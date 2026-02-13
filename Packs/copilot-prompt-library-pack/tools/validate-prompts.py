#!/usr/bin/env python3
import json
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
PROMPTS_DIR = os.path.join(ROOT, ".github", "prompts")
AGENTS_DIR = os.path.join(ROOT, ".github", "agents")

FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
REQ_KEYS = ["name", "description"]


def list_files(base, suffix):
    out = []
    for dirpath, _, filenames in os.walk(base):
        for fn in filenames:
            if fn.endswith(suffix):
                out.append(os.path.join(dirpath, fn))
    return sorted(out)


def parse_frontmatter(txt):
    m = FM_RE.match(txt)
    if not m:
        return None
    fm = m.group(1)
    d = {}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        d[k.strip()] = v.strip().strip("'").strip('"')
    return d


def main():
    errors = []
    warnings = []

    if not os.path.isdir(PROMPTS_DIR):
        errors.append(f"Missing prompts dir: {PROMPTS_DIR}")
        print("\n".join(errors))
        return 1

    prompt_files = list_files(PROMPTS_DIR, ".prompt.md")
    if not prompt_files:
        errors.append("No .prompt.md files found.")
        print("\n".join(errors))
        return 1

    # agent registry
    agents = set()
    if os.path.isdir(AGENTS_DIR):
        for p in list_files(AGENTS_DIR, ".agent.md"):
            txt = open(p, "r", encoding="utf-8", errors="ignore").read()
            fm = parse_frontmatter(txt)
            if fm and "name" in fm:
                agents.add(fm["name"])
    # built-ins
    agents.update({"ask", "edit", "plan", "agent"})

    names = {}
    for p in prompt_files:
        rel = os.path.relpath(p, ROOT)
        txt = open(p, "r", encoding="utf-8", errors="ignore").read()
        fm = parse_frontmatter(txt)
        if fm is None:
            errors.append(f"{rel}: missing YAML frontmatter")
            continue
        for k in REQ_KEYS:
            if k not in fm or not fm[k]:
                errors.append(f"{rel}: missing frontmatter key '{k}'")
        nm = fm.get("name")
        if nm:
            if nm in names:
                errors.append(f"Duplicate prompt name '{nm}' in {rel} and {names[nm]}")
            else:
                names[nm] = rel
        ag = fm.get("agent")
        if ag and ag not in agents:
            warnings.append(
                f"{rel}: references agent '{ag}' not found in .github/agents (ok if installed via another pack)"
            )

    if warnings:
        print("WARNINGS:")
        for w in warnings:
            print(f"  - {w}")
    if errors:
        print("\nERRORS:")
        for e in errors:
            print(f"  - {e}")
        return 1
    print("\nOK: prompt files validated (warnings may remain).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
