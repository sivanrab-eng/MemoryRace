import { useState, useEffect, useRef, useCallback } from "react";

/* ─── DATA ─── */
const ITEMS = {
  Book: { emoji: "📖", color: "#E74C3C" },
  Pen: { emoji: "🖊️", color: "#3498DB" },
  Chair: { emoji: "🪑", color: "#E67E22" },
  Teacher: { emoji: "👩‍🏫", color: "#9B59B6" },
  Student: { emoji: "🧑‍🎓", color: "#1ABC9C" },
  Table: { emoji: "🪵", color: "#795548" },
  Bag: { emoji: "🎒", color: "#E91E63" },
  Pencil: { emoji: "✏️", color: "#FFC107" },
  Classroom: { emoji: "🏫", color: "#607D8B" },
  Board: { emoji: "📋", color: "#4CAF50" },
  Eraser: { emoji: "🧽", color: "#FF7043" },
  Sharpener: { emoji: "🔧", color: "#5C6BC0" },
  Ruler: { emoji: "📏", color: "#26A69A" },
  Scissors: { emoji: "✂️", color: "#EF5350" },
  Glue: { emoji: "🧴", color: "#AB47BC" },
  Notebook: { emoji: "📓", color: "#42A5F5" },
  Computer: { emoji: "💻", color: "#78909C" },
  Library: { emoji: "📚", color: "#8D6E63" },
  Playground: { emoji: "🎡", color: "#66BB6A" },
  Lunchbox: { emoji: "🍱", color: "#FFA726" },
  Colors: { emoji: "🎨", color: "#EC407A" },
  Map: { emoji: "🗺️", color: "#29B6F6" },
  Clock: { emoji: "🕐", color: "#FFCA28" },
  Bell: { emoji: "🔔", color: "#FFD54F" },
};

const HEBREW = {
  Book: "סֵפֶר", Pen: "עֵט", Chair: "כִּסֵּא", Teacher: "מוֹרָה",
  Student: "תַּלְמִיד", Table: "שׁוּלְחָן", Bag: "תִּיק", Pencil: "עִפָּרוֹן",
  Classroom: "כִּתָּה", Board: "לוּחַ", Eraser: "מַחָק", Sharpener: "מְחַדֵּד",
  Ruler: "סַרְגֵּל", Scissors: "מִסְפָּרַיִם", Glue: "דֶּבֶק", Notebook: "מַחְבֶּרֶת",
  Computer: "מַחְשֵׁב", Library: "סִפְרִיָּה", Playground: "מִגְרָשׁ", Lunchbox: "קוּפְסַת אוֹכֶל",
  Colors: "צְבָעִים", Map: "מַפָּה", Clock: "שָׁעוֹן", Bell: "פַּעֲמוֹן",
};

const LEVELS = [
  { id: 1, label: "Level 1 – Warm Up", words: ["Book", "Pen", "Chair"], cols: 3 },
  { id: 2, label: "Level 2", words: ["Teacher", "Student", "Table", "Bag", "Pencil"], cols: 5 },
  { id: 3, label: "Level 3", words: ["Classroom", "Board", "Eraser", "Sharpener", "Ruler", "Scissors", "Glue"], cols: 7 },
  { id: 4, label: "Level 4", words: ["Notebook", "Computer", "Library", "Playground", "Lunchbox", "Colors", "Map", "Clock", "Bell"], cols: 6 },
  {
    id: 5,
    label: "Level 5 – The Big Challenge!",
    words: ["Book", "Pen", "Chair", "Teacher", "Student", "Table", "Bag", "Pencil", "Classroom", "Board", "Eraser", "Glue"],
    cols: 6,
  },
];

const PREVIEW_TIME = 2500;
const INITIAL_TIME = 45;
const BONUS_TIME = 3;
const PENALTY_TIME = 1;

/* ─── Hebrew translations ─── */
const TRANSLATIONS = {
  "Book": "ספר", "Pen": "עט", "Chair": "כיסא", "Teacher": "מורה",
  "Student": "תלמיד", "Table": "שולחן", "Bag": "תיק", "Pencil": "עיפרון",
  "Classroom": "כיתה", "Board": "לוח", "Eraser": "מחק", "Sharpener": "מחדד",
  "Ruler": "סרגל", "Scissors": "מספריים", "Glue": "דבק", "Notebook": "מחברת",
  "Computer": "מחשב", "Library": "ספרייה", "Playground": "מגרש משחקים",
  "Lunchbox": "קופסת אוכל", "Colors": "צבעים", "Map": "מפה",
  "Clock": "שעון", "Bell": "פעמון",
};

