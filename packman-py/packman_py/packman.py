from __future__ import annotations

import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path

try:
    import termios
    import tty
except ImportError:
    termios = None
    tty = None

import typer
from rich.console import Console
from rich.table import Table
from rich.text import Text

app = typer.Typer(no_args_is_help=True, rich_markup_mode="rich")
console = Console()

# Pastel cyberpunk palette
PALETTE = {"accent": "#7ef9ff", "muted": "#a29bfe", "glow": "#ff7bd0", "bg": "#0f1724"}
BOLD_STYLE_PREFIX = "bold "


def get_render_width() -> int:
    # Use console width, max 100 for readability
    return min(console.width, 100)


def hard_clear() -> None:
    console.clear()


def render_header() -> None:
    width = get_render_width()
    console.print("PACKMAN".center(width))
    console.print("repository pack manager - pastel cyberpunk".center(width))
    console.print("-" * width)


def clip_text(value: str, width: int) -> str:
    if width <= 1:
        return ""
    if len(value) <= width:
        return value
    if width == 2:
        return value[:2]
    return value[: width - 3] + "..."


def ask_yes_no(prompt: str, default: bool = True) -> bool:
    suffix = "[Y/n]" if default else "[y/N]"
    value = console.input(f"{prompt} {suffix} ").strip().lower()
    if value == "":
        return default
    return value in {"y", "yes"}


def run_py_command(args: list[str]) -> None:
    subprocess.run([sys.executable, "-m", "packman_py.packman", *args], check=False)


def render_interactive_menu(selected_index: int) -> None:
    hard_clear()
    render_header()

    menu = [
        ("Validate Packs", "Validate pack structure with strict/suite options."),
        ("Doctor Check", "Run local dependency and environment diagnostics."),
        ("Info", "Show repository and CLI summary information."),
        ("Package Artifacts", "Build node/python artifacts (node/py/pyexe/all)."),
        (
            "Run Node CLI Command",
            "Execute raw Node CLI args for advanced packman operations.",
        ),
        ("Exit", "Close the launcher session."),
    ]

    terminal_width = get_render_width()

    table = Table(
        width=terminal_width,
        box=None,
        show_header=True,
        header_style=BOLD_STYLE_PREFIX + PALETTE["accent"],
        padding=(0, 1),
    )
    table.add_column("", width=1)
    table.add_column("#", width=2, justify="right")
    table.add_column("Action", width=24)
    table.add_column("Explainer", ratio=1)

    for index, (action, explainer) in enumerate(menu):
        marker = ">" if index == selected_index else " "
        style = (
            BOLD_STYLE_PREFIX + PALETTE["accent"] if index == selected_index else None
        )

        table.add_row(marker, str(index + 1), action, explainer, style=style)

    console.print(table)
    console.print("Use up/down or j/k to move, Enter to select, q to quit.")


def read_menu_selection(count: int, initial_index: int = 0) -> int:
    if termios is None or tty is None or not sys.stdin.isatty():
        render_interactive_menu(initial_index)
        value = console.input(f"Select action number (1-{count}): ").strip()
        if value.lower() in {"q", "quit", "exit"}:
            return count - 1
        if value.isdigit():
            index = int(value) - 1
            if 0 <= index < count:
                return index
        return initial_index

    selected_index = initial_index
    try:
        stdin_fd = sys.stdin.fileno()
        previous_state = termios.tcgetattr(stdin_fd)
    except OSError:
        render_interactive_menu(initial_index)
        value = console.input(f"Select action number (1-{count}): ").strip()
        if value.lower() in {"q", "quit", "exit"}:
            return count - 1
        if value.isdigit():
            index = int(value) - 1
            if 0 <= index < count:
                return index
        return initial_index

    try:
        tty.setcbreak(stdin_fd)
        while True:
            render_interactive_menu(selected_index)
            key = os.read(stdin_fd, 1)

            if key in {b"\r", b"\n"}:
                return selected_index

            if key in {b"q", b"Q", b"\x03"}:
                return count - 1

            if key in {b"k", b"K"}:
                selected_index = (selected_index - 1) % count
                continue

            if key in {b"j", b"J"}:
                selected_index = (selected_index + 1) % count
                continue

            if key == b"\x1b":
                next_two = os.read(stdin_fd, 2)
                if next_two == b"[A":
                    selected_index = (selected_index - 1) % count
                elif next_two == b"[B":
                    selected_index = (selected_index + 1) % count
    finally:
        termios.tcsetattr(stdin_fd, termios.TCSADRAIN, previous_state)


def run_checked(cmd: list[str]) -> None:
    exit_code = os.spawnv(os.P_WAIT, cmd[0], cmd)
    if exit_code != 0:
        raise typer.Exit(code=exit_code)


def resolve_node() -> str:
    node_path = shutil.which("node")
    if not node_path:
        console.print(Text("Node.js not found in PATH.", style="red"))
        raise typer.Exit(code=2)
    return node_path


def resolve_packman_cli() -> str:
    cli_path = Path("./packman-cli/dist/index.js").resolve()
    if not cli_path.exists():
        console.print(
            Text(
                "packman-cli is not built. Run: pnpm --filter packman-cli -w run build",
                style="red",
            )
        )
        raise typer.Exit(code=3)
    return str(cli_path)


