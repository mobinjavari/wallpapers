import os
import re
import zipfile
from pathlib import Path
import requests

INPUT_XML_PATH = "/System/Library/AssetsV2/com_apple_MobileAsset_DesktopPicture/com_apple_MobileAsset_DesktopPicture.xml"

try:
    BASE_DIR = Path(__file__).parent
except NameError:
    BASE_DIR = Path.cwd()

OUTPUT_DIR_PATH = (BASE_DIR / ".." / "wallpapers" / "mac").resolve()

def setup_directories(download_folder: Path):
    if not download_folder.exists():
        download_folder.mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: '{download_folder}'")
    return download_folder

def parse_plist_data(file_path):
    if not os.path.exists(file_path):
        print(f"❌ Error: Input file '{file_path}' not found!")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    dict_blocks = re.findall(r'<dict>(.*?)</dict>', content, re.DOTALL)
    
    wallpapers = []
    for block in dict_blocks:
        id_match = re.search(r'<key>DesktopPictureID</key>\s*<string>(.*?)</string>', block)
        url_match = re.search(r'<key>__BaseURL</key>\s*<string>(.*?)</string>', block)
        path_match = re.search(r'<key>__RelativePath</key>\s*<string>(.*?)</string>', block)
        
        if id_match and url_match and path_match:
            wallpaper_name = id_match.group(1) 
            full_url = url_match.group(1) + path_match.group(1)
            wallpapers.append({
                "name": wallpaper_name,
                "url": full_url
            })
            
    return wallpapers

def download_and_extract_wallpapers():
    target_dir = setup_directories(OUTPUT_DIR_PATH)
    wallpapers = parse_plist_data(INPUT_XML_PATH)
    
    if not wallpapers:
        print("⚠️ No valid wallpaper links found in the input file.")
        return

    print(f"🚀 Found {len(wallpapers)} wallpapers to download...\n")

    for index, wp in enumerate(wallpapers, start=1):
        name = wp["name"]
        url = wp["url"]
        clean_name = name.replace(" ", "-")
        
        print(f"[{index}/{len(wallpapers)}] Processing: {clean_name} (Original: {name})...")
        
        zip_temp_path = target_dir / f"{clean_name}_temp.zip"
        
        try:
            print(f"   📥 Downloading from Apple servers...")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(zip_temp_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    
            print(f"   📦 Extracting image from ZIP...")
            with zipfile.ZipFile(zip_temp_path, 'r') as zip_ref:
                image_in_zip = None
                for file_info in zip_ref.infolist():
                    if file_info.filename.startswith("AssetData/") and not file_info.is_dir():
                        image_in_zip = file_info.filename
                        break
                
                if image_in_zip:
                    ext = os.path.splitext(image_in_zip)[1].lower()
                    final_image_path = target_dir / f"{clean_name}{ext}"
                    
                    with zip_ref.open(image_in_zip) as source_file:
                        with open(final_image_path, "wb") as target_file:
                            target_file.write(source_file.read())
                    print(f"   ✅ Saved directly as: {final_image_path.name}")
                else:
                    print(f"   ⚠️ Warning: No file found inside 'AssetData/' for {name}")
                
            zip_temp_path.unlink(missing_ok=True)
            print()
            
        except Exception as e:
            print(f"   ❌ Failed to process {name}. Error: {e}\n")
            if zip_temp_path.exists():
                zip_temp_path.unlink(missing_ok=True)

    print("========================================")
    print("✨ All downloads and extractions completed! ✨")
    print(f"📂 Saved to: '{target_dir}'")
    print("========================================")

if __name__ == "__main__":
    download_and_extract_wallpapers()