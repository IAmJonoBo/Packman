from __future__ import annotations

import os
import shutil
from pathlib import Path

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

app = typer.Typer(no_args_is_help=True, rich_markup_mode="rich")
console = Console()

# Pastel cyberpunk palette
PALETTE = {"accent": "#7ef9ff", "muted": "#a29bfe", "glow": "#ff7bd0", "bg": "#0f1724"}
BOLD_STYLE_PREFIX = "bold "


def render_header() -> None:
    title = Text("PACKMAN", justify="center", style=BOLD_STYLE_PREFIX + PALETTE["glow"])
    subtitle = Text(
        "repository pack manager — pastel cyberpunk",
        style=PALETTE["muted"],
        justify="center",
    )
    console.print(Panel.fit(Text.assemble(title, "\n", subtitle), style="on #071223"))


def run_checked(cmd: list[str]) -> None:
    exit_code = os.spawnv(os.P_WAIT, cmd[0], cmd)
    if exit_code != 0:
        raise typer.Exit(code=exit_code)


def resolve_node() -> str:
    node_path = shutil.which("node")
    if not node_path:
        console.print(Panel(Text("Node.js not found in PATH."), style="red"))
        raise typer.Exit(code=2)
    return node_path


def resolve_packman_cli() -> str:
    cli_path = Path("./packman-cli/dist/index.js").resolve()
    if not cli_path.exists():
        console.print(
            Panel(
                Text(
                    "packman-cli is not built. Run: pnpm --filter packman-cli -w run build"
                ),
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
            Panel(
                Text("Verbose diagnostics would appear here."),
                title="Diagnostics",
                style=PALETTE["accent"],
            )
        )


@app.command()
def validate(path: str = typer.Argument("./Packs")) -> None:
    """Run the pack validator (shells out to packman-cli)."""
    render_header()
    console.print(
        Panel(
            Text.from_markup(f"Running validator on [bold]{path}[/bold]..."),
            style=PALETTE["muted"],
        )
    )

    p = Path(path)
    if not (p.exists() and p.is_dir()):
        console.print(
            Panel(
                Text(f"Invalid path: {path} (must be an existing directory)"),
                style="red",
            )
        )
        raise typer.Exit(code=3)

    cmd = [resolve_node(), resolve_packman_cli(), "validate", str(p)]
    run_checked(cmd)
    console.print(Panel(Text("Validation completed."), style=PALETTE["accent"]))


@app.command()
def package(
    target: str = typer.Option("all", help="one of: node, py, pyexe, all"),
) -> None:
    """Build CLI artifacts into dist folders."""
    render_header()
    allowed = {"node", "py", "pyexe", "all"}
    if target not in allowed:
        console.print(
            Panel(
                Text(
                    f"Invalid target '{target}'. Choose one of: {', '.join(sorted(allowed))}"
                ),
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
        console.print(Panel(Text(f"Running: {label}"), style=PALETTE["muted"]))
        run_checked(cmd)

    console.print(
        Panel(
            Text(
                "Packaging complete. Artifacts are in packman-cli/dist/bin and packman-py/dist."
            ),
            style=PALETTE["accent"],
        )
    )


if __name__ == "__main__":
    app()
