import React, { useState, useEffect } from "react";
import axios from "axios";

const Support = () => {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get("https://ny-ai-recept-agent.onrender.com/calls");
      if (Array.isArray(data)) {
        const supportCalls = data
          .filter((call) => call.intent?.toLowerCase() === "support")
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // recent first
        setHistory(supportCalls);
      }
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const updateCallStatus = async (callId, status, reply) => {
    try {
      await axios.put("https://ny-ai-recept-agent.onrender.com/update-status", {
        callId,
        status,
        reply,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleToggleStatus = async (callId, currentStatus) => {
    const call = history.find((c) => c.id === callId);
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const replyText = newStatus === "pending" ? null : call?.reply || "";

    // Optimistic UI update
    setHistory((prev) =>
      prev.map((c) =>
        c.id === callId ? { ...c, status: newStatus, reply: replyText } : c
      )
    );

    // Update backend
    await updateCallStatus(callId, newStatus, replyText);

    // Refresh history
    fetchHistory();
  };

  const handleReplyChange = (callId, value) => {
    setHistory((prev) =>
      prev.map((call) => (call.id === callId ? { ...call, reply: value } : call))
    );
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "50px auto",
        backgroundColor: "#0b0c0f",
        color: "#fff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h2
        style={{
          color: "#ffd60a",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Support Call Logs
      </h2>

      <div
        style={{
          maxHeight: "500px",
          overflowY: "scroll",
          padding: "10px",
        }}
      >
        {history.length === 0 && <p>No Support calls found.</p>}
        {history.map((call) => (
          <div
            key={call.id}
            style={{
              marginBottom: "12px",
              padding: "12px",
              borderRadius: "8px",
              backgroundColor:
                call.status === "completed" ? "#155724" : "#004085",
              color: "#fff",
              transition: "all 0.4s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            <p>
              <strong>{call.caller_name || "Anonymous"}</strong>{" "}
              ({call.timestamp
                ? new Date(call.timestamp).toLocaleString()
                : "N/A"}
              )
            </p>
            <p>Message: {call.message}</p>
            <p>Sentiment: {call.sentiment || "N/A"}</p>

            <p>
              Reply:{" "}
              <input
                type="text"
                value={call.reply || "NULL"}
                onChange={(e) => handleReplyChange(call.id, e.target.value)}
                style={{
                  width: "60%",
                  padding: "6px",
                  marginRight: "10px",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  backgroundColor: "#1f1f2e",
                  color: "#fff",
                }}
              />
              <button
                onClick={() => handleToggleStatus(call.id, call.status || "pending")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor:
                    call.status === "completed" ? "#dc3545" : "#28a745",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                {call.status === "completed" ? "Mark Pending" : "Mark Completed"}
              </button>
            </p>

            <p>Status: {call.status || "pending"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Support;
