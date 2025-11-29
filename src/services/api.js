import axios from "axios";

export const getCallHistory = async () => {
  const res = await axios.get("https://ny-ai-recept-agent.onrender.com/calls");
  return res.data;
};

export const processCall = async (message, callerName) => {
  const res = await axios.post("https://ny-ai-recept-agent.onrender.com/process-call", {
    text: message,
    caller_name: callerName,
  });
  return res.data;
};

// Add this function
export const updateCallStatus = async (callId, status) => {
  const res = await axios.put("https://ny-ai-recept-agent.onrender.com/update-status", {
    callId,
    status,
  });
  return res.data;
};
