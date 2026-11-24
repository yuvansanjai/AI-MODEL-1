<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

type Age = "Children" | "Teenagers" | "Adults";
type Kural = {
  kural_number: number;
  tamil_line1: string;
  tamil_line2: string;
  tamil_meaning_mv: string;
  english_translation: string;
  english_explanation: string;
  chapter_en: string;
};

const API = "http://127.0.0.1:8000";

function App() {
  const [age, setAge] = React.useState<Age>("Adults");
  const [language, setLanguage] = React.useState<"English" | "Tamil">("English");
  const [query, setQuery] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [results, setResults] = React.useState<Kural[]>([]);
  const [voiceStatus, setVoiceStatus] = React.useState("Voice age estimation requires a downloaded local model.");
  const [loading, setLoading] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("Home");

  async function ask(questionOverride?: string) {
    const question = questionOverride ?? query;
    if (!question.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, age, confidence: null, language }),
      });
      if (!response.ok) throw new Error("Local backend returned an error");
      const data = await response.json();
      setAnswer(data.answer);
      setResults(data.records);
    } catch {
      setAnswer("The local backend is not running. Start it with start.bat, then try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setVoiceStatus("Browser text-to-speech is unavailable.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "Tamil" ? "ta-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  }

  async function checkAgeModel() {
    try {
      const response = await fetch(`${API}/api/estimate-age`, { method: "POST" });
      const data = await response.json();
      setVoiceStatus(data.message);
    } catch {
      setVoiceStatus("The local backend is not running.");
    }
  }

  const themeClass = age.toLowerCase();

  return (
    <main className={`app ${themeClass}`}>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setActiveSection("Home")}>
          <span className="brand-mark">தி</span>
          <span>
            <strong>THIRUVALLUVAR</strong>
            <small>AI COMPANION</small>
          </span>
        </button>
        <nav className="navlinks" aria-label="Main navigation">
          {["Home", "Explore", "Topics", "About"].map((item) => (
            <button
              key={item}
              className={activeSection === item ? "active" : ""}
              type="button"
              onClick={() => setActiveSection(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="controls">
          <label>
            <span>Age mode</span>
            <select value={age} onChange={(event) => setAge(event.target.value as Age)}>
              <option>Children</option>
              <option>Teenagers</option>
              <option>Adults</option>
            </select>
          </label>
          <label>
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as "English" | "Tamil")}>
              <option>English</option>
              <option>Tamil</option>
            </select>
          </label>
        </div>
      </header>

      <div className="page">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">ANCIENT WISDOM · 1330 COUPLETS</span>
            <h2>{language === "Tamil" ? "நல்ல வாழ்வுக்கான\nதிருக்குறள் வழிகாட்டி" : "Wisdom for modern life"}</h2>
            <p>{language === "Tamil"
              ? "உன் வாழ்வுக்கு பொருந்திய குறளைக் கேள் — உள்ளூரில், தனியுரிமையுடன்."
              : "Ask about life, character and purpose. Discover the right verse from Thirukkural's timeless collection."}</p>
            <div className="hero-actions">
              <button className="primary" type="button" onClick={() => document.getElementById("question")?.focus()}>
                Start exploring
              </button>
              <button className="secondary" type="button" onClick={() => { setQuery("391"); void ask("391"); }}>
                Today's Kural
              </button>
            </div>
          </div>
          <div className="portrait" aria-label="Traditional Thiruvalluvar-inspired manuscript portrait">
            <div className="portrait-halo">
              <div className="portrait-person">
                <span className="turban">தூ</span>
                <span className="beard">வள்ளுவர்</span>
              </div>
            </div>
            <div className="portrait-caption">
              <small>THIRUVALLUVAR</small>
              <strong>திருவள்ளுவர்</strong>
            </div>
          </div>
        </section>

        <section className="workspace">
          <aside className="side-panel">
            <div className="side-heading">
              <span>Discover</span>
              <strong>Curated paths</strong>
            </div>
            {[
              ["நட்பு", "Friendship", "friendship"],
              ["அறிவு", "Knowledge", "knowledge"],
              ["காதல்", "Love", "love"],
              ["அரசு", "Leadership", "leadership"],
            ].map(([tamilLabel, englishLabel, searchTerm]) => (
              <button
                type="button"
                className="topic-button"
                key={searchTerm}
                onClick={() => { setQuery(englishLabel); void ask(englishLabel); }}
              >
                <span className="topic-icon">{tamilLabel.slice(0, 1)}</span>
                <span><small>{tamilLabel}</small><strong>{englishLabel}</strong></span>
                <b>›</b>
              </button>
            ))}

            <div className="privacy-card">
              <div className="privacy-title"><span>◉</span><strong>Voice privacy</strong></div>
              <p>{voiceStatus}</p>
              <button type="button" onClick={checkAgeModel}>Check local model</button>
            </div>
          </aside>

          <div className="chat-card">
            <div className="chat-heading">
              <div>
                <span>ASK THIRUVALLUVAR</span>
                <h3>{language === "Tamil" ? "உன் கேள்வியை கேள்" : "What would you like to learn?"}</h3>
              </div>
              <span className="online-badge"><i /> Local & offline</span>
            </div>

            <div className="composer">
              <input
                id="question"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && void ask()}
                placeholder={language === "Tamil" ? "நட்பு பற்றி ஒரு குறள் சொல்லுங்கள்..." : "Ask for a Kural about friendship, wisdom or work..."}
              />
              <button type="button" onClick={() => void ask()} disabled={loading}>
                {loading ? "Searching..." : "Ask AI"}
              </button>
            </div>

            {answer && (
              <article className="answer">
                <div className="answer-heading">
                  <div className="ai-avatar">தி</div>
                  <strong>Thiruvalluvar AI</strong>
                  <button type="button" onClick={() => speak(answer)} aria-label="Speak response">◀ Play</button>
                </div>
                <pre>{answer}</pre>
              </article>
            )}

            <div className="kural-list">
              {results.map((kural) => (
                <article className="kural-card" key={kural.kural_number}>
                  <div className="kural-heading">
                    <span>குறள்</span>
                    <strong>{kural.kural_number}</strong>
                  </div>
                  <div className="kural-content">
                    <p className="tamil">{kural.tamil_line1}<br />{kural.tamil_line2}</p>
                    <p><strong>{language === "Tamil" ? "பொருள்" : "Meaning"}</strong><br />{language === "Tamil" ? kural.tamil_meaning_mv : kural.english_explanation}</p>
                    {language === "English" && <p className="translation">“{kural.english_translation}”</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
=======
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
>>>>>>> 071a39a990d8d851a677928900ec91f75fab24b3
);
