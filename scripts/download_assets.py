import os
import urllib.request
import json
import time

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 TokatTashanSim/1.0'}

TEXTURE_TARGETS = {
    'stone': {'id': 'castle_wall_slates', 'res': '1k'},
    'brick': {'id': 'brick_wall_04', 'res': '1k'},
    'cobble': {'id': 'cobblestone_large_01', 'res': '1k'},
    'roof': {'id': 'clay_roof_tiles', 'res': '1k'},
    'wood': {'id': 'rough_wood', 'res': '1k'},
    'plaster': {'id': 'beige_wall_001', 'res': '1k'}
}

HDRI_TARGET = {'id': 'kloppenheim_06', 'res': '1k'}

DEST_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')

def download_file(url, dest_path):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 1000:
        print(f"Already exists: {os.path.basename(dest_path)} ({os.path.getsize(dest_path)} bytes)")
        return True
    print(f"Downloading: {url} -> {dest_path}")
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"  OK: {os.path.getsize(dest_path)} bytes")
        return True
    except Exception as e:
        print(f"  FAILED: {e}")
        return False

def main():
    os.makedirs(DEST_DIR, exist_ok=True)
    manifest = {'textures': {}, 'hdri': {}}

    # 1. Download Textures
    for key, info in TEXTURE_TARGETS.items():
        tex_id = info['id']
        res = info['res']
        target_dir = os.path.join(DEST_DIR, 'textures', key)
        os.makedirs(target_dir, exist_ok=True)

        meta_url = f"https://api.polyhaven.com/files/{tex_id}"
        print(f"\nFetching metadata for {key} ({tex_id})...")
        req = urllib.request.Request(meta_url, headers=HEADERS)
        data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))

        channels = {
            'diffuse': ('Diffuse', 'jpg'),
            'normal': ('nor_gl' if 'nor_gl' in data else 'nor_dx', 'jpg'),
            'roughness': ('Rough', 'jpg'),
            'ao': ('AO', 'jpg')
        }

        manifest['textures'][key] = {}

        for ch_name, (api_key, ext) in channels.items():
            if api_key not in data:
                print(f"  Warning: {api_key} not in {tex_id}")
                continue
            res_entry = data[api_key].get(res) or data[api_key].get('1k')
            if not res_entry:
                print(f"  Warning: res {res} not in {api_key}")
                continue
            format_entry = res_entry.get(ext) or res_entry.get('png')
            if not format_entry:
                print(f"  Warning: format {ext} not in {res_entry}")
                continue
            
            file_url = format_entry['url']
            dest_filename = f"{key}_{ch_name}.jpg"
            dest_file_path = os.path.join(target_dir, dest_filename)
            success = download_file(file_url, dest_file_path)
            if success:
                manifest['textures'][key][ch_name] = f"/assets/textures/{key}/{dest_filename}"
        time.sleep(0.5)

    # 2. Download HDRI
    hdri_id = HDRI_TARGET['id']
    hdri_res = HDRI_TARGET['res']
    print(f"\nFetching metadata for HDRI ({hdri_id})...")
    req = urllib.request.Request(f"https://api.polyhaven.com/files/{hdri_id}", headers=HEADERS)
    hdri_data = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    
    hdri_url = hdri_data['hdri'][hdri_res]['hdr']['url']
    hdri_dest = os.path.join(DEST_DIR, 'hdri', f"{hdri_id}_{hdri_res}.hdr")
    if download_file(hdri_url, hdri_dest):
        manifest['hdri']['url'] = f"/assets/hdri/{hdri_id}_{hdri_res}.hdr"

    # Save manifest
    manifest_path = os.path.join(DEST_DIR, 'assets_manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as mf:
        json.dump(manifest, mf, indent=2)
    print(f"\nSaved assets manifest to {manifest_path}")

if __name__ == '__main__':
    main()
