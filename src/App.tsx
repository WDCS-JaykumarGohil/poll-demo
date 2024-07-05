// src/App.tsx
import React from "react";
import Poll from "./Poll";

const App: React.FC = () => {
  const singleSelectionPoll = {
    question: "Choose Your Favorite (Single Selection)?",
    options: [
      { id: "1", text: "Option 1" },
      { id: "2", text: "Option 2" },
      { id: "3", text: "Option 3" },
      { id: "4", text: "Option 4" },
      { id: "5", text: "Option 5" },
      { id: "6", text: "Option 6" },
      { id: "7", text: "Option 7" },
      { id: "8", text: "Option 8" },
      { id: "9", text: "Option 9" },
      { id: "10", text: "Option 10" },
    ],
    multiple: false,
  };

  const multiSelectionPoll = {
    question: "Select All That Apply (Multi Selection)",
    options: [
      { id: "20", text: "Option 20" },
      { id: "21", text: "Option 21" },
      { id: "22", text: "Option 22" },
      { id: "23", text: "Option 23" },
      { id: "24", text: "Option 24" },
      { id: "25", text: "Option 25" },
      { id: "26", text: "Option 26" },
      { id: "27", text: "Option 27" },
      { id: "28", text: "Option 28" },
      { id: "29", text: "Option 29" },
      { id: "30", text: "Option 30" },
    ],
    multiple: true,
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Poll Playground (1 sec debounce with history tracking))</h1>
      <Poll {...singleSelectionPoll} />
      <Poll {...multiSelectionPoll} />
    </div>
  );
};

export default App;
