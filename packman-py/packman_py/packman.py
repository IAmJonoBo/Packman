from __future__ import annotations

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

app = typer.Typer()
console = Console()

# Pastel cyberpunk palette
PALETTE = {"accent": "#7ef9ff", "muted": "#a29bfe", "glow": "#ff7bd0", "bg": "#0f1724"}


def header() -> None:
    t = Text("PACKMAN", justify="center", style="bold " + PALETTE["glow"])
    sub = Text("repository pack manager — pastel cyberpunk", style=PALETTE["muted"])
    console.print(Panel.fit(Text.assemble(t, "\n", sub), style="on #071223"))


@app.command()
def info(verbose: bool = typer.Option(False, "--verbose", "-v")) -> None:
    """Show repository and pack summary."""
    header()
    table = Table(show_header=True, header_style="bold " + PALETTE["accent"], box=None)
    table.add_column("Key", style=PALETTE["muted"])
    table.add_column("Value", style="white")
    table.add_row("Packs", "./Packs (discovered locally)")
    table.add_row("Validator", "packman-core validate (JS)")
    table.add_row("CLI (native)", "packman-cli (node) — use pkg to build")
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
    header()
    console.print(
        Panel(
            Text.from_markup(f"Running validator on [bold]{path}[/bold]..."),
            style=PALETTE["muted"],
        )
    )
    import shutil
    import subprocess
    from pathlib import Path

    # Resolve node executable explicitly to avoid partial paths
    node_path = shutil.which("node")
    if not node_path:
        console.print(Panel(Text("Node.js not found in PATH."), style="red"))
        raise typer.Exit(code=2)

    # Sanitize/validate path argument: allow relative or absolute existing dirs only
    p = Path(path)
    if not (p.exists() and p.is_dir()):
        console.print(
            Panel(
                Text(f"Invalid path: {path} (must be an existing directory)"),
                style="red",
            )
        )
        raise typer.Exit(code=3)

    cmd = [
        node_path,
        str(Path("./packman-cli/dist/index.js").resolve()),
        "validate",
        str(p),
    ]

    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        console.print(
            Panel(Text(f"Validator failed (exit {e.returncode})"), style="red")
        )
        raise typer.Exit(code=e.returncode)
    except Exception as e:
        console.print(Panel(Text(str(e)), style="red"))
        raise typer.Exit(code=1)


if __name__ == "__main__":
    app()
