"""Generate Markdown documentation from parsed ModuleDoc objects."""

from typing import List

from .parser import ArgumentDoc, ClassDoc, FunctionDoc, ModuleDoc


def _heading(text: str, level: int = 1) -> str:
    return f"{'#' * level} {text}\n"


def _code(text: str, lang: str = "") -> str:
    return f"```{lang}\n{text}\n```\n"


def _render_argument(arg: ArgumentDoc) -> str:
    parts = [f"`{arg.name}`"]
    if arg.annotation:
        parts.append(f"*{arg.annotation}*")
    if arg.default is not None:
        parts.append(f"default: `{arg.default}`")
    return " — ".join(parts)


def _render_function(func: FunctionDoc, level: int = 3) -> str:
    lines: List[str] = []

    sig_parts = []
    for arg in func.arguments:
        part = arg.name
        if arg.annotation:
            part += f": {arg.annotation}"
        if arg.default is not None:
            part += f" = {arg.default}"
        sig_parts.append(part)

    if func.decorators:
        for dec in func.decorators:
            lines.append(f"*@{dec}*  \n")

    sig = f"{func.name}({', '.join(sig_parts)})"
    if func.returns:
        sig += f" -> {func.returns}"

    lines.append(_heading(sig, level))

    if func.docstring:
        lines.append(func.docstring + "\n")

    if func.arguments:
        lines.append("**Parameters**\n")
        for arg in func.arguments:
            lines.append(f"- {_render_argument(arg)}\n")
        lines.append("")

    if func.returns:
        lines.append(f"**Returns:** *{func.returns}*\n")

    return "\n".join(lines)


def _render_class(cls: ClassDoc, level: int = 2) -> str:
    lines: List[str] = []

    heading_text = cls.name
    if cls.base_classes:
        heading_text += f"({', '.join(cls.base_classes)})"
    lines.append(_heading(heading_text, level))

    if cls.docstring:
        lines.append(cls.docstring + "\n")

    if cls.methods:
        lines.append(_heading("Methods", level + 1))
        for method in cls.methods:
            lines.append(_render_function(method, level=level + 2))

    return "\n".join(lines)


def render_module(module: ModuleDoc) -> str:
    """Render a ModuleDoc as a Markdown string.

    Args:
        module: The ModuleDoc to render.

    Returns:
        A Markdown-formatted string documenting the module.
    """
    lines: List[str] = []

    lines.append(_heading(module.name, 1))

    if module.filepath:
        lines.append(f"*File: `{module.filepath}`*\n")

    if module.docstring:
        lines.append(module.docstring + "\n")

    if module.functions:
        lines.append(_heading("Functions", 2))
        for func in module.functions:
            lines.append(_render_function(func, level=3))

    if module.classes:
        lines.append(_heading("Classes", 2))
        for cls in module.classes:
            lines.append(_render_class(cls, level=3))

    return "\n".join(lines)


def render_modules(modules: List[ModuleDoc]) -> str:
    """Render multiple ModuleDoc objects as a combined Markdown string.

    Args:
        modules: List of ModuleDoc instances to render.

    Returns:
        A single Markdown string containing documentation for all modules.
    """
    parts = [render_module(m) for m in modules]
    return "\n\n---\n\n".join(parts)
