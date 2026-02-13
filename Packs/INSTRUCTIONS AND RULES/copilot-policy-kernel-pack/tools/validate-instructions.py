#!/usr/bin/env python3
import os, sys, re

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
INSTR_DIR = os.path.join(ROOT, ".github", "instructions")

REQ_FRONTMATTER_KEYS = ["name", "description", "applyTo"]
FM_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)

def main():
    if not os.path.isdir(INSTR_DIR):
        print(f"ERROR: missing instructions directory: {INSTR_DIR}")
        return 1

    errors = []
    files = []
    for dirpath, _, filenames in os.walk(INSTR_DIR):
        for fn in filenames:
            if fn.endswith(".instructions.md"):
                files.append(os.path.join(dirpath, fn))

    if not files:
        errors.append("No .instructions.md files found.")

    for path in sorted(files):
        rel = os.path.relpath(path, ROOT)
        txt = open(path, "r", encoding="utf-8", errors="ignore").read()
        m = FM_RE.match(txt)
        if not m:
            errors.append(f"{rel}: missing YAML frontmatter block")
            continue
        fm = m.group(1)
        for k in REQ_FRONTMATTER_KEYS:
            if re.search(rf"^{re.escape(k)}\s*:", fm, re.MULTILINE) is None:
                errors.append(f"{rel}: frontmatter missing key '{k}'")
        # crude applyTo sanity
        if "applyTo:" in fm and ("**" not in fm and "*" not in fm and "{" not in fm and "}" not in fm):
            # still ok; just warn-ish via errors? keep as warning in stdout
            pass

    if errors:
        print("ERRORS:")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("OK: instructions validated.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
