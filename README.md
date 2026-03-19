# Dr.doc

**Dr.doc** is a lightweight, zero-dependency Python documentation generator.  
Point it at any Python file or directory and it instantly produces clean, readable Markdown documentation extracted from your module, class, and function docstrings.

---

## Features

- Parses Python docstrings (modules, classes, functions, methods)
- Captures type annotations and default argument values
- Outputs Markdown ready to embed in wikis, GitHub pages, or any static site
- Works as a command-line tool or importable library
- Zero runtime dependencies — pure Python 3.10+

---

## Installation

```bash
pip install .
```

---

## Usage

### Command line

```bash
# Document a single file
drdoc mymodule.py

# Document an entire package
drdoc src/

# Save output to a file
drdoc src/ -o docs/api.md

# Multiple targets
drdoc utils.py models.py
```

### Python API

```python
from drdoc.parser import parse_file, parse_directory
from drdoc.generator import render_module, render_modules

# Single file
doc = parse_file("mymodule.py")
print(render_module(doc))

# Entire directory
docs = parse_directory("src/")
print(render_modules(docs))
```

---

## Example output

Given this source file:

```python
"""Maths utilities."""

def add(x: int, y: int = 0) -> int:
    """Add two integers."""
    return x + y
```

Dr.doc produces:

```markdown
# maths

*File: `maths.py`*

Maths utilities.

## Functions

### add(x: int, y: int = 0) -> int

Add two integers.

**Parameters**

- `x` — *int*
- `y` — *int* — default: `0`

**Returns:** *int*
```

---

## Running tests

```bash
pip install pytest
pytest tests/
```

---

## License

MIT
