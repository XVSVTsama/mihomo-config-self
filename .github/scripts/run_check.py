#!/usr/bin/env python3
"""Run a check command with configurable enforcement and per-commit mode."""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVENT_PATH = os.environ.get("GITHUB_EVENT_PATH")


def load_config():
    return {"enforce": True, "per_commit": False}


def push_commit_shas():
    if os.environ.get("GITHUB_EVENT_NAME") != "push" or not EVENT_PATH:
        return []
    with open(EVENT_PATH, encoding="utf-8-sig") as fh:
        event = json.load(fh)
    return [
        commit.get("id")
        for commit in event.get("commits", [])
        if commit.get("id")
    ]


def commit_has_file(sha, rel_paths):
    if not rel_paths:
        return True
    for rel_path in rel_paths:
        proc = subprocess.run(
            ["git", "cat-file", "-e", "%s:%s" % (sha, rel_path)],
            capture_output=True,
            check=False,
        )
        if proc.returncode != 0:
            return False
    return True


def run_check(command, enforce, per_commit, file_paths):
    shas = push_commit_shas() if per_commit else []
    if shas:
        failed = []
        for sha in shas:
            if not commit_has_file(sha, file_paths):
                print(
                    "Skipping %s: %s does not exist in this commit"
                    % (sha, ", ".join(file_paths) if file_paths else "files")
                )
                continue
            print("Checking commit %s" % sha)
            subprocess.run(["git", "checkout", "--quiet", sha], check=True)
            if subprocess.run(command).returncode != 0:
                failed.append(sha)
        if failed:
            for sha in failed:
                message = "Check failed at commit %s" % sha
                print("::%s::%s" % ("error" if enforce else "warning", message))
            if enforce:
                sys.exit(1)
        else:
            print("All checked commits passed")
        return

    if subprocess.run(command).returncode != 0:
        message = "Check failed: %s" % " ".join(command)
        print("::%s::%s" % ("error" if enforce else "warning", message))
        if enforce:
            sys.exit(1)
    else:
        print("Check passed")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--file",
        action="append",
        default=[],
        help="repo file to gate per-commit checks (repeatable)",
    )
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()

    if not args.command or args.command[0] != "--":
        parser.error("expected '--' before the check command")

    config = load_config()
    enforce = config.get("enforce", True)
    per_commit = config.get("per_commit", False)

    env_enforce = os.environ.get("CHECK_ENFORCE")
    if env_enforce not in (None, ""):
        enforce = env_enforce.lower() == "true"
    env_per_commit = os.environ.get("CHECK_PER_COMMIT")
    if env_per_commit not in (None, ""):
        per_commit = env_per_commit.lower() == "true"

    run_check(args.command[1:], enforce, per_commit, args.file)


if __name__ == "__main__":
    main()
