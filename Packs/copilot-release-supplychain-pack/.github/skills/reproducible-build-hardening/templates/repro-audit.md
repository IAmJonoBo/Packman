# Reproducibility Audit (Template)

| Risk                 | Where         | Symptom             | Mitigation   | Status |
| -------------------- | ------------- | ------------------- | ------------ | ------ |
| toolchain drift      | CI/local      | inconsistent builds | pin versions |        |
| timestamps           | packaging     | differing hashes    | normalise    |        |
| env-dependent output | build scripts | flaky artifacts     | explicit env |        |
