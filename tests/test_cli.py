"""Tests for drdoc CLI (__main__)."""

import os
import textwrap

import pytest

from drdoc.__main__ import main


SAMPLE_PY = textwrap.dedent("""\
    \"\"\"Sample module.\"\"\"

    def hello(name: str) -> str:
        \"\"\"Say hello.\"\"\"
        return f"Hello, {name}!"
""")


def test_cli_stdout(capsys, tmp_path):
    py_file = tmp_path / "sample.py"
    py_file.write_text(SAMPLE_PY)

    ret = main([str(py_file)])
    captured = capsys.readouterr()

    assert ret == 0
    assert "# sample" in captured.out
    assert "hello(" in captured.out


def test_cli_output_file(tmp_path):
    py_file = tmp_path / "sample.py"
    py_file.write_text(SAMPLE_PY)
    out_file = tmp_path / "docs.md"

    ret = main([str(py_file), "-o", str(out_file)])

    assert ret == 0
    assert out_file.exists()
    content = out_file.read_text()
    assert "# sample" in content


def test_cli_directory(capsys, tmp_path):
    (tmp_path / "mod.py").write_text('"""Module."""\n')

    ret = main([str(tmp_path)])
    captured = capsys.readouterr()

    assert ret == 0
    assert "# mod" in captured.out


def test_cli_missing_path(capsys):
    ret = main(["/nonexistent/path/missing.py"])
    assert ret == 1


def test_cli_empty_directory(capsys, tmp_path):
    ret = main([str(tmp_path)])
    assert ret == 1


def test_cli_syntax_error(capsys, tmp_path):
    py_file = tmp_path / "bad.py"
    py_file.write_text("def (:\n")

    ret = main([str(py_file)])
    assert ret == 1


def test_cli_version(capsys):
    with pytest.raises(SystemExit) as exc_info:
        main(["--version"])
    assert exc_info.value.code == 0
