import os
import json
from datetime import datetime
import re

def get_folder_creation_date(base):
    """Get earliest file date inside folder (approx creation date)"""
    
    oldest_time = None

    for root, _, files in os.walk(base):
        for f in files:
            path = os.path.join(root, f)

            try:
                t = os.path.getmtime(path)  # last modified time

                if oldest_time is None or t < oldest_time:
                    oldest_time = t

            except Exception:
                continue

    if oldest_time:
        return datetime.fromtimestamp(oldest_time).strftime("%Y-%m-%d")

    # fallback if folder empty
    return "1970-01-01"

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return datetime.min
    
def extract_date_from_html(base_path):
    """Extract date from complete.html or overview.html"""
    
    for filename in ["complete.html", "overview.html"]:
        file_path = os.path.join(base_path, filename)
        
        if os.path.isfile(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Find date inside <p class="note-date">
                match = re.search(
                    r'<p class="note-date">.*?📅\s*(.*?)</p>',
                    content
                )
                
                if match:
                    raw_date = match.group(1).strip()
                    # Convert "December 24, 2025" → "2025-12-24"
                    parsed = datetime.strptime(raw_date, "%B %d, %Y")
                    return parsed.strftime("%Y-%m-%d")
            
            except Exception as e:
                print(f"⚠️ Error reading date from {filename}: {e}")
    
    return None

ROOT = "../data/notes"
OUTPUT = "../data/notes-list.json"

IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")

def clean_title(name):
    """Convert folder name to display title"""
    return name.replace("-", " ").replace("_", " ").title()

def detect_category(folder_name):
    """Detect AWS category from folder name"""
    categories = {
        "compute": ["ec2", "lambda", "elastic-beanstalk", "ecs", "eks", "fargate"],
        "storage": ["s3", "ebs", "efs", "glacier", "storage-gateway"],
        "database": ["rds", "dynamodb", "elasticache", "redshift", "aurora"],
        "networking": ["vpc", "cloudfront", "route53", "elb", "alb", "nlb", "api-gateway"],
        "security": ["iam", "kms", "secrets-manager", "waf", "shield", "cognito", "security-group"],
        "monitoring": ["cloudwatch", "cloudtrail", "x-ray"],
        "management": ["cloudformation", "systems-manager", "organizations", "config"],
        "fundamentals": ["cloud", "virtualization", "infrastructure", "basics", "introduction"]
    }
    
    folder_lower = folder_name.lower()
    for category, keywords in categories.items():
        if any(keyword in folder_lower for keyword in keywords):
            return category.title()
    
    return "General"

def detect_difficulty(folder_name):
    """Detect difficulty level from folder name"""
    folder_lower = folder_name.lower()
    
    if any(word in folder_lower for word in ["basics", "introduction", "fundamentals", "overview"]):
        return "Beginner"
    elif any(word in folder_lower for word in ["advanced", "deep-dive", "optimization", "architecture"]):
        return "Advanced"
    else:
        return "Intermediate"

def extract_date_from_metadata(base_path):
    """Try to extract date from metadata.json if it exists"""
    metadata_path = os.path.join(base_path, "metadata.json")
    if os.path.isfile(metadata_path):
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                return metadata.get("date", None)
        except:
            pass
    return None

def build_note(folder):
    """Build note entry for a topic folder"""
    base = os.path.join(ROOT, folder)

    # Collect images
    images = []
    images_dir = os.path.join(base, "images")

    if os.path.isdir(images_dir):
        for f in os.listdir(images_dir):
            if f.lower().endswith(IMAGE_EXT):
                images.append({
                    "name": clean_title(os.path.splitext(f)[0]),
                    "file": f
                })

    # Collect files
    files = []
    for f in os.listdir(base):
        full = os.path.join(base, f)
        if not os.path.isfile(full):
            continue

        lower = f.lower()

        # Skip certain files
        if lower.endswith(".md"):
            continue
        if lower in ["youtube.html", "whiteboard.pdf", "metadata.json"]:
            continue

        if lower.endswith(".html"):
            files.append({
                "name": clean_title(os.path.splitext(f)[0]),
                "file": f,
                "type": "html",
                "icon": "📄"
            })

    # Try to get date from metadata, otherwise use current date
    date_str = extract_date_from_metadata(base)

    if not date_str:
        date_str = extract_date_from_html(base)

    if not date_str:
        date_str = get_folder_creation_date(base)  # optional fallback
    return {
        "title": clean_title(folder),
        "folder": folder,
        "date": date_str,
        "type": "daily",
        "category": detect_category(folder),
        "difficulty": detect_difficulty(folder),
        "hasImages": len(images) > 0,
        "images": sorted(images, key=lambda x: x["file"]),
        "files": sorted(files, key=lambda x: x["file"])
    }

def is_valid_topic_folder(folder_path):
    """Check if folder is a valid topic folder"""
    # Must be a directory
    if not os.path.isdir(folder_path):
        return False
    
    # Must not be hidden or special directories
    folder_name = os.path.basename(folder_path)
    if folder_name.startswith('.') or folder_name in ['images', 'json', '__pycache__']:
        return False
    
    # Must contain at least overview.html or complete.html
    has_overview = os.path.isfile(os.path.join(folder_path, "overview.html"))
    has_complete = os.path.isfile(os.path.join(folder_path, "complete.html"))
    
    return has_overview or has_complete

def main():
    notes = []

    # Scan all folders in ROOT
    for item in os.listdir(ROOT):
        item_path = os.path.join(ROOT, item)
        
        if is_valid_topic_folder(item_path):
            notes.append(build_note(item))

    # Sort by date (most recent first)
    notes.sort(
        key=lambda x: parse_date(x["date"]),
        reverse=True
    )

    # Write to JSON
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({"notes": notes}, f, indent=2, ensure_ascii=False)

    print(f"✅ Wrote {len(notes)} topics to {OUTPUT}")
    
    # Print summary
    categories = {}
    for note in notes:
        cat = note.get("category", "General")
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n📊 Summary by category:")
    for cat, count in sorted(categories.items()):
        print(f"   {cat}: {count} topics")

if __name__ == "__main__":
    main()