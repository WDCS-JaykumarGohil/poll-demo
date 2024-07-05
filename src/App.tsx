// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import MessageList from "./MessageList";
import Poll from "./Poll";

const App: React.FC = () => {
  const singleSelectionPoll = {
    question: "Choose Your Favorite (Single Selection)?",
    options: [
      { id: "1", text: "Option 1", vote_count: 1 },
      { id: "2", text: "Option 2", vote_count: 1 },
      { id: "3", text: "Option 3", vote_count: 1 },
      { id: "4", text: "Option 4", vote_count: 1 },
      { id: "5", text: "Option 5", vote_count: 2 },
      { id: "6", text: "Option 6", vote_count: 1 },
      { id: "7", text: "Option 7", vote_count: 2 },
      { id: "8", text: "Option 8", vote_count: 1 },
      { id: "9", text: "Option 9", vote_count: 1 },
      { id: "10", text: "Option 10", vote_count: 1 },
    ],
    multiple: false,
  };

  const multiSelectionPoll = {
    question: "Select All That Apply (Multi Selection)",
    options: [
      { id: "20", text: "Option 20", vote_count: 1 },
      { id: "21", text: "Option 21", vote_count: 1 },
      { id: "22", text: "Option 22", vote_count: 2 },
      { id: "23", text: "Option 23", vote_count: 1 },
      { id: "24", text: "Option 24", vote_count: 1 },
      { id: "25", text: "Option 25", vote_count: 3 },
      { id: "26", text: "Option 26", vote_count: 1 },
      { id: "27", text: "Option 27", vote_count: 4 },
      { id: "28", text: "Option 28", vote_count: 1 },
      { id: "29", text: "Option 29", vote_count: 8 },
      { id: "30", text: "Option 30", vote_count: 1 },
    ],
    multiple: true,
  };

  // return (
  //   <div style={{ padding: "20px" }}>
  //     <h1>Poll Playground</h1>
  //     <h5>1 sec debounce with history tracking</h5>
  //     <Poll {...singleSelectionPoll} />
  //     <Poll {...multiSelectionPoll} />
  //   </div>
  // );

  return (
    <ApolloProvider client={client}>
      <Router>
        <div style={{ padding: "20px" }}>
          <h1>Poll Playground</h1>
          <h5>1 sec debounce with history tracking</h5>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Poll {...singleSelectionPoll} />
                  <Poll {...multiSelectionPoll} />
                </>
              }
            />
            <Route path="/messages/:channel_id/:message_id/:user_id" element={<MessageList />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
};

export default App;
