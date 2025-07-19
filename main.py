import os
from pathlib import Path

# --- Configuration ---
# Directories to scan relative to the script's location
DIRS_TO_SCAN = ['src', 'experimental']

# Name of the output file
OUTPUT_FILE = 'project.txt'

# Optional: directories to exclude from the scan
EXCLUDED_DIRS = ['node_modules', 'dist', '.git', '__pycache__']
# --- End Configuration ---

def create_codebase_snapshot():
    """
    Scans specified directories, reads all files, and concatenates
    their content into a single output file.
    """
    print(f"Starting to create codebase snapshot in '{OUTPUT_FILE}'...")

    project_root = Path.cwd()
    output_path = project_root / OUTPUT_FILE

    with open(output_path, 'w', encoding='utf-8') as outfile:
        for dir_name in DIRS_TO_SCAN:
            scan_path = project_root / dir_name

            if not scan_path.is_dir():
                print(f"Warning: Directory '{scan_path}' not found. Skipping.")
                continue

            print(f"Scanning directory: '{scan_path}'")

            for file_path in sorted(scan_path.rglob('*')):
                if not file_path.is_file() or any(excluded in file_path.parts for excluded in EXCLUDED_DIRS):
                    continue

                relative_path = file_path.relative_to(project_root)
                print(f"  -> Adding file: {relative_path}")

                outfile.write(f"\n{'='*20}\n")
                outfile.write(f"FILE: /{relative_path}\n")
                outfile.write(f"{'='*20}\n\n")

                try:
                    outfile.write(file_path.read_text(encoding='utf-8'))
                except Exception:
                    outfile.write(f"--- Could not read file (likely binary): {relative_path} ---\n")

    print(f"\nSuccessfully created '{OUTPUT_FILE}' at '{output_path}'")

if __name__ == '__main__':
    create_codebase_snapshot()

