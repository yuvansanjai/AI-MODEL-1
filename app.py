import re
import sqlite3
from pathlib import Path

import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "database" / "thirukkural.db"
CSV = ROOT / "database" / "kural_data.csv"


@st.cache_data
def load_kurals():
    if DATABASE.exists():
        with sqlite3.connect(DATABASE) as connection:
            return pd.read_sql_query("SELECT * FROM kurals ORDER BY kural_number", connection)
    return pd.read_csv(CSV)


df = load_kurals()

st.set_page_config(page_title="Thiruvalluvar AI", layout="wide", page_icon="📜")
st.title("திருவள்ளுவர் AI | Thiruvalluvar AI")
st.caption("Ancient Wisdom. Intelligent Future. Offline fallback interface.")

col1, col2, col3 = st.columns(3)
with col1:
    age = st.selectbox("Age interface", ["Children", "Teenagers", "Adults"])
with col2:
    language = st.selectbox("Language", ["English", "Tamil"])
with col3:
    number = st.number_input("Kural number", 1, 1330, 1)

st.info("Voice age estimation is unavailable until a vetted local model is installed. No age is inferred by pitch.")

if st.button("Open Kural"):
    row = df[df["kural_number"] == int(number)]
    if row.empty:
        st.warning("Kural not found.")
    else:
        record = row.iloc[0]
        st.markdown(f"### Kural {int(record['kural_number'])}")
        st.markdown(f"**{record['tamil_line1']}**  \n**{record['tamil_line2']}**")
        if language == "Tamil":
            st.write(record["tamil_meaning_mv"])
        else:
            st.write(record["english_explanation"])

query = st.text_input("Ask by topic or Kural number")
if query:
    number_match = re.search(r"\b(\d{1,4})\b", query)
    if number_match:
        match = df[df["kural_number"] == int(number_match.group(1))]
    else:
        mask = (
            df["tamil_line1"].fillna("").str.contains(query, case=False, regex=False)
            | df["tamil_line2"].fillna("").str.contains(query, case=False, regex=False)
            | df["english_translation"].fillna("").str.contains(query, case=False, regex=False)
            | df["english_explanation"].fillna("").str.contains(query, case=False, regex=False)
            | df["chapter_en"].fillna("").str.contains(query, case=False, regex=False)
        )
        match = df[mask].head(5)
    if match.empty:
        st.warning("No matching verified Kural found.")
    for _, record in match.iterrows():
        st.markdown(f"#### Kural {int(record['kural_number'])}")
        st.write(record["tamil_line1"], record["tamil_line2"])
        st.write(record["tamil_meaning_mv"] if language == "Tamil" else record["english_explanation"])
