import os
import re
from pathlib import Path

try:
    BASE_DIR = Path(__file__).parent
except NameError:
    BASE_DIR = Path.cwd()

TARGET_FOLDER = (BASE_DIR / ".." / "wallpapers").resolve()

PREFIX = "wp"
IGNORE_FOLDERS = {"mac"}

def get_highest_existing_index(target_path, valid_extensions):
    highest = 0
    pattern = re.compile(rf"^{PREFIX}(\d+)")
    
    for root, dirs, files in os.walk(target_path):
        dirs[:] = [d for d in dirs if d.lower() not in IGNORE_FOLDERS]
        
        for file in files:
            file_path = Path(root) / file
            if file_path.suffix.lower() in valid_extensions:
                match = pattern.match(file_path.stem)
                if match:
                    num = int(match.group(1))
                    if num > highest:
                        highest = num
    return highest

def rename_all_wallpapers_sequentially():
    if not TARGET_FOLDER.exists() or not TARGET_FOLDER.is_dir():
        print(f"❌ Error: Folder '{TARGET_FOLDER}' not found!")
        return

    valid_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.heic'}
    
    highest_idx = get_highest_existing_index(TARGET_FOLDER, valid_extensions)
    current_index = highest_idx + 1
    print(f"🔍 Scanning directory: {TARGET_FOLDER}")
    print(f"🔢 Highest existing file index found: {highest_idx}. Next file will be: {current_index}")

    all_images = []

    for root, dirs, files in os.walk(TARGET_FOLDER):
        current_dir = Path(root)
        
        path_parts = {p.lower() for p in current_dir.parts}
        if any(ignored in path_parts for ignored in IGNORE_FOLDERS):
            continue
            
        dirs[:] = [d for d in dirs if d.lower() not in IGNORE_FOLDERS]
        
        for file in files:
            file_path = current_dir / file
            if file_path.suffix.lower() in valid_extensions:
                if file.startswith(PREFIX):
                    continue
                all_images.append(file_path)

    all_images.sort(key=lambda x: x.stat().st_mtime)

    if not all_images:
        print("ℹ️ No new wallpapers found to rename.")
        return

    print(f"🚀 Found {len(all_images)} new images. Starting sequential renaming...\n")
    rename_count = 0

    for old_path in all_images:
        ext = old_path.suffix.lower()
        parent_dir = old_path.parent
        
        while True:
            new_name = f"{PREFIX}{current_index}{ext}"
            new_path = parent_dir / new_name
            if not new_path.exists():
                break
            current_index += 1
        
        try:
            old_path.rename(new_path)
            print(f"✅ [{old_path.parent.name}] {old_path.name} -> {new_name}")
            rename_count += 1
        except Exception as e:
            print(f"⚠️ Failed to rename '{old_path.name}' in '{parent_dir.name}': {e}")
            
        current_index += 1

    print("=" * 50)
    print("✨ Sequential renaming completed successfully! ✨")
    print(f"🖼️ Total images processed: {rename_count}")
    print(f"🔢 Next sequence marker is at index: {current_index}")
    print("=" * 50)

if __name__ == "__main__":
    rename_all_wallpapers_sequentially()