import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { processCall, getCallHistory } from "../services/api";

const languages = [
  { label: "English", code: "en" },
  { label: "Kannada", code: "kn" },
  { label: "Telugu", code: "te" },
  { label: "Tamil", code: "ta" },
  { label: "Hindi", code: "hi" },
  { label: "Marathi", code: "mr" },
  { label: "Gujarati", code: "gu" },
  { label: "Bengali", code: "bn" },
  { label: "Punjabi", code: "pa" },
  { label: "Malayalam", code: "ml" },
  { label: "Odia", code: "or" },
  { label: "Assamese", code: "as" },
  { label: "Sinhala", code: "si" },
  { label: "Urdu", code: "ur" },
  { label: "Kashmiri", code: "ks" },
  { label: "Nepali", code: "ne" },
  { label: "English (UK)", code: "en-GB" },
  { label: "English (US)", code: "en-US" },
  { label: "Arabic", code: "ar" },
  { label: "Spanish", code: "es" },
  { label: "French", code: "fr" },
  { label: "German", code: "de" },
  { label: "Chinese (Simplified)", code: "zh-CN" },
  { label: "Chinese (Traditional)", code: "zh-TW" },
  { label: "Japanese", code: "ja" },
  { label: "Korean", code: "ko" },
  { label: "Russian", code: "ru" },
];


const CallForm = () => {
  const [callerName, setCallerName] = useState("John Doe");
  const [message, setMessage] = useState("");
  const [recording, setRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const [history, setHistory] = useState([]);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const recognitionRef = useRef(null);

  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser!");
      return null;
    }
    const recog = new SpeechRecognition();
    recog.lang = selectedLang === "en" ? "en-US" : `${selectedLang}-IN`;
    recog.continuous = false;
    recog.interimResults = false;
    return recog;
  };

  const startRecording = () => {
    const recog = initRecognition();
    if (!recog) return;
    recognitionRef.current = recog;
    setRecording(true);
    recog.start();
    recog.onresult = (event) => setMessage(event.results[0][0].transcript);
    recog.onerror = (e) => console.error(e);
    recog.onend = () => setRecording(false);
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setRecording(false);
  };

  const translateToEnglish = async (text, sourceLang) => {
    try {
      const res = await axios.post("https://translate.astian.org/translate", {
        q: text,
        source: sourceLang,
        target: "en",
        format: "text",
      });
      return res.data.translatedText || text;
    } catch (err) {
      console.warn("Translation failed:", err);
      return text;
    }
  };

  const fetchHistory = async () => {
    try {
      const data = await getCallHistory();
      if (Array.isArray(data)) {
        const filtered = data
          .filter(
            (call) =>
              (call.caller_name || "").trim().toLowerCase() ===
              callerName.trim().toLowerCase()
          )
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // recent -> past
        setHistory(filtered);
      } else setHistory([]);
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [callerName]);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!message) return;
  setLoading(true);
  try {
    const translatedMessage =
      selectedLang === "en" ? message : await translateToEnglish(message, selectedLang);

    // Send to backend
    await processCall(translatedMessage, callerName);

    // Fetch latest call from DB
    const data = await getCallHistory();
    const latestCall = data
      .filter((call) => (call.caller_name || "").trim().toLowerCase() === callerName.trim().toLowerCase())
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    setResponse(latestCall || {}); // now intent and sentiment will be correct
    setMessage("");
    fetchHistory(); // refresh call logs
  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        backgroundColor: "#0b0c0f",
        color: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h2 style={{ color: "#ffd60a", textAlign: "center", marginBottom: "20px" }}>
        AI Reception Agent
      </h2>

      <input
        type="text"
        value={callerName}
        onChange={(e) => setCallerName(e.target.value)}
        style={{
          width: "60%",
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#1f1f2e",
          color: "#fff",
        }}
      />

      <select
        value={selectedLang}
        onChange={(e) => setSelectedLang(e.target.value)}
        style={{
          width: "60%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#1f1f2e",
          color: "#fff",
        }}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>

      <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={startRecording}
          disabled={recording}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: recording ? "#007bff" : "#28a745",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {recording ? "Listening..." : "🎙 Start"}
        </button>
        <button
          onClick={stopRecording}
          disabled={!recording}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#dc3545",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          ⏹ Stop
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Speak or type message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            width: "96%",
            padding: "12px",
            height: "100px",
            marginBottom: "15px",
            borderRadius: "6px",
            border: "1px solid #444",
            backgroundColor: "#1f1f2e",
            color: "#fff",
            fontSize: "14px",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ffd60a",
            color: "#000",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {loading ? "Processing..." : "Send"}
        </button>
      </form>

      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "#1f1f2e",
            borderLeft: "4px solid #28a745",
          }}
        >
          <p>
            <strong>Intent:</strong> {response.intent || "N/A"}
          </p>
          <p>
            <strong>Sentiment:</strong> {response.sentiment || "N/A"}
          </p>
        </div>
      )}

      <h3 style={{ marginTop: "30px", color: "#ffd60a" }}>Call History</h3>
      <div
        style={{
          maxHeight: "300px",
          overflowY: "scroll",
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: "#1f1f2e",
        }}
      >
        {history.length === 0 && <p>No calls yet for this caller.</p>}
        {history.map((call, index) => (
          <div
            key={call.id || index}
            style={{
              marginBottom: "12px",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: call.status === "completed" ? "#155724" : "#004085",
              color: "#fff",
              transition: "all 0.5s",
            }}
          >
            <p>
              <strong>{call.caller_name || "Anonymous"}</strong>{" "}
              ({call.timestamp ? new Date(call.timestamp).toLocaleString() : "N/A"})
            </p>
            <p>Message: {call.message || "N/A"}</p>
            <p>
              Intent: {call.intent || "N/A"}, Sentiment: {call.sentiment || "N/A"}
            </p>
            <p>Reply: {call.reply || "NULL"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CallForm;
