import os

def ensure_structure(base_root):
    try:
        if not os.path.exists(base_root):
            print("❌ Base path not found:", base_root)
            return

        for folder in os.listdir(base_root):
            folder_path = os.path.join(base_root, folder)

            if not os.path.isdir(folder_path):
                continue

            print(f"\n📁 Checking: {folder}")

            # ---- complete.html ----
            html_path = os.path.join(folder_path, "complete.html")
            if not os.path.exists(html_path):
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
                print("  + created complete.html")

            # ---- images folder ----
            images_path = os.path.join(folder_path, "images")
            if not os.path.exists(images_path):
                os.makedirs(images_path)
                print("  + created images/")

            # ---- json folder + files ----
            json_path = os.path.join(folder_path, "json")
            if not os.path.exists(json_path):
                os.makedirs(json_path)
                print("  + created json/")

            json_files = ["mcq.json", "interview.json", "glossary.json", "checklist.json"]

            for file_name in json_files:
                file_path = os.path.join(json_path, file_name)
                if not os.path.exists(file_path):
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write("{}")
                    print(f"  + created json/{file_name}")

            # ---- markdown folder + files ----
            markdown_path = os.path.join(folder_path, "markdown")
            if not os.path.exists(markdown_path):
                os.makedirs(markdown_path)
                print("  + created markdown/")

            md_files = ["screenshot.md", "image.md"]

            for file_name in md_files:
                file_path = os.path.join(markdown_path, file_name)
                if not os.path.exists(file_path):
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write("# " + file_name.replace(".md", "").capitalize() + "\n")
                    print(f"  + created markdown/{file_name}")

        print("\n✅ Done checking all folders")

    except Exception as e:
        print("❌ Error:", e)


if __name__ == "__main__":
    base_root = os.path.join("..", "data", "notes")
    ensure_structure(base_root)