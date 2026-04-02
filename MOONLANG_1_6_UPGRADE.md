# MoonLang 1.6 Upgrade Notes

This project now targets MoonLang `1.6.0`.

## Local toolchain requirement

The repository `.gitignore` excludes `MulanMoonlang/`, so the bundled compiler runtime is still expected to exist locally on Windows machines.

Required local layout:

```text
MulanMoonlang/
  moonc.exe
  moonrt.lib
  packages/
```

Minimum expectation:

- `MulanMoonlang/moonc.exe --version` reports `v1.6.0`
- `MulanMoonlang/packages/` exists

## Build behavior

`build.bat` now validates the `packages/` directory before starting the desktop build. This avoids partial builds with an old 1.4 runtime.

## Upgrade source used locally

The local upgrade was applied from:

```text
D:\document\mulanmoonlang\moonlang1.6\moonlang1.6_windows64 (1)
```
