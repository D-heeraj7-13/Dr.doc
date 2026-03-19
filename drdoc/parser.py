"""Parse Python source files and extract documentation metadata."""

import ast
import os
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ArgumentDoc:
    """Documentation for a single function/method argument."""

    name: str
    annotation: Optional[str] = None
    default: Optional[str] = None


@dataclass
class FunctionDoc:
    """Documentation extracted from a function or method definition."""

    name: str
    docstring: Optional[str]
    arguments: List[ArgumentDoc] = field(default_factory=list)
    returns: Optional[str] = None
    is_method: bool = False
    decorators: List[str] = field(default_factory=list)


@dataclass
class ClassDoc:
    """Documentation extracted from a class definition."""

    name: str
    docstring: Optional[str]
    methods: List[FunctionDoc] = field(default_factory=list)
    base_classes: List[str] = field(default_factory=list)


@dataclass
class ModuleDoc:
    """Documentation extracted from a Python module."""

    name: str
    docstring: Optional[str]
    functions: List[FunctionDoc] = field(default_factory=list)
    classes: List[ClassDoc] = field(default_factory=list)
    filepath: str = ""


def _annotation_to_str(node: Optional[ast.expr]) -> Optional[str]:
    """Convert an AST annotation node to a readable string."""
    if node is None:
        return None
    return ast.unparse(node)


def _parse_arguments(args: ast.arguments) -> List[ArgumentDoc]:
    """Extract argument documentation from an AST arguments node."""
    result: List[ArgumentDoc] = []

    all_args = args.posonlyargs + args.args
    if args.vararg:
        all_args = all_args + [args.vararg]
    if args.kwonlyargs:
        all_args = all_args + args.kwonlyargs
    if args.kwarg:
        all_args = all_args + [args.kwarg]

    defaults_offset = len(all_args) - len(args.defaults)
    kw_defaults = {kw.arg: args.kw_defaults[i] for i, kw in enumerate(args.kwonlyargs)}

    for idx, arg in enumerate(all_args):
        annotation = _annotation_to_str(arg.annotation)
        default: Optional[str] = None

        if idx >= defaults_offset:
            default_node = args.defaults[idx - defaults_offset]
            default = ast.unparse(default_node)
        elif arg.arg in kw_defaults and kw_defaults[arg.arg] is not None:
            default = ast.unparse(kw_defaults[arg.arg])

        result.append(ArgumentDoc(name=arg.arg, annotation=annotation, default=default))

    return result


def _parse_function(node: ast.FunctionDef, is_method: bool = False) -> FunctionDoc:
    """Extract a FunctionDoc from an AST FunctionDef node."""
    docstring = ast.get_docstring(node)
    arguments = _parse_arguments(node.args)
    returns = _annotation_to_str(node.returns)
    decorators = [ast.unparse(d) for d in node.decorator_list]

    return FunctionDoc(
        name=node.name,
        docstring=docstring,
        arguments=arguments,
        returns=returns,
        is_method=is_method,
        decorators=decorators,
    )


def _parse_class(node: ast.ClassDef) -> ClassDoc:
    """Extract a ClassDoc from an AST ClassDef node."""
    docstring = ast.get_docstring(node)
    base_classes = [ast.unparse(b) for b in node.bases]
    methods: List[FunctionDoc] = []

    for item in node.body:
        if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
            methods.append(_parse_function(item, is_method=True))

    return ClassDoc(
        name=node.name,
        docstring=docstring,
        methods=methods,
        base_classes=base_classes,
    )


def parse_source(source: str, name: str = "<string>", filepath: str = "") -> ModuleDoc:
    """Parse Python source code and return a ModuleDoc.

    Args:
        source: The Python source code to parse.
        name: A human-readable name for the module.
        filepath: The filesystem path to the source file.

    Returns:
        A ModuleDoc instance populated with extracted documentation.
    """
    tree = ast.parse(source)
    docstring = ast.get_docstring(tree)
    functions: List[FunctionDoc] = []
    classes: List[ClassDoc] = []

    for node in ast.iter_child_nodes(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(_parse_function(node))
        elif isinstance(node, ast.ClassDef):
            classes.append(_parse_class(node))

    return ModuleDoc(
        name=name,
        docstring=docstring,
        functions=functions,
        classes=classes,
        filepath=filepath,
    )


def parse_file(filepath: str) -> ModuleDoc:
    """Parse a Python file and return a ModuleDoc.

    Args:
        filepath: Absolute or relative path to the Python file.

    Returns:
        A ModuleDoc instance populated with extracted documentation.

    Raises:
        FileNotFoundError: If the file does not exist.
        SyntaxError: If the file contains invalid Python syntax.
    """
    with open(filepath, "r", encoding="utf-8") as fh:
        source = fh.read()

    name = os.path.splitext(os.path.basename(filepath))[0]
    return parse_source(source, name=name, filepath=filepath)


def parse_directory(dirpath: str) -> List[ModuleDoc]:
    """Recursively parse all Python files in a directory.

    Args:
        dirpath: Path to the directory to scan.

    Returns:
        A list of ModuleDoc instances, one per Python file found.
    """
    docs: List[ModuleDoc] = []
    for root, _dirs, files in os.walk(dirpath):
        for filename in sorted(files):
            if filename.endswith(".py"):
                filepath = os.path.join(root, filename)
                try:
                    docs.append(parse_file(filepath))
                except SyntaxError:
                    pass  # Skip files with syntax errors
    return docs
