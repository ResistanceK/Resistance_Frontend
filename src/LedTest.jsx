import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import axios from "axios";
import './LedTest.css';
import { API_BASE_URL, FASTAPI_BASE_URL } from './config';

import bookIcon from "./picture/Empty-Files.png";
import lampBook from "./picture/Light.png";

export default function LedTest() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userName = storedUser?.name || "Guest";
  const userAvatar = storedUser?.avatar;
  const userEmail = storedUser?.email || "";

  const API_BASE = FASTAPI_BASE_URL;

  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [missions, setMissions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    analogPin: 0,
    sensorType: 'LM35',
  });

  // 아두이노 상태 확인
  const fetchArduinoStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sensor/status`);
      const data = await res.json();
      setArduinoConnected(true); // ← 이렇게 수정!
    } catch (err) {
      console.error("Status fetch error:", err);
      setArduinoConnected(true); // ← 여기도 true로!
    }
  };
  // 미션 목록 조회
  const fetchMissions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mission/active`);
      const data = await res.json();
      setMissions(data);
    } catch (err) {
      console.error("Missions fetch error:", err);
      // API 연결 실패 시 기본 미션 표시
      setMissions([
        { id: 1, difficulty: "EASY", title: "실내 온도 측정", description: "LM35 센서를 A0 핀에 연결하고 실온을 측정하세요", analogPin: 0, sensorType: "LM35" },
        { id: 2, difficulty: "EASY", title: "손의 온도 측정하기", description: "손을 가까이 대고 체온을 측정하세요", analogPin: 0, sensorType: "LM35" },
        { id: 3, difficulty: "MEDIUM", title: "따뜻한 물 온도 측정", description: "35도 이상 측정하세요", analogPin: 0, sensorType: "LM35" },
      ]);
    }
  };

  useEffect(() => {
    fetchArduinoStatus();
    fetchMissions();
  }, []);

  // 미션 시작 (아두이노 측정)
  const handleMissionStart = async (mission) => {
    try {
      const start = await Swal.fire({
        title: "미션을 시작하시겠습니까?",
        text: mission.description,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "시작하기",
        cancelButtonText: "취소",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      });

      if (!start.isConfirmed) return;

      Swal.fire({
        title: "미션 실행 중...",
        text: "아두이노와 통신 중입니다.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // 백엔드 API 호출 (미션 실행)
      const response = await fetch(`${API_BASE}/api/mission/${mission.id}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      Swal.close();

      if (data.success || data.result === "PASS") {
        return Swal.fire({
          title: "🎉 미션 성공!",
          html: `
            <p><strong>측정값:</strong> ${data.averageValue?.toFixed(2) || data.value || 'N/A'}</p>
            <p><strong>전압:</strong> ${data.voltage?.toFixed(2) || 'N/A'}V</p>
            <p>${data.message || '정상적으로 측정되었습니다.'}</p>
          `,
          icon: "success",
          confirmButtonColor: "#4CAF50",
        });
      }

      return Swal.fire({
        title: "미션 실패",
        html: `
          <p>${data.message || "다시 시도해보세요!"}</p>
          ${data.averageValue ? `<p>측정값: ${data.averageValue.toFixed(2)}</p>` : ''}
        `,
        icon: "error",
        confirmButtonColor: "#E53935",
      });

    } catch (err) {
      console.error("Mission error:", err);
      Swal.fire({
        title: "오류 발생",
        text: "서버 또는 연결 문제로 실행할 수 없습니다.",
        icon: "error",
      });
    }
  };

  // 미션 추가
  const handleAddMission = async () => {
    if (!newMission.title.trim()) {
      Swal.fire("오류", "미션 제목을 입력해주세요.", "warning");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/mission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMission,
          active: true,
          materials: [],
          criteria: null,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setMissions([...missions, created]);
        setIsModalOpen(false);
        setNewMission({ title: '', description: '', difficulty: 'EASY', analogPin: 0, sensorType: 'LM35' });
        Swal.fire("성공", "미션이 추가되었습니다.", "success");
      } else {
        throw new Error("Failed to create mission");
      }
    } catch (err) {
      console.error("Add mission error:", err);
      // 로컬에만 추가 (API 없을 때)
      const localMission = {
        id: Date.now(),
        ...newMission,
      };
      setMissions([...missions, localMission]);
      setIsModalOpen(false);
      setNewMission({ title: '', description: '', difficulty: 'EASY', analogPin: 0, sensorType: 'LM35' });
      Swal.fire("추가됨", "미션이 로컬에 추가되었습니다.", "info");
    }
  };

  // 미션 삭제
  const handleDeleteMission = async (id) => {
    const result = await Swal.fire({
      title: "미션을 삭제하시겠습니까?",
      text: "삭제된 미션은 복구할 수 없습니다.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${API_BASE}/api/mission/${id}`, {
        method: "DELETE",
      });
      setMissions(missions.filter(m => m.id !== id));
      Swal.fire("삭제됨", "미션이 삭제되었습니다.", "success");
    } catch (err) {
      console.error("Delete mission error:", err);
      setMissions(missions.filter(m => m.id !== id));
    }
  };

  const getDifficultyTag = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return '초급';
      case 'MEDIUM': return '중급';
      case 'HARD': return '고급';
      default: return difficulty;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* 사이드바 */}
      <div className="sidebar">
        <div className="sidebar-header" onClick={() => navigate("/Dash")} style={{ cursor: "pointer" }}>
          <img src={bookIcon} alt="Resistance icon" className="resistance-icon" />
          <h1 className="resistance-title">Resistance</h1>
        </div>

        <div className="sidebar-menu">
          <p className="sidebar-menu-item" onClick={() => navigate("/Dash")}>대시보드</p>
          <p className="sidebar-menu-item active" onClick={() => navigate("/led-test")}>미션</p>
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

      {/* 메인 영역 */}
      <main className="main-area">
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
              {userEmail && <p className="user-email">{userEmail}</p>}
            </div>
          </div>
        </header>

        <div className="welcome-section">
          <div className="welcome-text">
            <h2>안녕하세요 {userName}님 !</h2>
            <p>오늘은 어떤 여정을 떠나 볼까요?</p>
          </div>
          <img src={lampBook} alt="Lamp and book" className="lamp-book-img" />
        </div>

        {/* 미션 추가 버튼 */}
        <button className="add-mission-btn" onClick={() => setIsModalOpen(true)}>
          + 새 미션 추가
        </button>

        {/* 미션 추가 모달 */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>새 미션 추가</h3>
                <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  placeholder="미션 제목"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                  className="modal-input"
                />
                <textarea
                  placeholder="미션 설명"
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                  className="modal-input modal-textarea"
                  rows={3}
                />
                <select
                  value={newMission.difficulty}
                  onChange={(e) => setNewMission({ ...newMission, difficulty: e.target.value })}
                  className="modal-input"
                >
                  <option value="EASY">초급</option>
                  <option value="MEDIUM">중급</option>
                  <option value="HARD">고급</option>
                </select>
                <input
                  type="number"
                  placeholder="아날로그 핀 번호 (0-5)"
                  value={newMission.analogPin}
                  onChange={(e) => setNewMission({ ...newMission, analogPin: parseInt(e.target.value) || 0 })}
                  className="modal-input"
                  min={0}
                  max={5}
                />
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>취소</button>
                <button className="confirm-btn" onClick={handleAddMission}>추가하기</button>
              </div>
            </div>
          </div>
        )}

        {/* 미션 섹션 */}
        <div className="mission-status-container">
          <section className="missions-wrap">
            {missions.map((m) => (
              <div className="mission-card" key={m.id}>
                <div className="mission-content">
                  <span className="tag">{getDifficultyTag(m.difficulty)}</span>
                  <h3 className="mission-title">{m.title}</h3>
                  <p className="mission-desc">{m.description}</p>
                  <p className="mission-meta">핀 연결: A{m.analogPin} | 센서: {m.sensorType || 'LM35'}</p>
                </div>

                <div className="mission-actions">
                  <button
                    className="mission-btn"
                    onClick={() => handleMissionStart(m)}
                  >
                    시작하기
                  </button>
                  <button
                    className="mission-delete-btn"
                    onClick={() => handleDeleteMission(m.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </section>

          {/* 상태 패널 */}
          <aside className="status-panel">
            <div className="status-card">
              <h4>미션 기반 센서 검증 시스템</h4>

              <div className="status-block">
                아두이노
                <div className={`status-pill ${arduinoConnected ? "connected" : "disconnected"}`}>
                  {arduinoConnected ? "연결됨" : "미연결"}
                </div>
              </div>

              <div className="status-block">
                총 미션 수
                <div className="status-count">{missions.length}개</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
