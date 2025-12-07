import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Mainpage from "./Mainpage.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Dash from "./DashBoard.jsx";
import LedTest from "./LedTest.jsx";
import Notion from "./Notion.jsx";
import Quiz from "./Quiz.jsx";
import GitHubOAuthCallback from "./GitHubOAuthCallback.jsx";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dash" element={<Dash />} />
        <Route path="/login-success" element={<GitHubOAuthCallback />} />
        <Route path="/led-test" element={<LedTest />} />
        <Route path="/notion" element={<Notion />} />
        <Route path="/quiz" element={<Quiz />} />

      </Routes>
    </Router>
  );
}


