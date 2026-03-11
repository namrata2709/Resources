import os
import json

ROOT = "."
OUTPUT = "../kc-list.json"

def main():
    items = []

    for file in os.listdir(ROOT):
        if not file.lower().endswith(".json"):
            continue

        path = os.path.join(ROOT, file)

        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except:
            continue

        title = data.get("title")
        topic = data.get("topic")

        if not title or not topic:
            continue

        items.append({
            "title": title,
            "file": os.path.splitext(file)[0],
            "topic": topic
        })

    items.sort(key=lambda x: (x["topic"], x["title"]))

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump({ "knowledgeChecks": items }, f, indent=2)

    print(f"Wrote {len(items)} KC entries to {OUTPUT}")

if __name__ == "__main__":
    main()
