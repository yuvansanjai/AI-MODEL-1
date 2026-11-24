#!/usr/bin/env python3
"""
Thiruvalluvar AI - Thirukkural Database Import Script
Generates and populates backend/database/kurals.db with all 1,330 Thirukkural couplets.

Sections:
- அறத்துப்பால் (Virtue): Chapters 1-38, Kurals 1-380
- பொருட்பால் (Wealth): Chapters 39-108, Kurals 381-1080
- காமத்துப்பால் (Love): Chapters 109-133, Kurals 1081-1330
"""

import os
import sys
import json
import sqlite3
import re
import urllib.request

# Ensure UTF-8 output encoding for console
sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "kurals.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
LOCAL_KURALS_JSON = os.path.join(BASE_DIR, "thirukkural.json")
LOCAL_DETAIL_JSON = os.path.join(BASE_DIR, "detail.json")

# Verified remote data sources
REMOTE_KURALS_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json"
REMOTE_DETAIL_URL = "https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json"

# System generated local step cache fallback
CACHE_PATHS_KURALS = [
    LOCAL_KURALS_JSON,
    r"C:\Users\YUVAN SANJAI\.gemini\antigravity\brain\299d957a-ed44-4b74-865f-314d1dd869ae\.system_generated\steps\8\content.md",
]

CACHE_PATHS_DETAIL = [
    LOCAL_DETAIL_JSON,
    r"C:\Users\YUVAN SANJAI\.gemini\antigravity\brain\299d957a-ed44-4b74-865f-314d1dd869ae\.system_generated\steps\14\content.md",
]


def load_json_from_markdown_or_file(path):
    """Load JSON data from a plain JSON file or markdown with YAML/markdown headers."""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # If file contains markdown frontmatter / header with '---', extract after it
    if "---" in content:
        parts = content.split("---", 1)
        json_candidate = parts[1].strip()
        try:
            return json.loads(json_candidate)
        except Exception:
            pass

    return json.loads(content)


