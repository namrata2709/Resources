import os
import json
from datetime import datetime
import re

ROOT = "../data/notes"
OUTPUT = "../data/notes-list.json"

IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")


# -----------------------------
# Helpers
# -----------------------------

def clean_title(name):
    return name.replace("-", " ").replace("_", " ").title()


def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        return datetime.min


def get_folder_creation_date(base):
    """Fallback date using oldest file timestamp"""
    oldest_time = None

    for root, _, files in os.walk(base):
        for f in files:
            path = os.path.join(root, f)
            try:
                t = os.path.getmtime(path)
                if oldest_time is None or t < oldest_time:
                    oldest_time = t
            except Exception:
                continue

    if oldest_time:
        return datetime.fromtimestamp(oldest_time).strftime("%Y-%m-%d")

    return "1970-01-01"


# -----------------------------
# HTML Extractors
# -----------------------------

def extract_title_from_html(base_path):
    for filename in ["complete.html", "overview.html"]:
        file_path = os.path.join(base_path, filename)

        if not os.path.isfile(file_path):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            match = re.search(
                r'<div class="note-header">.*?<h1>(.*?)</h1>',
                content,
                re.DOTALL
            )

            if match:
                return match.group(1).strip()

        except Exception as e:
            print(f"⚠️ Title extraction failed ({filename}): {e}")

    return None


def extract_date_from_html(base_path):
    for filename in ["complete.html", "overview.html"]:
        file_path = os.path.join(base_path, filename)

        if not os.path.isfile(file_path):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            match = re.search(
                r'<p class="note-date">.*?📅\s*(.*?)</p>',
                content
            )

            if match:
                raw_date = match.group(1).strip()
                parsed = datetime.strptime(raw_date, "%B %d, %Y")
                return parsed.strftime("%Y-%m-%d")

        except Exception as e:
            print(f"⚠️ Date extraction failed ({filename}): {e}")

    return None


def extract_tags_from_html(base_path):
    """Extract tags from HTML safely"""
    tags = []

    for filename in ["complete.html", "overview.html"]:
        file_path = os.path.join(base_path, filename)

        if not os.path.isfile(file_path):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            matches = re.findall(r'<span class="tag">(.*?)</span>', content)

            if matches:
                tags = list(dict.fromkeys(tag.strip() for tag in matches if tag.strip()))
                break

        except Exception as e:
            print(f"⚠️ Tag extraction failed ({filename}): {e}")

    return tags


def extract_date_from_metadata(base_path):
    metadata_path = os.path.join(base_path, "metadata.json")

    if os.path.isfile(metadata_path):
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
                return metadata.get("date", None)
        except Exception:
            pass

    return None


# -----------------------------
# Detection Logic
# -----------------------------

def detect_category(folder_name):
    categories = {
        "compute": ["ec2", "lambda", "ecs", "eks", "fargate"],
        "storage": ["s3", "ebs", "efs", "glacier"],
        "database": ["rds", "dynamodb", "redshift", "aurora"],
        "networking": ["vpc", "cloudfront", "route53", "alb", "nlb"],
        "security": ["iam", "kms", "waf", "shield", "cognito"],
        "monitoring": ["cloudwatch", "cloudtrail"],
        "management": ["cloudformation", "systems-manager"],
        "fundamentals": ["basics", "introduction", "cloud"]
    }

    folder_lower = folder_name.lower()

    for category, keywords in categories.items():
        if any(keyword in folder_lower for keyword in keywords):
            return category.title()

    return "General"


def detect_difficulty(folder_name):
    folder_lower = folder_name.lower()

    if any(word in folder_lower for word in ["basics", "introduction", "fundamentals"]):
        return "Beginner"
    elif any(word in folder_lower for word in ["advanced", "architecture", "deep"]):
        return "Advanced"
    return "Intermediate"


# -----------------------------
# Core Builder
# -----------------------------

def build_note(folder):
    base = os.path.join(ROOT, folder)

    # Title
    try:
        title = extract_title_from_html(base) or clean_title(folder)
    except Exception:
        title = clean_title(folder)

    # Category & difficulty
    category = detect_category(folder)
    difficulty = detect_difficulty(folder)

    # Tags
    try:
        tags = extract_tags_from_html(base)
    except Exception:
        tags = []

    if not tags:
        tags = [category]

    # Images
    images = []
    images_dir = os.path.join(base, "images")

    if os.path.isdir(images_dir):
        for f in os.listdir(images_dir):
            if f.lower().endswith(IMAGE_EXT):
                images.append({
                    "name": clean_title(os.path.splitext(f)[0]),
                    "file": f
                })

    # Files
    files = []
    for f in os.listdir(base):
        full = os.path.join(base, f)

        if not os.path.isfile(full):
            continue

        lower = f.lower()

        if lower.endswith(".md"):
            continue
        if lower in ["metadata.json"]:
            continue

        if lower.endswith(".html"):
            files.append({
                "name": clean_title(os.path.splitext(f)[0]),
                "file": f,
                "type": "html",
                "icon": "📄"
            })

    # Date
    try:
        date_str = extract_date_from_metadata(base)
        if not date_str:
            date_str = extract_date_from_html(base)
        if not date_str:
            date_str = get_folder_creation_date(base)
    except Exception:
        date_str = "1970-01-01"

    return {
        "title": title,
        "folder": folder,
        "date": date_str,
        "type": "daily",
        "category": category,
        "difficulty": difficulty,
        "tags": tags,
        "hasImages": len(images) > 0,
        "images": sorted(images, key=lambda x: x["file"]),
        "files": sorted(files, key=lambda x: x["file"])
    }


def is_valid_topic_folder(folder_path):
    if not os.path.isdir(folder_path):
        return False

    folder_name = os.path.basename(folder_path)

    if folder_name.startswith('.') or folder_name in ['images', 'json', '__pycache__']:
        return False

    return (
        os.path.isfile(os.path.join(folder_path, "overview.html")) or
        os.path.isfile(os.path.join(folder_path, "complete.html"))
    )


# -----------------------------
# Main
# -----------------------------

def main():
    notes = []

    for item in os.listdir(ROOT):
        item_path = os.path.join(ROOT, item)

        if is_valid_topic_folder(item_path):
            try:
                notes.append(build_note(item))
            except Exception as e:
                print(f"❌ Failed to process {item}: {e}")

    notes.sort(key=lambda x: parse_date(x["date"]), reverse=True)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({"notes": notes}, f, indent=2, ensure_ascii=False)

    print(f"✅ Wrote {len(notes)} topics to {OUTPUT}")


if __name__ == "__main__":
    main()