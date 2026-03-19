"""Command-line interface for Dr.doc."""

import argparse
import os
import sys

from . import __version__
from .generator import render_module, render_modules
from .parser import parse_directory, parse_file


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="drdoc",
        description="Dr.doc — automatic documentation generator for Python source files.",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument(
        "targets",
        nargs="+",
        metavar="TARGET",
        help="One or more Python files or directories to document.",
    )
    parser.add_argument(
        "-o",
        "--output",
        metavar="FILE",
        help="Write output to FILE instead of stdout.",
    )
    return parser


def main(argv=None) -> int:
    """Entry point for the drdoc command-line tool."""
    parser = _build_parser()
    args = parser.parse_args(argv)

    modules = []
    for target in args.targets:
        if not os.path.exists(target):
            print(f"drdoc: error: path not found: {target}", file=sys.stderr)
            return 1
        if os.path.isdir(target):
            modules.extend(parse_directory(target))
        else:
            try:
                modules.append(parse_file(target))
            except SyntaxError as exc:
                print(f"drdoc: error: syntax error in {target}: {exc}", file=sys.stderr)
                return 1

    if not modules:
        print("drdoc: no Python files found.", file=sys.stderr)
        return 1

    output = render_modules(modules) if len(modules) > 1 else render_module(modules[0])

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(output)
        print(f"Documentation written to {args.output}")
    else:
        print(output)

    return 0


if __name__ == "__main__":
    sys.exit(main())
