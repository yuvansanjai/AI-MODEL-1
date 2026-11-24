import json
import pandas as pd
import os

# 1. Define paths based on your VS Code workspace structure
db_dir = "database"
thirukkural_path = os.path.join(db_dir, "thirukkural.json")
detail_path = os.path.join(db_dir, "detail.json")

# 2. Load JSONs with explicit UTF-8 encoding to prevent DecodeErrors
with open(thirukkural_path, 'r', encoding='utf-8') as f:
    kural_data = json.load(f)
    
with open(detail_path, 'r', encoding='utf-8') as f:
    detail_data = json.load(f)

# 3. Map Adhikaram (Chapters) and Divisions from detail.json
kural_meta = {}
for division in detail_data[0]['section']['detail']:
    div_name_ta = division['name']
    div_name_en = division['translation']
    for iyal in division['chapterGroup']['detail']:
        for chapter in iyal['chapters']['detail']:
            start = chapter['start']
            end = chapter['end']
            for num in range(start, end + 1):
                kural_meta[num] = {
                    "division_ta": div_name_ta,
                    "division_en": div_name_en,
                    "chapter_ta": chapter['name'],
                    "chapter_en": chapter['translation']
                }

# 4. Merge data into a flat structure
records = []
for kural in kural_data['kural']:
    num = kural.get("Number")
    meta = kural_meta.get(num, {})
    
    record = {
        "kural_number": num,
        "tamil_line1": kural.get("Line1"),
        "tamil_line2": kural.get("Line2"),
        "division_ta": meta.get("division_ta", ""),
        "division_en": meta.get("division_en", ""),
        "chapter_ta": meta.get("chapter_ta", ""),
        "chapter_en": meta.get("chapter_en", ""),
        "tamil_meaning_mv": kural.get("mv"), # Mu. Varadarajan meaning
        "tamil_meaning_sp": kural.get("sp"), # Solomon Pappaiah meaning
        "english_translation": kural.get("Translation"),
        "english_explanation": kural.get("explanation")
    }
    records.append(record)

# 5. Export to CSV for the Search Module
df = pd.DataFrame(records)
output_csv = os.path.join(db_dir, "kural_data.csv")
# utf-8-sig ensures Excel/pandas reads Tamil characters correctly
df.to_csv(output_csv, index=False, encoding='utf-8-sig')

print("\n--- DATASET VALIDATION ---")
print(f"Total records processed: {len(df)}")
print(f"Unique Kural numbers: {df['kural_number'].nunique()}")
print(f"Missing Kural numbers: {sorted(set(range(1, 1331)) - set(df['kural_number']))}")
print(f"Successfully saved merged database to {output_csv}")