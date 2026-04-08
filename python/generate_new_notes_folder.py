import os

def create_structure():
    try:
        # Base path
        base_root = os.path.join("..", "data", "notes")
        os.makedirs(base_root, exist_ok=True)

        # User input folder inside notes
        folder_name = input("Enter folder name: ").strip()
        if not folder_name:
            print("❌ Folder name cannot be empty")
            return

        base_path = os.path.join(base_root, folder_name)
        os.makedirs(base_path, exist_ok=True)

        # Create complete.html
        html_path = os.path.join(base_path, "complete.html")
        with open(html_path, "w", encoding="utf-8") as f:
            f.write("""<!DOCTYPE html>
<html>
<head>
    <title>Complete</title>
</head>
<body>
</body>
</html>
""")

        # Create images folder
        images_path = os.path.join(base_path, "images")
        os.makedirs(images_path, exist_ok=True)

        # Create json folder
        json_path = os.path.join(base_path, "json")
        os.makedirs(json_path, exist_ok=True)

        # JSON files
        json_files = ["mcq.json", "interview.json", "glossary.json", "checklist.json"]

        for file_name in json_files:
            file_path = os.path.join(json_path, file_name)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write("{}")

        print(f"\n✅ Created successfully at: {os.path.abspath(base_path)}")

    except Exception as e:
        print("❌ Error:", e)


if __name__ == "__main__":
    create_structure()