/* ─── TTS helper ─── */
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const uEn = new SpeechSynthesisUtterance(text);
  uEn.lang = "en-US";
  uEn.rate = 0.9;
  uEn.pitch = 1.1;

  const heWord = TRANSLATIONS[text];
  if (heWord) {
    uEn.onend = () => {
      const uHe = new SpeechSynthesisUtterance(heWord);
      uHe.lang = "he-IL";
      uHe.rate = 0.85;
      uHe.pitch = 1.1;
      window.speechSynthesis.speak(uHe);
    };
  }
  window.speechSynthesis.speak(uEn);
}

/* ─── Shuffle ─── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Card Component ─── */
function Card({ card, isFlipped, isMatched, onClick, index, preview }) {
  const item = ITEMS[card.word];
  const show = isFlipped || isMatched || preview;

  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched || preview}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "3/4",
        perspective: "600px",
        border: "none",
        background: "none",
        cursor: isMatched || preview ? "default" : "pointer",
        padding: 0,
        transition: "transform 0.15s",
        transform: !isMatched && !preview && !isFlipped ? "scale(1)" : "scale(1)",
      }}
      onMouseEnter={(e) => { if (!isMatched) e.currentTarget.style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
      aria-label={isMatched ? card.word : "Hidden card"}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.45s cubic-bezier(.4,.2,.2,1)",
          transform: show ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Back (question mark) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            borderRadius: 14,
            background: "linear-gradient(145deg, #2c5f2d, #1a3c1a)",
            border: "3px solid #4a8c4a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: "clamp(28px, 5vw, 44px)", color: "#ffffffdd", fontFamily: "'Fredoka', sans-serif" }}>?</span>
          <div style={{
            position: "absolute", top: 6, left: 6, right: 6, bottom: 6,
            border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 10, pointerEvents: "none"
          }} />
        </div>
        {/* Front (content) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderRadius: 14,
            background: isMatched
              ? `linear-gradient(145deg, ${item.color}22, ${item.color}44)`
              : "#fffdf7",
            border: `3px solid ${isMatched ? item.color : "#e0d8c8"}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            boxShadow: isMatched
              ? `0 0 20px ${item.color}66, 0 4px 15px rgba(0,0,0,0.15)`
              : "0 4px 15px rgba(0,0,0,0.12)",
            transition: "all 0.3s",
          }}
        >
          <span style={{ fontSize: "clamp(20px, 4vw, 34px)", lineHeight: 1, filter: isMatched ? "drop-shadow(0 0 6px rgba(0,0,0,0.2))" : "none" }}>
            {item.emoji}
          </span>
          <span
            style={{
              fontSize: "clamp(13px, 2.8vw, 20px)",
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 700,
              color: isMatched ? item.color : "#3d3425",
              letterSpacing: 0.5,
              textAlign: "center",
              padding: "0 4px",
            }}
          >
            {card.word}
          </span>
          <span
            style={{
              fontSize: "clamp(9px, 1.6vw, 13px)",
              fontFamily: "'Fredoka', sans-serif",
              fontWeight: 600,
              color: isMatched ? `${item.color}aa` : "#888",
              textAlign: "center",
              direction: "rtl",
            }}
          >
            {HEBREW[card.word]}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Confetti / Sparkle effect ─── */
function Sparkles({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    dur: 1 + Math.random() * 1.5,
    emoji: ["⭐", "🌟", "✨", "🎉", "📚", "✏️", "🎒"][i % 7],
    size: 16 + Math.random() * 16,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999, overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: "-30px",
            fontSize: p.size,
            animation: `confettiFall ${p.dur}s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

/* ─── Backpack Animation ─── */
function BackpackAnimation({ items, onDone }) {
  const [phase, setPhase] = useState(0); // 0=flying, 1=closing, 2=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), items.length * 120 + 400);
    const t2 = setTimeout(() => { setPhase(2); onDone(); }, items.length * 120 + 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", display: "flex",
      flexDirection: "column", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }}>
      <div style={{ position: "relative", width: 120, height: 140 }}>
        <div style={{
          fontSize: 100, textAlign: "center",
          animation: phase === 1 ? "backpackBounce 0.4s ease" : "none",
        }}>🎒</div>
        {phase < 1 && items.map((w, i) => (
          <div key={w} style={{
            position: "absolute",
            fontSize: 28,
            animation: `flyToBackpack 0.4s ease-in ${i * 0.12}s forwards`,
            opacity: 0,
            left: `${(i % 5) * 30 - 30}px`,
            top: "-60px",
          }}>
            {ITEMS[w]?.emoji}
          </div>
        ))}
      </div>
      <p style={{
        color: "#fff", fontFamily: "'Fredoka', sans-serif",
        fontSize: 22, marginTop: 16,
        opacity: phase >= 1 ? 1 : 0, transition: "opacity 0.3s",
      }}>
        All packed! 🎉
      </p>
    </div>
  );
}

/* ─── Leaderboard Modal ─── */
function Leaderboard({ records, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(0,0,0,0.65)", display: "flex",
      alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "linear-gradient(160deg, #fffdf7, #f5f0e6)",
        borderRadius: 20, padding: "28px 32px", minWidth: 300, maxWidth: "90vw",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", border: "3px solid #e0d8c8",
      }}>
        <h2 style={{ fontFamily: "'Fredoka', sans-serif", color: "#2c5f2d", margin: "0 0 16px", textAlign: "center" }}>
          🏆 Leaderboard
        </h2>
        {records.length === 0 ? (
          <p style={{ fontFamily: "'Fredoka', sans-serif", color: "#888", textAlign: "center" }}>
            No records yet! Complete Level 5 to set a score.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {records.slice(0, 10).map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "8px 14px", borderRadius: 10,
                background: i === 0 ? "#FFD70033" : i === 1 ? "#C0C0C033" : i === 2 ? "#CD7F3222" : "#f5f0e6",
                border: `2px solid ${i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : "#e0d8c8"}`,
              }}>
                <span style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700, color: "#3d3425" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <span style={{ fontFamily: "'Fredoka', sans-serif", color: "#3d3425", fontWeight: 600, fontSize: 18 }}>
                  {r.time}s left
                </span>
                <span style={{ fontFamily: "'Fredoka', sans-serif", color: "#888", fontSize: 12 }}>
                  {r.date}
                </span>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} style={{
          display: "block", margin: "18px auto 0", padding: "10px 28px",
          borderRadius: 30, border: "none", fontFamily: "'Fredoka', sans-serif",
          fontSize: 16, fontWeight: 600, cursor: "pointer",
          background: "linear-gradient(135deg, #2c5f2d, #4a8c4a)", color: "#fff",
        }}>Close</button>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function MemoryRace() {
  const [screen, setScreen] = useState("menu"); // menu | game | levelComplete | gameOver | victory
  const [levelIdx, setLevelIdx] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [preview, setPreview] = useState(true);
  const [time, setTime] = useState(INITIAL_TIME);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [bonusAnim, setBonusAnim] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [records, setRecords] = useState([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [gameMode, setGameMode] = useState("timed"); // "timed" | "relaxed"
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(null);
  const CONTINUE_COST = 200;

  const timerRef = useRef(null);
  const lockRef = useRef(false);
  const matchCountRef = useRef(0);

  // Load leaderboard
  useEffect(() => {
    try {
      const res = localStorage.getItem("leaderboard");
      if (res) setRecords(JSON.parse(res));
    } catch { }
  }, []);

  const saveRecord = async (timeLeft) => {
    const newRec = { time: timeLeft, date: new Date().toLocaleDateString() };
    const updated = [...records, newRec].sort((a, b) => b.time - a.time).slice(0, 20);
    const isNew = records.length === 0 || timeLeft > records[0]?.time;
    setIsNewRecord(isNew);
    setRecords(updated);
    updateStreak();
    try { localStorage.setItem("leaderboard", JSON.stringify(updated)); } catch { }
  };

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [streak, setStreak] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Daily streak
  useEffect(() => {
    try {
      const res = localStorage.getItem("streak");
      if (res) {
        const data = JSON.parse(res);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.lastDay === today) setStreak(data.count);
        else if (data.lastDay === yesterday) setStreak(data.count);
        else setStreak(0);
      }
    } catch {}
  }, []);

  const updateStreak = () => {
    try {
      const res = localStorage.getItem("streak");
      const today = new Date().toDateString();
      let count = 1;
      if (res) {
        const data = JSON.parse(res);
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.lastDay === today) count = data.count;
        else if (data.lastDay === yesterday) count = data.count + 1;
      }
      setStreak(count);
      localStorage.setItem("streak", JSON.stringify({ count, lastDay: today }));
    } catch {}
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
    } else {
      // Show manual instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert("📲 להתקנה:\n1. לחצ/י על כפתור השיתוף (⬆️) בתחתית המסך\n2. גלול/י למטה ולחצ/י 'הוסף למסך הבית'\n3. לחצ/י 'הוסף'");
      } else {
        alert("📲 להתקנה:\n1. לחצ/י על שלוש הנקודות (⋮) בפינה\n2. לחצ/י 'הוסף למסך הבית' או 'התקן אפליקציה'\n3. אשר/י את ההתקנה");
      }
    }
  };

  // Share app (for menu - שתף חבר)
  const shareApp = () => {
    const msg = encodeURIComponent(
      `🎒 גילית כבר את Memory Race?\n\n📲 שחק/י עכשיו: ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // Challenge friend (for game screens - אתגר חבר)
  const sendChallenge = (challengeScore, challengeTime) => {
    const msg = gameMode === "relaxed"
      ? encodeURIComponent(
          `🎒😌 אתגר Memory Race – מצב רגוע!\n\nסיימתי עם ${challengeScore} נקודות ב-${moves} מהלכים! 🧠\n\n😏 בטוח/ה שאת/ה יכול/ה בפחות מהלכים?\n\n🔗 ${window.location.href}`
        )
      : encodeURIComponent(
          `🎒🔥 אתגר Memory Race!\n\nסיימתי עם ${challengeScore} נקודות ו-${challengeTime} שניות על השעון! ⏱️\n\n😏 בטוח/ה שאת/ה יכול/ה לנצח אותי?\nבוא/י נראה מי המוח פה 🧠\n\n🔗 ${window.location.href}`
        );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleContinue = (method) => {
    if (method === "points") {
      if (score < CONTINUE_COST) return;
      setScore((s) => s - CONTINUE_COST);
    }
    if (method === "challenge") {
      sendChallenge(score, 0);
    }
    if (method === "ad") {
      /* placeholder for rewarded ad */
    }
    // Resume game with 15 extra seconds
    setTime(15);
    setScreen("game");
  };

  // Timer
  useEffect(() => {
    if (screen !== "game" || preview) return;
    if (gameMode === "relaxed") {
      // Count up in relaxed mode
      elapsedRef.current = setInterval(() => {
        setElapsed((e) => e + 1);
      }, 1000);
      return () => clearInterval(elapsedRef.current);
    }
    timerRef.current = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setScreen("gameOver");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, preview, gameMode]);

  const level = LEVELS[levelIdx];

  const startLevel = useCallback((idx) => {
    const lv = LEVELS[idx];
    const pairs = lv.words.flatMap((w) => [
      { word: w, uid: w + "_a" },
      { word: w, uid: w + "_b" },
    ]);
    setCards(shuffle(pairs));
    setFlipped([]);
    setMatched(new Set());
    setPreview(true);
    setCombo(0);
    matchCountRef.current = 0;
    lockRef.current = false;
    setScreen("game");
    if (idx === 0) {
      setTime(INITIAL_TIME);
      setMoves(0);
      setElapsed(0);
    }
    setTimeout(() => setPreview(false), PREVIEW_TIME);
  }, []);

  const handleCardClick = (index) => {
    if (lockRef.current || preview || flipped.includes(index) || matched.has(cards[index].uid)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    speak(cards[index].word);

    if (newFlipped.length === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [i1, i2] = newFlipped;

      if (cards[i1].word === cards[i2].word) {
        // Match!
        setTimeout(() => {
          speak(`This is a ${cards[i1].word}!`);
          setMatched((prev) => {
            const ns = new Set(prev);
            ns.add(cards[i1].uid);
            ns.add(cards[i2].uid);
            return ns;
          });
          setFlipped([]);
          if (gameMode === "timed") {
            setTime((t) => t + BONUS_TIME);
            setBonusAnim("+3s");
          }
          setScore((s) => s + 100 + combo * 25);
          setCombo((c) => c + 1);
          if (gameMode === "timed") setTimeout(() => setBonusAnim(null), 900);

          matchCountRef.current += 1;
          if (matchCountRef.current === level.words.length) {
            clearInterval(timerRef.current);
            if (gameMode === "relaxed") clearInterval(elapsedRef.current);
            setTimeout(() => {
              if (levelIdx === LEVELS.length - 1) {
                setShowSparkles(true);
                setShowBackpack(true);
              } else {
                setShowBackpack(true);
              }
            }, 500);
          }
          lockRef.current = false;
        }, 400);
      } else {
        // Mismatch
        setTimeout(() => {
          setFlipped([]);
          if (gameMode === "timed") {
            setTime((t) => Math.max(0, t - PENALTY_TIME));
            setBonusAnim("-1s");
            setTimeout(() => setBonusAnim(null), 900);
          }
          setCombo(0);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  const handleBackpackDone = () => {
    setShowBackpack(false);
    if (levelIdx === LEVELS.length - 1) {
      saveRecord(time);
      setScreen("victory");
    } else {
      setScreen("levelComplete");
    }
  };

  const gridCols = level ? Math.min(level.cols, 6) : 3;

  /* ─── STYLES (injected once) ─── */
  const styleTag = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap');
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes flyToBackpack {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(30px, 80px) scale(0.3); }
    }
    @keyframes backpackBounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
    @keyframes slideUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes bonusPop {
      0% { opacity: 1; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-30px) scale(1.4); }
    }
    @keyframes timerWarning {
      0%,100% { color: #e74c3c; }
      50% { color: #ff6b6b; }
    }
    body { margin:0; overflow-x:hidden; }
  `;

  /* ─── MENU SCREEN ─── */
  if (screen === "menu") {
    return (
      <>
        <style>{styleTag}</style>
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #1a3c1a 0%, #2c5f2d 40%, #1f4f1f 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'Fredoka', sans-serif", position: "relative", overflow: "hidden",
        }}>
          {/* Chalk dust effect */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.05,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "30px 30px", pointerEvents: "none",
          }} />

          <div style={{ textAlign: "center", animation: "slideUp 0.6s ease-out" }}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>🎒</div>
            <h1 style={{
              color: "#fff", fontSize: "clamp(28px, 6vw, 48px)", margin: "0 0 8px",
              textShadow: "0 2px 10px rgba(0,0,0,0.3)",
              letterSpacing: 1,
            }}>
              Memory Race
            </h1>
            <p style={{ color: "#ffffff99", fontSize: "clamp(14px, 3vw, 18px)", margin: "0 0 28px" }}>
              Match the items · learn new words!
            </p>

            {/* Mode selection cards */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, maxWidth: 340, width: "100%" }}>
              <button
                onClick={() => { setGameMode("timed"); setLevelIdx(0); setScore(0); setTime(INITIAL_TIME); startLevel(0); }}
                style={{
                  flex: 1, padding: "18px 12px", borderRadius: 18, border: "3px solid #FFD700",
                  background: "linear-gradient(145deg, rgba(255,215,0,0.15), rgba(255,160,0,0.08))",
                  cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 4px 15px rgba(255,160,0,0.2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 25px rgba(255,160,0,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,160,0,0.2)"; }}
              >
                <span style={{ fontSize: 32 }}>⏱️</span>
                <span style={{ color: "#FFD700", fontSize: 16, fontWeight: 700 }}>מרוץ זמן</span>
                <span style={{ color: "#ffffff77", fontSize: 11, fontWeight: 400 }}>45 שניות · מי מהיר?</span>
              </button>

              <button
                onClick={() => { setGameMode("relaxed"); setLevelIdx(0); setScore(0); setMoves(0); setElapsed(0); startLevel(0); }}
                style={{
                  flex: 1, padding: "18px 12px", borderRadius: 18, border: "3px solid #60a5fa",
                  background: "linear-gradient(145deg, rgba(96,165,250,0.15), rgba(96,165,250,0.08))",
                  cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  boxShadow: "0 4px 15px rgba(96,165,250,0.2)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 6px 25px rgba(96,165,250,0.35)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(96,165,250,0.2)"; }}
              >
                <span style={{ fontSize: 32 }}>😌</span>
                <span style={{ color: "#60a5fa", fontSize: 16, fontWeight: 700 }}>מצב רגוע</span>
                <span style={{ color: "#ffffff77", fontSize: 11, fontWeight: 400 }}>בלי זמן · בלי לחץ</span>
              </button>
            </div>

            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                display: "block", margin: "16px auto 0", padding: "10px 28px",
                borderRadius: 30, border: "2px solid #ffffff44",
                background: "transparent", color: "#ffffffcc",
                fontSize: 15, fontWeight: 500, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              🏆 Leaderboard
            </button>

            <button
              onClick={handleInstall}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                margin: "14px auto 0", padding: "10px 28px",
                borderRadius: 30, border: "2px solid #4ade80",
                background: "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.04))",
                color: "#4ade80", fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              📲 הורדת אפליקציה
            </button>

            <button
              onClick={shareApp}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                margin: "10px auto 0", padding: "10px 28px",
                borderRadius: 30, border: "2px solid #60a5fa",
                background: "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(96,165,250,0.04))",
                color: "#60a5fa", fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              📤 שתף חבר
            </button>

            {streak > 0 && (
              <div style={{
                margin: "18px auto 0", padding: "8px 20px",
                borderRadius: 20, background: "rgba(255,215,0,0.1)",
                border: "1px solid rgba(255,215,0,0.25)",
                color: "#FFD700", fontSize: 14, fontWeight: 600,
                fontFamily: "'Fredoka', sans-serif", textAlign: "center",
              }}>
                🔥 רצף יומי: {streak} {streak === 1 ? "יום" : "ימים"}
              </div>
            )}
          </div>

          {/* Floating items */}
          {["📖", "✏️", "✂️", "📏", "🎨", "🔔"].map((e, i) => (
            <div key={i} style={{
              position: "absolute",
              fontSize: 24 + (i % 3) * 8,
              opacity: 0.15,
              left: `${10 + i * 15}%`,
              top: `${15 + (i % 4) * 20}%`,
              animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              pointerEvents: "none",
            }}>
              {e}
            </div>
          ))}
          {showLeaderboard && <Leaderboard records={records} onClose={() => setShowLeaderboard(false)} />}
        </div>
      </>
    );
  }

  /* ─── GAME OVER ─── */
  if (screen === "gameOver") {
    return (
      <>
        <style>{styleTag}</style>
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #4a1a1a, #2d0a0a)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'Fredoka', sans-serif", textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>⏰</div>
          <h1 style={{ color: "#ff6b6b", fontSize: 28, margin: "0 0 6px" }}>Time's Up!</h1>
          <p style={{ color: "#ffffffaa", fontSize: 16, margin: "0 0 4px" }}>
            You reached {level.label}
          </p>
          <p style={{ color: "#FFD700", fontSize: 20, margin: "0 0 20px" }}>
            Score: {score}
          </p>

          {/* Continue / Buy Lives */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "18px 20px",
            border: "2px solid rgba(255,68,255,0.2)",
            marginBottom: 18, width: "100%", maxWidth: 300,
          }}>
            <h3 style={{ color: "#fff", fontSize: 16, margin: "0 0 4px", fontFamily: "'Fredoka', sans-serif" }}>💖 רוצה להמשיך?</h3>
            <p style={{ color: "#ffffff66", fontSize: 12, margin: "0 0 14px", fontFamily: "'Fredoka', sans-serif" }}>בחר דרך לקבל חיים נוספים</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => handleContinue("points")}
                disabled={score < CONTINUE_COST}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 14, border: "none",
                  background: score >= CONTINUE_COST
                    ? "linear-gradient(135deg, #FFD700, #FFA000)"
                    : "rgba(255,255,255,0.08)",
                  color: score >= CONTINUE_COST ? "#3d2500" : "#ffffff44",
                  fontSize: 14, fontWeight: 700, cursor: score >= CONTINUE_COST ? "pointer" : "not-allowed",
                  fontFamily: "'Fredoka', sans-serif", width: "100%",
                }}
              >
                ⭐ השתמש ב-{CONTINUE_COST} נקודות
              </button>

              <button
                onClick={() => handleContinue("challenge")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 14,
                  border: "2px solid #60a5fa",
                  background: "rgba(96,165,250,0.1)",
                  color: "#60a5fa", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Fredoka', sans-serif", width: "100%",
                }}
              >
                🤝 אתגר חבר וקבל חיים
              </button>

              <button
                onClick={() => handleContinue("ad")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 20px", borderRadius: 14,
                  border: "2px solid #a78bfa",
                  background: "rgba(167,139,250,0.1)",
                  color: "#a78bfa", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "'Fredoka', sans-serif", width: "100%",
                }}
              >
                🎬 צפה בפרסומת
              </button>
            </div>
          </div>

          <button
            onClick={() => setScreen("menu")}
            style={{
              padding: "14px 40px", borderRadius: 50, border: "none",
              background: "linear-gradient(135deg, #FFD700, #FFA000)",
              color: "#3d2500", fontSize: 17, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: "0 6px 20px rgba(255,160,0,0.3)",
            }}
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  /* ─── VICTORY ─── */
  if (screen === "victory") {
    return (
      <>
        <style>{styleTag}</style>
        <Sparkles active />
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #1a3c1a, #2c5f2d)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'Fredoka', sans-serif", textAlign: "center",
        }}>
          <div style={{ fontSize: 72, marginBottom: 8 }}>🏆</div>
          {isNewRecord && (
            <div style={{
              display: "inline-block", padding: "6px 18px", borderRadius: 20,
              background: "linear-gradient(135deg, #FFD700, #FFA000)",
              color: "#3d2500", fontSize: 14, fontWeight: 700,
              fontFamily: "'Fredoka', sans-serif", marginBottom: 10,
              animation: "pulse 1s ease-in-out infinite",
            }}>
              🎉 שיא חדש!
            </div>
          )}
          <h1 style={{ color: "#FFD700", fontSize: "clamp(26px, 6vw, 40px)", margin: "0 0 8px" }}>
            Amazing!
          </h1>
          {gameMode === "timed" ? (
            <>
              <p style={{ color: "#ffffffcc", fontSize: 18, margin: "0 0 6px" }}>
                Time Remaining: <strong style={{ color: "#4ade80" }}>{time}s</strong>
              </p>
              <p style={{ color: "#FFD700", fontSize: 24, margin: "0 0 24px" }}>
                Final Score: {score}
              </p>
            </>
          ) : (
            <>
              <p style={{ color: "#ffffffcc", fontSize: 18, margin: "0 0 6px" }}>
                זמן: <strong style={{ color: "#60a5fa" }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</strong>
              </p>
              <p style={{ color: "#60a5fa", fontSize: 24, margin: "0 0 6px" }}>
                {moves} מהלכים
              </p>
              <p style={{ color: "#FFD700", fontSize: 20, margin: "0 0 24px" }}>
                Score: {score}
              </p>
            </>
          )}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => setScreen("menu")}
              style={{
                padding: "14px 36px", borderRadius: 50, border: "none",
                background: "linear-gradient(135deg, #FFD700, #FFA000)",
                color: "#3d2500", fontSize: 17, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              Play Again
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                padding: "14px 36px", borderRadius: 50, border: "2px solid #FFD70066",
                background: "transparent", color: "#FFD700", fontSize: 17, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
              }}
            >
              🏆 Leaderboard
            </button>
          </div>
          <button
            onClick={() => sendChallenge(score, time)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              margin: "14px auto 0", padding: "14px 36px",
              borderRadius: 50, border: "2px solid #4ade80",
              background: "linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))",
              color: "#4ade80", fontSize: 17, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
            }}
          >
            🤝 אתגר חבר!
          </button>
          {showLeaderboard && <Leaderboard records={records} onClose={() => setShowLeaderboard(false)} />}
        </div>
      </>
    );
  }

  /* ─── LEVEL COMPLETE ─── */
  if (screen === "levelComplete") {
    return (
      <>
        <style>{styleTag}</style>
        <div style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #1a3c1a, #2c5f2d)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'Fredoka', sans-serif", textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⭐</div>
          <h1 style={{ color: "#4ade80", fontSize: 28, margin: "0 0 8px" }}>
            {level.label} Complete!
          </h1>
          <p style={{ color: "#ffffffaa", fontSize: 16, margin: "0 0 6px" }}>
            {gameMode === "timed" ? (
              <>Time left: <strong style={{ color: "#FFD700" }}>{time}s</strong> · Score: <strong style={{ color: "#FFD700" }}>{score}</strong></>
            ) : (
              <>מהלכים: <strong style={{ color: "#60a5fa" }}>{moves}</strong> · זמן: <strong style={{ color: "#60a5fa" }}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}</strong></>
            )}
          </p>
          <p style={{ color: "#ffffffaa", fontSize: 14, margin: "0 0 24px" }}>
            Next: {LEVELS[levelIdx + 1]?.label}
          </p>
          <button
            onClick={() => { const next = levelIdx + 1; setLevelIdx(next); startLevel(next); }}
            style={{
              padding: "14px 44px", borderRadius: 50, border: "none",
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              color: "#0a2e14", fontSize: 18, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Fredoka', sans-serif",
              boxShadow: "0 6px 20px rgba(34,197,94,0.4)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            Next Level →
          </button>
          <button
            onClick={() => sendChallenge(score, time)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              margin: "12px auto 0", padding: "10px 28px",
              borderRadius: 30, border: "2px solid #60a5fa",
              background: "rgba(96,165,250,0.1)",
              color: "#60a5fa", fontSize: 14, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Fredoka', sans-serif",
            }}
          >
            🤝 אתגר חבר
          </button>
        </div>
      </>
    );
  }

  /* ─── GAME SCREEN ─── */
  return (
    <>
      <style>{styleTag}</style>
      {showBackpack && <BackpackAnimation items={level.words} onDone={handleBackpackDone} />}
      {showSparkles && <Sparkles active />}

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #1a3c1a 0%, #2c5f2d 40%, #1f4f1f 100%)",
        display: "flex", flexDirection: "column", fontFamily: "'Fredoka', sans-serif",
        position: "relative",
      }}>
        {/* Chalk texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px", pointerEvents: "none",
        }} />

        {/* Top HUD */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "12px 16px", position: "relative", zIndex: 10,
          background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)",
          borderBottom: "2px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <div style={{ color: "#ffffffaa", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
              {level.label}
            </div>
            <div style={{ color: "#FFD700", fontSize: 18, fontWeight: 700 }}>
              ⭐ {score}
            </div>
          </div>
          <div style={{ textAlign: "center", position: "relative" }}>
            {gameMode === "timed" ? (
              <>
                <div style={{
                  color: time <= 10 ? "#ff4444" : "#fff",
                  fontSize: 32, fontWeight: 700,
                  animation: time <= 10 ? "timerWarning 0.5s ease infinite" : "none",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {time}s
                </div>
                {bonusAnim && (
                  <div style={{
                    position: "absolute", top: -8, right: -30, fontSize: 16, fontWeight: 700,
                    color: bonusAnim.startsWith("+") ? "#4ade80" : "#ff6b6b",
                    animation: "bonusPop 0.8s ease-out forwards",
                    whiteSpace: "nowrap",
                  }}>
                    {bonusAnim}
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ color: "#60a5fa", fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                </div>
                <div style={{ color: "#ffffff88", fontSize: 11 }}>
                  {moves} מהלכים
                </div>
              </div>
            )}
            {preview && (
              <div style={{ color: "#FFD700", fontSize: 12, marginTop: 2 }}>
                👀 Memorize!
              </div>
            )}
          </div>
          <button onClick={() => setScreen("menu")} style={{
            padding: "6px 14px", borderRadius: 20, border: "2px solid #ffffff33",
            background: "rgba(255,255,255,0.08)", color: "#ffffffbb",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            fontFamily: "'Fredoka', sans-serif",
          }}>
            ✕ Quit
          </button>
        </div>

        {/* Combo indicator */}
        {combo >= 2 && (
          <div style={{
            textAlign: "center", padding: "6px 0", color: "#FFD700",
            fontSize: 14, fontWeight: 600, background: "rgba(255,215,0,0.08)",
          }}>
            🔥 Combo x{combo}!
          </div>
        )}

        {/* Card Grid */}
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 12px 24px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap: "clamp(6px, 1.5vw, 12px)",
            width: "100%",
            maxWidth: 520,
          }}>
            {cards.map((card, i) => (
              <Card
                key={card.uid}
                card={card}
                index={i}
                isFlipped={flipped.includes(i)}
                isMatched={matched.has(card.uid)}
                onClick={() => handleCardClick(i)}
                preview={preview}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, background: "rgba(255,255,255,0.1)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${(matched.size / (level.words.length * 2)) * 100}%`,
            background: "linear-gradient(90deg, #4ade80, #FFD700)",
            borderRadius: 4,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>
    </>
  );
}
