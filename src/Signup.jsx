import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import folder3d from "./picture/Empty-Files.png";

export default function Signup() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/dash");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const avatar = params.get("avatar");
    const token = params.get("token");

    // Case 1: User just completed the GitHub login flow.
    // The URL will have the name and token.
    if (name && token) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: name,
          avatar: avatar,
          token: token,
        })
      );
      setUsername(name); // Set state to display the welcome message.
    } else {
      // Case 2: User is revisiting or refreshing the /login-success page.
      // Check if they have an existing session in localStorage.
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUsername(parsed.name);
      } else {
        // Case 3: No login info in URL and no session.
        // Redirect to the login page.
        navigate("/login");
      }
    }
  }, [navigate]);

  // While username is being determined, show a loading message.
  if (!username) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        GitHub 로그인 정보를 확인 중...
      </div>
    );
  }

  // Once username is set, show the welcome page.
  return (
    <div className="signup-container">
  

      <div className="welcome-card">
        <div className="welcome-content">
          <img
            src={folder3d}
            alt="Welcome folder icon"
            className="welcome-image"
          />

          <h1 className="welcome-title">WELCOME BACK !</h1>
          <p className="welcome-username">환영합니다 ! {username}님</p>

          <button className="start-btn" onClick={handleStart}>
            START
          </button>
        </div>
      </div>
    </div>
  );
}