"""Tests for drdoc.generator module."""

import textwrap

from drdoc.parser import parse_source
from drdoc.generator import render_module, render_modules


SAMPLE_SOURCE = textwrap.dedent("""\
    \"\"\"Sample module docstring.\"\"\"

    def add(x: int, y: int = 0) -> int:
        \"\"\"Add two numbers.\"\"\"
        return x + y


    class Calculator:
        \"\"\"A simple calculator.\"\"\"

        def multiply(self, a: float, b: float) -> float:
            \"\"\"Multiply two numbers.\"\"\"
            return a * b
""")


def _doc():
    return parse_source(SAMPLE_SOURCE, name="sample")


def test_render_module_heading():
    md = render_module(_doc())
    assert "# sample" in md


def test_render_module_docstring():
    md = render_module(_doc())
    assert "Sample module docstring." in md


def test_render_function_heading():
    md = render_module(_doc())
    assert "add(" in md


def test_render_function_docstring():
    md = render_module(_doc())
    assert "Add two numbers." in md


def test_render_function_return():
    md = render_module(_doc())
    assert "int" in md


def test_render_class_heading():
    md = render_module(_doc())
    assert "Calculator" in md


def test_render_class_docstring():
    md = render_module(_doc())
    assert "A simple calculator." in md


def test_render_class_method():
    md = render_module(_doc())
    assert "multiply(" in md


def test_render_modules_separator():
    doc1 = parse_source('"""Module 1."""\n', name="mod1")
    doc2 = parse_source('"""Module 2."""\n', name="mod2")
    md = render_modules([doc1, doc2])
    assert "---" in md
    assert "# mod1" in md
    assert "# mod2" in md


def test_render_module_no_functions_no_classes():
    doc = parse_source('"""Just a docstring."""\n', name="plain")
    md = render_module(doc)
    assert "# plain" in md
    assert "Just a docstring." in md
    assert "## Functions" not in md
    assert "## Classes" not in md
