import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Quiz.css';
import { API_BASE_URL, FASTAPI_BASE_URL } from './config';

import bookIcon from "./picture/Empty-Files.png";
import lampBook from "./picture/Light.png";

export default function Quiz() {
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userName = storedUser?.name || "Guest";
    const userAvatar = storedUser?.avatar;

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isManageMode, setIsManageMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 로컬 스토리지에서 투표한 질문 ID 저장
    const [votedQuestions, setVotedQuestions] = useState(() => {
        const saved = localStorage.getItem("votedQuestions");
        return saved ? JSON.parse(saved) : [];
    });

    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', '']
    });

    // 질문 목록 불러오기 (API)
    const fetchQuestions = async () => {
        try {
            const res = await axios.get(`${FASTAPI_BASE_URL}/api/quiz/questions`);
            setQuestions(res.data);
        } catch (err) {
            console.error("Failed to fetch questions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    // 질문 추가
    const handleAddQuestion = async () => {
        if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
            Swal.fire("오류", "질문과 모든 선택지를 입력해주세요.", "warning");
            return;
        }

        try {
            await axios.post(`${FASTAPI_BASE_URL}/api/quiz/questions`, newQuestion);
            await fetchQuestions();
            setIsAddModalOpen(false);
            setNewQuestion({ question: '', options: ['', '', '', ''] });
            Swal.fire("성공", "질문이 추가되었습니다!", "success");
        } catch (err) {
            console.error("Failed to add question:", err);
            Swal.fire("오류", "질문 추가에 실패했습니다.", "error");
        }
    };

    // 질문 삭제
    const handleDeleteQuestion = async (id) => {
        const result = await Swal.fire({
            title: "질문을 삭제하시겠습니까?",
            text: "삭제된 질문과 투표 결과는 복구할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${FASTAPI_BASE_URL}/api/quiz/questions/${id}`);
            await fetchQuestions();
            Swal.fire("삭제됨", "질문이 삭제되었습니다.", "success");
        } catch (err) {
            console.error("Failed to delete question:", err);
            Swal.fire("오류", "질문 삭제에 실패했습니다.", "error");
        }
    };

    // 투표하기
    const handleVote = async (questionId, answer) => {
        if (votedQuestions.includes(questionId)) {
            Swal.fire("알림", "이미 투표하셨습니다.", "info");
            return;
        }

        try {
            await axios.post(`${FASTAPI_BASE_URL}/api/quiz/vote`, {
                question_id: questionId,
                answer: answer
            });

            // 로컬 스토리지 업데이트
            const newVoted = [...votedQuestions, questionId];
            setVotedQuestions(newVoted);
            localStorage.setItem("votedQuestions", JSON.stringify(newVoted));

            await fetchQuestions();
            Swal.fire("투표 완료", "소중한 의견 감사합니다!", "success");
        } catch (err) {
            console.error("Vote failed:", err);
            Swal.fire("오류", "투표에 실패했습니다.", "error");
        }
    };

    if (loading) {
        return <div className="loading">불러오는 중...</div>;
    }

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
                    <p className="sidebar-menu-item" onClick={() => navigate("/led-test")}>미션</p>
                    <p className="sidebar-menu-item" onClick={() => navigate("/notion")}>노션</p>
                    <p className="sidebar-menu-item active" onClick={() => navigate("/quiz")}>선배님께 질문!</p>
                    <p className="sidebar-menu-item" onClick={() => navigate("/")}>정보</p>
                </div>

                <div
                    className="logout-btn-sidebar"
                    onClick={async () => {
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
                                <img src={userAvatar} alt="profile" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                            )}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{userName}</p>
                        </div>
                    </div>
                </header>

                <div className="welcome-section">
                    <div className="welcome-text">
                        <h2>선배님께 질문!</h2>
                        <p>궁금한 점을 투표로 물어보세요.</p>
                    </div>
                    <div className="quiz-controls">
                        <button
                            className={`mode-btn ${isManageMode ? 'active' : ''}`}
                            onClick={() => setIsManageMode(!isManageMode)}
                        >
                            {isManageMode ? '투표 참여' : '⚙️ 질문 관리'}
                        </button>
                    </div>
                </div>

                {/* 관리 모드 */}
                {isManageMode ? (
                    <div className="manage-section">
                        <div className="manage-header">
                            <h3>질문 관리 ({questions.length}개)</h3>
                            <button className="add-question-btn" onClick={() => setIsAddModalOpen(true)}>
                                + 질문 추가
                            </button>
                        </div>

                        <div className="questions-list">
                            {questions.map((q, idx) => (
                                <div key={q.id} className="question-manage-card">
                                    <div className="question-number">Q{idx + 1}</div>
                                    <div className="question-info">
                                        <p className="question-text-small">{q.question}</p>
                                        <div className="options-preview">
                                            {q.options.map((opt, i) => (
                                                <span key={i} className="option-tag">
                                                    {opt}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <button className="delete-question-btn" onClick={() => handleDeleteQuestion(q.id)}>
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 질문 추가 모달 */}
                        {isAddModalOpen && (
                            <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>새 질문 추가</h3>
                                        <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            type="text"
                                            placeholder="질문을 입력하세요"
                                            value={newQuestion.question}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                            className="modal-input"
                                        />
                                        {newQuestion.options.map((opt, idx) => (
                                            <div key={idx} className="option-input-row">
                                                <input
                                                    type="text"
                                                    placeholder={`선택지 ${idx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const newOpts = [...newQuestion.options];
                                                        newOpts[idx] = e.target.value;
                                                        setNewQuestion({ ...newQuestion, options: newOpts });
                                                    }}
                                                    className="modal-input option-input"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="modal-footer">
                                        <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>취소</button>
                                        <button className="confirm-btn" onClick={handleAddQuestion}>추가하기</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* 투표 모드 */
                    <div className="survey-container">
                        {questions.length > 0 ? (
                            <div className="survey-grid">
                                {questions.map((q) => {
                                    const isVoted = votedQuestions.includes(q.id);
                                    return (
                                        <div key={q.id} className="survey-card">
                                            <h3 className="survey-question">{q.question}</h3>
                                            <div className="survey-options">
                                                {q.options.map((opt, idx) => {
                                                    const count = q.vote_counts[opt] || 0;
                                                    const percentage = q.total_votes > 0 ? Math.round((count / q.total_votes) * 100) : 0;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`survey-option ${isVoted ? 'voted' : ''}`}
                                                            onClick={() => !isVoted && handleVote(q.id, opt)}
                                                        >
                                                            <div className="option-content">
                                                                <span className="option-text">{opt}</span>
                                                                {isVoted && <span className="option-percent">{percentage}% ({count}표)</span>}
                                                            </div>
                                                            {isVoted && (
                                                                <div className="progress-bar-bg">
                                                                    <div
                                                                        className="progress-bar-fill"
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="survey-footer">
                                                <span className="total-votes">총 {q.total_votes}명 참여</span>
                                                {isVoted && <span className="voted-badge">참여완료</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="no-questions">
                                <h3>등록된 질문이 없습니다.</h3>
                                <p>관리자 모드에서 질문을 추가해주세요.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
