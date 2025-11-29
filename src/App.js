import React, { useState } from "react";
import CallForm from "./components/CallForm";
import HR from "./components/HR";
import Support from "./components/Support";
import Appointment from "./components/Appointment";
import Other from "./components/Other";

const App = () => {
  const [activeTab, setActiveTab] = useState("User");

  const tabs = ["User", "HR", "Support", "Appointment", "Other"];

  const renderTab = () => {
    switch (activeTab) {
      case "User":
        return <CallForm />;
      case "HR":
        return <HR />;
      case "Support":
        return <Support />;
      case "Appointment":
        return <Appointment />;
      case "Other":
        return <Other />;
      default:
        return <CallForm />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f111a", // dark background
        color: "#e5e7eb",           // light text
        fontFamily: "'Inter', sans-serif",
        padding: "20px",
      }}
    >
      {/* Tab Bar */}
      <div style={{ display: "flex", marginBottom: "20px", gap: "10px" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "1px solid #27293d",
              backgroundColor: activeTab === tab ? "#3b82f6" : "#1f2233",
              color: activeTab === tab ? "#fff" : "#9ca3af",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        style={{
          backgroundColor: "#1f2233",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {renderTab()}
      </div>
    </div>
  );
};

export default App;