def fetch_or_load_data(remote_url, local_candidates, save_local_path):
    """Attempt loading from local candidate paths, otherwise download from remote URL."""
    for path in local_candidates:
        if os.path.exists(path):
            try:
                print(f"Loading data from local cache: {path}")
                data = load_json_from_markdown_or_file(path)
                # If local target doesn't exist, save clean copy
                if not os.path.exists(save_local_path):
                    with open(save_local_path, "w", encoding="utf-8") as out_f:
                        json.dump(data, out_f, ensure_ascii=False, indent=2)
                return data
            except Exception as e:
                print(f"Failed to parse {path}: {e}")

    print(f"Downloading data from: {remote_url}")
    req = urllib.request.Request(
        remote_url,
        headers={"User-Agent": "ThiruvalluvarAI-DBBuilder/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        content = response.read().decode("utf-8")
        data = json.loads(content)
        with open(save_local_path, "w", encoding="utf-8") as out_f:
            json.dump(data, out_f, ensure_ascii=False, indent=2)
        return data


# Stopwords for keyword filtering
ENGLISH_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
    "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
    "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
    "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my",
    "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
    "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's",
    "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
    "them", "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
    "they've", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't",
    "we", "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
    "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
    "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
    "yourselves", "shall", "unto", "doth", "thee", "thou", "thy", "will", "one", "men", "whoever"
}

# Thematic keywords mapped to chapters
CHAPTER_THEMES = {
    1: ["god", "almighty", "lord", "divine", "creator", "worship", "faith", "prayer", "பக்தி", "கடவுள்", "இறைவன்"],
    2: ["rain", "water", "cloud", "monsoon", "drought", "crops", "sky", "வான்", "மழை", "நீர்"],
    3: ["ascetic", "renunciation", "sage", "saint", "virtue", "greatness", "நீத்தார்", "துறவி", "சான்றோர்"],
    4: ["virtue", "dharma", "righteousness", "morality", "duty", "goodness", "அறம்", "அறநெறி", "தர்மம்"],
    5: ["domestic life", "householder", "family", "marriage", "home", "இல்வாழ்க்கை", "குடும்பம்", "இல்லறம்"],
    6: ["wife", "spouse", "partner", "good wife", "household", "மனைவி", "துணைவி", "வாழ்க்கைத்துணை"],
    7: ["children", "sons", "daughters", "offspring", "parenting", "child", "மக்கள்", "பிள்ளைகள்", "மக்கட்பேறு"],
    8: ["love", "affection", "kindness", "compassion", "heart", "அன்பு", "பாசம்", "நேசம்"],
    9: ["hospitality", "guest", "welcoming", "entertaining", "sharing", "விருந்து", "விருந்தோம்பல்"],
    10: ["kind words", "pleasant speech", "courtesy", "sweet words", "gentleness", "இன்சொல்", "இனியவை கூறல்"],
    11: ["gratitude", "thankfulness", "unforgotten help", "kindness", "செய்ந்நன்றி", "நன்றி"],
    12: ["impartiality", "equity", "fairness", "justice", "balance", "நடுவுநிலைமை", "நேர்மை"],
    13: ["self-restraint", "self-control", "humility", "discipline", "modesty", "அடக்கம்", "அடக்கமுடைமை"],
    14: ["decorum", "conduct", "good manners", "discipline", "character", "ஒழுக்கம்", "நற்பண்பு"],
    15: ["not coveting", "fidelity", "loyalty", "chastity", "moral restraint", "பிறனில் விழையாமை"],
    16: ["forbearance", "patience", "tolerance", "endurance", "forgiveness", "பொறை", "பொறுமை"],
    17: ["envy", "jealousy", "not envying", "goodwill", "அழுக்காறாமை", "பொறாமை இன்மை"],
    18: ["greed", "covetousness", "contentment", "not coveting", "வெஃகாமை", "பேராசை இன்மை"],
    19: ["backbiting", "slander", "gossip", "truthfulness", "புறங்கூறாமை"],
    20: ["vain words", "fruitless words", "idle talk", "meaningful speech", "பயனில சொல்லாமை"],
    21: ["dread of evil", "sin", "fear of evil", "bad deeds", "தீவினையச்சம்", "பாவம்"],
    22: ["duty to society", "altruism", "social service", "benevolence", "ஒப்புரவறிதல்"],
    23: ["giving", "charity", "alms", "generosity", "helping poor", "ஈகை", "கொடை"],
    24: ["fame", "renown", "glory", "reputation", "lasting honor", "புகழ்"],
    25: ["compassion", "mercy", "grace", "kindness to living beings", "அருளுடைமை", "கருணை"],
    26: ["abstinence from meat", "vegetarianism", "ahimsa", "meat-eating", "புலால் மறுத்தல்"],
    27: ["penance", "austerity", "tapas", "spiritual power", "தவம்"],
    28: ["hypocrisy", "imposture", "false asceticism", "pretence", "கூடாவொழுக்கம்"],
    29: ["non-stealing", "honesty", "theft", "integrity", "கள்ளாமை"],
    30: ["truthfulness", "truth", "veracity", "honesty", "வாய்மை", "உண்மை"],
    31: ["avoiding anger", "temper", "forbearance", "calmness", "வெகுளாமை", "கோபம் இன்மை"],
    32: ["not injuring", "non-violence", "ahimsa", "innocence", "இன்னா செய்யாமை"],
    33: ["non-killing", "reverence for life", "protection of beings", "கொல்லாமை"],
    34: ["impermanence", "transience of wealth", "mortality", "transitory life", "நிலையாமை"],
    35: ["renunciation", "detachment", "spiritual liberation", "துறவு"],
    36: ["knowledge of truth", "realization", "wisdom", "enlightenment", "மெய்யுணர்தல்"],
    37: ["curbing of desire", "extirpation of desire", "freedom from craving", "அவாவறுத்தல்"],
    38: ["destiny", "fate", "karma", "providence", "ஊழ்", "விதி"],
    39: ["king", "monarch", "sovereign", "royal leadership", "governance", "இறைமாட்சி", "அரசு"],
    40: ["learning", "education", "knowledge", "scholarship", "study", "கல்வி", "படிப்பு"],
    41: ["ignorance", "unlearned", "illiteracy", "lack of education", "கல்லாமை"],
    42: ["listening", "hearing", "learning by ear", "wise counsel", "கேள்வி"],
    43: ["wisdom", "possession of wisdom", "intellect", "prudence", "அறிவுடைமை", "அறிவு"],
    44: ["correction of faults", "faultlessness", "overcoming flaws", "குற்றங்கடிதல்"],
    45: ["guidance of elders", "seeking great men", "association with wise", "பெரியாரைத் துணைக்கோடல்"],
    46: ["avoiding mean company", "good association", "bad company", "சிற்றினம் சேராமை"],
    47: ["deliberation before action", "planning", "judicious action", "தெரிந்து செயல்வகை"],
    48: ["knowing power", "assessment of strength", "capability", "வலியறிதல்"],
    49: ["knowing time", "timeliness", "opportuneness", "right time", "காலமறிதல்"],
    50: ["knowing place", "appropriate place", "strategic location", "இடனறிதல்"],
    51: ["testing men", "trusting men", "selection of staff", "தெரிந்து தெளிதல்"],
    52: ["selection and employment", "delegation of work", "testing capability", "தெரிந்து வினையாடல்"],
    53: ["cherishing kinsmen", "relatives", "family bonds", "சுற்றந்தழால்"],
    54: ["unforgetfulness", "mindfulness", "vigilance", "alertness", "பொச்சாவாமை"],
    55: ["righteous rule", "just governance", "scepter", "justice", "செங்கோன்மை"],
    56: ["unrighteous rule", "tyranny", "cruel governance", "oppression", "கொடுங்கோன்மை"],
    57: ["absence of terror", "gentle rule", "mild governance", "வெருவந்த செய்யாமை"],
    58: ["benignity", "kindly looks", "favor", "graciousness", "கண்ணோட்டம்"],
    59: ["espionage", "spies", "intelligence", "secret agents", "ஒற்றாடல்"],
    60: ["energy", "zeal", "enthusiasm", "initiative", "perseverance", "ஊக்கமுடைமை"],
    61: ["unslothfulness", "freedom from laziness", "industry", "action", "மடியின்மை"],
    62: ["manly effort", "hard work", "perseverance", "enterprise", "ஆள்வினையுடைமை"],
    63: ["unflinching in sorrow", "resilience", "courage in despair", "இடுக்கணழியாமை"],
    64: ["ministers", "counselors", "cabinet", "statesmanship", "அமைச்சு"],
    65: ["eloquence", "power of speech", "persuasive speaking", "oratory", "சொல்வன்மை"],
    66: ["purity of action", "ethical action", "clean deeds", "வினைத்தூய்மை"],
    67: ["power of action", "firmness in action", "resolution", "வினைத்திட்பம்"],
    68: ["mode of action", "execution", "procedure", "strategy", "வினைசெயல்வகை"],
    69: ["embassy", "envoy", "ambassador", "diplomacy", "தூது"],
    70: ["associating with king", "conduct with rulers", "manners at court", "மன்னரைச் சேர்ந்தொழுகல்"],
    71: ["reading signs", "understanding intentions", "intuition", "குறிப்பறிதல்"],
    72: ["judging audience", "knowledge of council", "court address", "அவையறிதல்"],
    73: ["confidence in audience", "courage in assembly", "speech before rulers", "அவையஞ்சாமை"],
    74: ["country", "nation", "homeland", "patriotism", "fertility of land", "நாடு"],
    75: ["fortress", "fort", "defense", "security", "citadel", "அரண்"],
    76: ["wealth", "acquisition of wealth", "treasure", "economy", "பொருள்செயல்வகை"],
    77: ["army", "military strength", "defense forces", "soldiers", "படைமாட்சி"],
    78: ["military spirit", "bravery", "valour", "heroism in battle", "படைச்செருக்கு"],
    79: ["friendship", "true friends", "companionship", "brotherhood", "நட்பு"],
    80: ["investigating friendship", "choosing friends", "testing friendship", "நட்பாராய்தல்"],
    81: ["intimacy", "familiarity", "longstanding friendship", "பழைமை"],
    82: ["bad friendship", "evil companionship", "fake friends", "தீ நட்பு"],
    83: ["false friendship", "deceitful friends", "insincere alliance", "கூடா நட்பு"],
    84: ["folly", "foolishness", "lack of sense", "ignorance", "பேதைமை"],
    85: ["ignorance", "conceit", "presumption", "stubborn folly", "புல்லறிவாண்மை"],
    86: ["hostility", "enmity", "hatred", "feud", "discord", "இகல்"],
    87: ["noble enmity", "merits of enmity", "valour against foes", "பகைமாட்சி"],
    88: ["knowing enemy power", "assessing opposition", "enmity analysis", "பகைத்திறந்தெரிதல்"],
    89: ["internal enmity", "hidden foes", "treachery within", "உட்பகை"],
    90: ["not offending great", "respect for mighty", "caution with elders", "பெரியாரைப் பிழையாமை"],
    91: ["being led by women", "henpecked", "effeminacy", "subservience to wife", "பெண்வழிச்சேறல்"],
    92: ["wanton women", "courtesans", "prostitution", "lustful trap", "வரைவின் மகளிர்"],
    93: ["not drinking intoxicants", "sobriety", "alcoholism", "temperance", "கள்ளுண்ணாமை"],
    94: ["gambling", "gaming", "betting", "ruin of gambling", "சூது"],
    95: ["medicine", "health", "physician", "diet", "healing", "மருந்து"],
    96: ["nobility", "good lineage", "gentle birth", "high character", "குடிமை"],
    97: ["honor", "self-respect", "dignity", "integrity", "மானம்"],
    98: ["greatness", "highness of soul", "magnanimity", "eminence", "பெருமை"],
    99: ["perfect goodness", "nobility of soul", "worth", "righteous conduct", "சான்றாண்மை"],
    100: ["courtesy", "politeness", "urbane manners", "sociability", "பண்புடைமை"],
    101: ["useless wealth", "unprofitable wealth", "miserliness", "hoarded riches", "நன்றியில் செல்வம்"],
    102: ["sense of shame", "modesty", "moral shyness", "guilt", "நாணுடைமை"],
    103: ["advancing family", "elevation of family", "ancestral prestige", "குடிசெயல்வகை"],
    104: ["farming", "agriculture", "farmer", "ploughing", "food producer", "உழவு", "விவசாயம்"],
    105: ["poverty", "destitution", "indigence", "misfortune", "நல்குரவு", "வறுமை"],
    106: ["mendicancy", "begging", "asking alms", "poverty plea", "இரவு"],
    107: ["dread of begging", "shunning mendicancy", "self-reliance", "இரவச்சம்"],
    108: ["baseness", "meanness", "wicked people", "dishonorable conduct", "கயமை"],
    109: ["beauty of maiden", "fascination", "first love", "enchantment", "தகையணங்குறுத்தல்"],
    110: ["recognition of signs", "signs of love", "eye-speech", "loving glances", "குறிப்பறிதல்"],
    111: ["rejoicing in embrace", "conjugal bliss", "embrace of love", "union", "புணர்ச்சி மகிழ்தல்"],
    112: ["praising beauty", "beloved's charm", "adoration of beauty", "நலம்புனைந்துரைத்தல்"],
    113: ["declaration of love", "praise of love", "tenderness of heart", "காதற் சிறப்புரைத்தல்"],
    114: ["abandoning reserve", "confession of love", "madel riding", "நாணத்துறவுரைத்தல்"],
    115: ["announcement of rumor", "rumors of love", "village gossip", "அலரறிவுறுத்தல்"],
    116: ["separation unendurable", "pangs of parting", "grief of separation", "பிரிவாற்றாமை"],
    117: ["complainings", "pining", "lament of absence", "sorrow of love", "படர்மெலிந்திரங்கல்"],
    118: ["eyes consumed with grief", "longing eyes", "weeping eyes", "கண்விதுப்பழிதல்"],
    119: ["pallor of grief", "lovesick pallor", "wasting away", "பசப்புறு பருவரல்"],
    120: ["solitary anguish", "grief in isolation", "lonely yearning", "தனிப்படர் மிகுதி"],
    121: ["sad memories", "remembrance of love", "reminiscence", "நினைந்தவர் புலம்பல்"],
    122: ["visions of the night", "dreams of lover", "dreaming", "கனவுநிலையுரைத்தல்"],
    123: ["lamentations at eventide", "evening sorrow", "dusk gloom", "பொழுதுகண்டிரங்கல்"],
    124: ["wasting of limbs", "debilitation by grief", "thinning bracelets", "உறுப்புநலனழிதல்"],
    125: ["soliloquy", "address to one's heart", "confiding to mind", "நெஞ்சொடுகிளத்தல்"],
    126: ["reserve overcome", "loss of modesty", "uncontrolled emotion", "நிறையழிதல்"],
    127: ["mutual longing", "yearning for union", "desire for return", "அவர்வயின் விதும்பல்"],
    128: ["reading the signs", "discovering thoughts", "lover's intent", "குறிப்பறிவுறுத்தல்"],
    129: ["desire for reunion", "eagerness to embrace", "yearning to meet", "புணர்ச்சி விதும்பல்"],
    130: ["expostulation with oneself", "chiding one's heart", "debate with mind", "நெஞ்சொடு புலத்தல்"],
    131: ["feigned sulking", "pouting", "lover's quarrel", "coquetry", "புலவி"],
    132: ["delicate sulking", "nuances of feigned anger", "lovers' spat", "புலவி நுணுக்கம்"],
    133: ["pleasures of temporary variance", "joy of reunion", "delight of pouting", "ஊடலுவகை"]
}


def generate_keywords(kural_num, chapter_id, ch_tamil, ch_english, ch_translit,
                      sec_tamil, sec_english, translation_en, explanation_en,
                      couplet_en, line1, line2, meaning_ta):
    """Generate rich, deduplicated search keywords for a Kural."""
    keywords = set()

    # Section & Chapter terms
    keywords.add(sec_tamil.strip())
    keywords.add(sec_english.strip().lower())
    keywords.add(ch_tamil.strip())
    keywords.add(ch_english.strip().lower())
    if ch_translit:
        keywords.add(ch_translit.strip().lower())

    # Predefined curated chapter themes
    if chapter_id in CHAPTER_THEMES:
        for theme in CHAPTER_THEMES[chapter_id]:
            keywords.add(theme.strip().lower())

    # Extract salient words from English translation & explanation
    combined_en = f"{ch_english} {translation_en} {explanation_en} {couplet_en}"
    # Tokenize English words (letters only, length >= 3)
    en_words = re.findall(r"[a-zA-Z]{3,}", combined_en.lower())
    for w in en_words:
        if w not in ENGLISH_STOPWORDS:
            keywords.add(w)

    # Extract Tamil words from verse and primary meaning (length >= 3 characters)
    combined_ta = f"{line1} {line2}"
    ta_words = re.findall(r"[\u0B80-\u0BFF]{3,}", combined_ta)
    # Add top Tamil words from verse
    for w in ta_words[:6]:
        keywords.add(w)

    # Clean and order keywords
    sorted_keywords = sorted(list(keywords))
    return ", ".join(sorted_keywords)


def build_database():
    """Main function to create schema and populate kurals.db with all 1,330 kurals."""
    print("=" * 70)
    print("THIRUVALLUVAR AI - THIRUKKURAL DATABASE GENERATOR")
    print("=" * 70)

    # 1. Fetch or load raw data
    print("\n[Step 1/5] Loading Thirukkural couplets data...")
    kurals_raw = fetch_or_load_data(
        REMOTE_KURALS_URL,
        CACHE_PATHS_KURALS,
        LOCAL_KURALS_JSON
    )

    print("\n[Step 2/5] Loading structural details (sections, groups, chapters)...")
    detail_raw = fetch_or_load_data(
        REMOTE_DETAIL_URL,
        CACHE_PATHS_DETAIL,
        LOCAL_DETAIL_JSON
    )

    # Extract list of kurals
    if isinstance(kurals_raw, dict) and "kural" in kurals_raw:
        kurals_list = kurals_raw["kural"]
    elif isinstance(kurals_raw, list):
        kurals_list = kurals_raw
    else:
        raise ValueError("Unexpected structure in kurals data")

    print(f"Loaded {len(kurals_list)} Kurals from data source.")
    if len(kurals_list) != 1330:
        raise ValueError(f"Expected 1,330 Kurals, but found {len(kurals_list)}!")

    # 2. Parse structural details into fast lookups
    sections_data = []
    chapter_groups_data = []
    chapters_data = {}  # chapter_number -> chapter_dict

    # Detail JSON can be wrapped in list or dict
    if isinstance(detail_raw, list):
        root_detail = detail_raw[0]
    else:
        root_detail = detail_raw

    sec_list = root_detail.get("section", {}).get("detail", [])
    group_counter = 1

    for sec in sec_list:
        sec_num = sec["number"]
        sec_name_ta = sec["name"]
        sec_translit = sec.get("transliteration", "")
        sec_trans = sec.get("translation", "")
        sections_data.append((sec_num, sec_name_ta, sec_trans, sec_translit, f"Section {sec_num}: {sec_trans}"))

        group_list = sec.get("chapterGroup", {}).get("detail", [])
        for grp in group_list:
            grp_name_ta = grp["name"]
            grp_translit = grp.get("transliteration", "")
            grp_trans = grp.get("translation", "")
            chapter_groups_data.append((group_counter, sec_num, grp_name_ta, grp_trans, grp_translit))

            ch_list = grp.get("chapters", {}).get("detail", [])
            for ch in ch_list:
                ch_num = ch["number"]
                ch_name_ta = ch["name"]
                ch_translit = ch.get("transliteration", "")
                ch_trans = ch.get("translation", "")
                start_k = ch.get("start", (ch_num - 1) * 10 + 1)
                end_k = ch.get("end", ch_num * 10)

                chapters_data[ch_num] = {
                    "id": ch_num,
                    "group_id": group_counter,
                    "section_id": sec_num,
                    "name_tamil": ch_name_ta,
                    "name_english": ch_trans,
                    "transliteration": ch_translit,
                    "start_kural": start_k,
                    "end_kural": end_k,
                    "group_tamil": grp_name_ta,
                    "group_english": grp_trans,
                    "section_tamil": sec_name_ta,
                    "section_english": sec_trans
                }
            group_counter += 1

    print(f"Extracted {len(sections_data)} sections, {len(chapter_groups_data)} chapter groups, {len(chapters_data)} chapters.")
    if len(chapters_data) != 133:
        raise ValueError(f"Expected 133 chapters, but found {len(chapters_data)}!")

    # 3. Create or reset SQLite database
    print("\n[Step 3/5] Initializing SQLite database schema...")
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print(f"Removed previous database at {DB_PATH}")
        except Exception as e:
            print(f"Note: Could not delete existing DB ({e}), will recreate tables.")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Read and execute schema
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    cursor.executescript(schema_sql)
    conn.commit()
    print("Schema created successfully.")

    # 4. Insert sections, chapter_groups, chapters
    print("\n[Step 4/5] Populating metadata tables (sections, chapter groups, chapters)...")
    cursor.executemany(
        "INSERT INTO sections (id, name_tamil, name_english, transliteration, description) VALUES (?, ?, ?, ?, ?)",
        sections_data
    )

    cursor.executemany(
        "INSERT INTO chapter_groups (id, section_id, name_tamil, name_english, transliteration) VALUES (?, ?, ?, ?, ?)",
        chapter_groups_data
    )

    for ch_id in range(1, 134):
        ch = chapters_data[ch_id]
        cursor.execute(
            """INSERT INTO chapters 
               (id, chapter_group_id, section_id, name_tamil, name_english, transliteration, start_kural, end_kural, total_kurals)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (ch["id"], ch["group_id"], ch["section_id"], ch["name_tamil"], ch["name_english"],
             ch["transliteration"], ch["start_kural"], ch["end_kural"], 10)
        )
    conn.commit()

    # 5. Insert all 1,330 kurals
    print("\n[Step 5/5] Inserting all 1,330 Kurals with keywords...")
    kurals_rows = []

    for item in kurals_list:
        k_num = item["Number"]
        ch_id = (k_num - 1) // 10 + 1
        ch_info = chapters_data[ch_id]

        line1 = item.get("Line1", "").strip()
        line2 = item.get("Line2", "").strip()
        verse_tamil = f"{line1}\n{line2}"

        translation_en = item.get("Translation", "").strip()
        couplet_en = item.get("couplet", "").strip()
        explanation_en = item.get("explanation", "").strip()

        # Commentaries
        meaning_ta_mv = item.get("mv", "").strip()
        meaning_ta_sp = item.get("sp", "").strip()
        meaning_ta_mk = item.get("mk", "").strip()
        # Primary Tamil meaning defaults to Dr. Mu. Varadarajan (mv), or fallback to sp / mk
        meaning_ta = meaning_ta_mv or meaning_ta_sp or meaning_ta_mk

        t1 = item.get("transliteration1", "").strip()
        t2 = item.get("transliteration2", "").strip()
        transliteration = f"{t1}\n{t2}".strip()

        # Keywords
        keywords = generate_keywords(
            k_num,
            ch_id,
            ch_info["name_tamil"],
            ch_info["name_english"],
            ch_info["transliteration"],
            ch_info["section_tamil"],
            ch_info["section_english"],
            translation_en,
            explanation_en,
            couplet_en,
            line1,
            line2,
            meaning_ta
        )

        kurals_rows.append((
            k_num,
            line1,
            line2,
            verse_tamil,
            translation_en,
            couplet_en,
            explanation_en,
            meaning_ta,
            meaning_ta_mv,
            meaning_ta_sp,
            meaning_ta_mk,
            transliteration,
            t1,
            t2,
            ch_id,
            ch_info["name_tamil"],
            ch_info["name_english"],
            ch_info["group_tamil"],
            ch_info["group_english"],
            ch_info["section_id"],
            ch_info["section_tamil"],
            ch_info["section_english"],
            ch_info["section_english"],  # section canonical column
            keywords
        ))

    cursor.executemany(
        """INSERT INTO kurals (
            number, line1, line2, verse_tamil, translation_en, couplet_en, explanation_en,
            meaning_ta, meaning_ta_mv, meaning_ta_sp, meaning_ta_mk, transliteration,
            transliteration1, transliteration2, chapter_id, chapter_tamil, chapter_english,
            chapter_group_tamil, chapter_group_english, section_id, section_tamil,
            section_english, section, keywords
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )""",
        kurals_rows
    )

    conn.commit()

    # Quick count verification
    cursor.execute("SELECT COUNT(*) FROM kurals")
    total_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM kurals_fts")
    fts_count = cursor.fetchone()[0]

    conn.close()

    db_size = os.path.getsize(DB_PATH) / 1024 / 1024

    print("=" * 70)
    print(f"DATABASE CREATED SUCCESSFULLY!")
    print(f"File: {DB_PATH}")
    print(f"Size: {db_size:.2f} MB")
    print(f"Total Kurals: {total_count} (FTS indexed: {fts_count})")
    print(f"Total Chapters: {len(chapters_data)}")
    print(f"Total Sections: {len(sections_data)}")
    print("=" * 70)

    return total_count == 1330


if __name__ == "__main__":
    success = build_database()
    sys.exit(0 if success else 1)
