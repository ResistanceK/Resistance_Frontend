import React from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import { API_BASE_URL } from './config';

// 이미지 import
import frameImg from "./picture/Light.png";
import githubIcon from "./picture/github.png";

export default function Login() {
  return (
    <div className="login-container">


      <div className="login-card">
        <div className="login-content">
          <img
            src={frameImg}
            alt="Login illustration"
            className="login-image"
          />

          <h1 className="login-title">WELCOME BACK !</h1>
          <p className="login-subtitle">다시 돌아오셨군요</p>

          <div
            className="github-btn"
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
            }}
          >
            <img src={githubIcon} alt="GitHub" className="github-icon" />
            <span>GitHub로 로그인</span>
          </div>
        </div>
      </div>
    </div>
  );
}