@app.command()
def doctor() -> None:
    """Check local CLI packaging prerequisites."""
    render_header()
    table = Table(
        show_header=True, header_style=BOLD_STYLE_PREFIX + PALETTE["accent"], box=None
    )
    table.add_column("Dependency", style=PALETTE["muted"])
    table.add_column("Status", style="white")
    table.add_row("node", "ok" if shutil.which("node") else "missing")
    table.add_row("pnpm", "ok" if shutil.which("pnpm") else "missing")
    table.add_row("python", "ok" if shutil.which("python") else "missing")
    table.add_row("pyinstaller", "ok" if shutil.which("pyinstaller") else "missing")
    console.print(table)


@app.command()
def info(verbose: bool = typer.Option(False, "--verbose", "-v")) -> None:
    """Show repository and pack summary."""
    render_header()
    table = Table(
        show_header=True, header_style=BOLD_STYLE_PREFIX + PALETTE["accent"], box=None
    )
    table.add_column("Key", style=PALETTE["muted"])
    table.add_column("Value", style="white")
    table.add_row("Packs", "./Packs (discovered locally)")
    table.add_row("Validator", "packman-core validate (JS)")
    table.add_row("CLI (native)", "packman-cli/dist/bin + packman-py/dist")
    console.print(table)

    if verbose:
        console.print(
            Text("Diagnostics: verbose output placeholder.", style=PALETTE["accent"])
        )


@app.command()
def validate(
    path: str = typer.Argument("./Packs"),
    strict: bool = typer.Option(
        False, "--strict", help="Enable strict validation mode."
    ),
    suite: bool = typer.Option(False, "--suite", help="Enable suite validation mode."),
    json_output: bool = typer.Option(
        False, "--json", help="Emit JSON output from packman-cli."
    ),
) -> None:
    """Run the pack validator (shells out to packman-cli)."""
    if not json_output:
        render_header()
        console.print(Text.from_markup(f"Running validator on [bold]{path}[/bold]..."))

    p = Path(path)
    if not (p.exists() and p.is_dir()):
        console.print(
            Text(f"Invalid path: {path} (must be an existing directory)", style="red")
        )
        raise typer.Exit(code=3)

    cmd = [resolve_node(), resolve_packman_cli(), "validate", str(p)]
    if strict:
        cmd.append("--strict")
    if suite:
        cmd.append("--suite")
    if json_output:
        cmd.append("--json")
    run_checked(cmd)
    if not json_output:
        console.print(Text("Validation completed.", style=PALETTE["accent"]))


@app.command()
def package(
    target: str = typer.Option("all", help="one of: node, py, pyexe, all"),
) -> None:
    """Build CLI artifacts into dist folders."""
    render_header()
    allowed = {"node", "py", "pyexe", "all"}
    if target not in allowed:
        console.print(
            Text(
                f"Invalid target '{target}'. Choose one of: {', '.join(sorted(allowed))}",
                style="red",
            )
        )
        raise typer.Exit(code=4)

    steps: list[tuple[str, list[str]]] = []
    if target in {"node", "all"}:
        steps.append(("Node executables", ["sh", "./scripts/build-executables.sh"]))
    if target in {"py", "all"}:
        steps.append(("Python wheel/sdist", ["sh", "./scripts/build-python-dist.sh"]))
    if target in {"pyexe", "all"}:
        steps.append(
            ("Python host executable", ["sh", "./scripts/build-python-exe.sh"])
        )

    for label, cmd in steps:
        console.print(Text(f"Running: {label}", style=PALETTE["muted"]))
        run_checked(cmd)

    console.print(
        Text(
            "Packaging complete. Artifacts are in packman-cli/dist/bin and packman-py/dist.",
            style=PALETTE["accent"],
        )
    )


@app.command()
def interactive() -> None:
    """Open an interactive Packman home screen with arrow-key navigation."""
    options = [
        "Validate Packs",
        "Doctor Check",
        "Info",
        "Package Artifacts",
        "Run Node CLI Command",
        "Exit",
    ]
    selected_index = 0
    while True:
        selected_index = read_menu_selection(len(options), selected_index)
        choice = options[selected_index]

        if choice == "Exit":
            console.clear()
            render_header()
            console.print(Text("Goodbye.", style=PALETTE["muted"]))
            raise typer.Exit(code=0)

        if choice == "Validate Packs":
            console.clear()
            render_header()
            path_input = console.input("Pack path [./Packs]: ").strip() or "./Packs"
            strict = ask_yes_no("Enable strict mode?", default=True)
            suite = ask_yes_no("Enable suite mode?", default=True)

            args = ["validate", path_input]
            if strict:
                args.append("--strict")
            if suite:
                args.append("--suite")
            run_py_command(args)
            console.input("\nPress Enter to return to menu...")
            continue

        if choice == "Doctor Check":
            console.clear()
            run_py_command(["doctor"])
            console.input("\nPress Enter to return to menu...")
            continue

        if choice == "Info":
            console.clear()
            run_py_command(["info"])
            console.input("\nPress Enter to return to menu...")
            continue

        if choice == "Package Artifacts":
            console.clear()
            render_header()
            target = (
                console.input("Package target [all|node|py|pyexe] (default all): ")
                .strip()
                .lower()
                or "all"
            )
            run_py_command(["package", "--target", target])
            console.input("\nPress Enter to return to menu...")
            continue

        if choice == "Run Node CLI Command":
            console.clear()
            render_header()
            command_line = console.input(
                "Node CLI args (example: validate ./Packs --strict --suite): "
            ).strip()

            if not command_line:
                continue

            node_args = shlex.split(command_line)
            subprocess.run(
                [resolve_node(), resolve_packman_cli(), *node_args],
                check=False,
            )
            console.input("\nPress Enter to return to menu...")
            continue


if __name__ == "__main__":
    app()
