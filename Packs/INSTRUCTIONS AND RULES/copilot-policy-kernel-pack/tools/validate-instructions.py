#!/usr/bin/env python3
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
DIR = os.path.join(ROOT, ".github", "instructions")
FM = re.compile(r"^---\n(.*?)\n---\n", re.S)
REQ = ["name", "description", "applyTo"]
errs = []
if not os.path.isdir(DIR):
    print("ERROR: missing", DIR)
    raise SystemExit(1)
for dp, _, fns in os.walk(DIR):
    for fn in fns:
        if not fn.endswith(".instructions.md"):
            continue
        p = os.path.join(dp, fn)
        s = open(p, "r", encoding="utf-8", errors="ignore").read()
        m = FM.match(s)
        if not m:
            errs.append(f"{os.path.relpath(p,ROOT)}: missing frontmatter")
            continue
        fm = m.group(1)
        for k in REQ:
            if re.search(rf"^{k}\s*:", fm, re.M) is None:
                errs.append(f"{os.path.relpath(p,ROOT)}: missing {k}")
if errs:
    print("ERRORS:")
    [print(" -", e) for e in errs]
    raise SystemExit(1)
print("OK")
