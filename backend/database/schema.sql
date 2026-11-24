-- Thiruvalluvar AI - Thirukkural Database Schema
-- SQLite schema for all 1,330 Thirukkural verses, chapters, sections, and search index

-- 1. Sections (பால் / Paal)
-- Three major divisions: அறத்துப்பால் (Virtue), பொருட்பால் (Wealth), காமத்துப்பால் (Love)
CREATE TABLE IF NOT EXISTS sections (
    id INTEGER PRIMARY KEY,                     -- 1: Virtue, 2: Wealth, 3: Love
    name_tamil TEXT NOT NULL UNIQUE,            -- அறத்துப்பால், பொருட்பால், காமத்துப்பால்
    name_english TEXT NOT NULL,                 -- Virtue, Wealth, Love
    transliteration TEXT NOT NULL,              -- Araththuppaal, Porutpaal, Kaamaththuppaal
    description TEXT                            -- Overview of the section
);

-- 2. Chapter Groups (இயல் / Iyal)
-- Sub-divisions within sections (e.g. பாயிரவியல், இல்லறவியல், அரசியல், etc.)
CREATE TABLE IF NOT EXISTS chapter_groups (
    id INTEGER PRIMARY KEY,                     -- 1 to 13
    section_id INTEGER NOT NULL,                -- References sections(id)
    name_tamil TEXT NOT NULL,                   -- e.g. பாயிரவியல்
    name_english TEXT NOT NULL,                 -- e.g. Prologue
    transliteration TEXT NOT NULL,              -- e.g. Paayiraviyal
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- 3. Chapters (அதிகாரம் / Adhigaram)
-- All 133 chapters (10 kurals per chapter)
CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY,                     -- 1 to 133
    chapter_group_id INTEGER,                   -- References chapter_groups(id)
    section_id INTEGER NOT NULL,                -- References sections(id)
    name_tamil TEXT NOT NULL,                   -- e.g. கடவுள் வாழ்த்து
    name_english TEXT NOT NULL,                 -- e.g. The Praise of God
    transliteration TEXT NOT NULL,              -- e.g. Katavul Vaazhththu
    start_kural INTEGER NOT NULL,               -- e.g. 1
    end_kural INTEGER NOT NULL,                 -- e.g. 10
    total_kurals INTEGER DEFAULT 10,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (chapter_group_id) REFERENCES chapter_groups(id) ON DELETE SET NULL
);

-- 4. Kurals (குறள் / Thirukkural couplets)
-- All 1,330 couplets with verified Tamil verse and English translations
CREATE TABLE IF NOT EXISTS kurals (
    number INTEGER PRIMARY KEY,                 -- 1 to 1330
    line1 TEXT NOT NULL,                        -- First line (4 metrical feet / சீர்)
    line2 TEXT NOT NULL,                        -- Second line (3 metrical feet / சீர்)
    verse_tamil TEXT NOT NULL,                  -- Complete 2-line Tamil couplet
    translation_en TEXT NOT NULL,               -- English poetic translation (Kaviyogi Bharati)
    couplet_en TEXT,                            -- Classic English translation (Rev. G.U. Pope)
    explanation_en TEXT NOT NULL,               -- Detailed English meaning / commentary
    meaning_ta TEXT NOT NULL,                   -- Primary Tamil explanation (Dr. Mu. Varadarajan)
    meaning_ta_mv TEXT,                         -- Dr. Mu. Varadarajan commentary
    meaning_ta_sp TEXT,                         -- Solomon Pappaiah commentary
    meaning_ta_mk TEXT,                         -- Kalaignar M. Karunanidhi commentary
    transliteration TEXT,                       -- Romanized transliteration of couplet
    transliteration1 TEXT,                      -- Transliteration of line 1
    transliteration2 TEXT,                      -- Transliteration of line 2
    chapter_id INTEGER NOT NULL,                -- 1 to 133
    chapter_tamil TEXT NOT NULL,                -- Tamil chapter name
    chapter_english TEXT NOT NULL,              -- English chapter name
    chapter_group_tamil TEXT,                   -- Tamil chapter group (இயல்)
    chapter_group_english TEXT,                 -- English chapter group
    section_id INTEGER NOT NULL,                -- 1 to 3
    section_tamil TEXT NOT NULL,                -- அறத்துப்பால், பொருட்பால், காமத்துப்பால்
    section_english TEXT NOT NULL,              -- Virtue, Wealth, Love
    section TEXT NOT NULL,                      -- Canonical section name (Virtue, Wealth, Love)
    keywords TEXT NOT NULL,                     -- Searchable keywords (Tamil & English)
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Indexes for rapid lookup by chapter, section, and number
CREATE INDEX IF NOT EXISTS idx_kurals_chapter_id ON kurals(chapter_id);
CREATE INDEX IF NOT EXISTS idx_kurals_section_id ON kurals(section_id);
CREATE INDEX IF NOT EXISTS idx_kurals_section ON kurals(section);
CREATE INDEX IF NOT EXISTS idx_kurals_section_tamil ON kurals(section_tamil);
CREATE INDEX IF NOT EXISTS idx_chapters_section_id ON chapters(section_id);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_group_id ON chapters(chapter_group_id);

-- Full-Text Search (FTS5) for semantic & keyword search across Tamil and English
CREATE VIRTUAL TABLE IF NOT EXISTS kurals_fts USING fts5(
    number UNINDEXED,
    verse_tamil,
    translation_en,
    explanation_en,
    meaning_ta,
    chapter_tamil,
    chapter_english,
    section_english,
    keywords,
    content='kurals',
    content_rowid='number'
);

-- Triggers to keep FTS table synchronized with kurals table
CREATE TRIGGER IF NOT EXISTS kurals_ai AFTER INSERT ON kurals BEGIN
    INSERT INTO kurals_fts(rowid, number, verse_tamil, translation_en, explanation_en, meaning_ta, chapter_tamil, chapter_english, section_english, keywords)
    VALUES (new.number, new.number, new.verse_tamil, new.translation_en, new.explanation_en, new.meaning_ta, new.chapter_tamil, new.chapter_english, new.section_english, new.keywords);
END;

CREATE TRIGGER IF NOT EXISTS kurals_ad AFTER DELETE ON kurals BEGIN
    INSERT INTO kurals_fts(kurals_fts, rowid, number, verse_tamil, translation_en, explanation_en, meaning_ta, chapter_tamil, chapter_english, section_english, keywords)
    VALUES('delete', old.number, old.number, old.verse_tamil, old.translation_en, old.explanation_en, old.meaning_ta, old.chapter_tamil, old.chapter_english, old.section_english, old.keywords);
END;

CREATE TRIGGER IF NOT EXISTS kurals_au AFTER UPDATE ON kurals BEGIN
    INSERT INTO kurals_fts(kurals_fts, rowid, number, verse_tamil, translation_en, explanation_en, meaning_ta, chapter_tamil, chapter_english, section_english, keywords)
    VALUES('delete', old.number, old.number, old.verse_tamil, old.translation_en, old.explanation_en, old.meaning_ta, old.chapter_tamil, old.chapter_english, old.section_english, old.keywords);
    INSERT INTO kurals_fts(rowid, number, verse_tamil, translation_en, explanation_en, meaning_ta, chapter_tamil, chapter_english, section_english, keywords)
    VALUES (new.number, new.number, new.verse_tamil, new.translation_en, new.explanation_en, new.meaning_ta, new.chapter_tamil, new.chapter_english, new.section_english, new.keywords);
END;
