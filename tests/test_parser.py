"""Tests for drdoc.parser module."""

import textwrap

import pytest

from drdoc.parser import parse_source, ArgumentDoc, FunctionDoc, ClassDoc, ModuleDoc


SIMPLE_MODULE = textwrap.dedent("""\
    \"\"\"A simple example module.\"\"\"

    def greet(name: str, greeting: str = "Hello") -> str:
        \"\"\"Return a greeting string.\"\"\"
        return f"{greeting}, {name}!"


    class Dog:
        \"\"\"Represents a dog.\"\"\"

        def __init__(self, name: str) -> None:
            \"\"\"Initialise the dog.\"\"\"
            self.name = name

        def bark(self) -> str:
            \"\"\"Make the dog bark.\"\"\"
            return "Woof!"
""")


def test_module_docstring():
    doc = parse_source(SIMPLE_MODULE, name="example")
    assert doc.docstring == "A simple example module."
    assert doc.name == "example"


def test_function_parsed():
    doc = parse_source(SIMPLE_MODULE, name="example")
    assert len(doc.functions) == 1
    func = doc.functions[0]
    assert func.name == "greet"
    assert func.docstring == "Return a greeting string."


def test_function_arguments():
    doc = parse_source(SIMPLE_MODULE, name="example")
    func = doc.functions[0]
    arg_names = [a.name for a in func.arguments]
    assert "name" in arg_names
    assert "greeting" in arg_names


def test_function_argument_annotation():
    doc = parse_source(SIMPLE_MODULE, name="example")
    func = doc.functions[0]
    name_arg = next(a for a in func.arguments if a.name == "name")
    assert name_arg.annotation == "str"


def test_function_argument_default():
    doc = parse_source(SIMPLE_MODULE, name="example")
    func = doc.functions[0]
    greeting_arg = next(a for a in func.arguments if a.name == "greeting")
    assert greeting_arg.default == "'Hello'"


def test_function_return_annotation():
    doc = parse_source(SIMPLE_MODULE, name="example")
    func = doc.functions[0]
    assert func.returns == "str"


def test_class_parsed():
    doc = parse_source(SIMPLE_MODULE, name="example")
    assert len(doc.classes) == 1
    cls = doc.classes[0]
    assert cls.name == "Dog"
    assert cls.docstring == "Represents a dog."


def test_class_methods():
    doc = parse_source(SIMPLE_MODULE, name="example")
    cls = doc.classes[0]
    method_names = [m.name for m in cls.methods]
    assert "__init__" in method_names
    assert "bark" in method_names


def test_no_docstring_module():
    source = "x = 1\n"
    doc = parse_source(source, name="nodc")
    assert doc.docstring is None


def test_parse_source_filepath():
    doc = parse_source("", name="empty", filepath="/some/path/empty.py")
    assert doc.filepath == "/some/path/empty.py"


def test_parse_file(tmp_path):
    from drdoc.parser import parse_file

    py_file = tmp_path / "mymodule.py"
    py_file.write_text('"""My module."""\n\ndef foo():\n    pass\n')
    doc = parse_file(str(py_file))
    assert doc.name == "mymodule"
    assert doc.docstring == "My module."
    assert len(doc.functions) == 1


def test_parse_file_not_found():
    from drdoc.parser import parse_file

    with pytest.raises(FileNotFoundError):
        parse_file("/nonexistent/path/module.py")


def test_parse_directory(tmp_path):
    from drdoc.parser import parse_directory

    (tmp_path / "a.py").write_text('"""Module A."""\n')
    (tmp_path / "b.py").write_text('"""Module B."""\n')
    (tmp_path / "not_python.txt").write_text("hello")

    docs = parse_directory(str(tmp_path))
    names = [d.name for d in docs]
    assert "a" in names
    assert "b" in names
    assert len(docs) == 2


def test_parse_directory_skips_syntax_errors(tmp_path):
    from drdoc.parser import parse_directory

    (tmp_path / "good.py").write_text('"""Good."""\n')
    (tmp_path / "bad.py").write_text("def (:\n")

    docs = parse_directory(str(tmp_path))
    assert len(docs) == 1
    assert docs[0].name == "good"


def test_class_methods_not_affected_by_nested_class():
    """Methods defined after a nested class must still be collected."""
    source = textwrap.dedent("""\
        class Outer:
            \"\"\"Outer class.\"\"\"

            class Inner:
                \"\"\"Inner class.\"\"\"

            def after_nested(self) -> None:
                \"\"\"Method after the nested class.\"\"\"
                pass
    """)
    doc = parse_source(source, name="nested")
    cls = doc.classes[0]
    method_names = [m.name for m in cls.methods]
    assert "after_nested" in method_names
