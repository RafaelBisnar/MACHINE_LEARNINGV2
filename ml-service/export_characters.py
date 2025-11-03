"""
Script to export character data from TypeScript to JSON
Run this whenever you update your characters.ts file
"""

import json
import re
import sys
import os

def parse_typescript_characters(ts_file_path):
    """
    Parse the TypeScript characters.ts file and extract character data
    """
    with open(ts_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the CHARACTERS array
    match = re.search(r'export const CHARACTERS: Character\[\] = \[(.*?)\];', content, re.DOTALL)
    if not match:
        raise ValueError("Could not find CHARACTERS array in TypeScript file")
    
    array_content = match.group(1)
    
    # Extract individual character objects
    # This is a simplified parser - adjust if needed
    characters = []
    
    # Split by character objects (looking for id field)
    char_pattern = r'\{[^}]*id:\s*["\']([^"\']+)["\'][^}]*\}'
    
    # More robust: find all character objects
    char_blocks = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', array_content)
    
    for block in char_blocks:
        if 'id:' not in block:
            continue
            
        char_data = {}
        
        # Extract id
        id_match = re.search(r'id:\s*["\']([^"\']+)["\']', block)
        if id_match:
            char_data['id'] = id_match.group(1)
        
        # Extract name
        name_match = re.search(r'name:\s*["\']([^"\']+)["\']', block)
        if name_match:
            char_data['name'] = name_match.group(1)
        
        # Extract quote
        quote_match = re.search(r'quote:\s*["\']([^"\']+)["\']', block)
        if quote_match:
            char_data['quote'] = quote_match.group(1)
        
        # Extract source
        source_match = re.search(r'source:\s*["\']([^"\']+)["\']', block)
        if source_match:
            char_data['source'] = source_match.group(1)
        
        # Extract universe
        universe_match = re.search(r'universe:\s*["\']([^"\']+)["\']', block)
        if universe_match:
            char_data['universe'] = universe_match.group(1)
        
        # Extract genre
        genre_match = re.search(r'genre:\s*["\']([^"\']+)["\']', block)
        if genre_match:
            char_data['genre'] = genre_match.group(1)
        
        # Extract imageUrl
        image_match = re.search(r'imageUrl:\s*["\']([^"\']+)["\']', block)
        if image_match:
            char_data['imageUrl'] = image_match.group(1)
        
        # Extract aliases
        aliases_match = re.search(r'aliases:\s*\[(.*?)\]', block)
        if aliases_match:
            aliases_str = aliases_match.group(1)
            aliases = re.findall(r'["\']([^"\']+)["\']', aliases_str)
            char_data['aliases'] = aliases
        
        if char_data.get('id'):
            characters.append(char_data)
    
    return characters


def main():
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    ts_file = os.path.join(project_root, 'server', 'data', 'characters.ts')
    json_file = os.path.join(script_dir, 'characters.json')
    
    print("=" * 60)
    print("Exporting Characters from TypeScript to JSON")
    print("=" * 60)
    print(f"\nReading from: {ts_file}")
    
    if not os.path.exists(ts_file):
        print(f"❌ Error: File not found: {ts_file}")
        sys.exit(1)
    
    try:
        characters = parse_typescript_characters(ts_file)
        
        # Save to JSON
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(characters, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Exported {len(characters)} characters")
        print(f"✓ Saved to: {json_file}")
        
        # Show sample
        if characters:
            print(f"\nSample character:")
            print(f"  - ID: {characters[0]['id']}")
            print(f"  - Name: {characters[0]['name']}")
            print(f"  - Universe: {characters[0].get('universe', 'N/A')}")
        
        print("\n✓ Export complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
