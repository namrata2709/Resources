import os
import json
import re
import html
from datetime import datetime

ROOT = "../data/notes"
OUTPUT = "../data/notes-list.json"

IMAGE_EXT = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")


# -----------------------------
# Utilities
# -----------------------------

def normalize_text(text: str) -> str:
    text = html.unescape(text)  # ✅ fix HTML entities
    text = re.sub(r'^[^\w]+', '', text)
    text = text.replace("-", " ").replace("_", " ")
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def smart_title(text: str) -> str:
    words = text.split()
    result = []

    for w in words:
        if w.isupper() or any(char.isdigit() for char in w):
            result.append(w)  # keep AWS, EC2
        else:
            result.append(w.capitalize())

    return " ".join(result)


def parse_date_safe(date_str: str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except Exception:
        return datetime.min


def read_html(base_path):
    for name in ("complete.html", "overview.html"):
        path = os.path.join(base_path, name)
        if os.path.isfile(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    return f.read()
            except Exception:
                return None
    return None


# -----------------------------
# Extractors
# -----------------------------

def extract_title(content):
    if not content:
        return None

    match = re.search(r'<h1>(.*?)</h1>', content, re.DOTALL)
    if not match:
        return None

    raw = match.group(1)
    clean = normalize_text(raw)
    return smart_title(clean)


def extract_date(content):
    if not content:
        return None

    match = re.search(r'📅\s*(.*?)</p>', content)
    if not match:
        return None

    try:
        parsed = datetime.strptime(match.group(1).strip(), "%B %d, %Y")
        return parsed.strftime("%Y-%m-%d")
    except Exception:
        return None


def extract_tags(content):
    if not content:
        return []

    matches = re.findall(r'<span class="tag">(.*?)</span>', content)
    tags = [normalize_text(tag) for tag in matches if tag.strip()]

    return list(dict.fromkeys(tags))  # remove duplicates


def extract_metadata_date(base_path):
    path = os.path.join(base_path, "metadata.json")
    if not os.path.isfile(path):
        return None

    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f).get("date")
    except Exception:
        return None


def fallback_folder_date(base_path):
    oldest = None

    for root, _, files in os.walk(base_path):
        for f in files:
            try:
                t = os.path.getmtime(os.path.join(root, f))
                if oldest is None or t < oldest:
                    oldest = t
            except Exception:
                continue

    if oldest:
        return datetime.fromtimestamp(oldest).strftime("%Y-%m-%d")

    return "1970-01-01"


# -----------------------------
# Classification
# -----------------------------

def detect_category(folder):
    mapping = {
        "compute": ["ec2", "lambda", "ecs", "eks", "fargate"],
        "storage": ["s3", "ebs", "efs", "glacier"],
        "database": ["rds", "dynamodb", "redshift", "aurora"],
        "networking": ["vpc", "cloudfront", "route53", "alb", "nlb"],
        "security": ["iam", "kms", "waf", "shield", "cognito"],
        "monitoring": ["cloudwatch", "cloudtrail"],
        "management": ["cloudformation", "systems-manager"],
        "fundamentals": ["basics", "introduction", "cloud"],
    }

    folder = folder.lower()

    for category, keys in mapping.items():
        if any(k in folder for k in keys):
            return category.title()

    return "General"


def detect_difficulty(folder):
    f = folder.lower()

    if any(x in f for x in ["basics", "introduction", "fundamentals"]):
        return "Beginner"
    if any(x in f for x in ["advanced", "architecture", "deep"]):
        return "Advanced"

    return "Intermediate"


# -----------------------------
# Builder
# -----------------------------

def build_note(folder):
    base = os.path.join(ROOT, folder)
    content = read_html(base)

    title = extract_title(content) or smart_title(normalize_text(folder))
    category = detect_category(folder)
    difficulty = detect_difficulty(folder)

    tags = extract_tags(content) or [category]

    # images
    images = []
    img_dir = os.path.join(base, "images")

    if os.path.isdir(img_dir):
        for f in os.listdir(img_dir):
            if f.lower().endswith(IMAGE_EXT):
                images.append({
                    "name": smart_title(normalize_text(os.path.splitext(f)[0])),
                    "file": f
                })

    # files
    files = []
    for f in os.listdir(base):
        full = os.path.join(base, f)

        if not os.path.isfile(full):
            continue

        if f.lower().endswith(".html"):
            files.append({
                "name": smart_title(normalize_text(os.path.splitext(f)[0])),
                "file": f,
                "type": "html",
                "icon": "📄"
            })

    # date priority
    date = (
        extract_metadata_date(base)
        or extract_date(content)
        or fallback_folder_date(base)
    )

    return {
        "title": title,
        "folder": folder,
        "date": date,
        "type": "daily",
        "category": category,
        "difficulty": difficulty,
        "tags": tags,
        "hasImages": bool(images),
        "images": sorted(images, key=lambda x: x["file"]),
        "files": sorted(files, key=lambda x: x["file"])
    }


def is_valid_topic_folder(path):
    if not os.path.isdir(path):
        return False

    name = os.path.basename(path)

    if name.startswith('.') or name in ['images', 'json', '__pycache__']:
        return False

    return any(
        os.path.isfile(os.path.join(path, f))
        for f in ("overview.html", "complete.html")
    )


# -----------------------------
# Main
# -----------------------------

def main():
    notes = []

    for item in os.listdir(ROOT):
        path = os.path.join(ROOT, item)

        if is_valid_topic_folder(path):
            try:
                notes.append(build_note(item))
            except Exception as e:
                print(f"❌ Failed: {item} → {e}")

    notes.sort(key=lambda x: parse_date_safe(x["date"]), reverse=True)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({"notes": notes}, f, indent=2, ensure_ascii=False)

    print(f"✅ Generated {len(notes)} notes")


if __name__ == "__main__":
    main()