import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DashBoard.css";
import { API_BASE_URL } from './config';

import bookIcon from "./picture/Empty-Files.png";
import lampBook from "./picture/Light.png";

// YouTube API
const API_KEY = "AIzaSyCXX4gz6lBYKDS_4vDNOhurhIi_BeQWW2E";
const SEARCH_QUERY = "전기전자 교육";

export default function Dash() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.name || "Guest";
  const userAvatar = storedUser?.avatar;

  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    quizBestScore: 0,
    totalQuizzes: 0,
    sharedLinks: 0,
    totalQuestions: 0,
  });

  // 통계 데이터 불러오기
  const fetchStats = async () => {
    try {
      // 퀴즈 랭킹 조회
      const rankingsRes = await axios.get(`${API_BASE_URL}/api/quiz/rankings`);
      const rankings = rankingsRes.data;
      const userRanking = rankings.find(r => r.name === userName);

      // 퀴즈 문제 수 조회
      const questionsRes = await axios.get(`${API_BASE_URL}/api/quiz/questions`);

      // 노션 링크 수 조회
      const linksRes = await axios.get(`${API_BASE_URL}/api/notion/links`);

      setStats({
        quizBestScore: userRanking?.percentage || 0,
        totalQuizzes: rankings.filter(r => r.name === userName).length,
        sharedLinks: linksRes.data.length,
        totalQuestions: questionsRes.data.length,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();

    const fetchVideos = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${SEARCH_QUERY}&type=video&maxResults=4&key=${API_KEY}`
        );
        const data = await response.json();
        const videoData = data.items?.map((item) => ({
          title: item.snippet.title,
          videoUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails.medium.url,
        })) || [];
        setVideos(videoData);
      } catch (error) {
        console.error("YouTube API fetch error:", error);
      }
    };
    fetchVideos();
  }, []);

  const ContentCard = ({ video }) => (
    <div className="content-card">
      <h4 className="card-title">{video.title}</h4>
      <div className="video-container">
        <iframe
          src={video.videoUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header" onClick={() => navigate("/Dash")} style={{ cursor: "pointer" }}>
          <img src={bookIcon} alt="Resistance icon" className="resistance-icon" />
          <h1 className="resistance-title">Resistance</h1>
        </div>

        <div className="sidebar-menu">
          <p className="sidebar-menu-item active" onClick={() => navigate("/Dash")}>대시보드</p>
          <p className="sidebar-menu-item" onClick={() => navigate("/led-test")}>미션</p>
          <p className="sidebar-menu-item" onClick={() => navigate("/notion")}>노션</p>
          <p className="sidebar-menu-item" onClick={() => navigate("/quiz")}>퀴즈</p>
          <p className="sidebar-menu-item" onClick={() => navigate("/")}>정보</p>
        </div>

        <div
          className="logout-btn-sidebar"
          onClick={async () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user && user.token) {
              try {
                await axios.post(`${API_BASE_URL}/auth/github/revoke`, {
                  token: user.token,
                });
              } catch (error) {
                console.error("Failed to revoke token on logout:", error);
              }
            }
            localStorage.clear();
            navigate("/login");
          }}
        >
          로그아웃
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="main-content">
        {/* 헤더 */}
        <header className="dashboard-header">
          <div className="user-info-container">
            <div className="profile-circle">
              {userAvatar && (
                <img
                  src={userAvatar}
                  alt="profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>
            <div className="user-details">
              <p className="user-name">{userName}</p>
            </div>
          </div>
        </header>

        {/* 환영 메시지 */}
        <div className="welcome-section">
          <div className="welcome-text">
            <h2>안녕하세요 {userName}님 !</h2>
            <p>오늘은 어떤 여정을 떠나 볼까요?</p>
          </div>
          <img src={lampBook} alt="Lamp and book" className="lamp-book-img" />
        </div>

        {/* 통계 카드 */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate("/quiz")}>
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <span className="stat-value">{stats.quizBestScore}%</span>
                <span className="stat-label">퀴즈 최고 점수</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate("/quiz")}>
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalQuestions}</span>
                <span className="stat-label">등록된 문제</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate("/notion")}>
              <div className="stat-icon">🔗</div>
              <div className="stat-info">
                <span className="stat-value">{stats.sharedLinks}</span>
                <span className="stat-label">공유된 링크</span>
              </div>
            </div>
            <div className="stat-card" onClick={() => navigate("/led-test")}>
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <span className="stat-value">미션</span>
                <span className="stat-label">아두이노 실험</span>
              </div>
            </div>
          </div>
        </section>

        {/* Contents 섹션 */}
        <section className="contents-section">
          <h3>추천 영상</h3>
          <div className="contents-grid">
            {videos.map((video, index) => (
              <ContentCard key={index} video={video} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
