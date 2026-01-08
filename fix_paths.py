#!/usr/bin/env python3
"""
Script to fix all paths after restructuring
"""
import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent

# Path mappings
PATH_MAPPINGS = {
    # Public HTML files (src/public/)
    r'href="assets/': r'href="../assets/',
    r'src="assets/': r'src="../assets/',
    r'from [\'"]\./assets/': r'from "../assets/',
    r'from [\'"]assets/': r'from "../assets/',
    
    # App HTML files (src/app/) - already have ../assets, keep them
    # Admin HTML files (src/admin/) - already have ../assets, keep them
    
    # JavaScript imports in public.js
    r'from [\'"]\./assets/js/services/': r'from "../assets/js/services/',
    r'from [\'"]\./assets/js/components/': r'from "../assets/js/components/',
    
    # Update router paths
    r'/app/': r'/src/app/',
    r'/backoffice/': r'/src/admin/',
    r'/index.html': r'/src/public/index.html',
}

def fix_file(file_path):
    """Fix paths in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply all mappings
        for pattern, replacement in PATH_MAPPINGS.items():
            content = re.sub(pattern, replacement, content)
        
        # Only write if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

def main():
    """Main function"""
    print("Fixing paths after restructuring...")
    
    # Files to fix
    files_to_fix = []
    
    # HTML files
    for html_file in BASE_DIR.rglob('*.html'):
        files_to_fix.append(html_file)
    
    # JavaScript files
    for js_file in BASE_DIR.rglob('*.js'):
        files_to_fix.append(js_file)
    
    fixed_count = 0
    for file_path in files_to_fix:
        if fix_file(file_path):
            fixed_count += 1
            print(f"Fixed: {file_path.relative_to(BASE_DIR)}")
    
    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()









