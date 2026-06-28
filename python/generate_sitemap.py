#!/usr/bin/env python3
"""
Sitemap Generator for AWS Training Notes
Automatically scans data/notes/ and generates sitemap.xml
"""

import os
from datetime import datetime
from pathlib import Path

BASE_URL = "https://namrata2709.github.io/Resources"
NOTES_DIR = "../data/notes"
OUTPUT_FILE = "../sitemap.xml"

def is_date_folder(folder_name):
    """Check if folder name matches DD-MM-YYYY pattern"""
    parts = folder_name.split('-')
    return len(parts) == 3 and all(p.isdigit() for p in parts)

def generate_sitemap():
    """Generate sitemap.xml from data/notes/ structure"""
    
    urls = []
    
    # Add main pages
    main_pages = [
        "",  # index.html
        "notes.html",
        "quiz-list.html",
    ]
    
    for page in main_pages:
        urls.append({
            'loc': f"{BASE_URL}/{page}",
            'lastmod': datetime.now().strftime('%Y-%m-%d'),
            'changefreq': 'weekly',
            'priority': '1.0' if page == '' else '0.9'
        })
    # Scan notes folders
    notes_path = Path(NOTES_DIR)
    if notes_path.exists():
        for folder in sorted(notes_path.iterdir()):
            if folder.is_dir() and not folder.name.startswith('.'):
                
                
                # Add completed.html
                complete = folder / "complete.html"
                if complete.exists():
                    urls.append({
                        'loc': f"{BASE_URL}/data/notes/{folder.name}/complete.html",
                        'lastmod': datetime.fromtimestamp(complete.stat().st_mtime).strftime('%Y-%m-%d'),
                        'changefreq': 'monthly',
                        'priority': '0.7'
                    })
    
    # Generate XML
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    for url in urls:
        xml_content += '  <url>\n'
        xml_content += f'    <loc>{url["loc"]}</loc>\n'
        xml_content += f'    <lastmod>{url["lastmod"]}</lastmod>\n'
        xml_content += f'    <changefreq>{url["changefreq"]}</changefreq>\n'
        xml_content += f'    <priority>{url["priority"]}</priority>\n'
        xml_content += '  </url>\n'
    
    xml_content += '</urlset>'
    
    # Write to file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print(f"✅ Sitemap generated successfully!")
    print(f"📁 Output: {OUTPUT_FILE}")
    print(f"📊 Total URLs: {len(urls)}")

if __name__ == "__main__":
    generate_sitemap()