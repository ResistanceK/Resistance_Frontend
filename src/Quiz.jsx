import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Quiz.css';
import { API_BASE_URL } from './config';

import bookIcon from "./picture/Empty-Files.png";
import lampBook from "./picture/Light.png";

export default function Quiz() {
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userName = storedUser?.name || "Guest";
    const userAvatar = storedUser?.avatar;

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [rankings, setRankings] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [isManageMode, setIsManageMode] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correct: 0,
        explanation: ''
    });

    // 랭킹 불러오기 (API)
    const fetchRankings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/quiz/rankings`);
            setRankings(res.data);
        } catch (err) {
            console.error("Failed to fetch rankings:", err);
        }
    };

    // 퀴즈 문제 불러오기 (API)
    const fetchQuestions = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/quiz/questions`);
            setQuizQuestions(res.data);
        } catch (err) {
            console.error("Failed to fetch questions:", err);
            // 기본 문제 사용
            setQuizQuestions([
                { id: 1, question: "물의 화학식은?", options: ["CO₂", "H₂O", "NaCl", "O₂"], correct: 1, explanation: "H₂O입니다." },
            ]);
        }
    };

    useEffect(() => {
        fetchRankings();
        fetchQuestions();
    }, []);

    // 랭킹 저장 (API)
    const saveRanking = async (newScore) => {
        const newEntry = {
            name: userName,
            avatar: userAvatar,
            score: newScore,
            total: quizQuestions.length,
            percentage: Math.round((newScore / quizQuestions.length) * 100),
            date: new Date().toLocaleDateString('ko-KR'),
        };

        try {
            const res = await axios.post(`${API_BASE_URL}/api/quiz/rankings`, newEntry);
            setRankings(res.data.rankings);
        } catch (err) {
            console.error("Failed to save ranking:", err);
        }
    };

    // 문제 추가
    const handleAddQuestion = async () => {
        if (!newQuestion.question.trim() || newQuestion.options.some(opt => !opt.trim())) {
            Swal.fire("오류", "문제와 모든 선택지를 입력해주세요.", "warning");
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/quiz/questions`, newQuestion);
            await fetchQuestions();
            setIsAddModalOpen(false);
            setNewQuestion({ question: '', options: ['', '', '', ''], correct: 0, explanation: '' });
            Swal.fire("성공", "문제가 추가되었습니다!", "success");
        } catch (err) {
            console.error("Failed to add question:", err);
            Swal.fire("오류", "문제 추가에 실패했습니다.", "error");
        }
    };

    // 문제 삭제
    const handleDeleteQuestion = async (id) => {
        const result = await Swal.fire({
            title: "문제를 삭제하시겠습니까?",
            text: "삭제된 문제는 복구할 수 없습니다.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/quiz/questions/${id}`);
            await fetchQuestions();
            Swal.fire("삭제됨", "문제가 삭제되었습니다.", "success");
        } catch (err) {
            console.error("Failed to delete question:", err);
            Swal.fire("오류", "문제 삭제에 실패했습니다.", "error");
        }
    };

    const handleAnswerClick = (answerIndex) => {
        if (isAnswered) return;
        setSelectedAnswer(answerIndex);
        setIsAnswered(true);
        if (answerIndex === quizQuestions[currentQuestion]?.correct) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            const finalScore = selectedAnswer === quizQuestions[currentQuestion]?.correct ? score + 1 : score;
            saveRanking(finalScore);
            setShowResult(true);
        }
    };

    const handleRestartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setShowResult(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    const getScoreMessage = () => {
        const percentage = (score / quizQuestions.length) * 100;
        if (percentage >= 90) return { emoji: "🏆", message: "완벽해요! 과학 천재!" };
        if (percentage >= 70) return { emoji: "🎉", message: "훌륭해요!" };
        if (percentage >= 50) return { emoji: "👍", message: "괜찮아요!" };
        return { emoji: "📚", message: "더 공부해봐요!" };
    };

    const getRankEmoji = (index) => {
        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";
        return `${index + 1}`;
    };

    if (quizQuestions.length === 0) {
        return <div className="loading">퀴즈를 불러오는 중...</div>;
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
                    <p className="sidebar-menu-item active" onClick={() => navigate("/quiz")}>퀴즈</p>
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
                        <h2>과학 퀴즈</h2>
                        <p>과학 지식을 테스트해보세요!</p>
                    </div>
                    <div className="quiz-controls">
                        <button
                            className={`mode-btn ${isManageMode ? 'active' : ''}`}
                            onClick={() => setIsManageMode(!isManageMode)}
                        >
                            {isManageMode ? '퀴즈 풀기' : '⚙️ 문제 관리'}
                        </button>
                    </div>
                </div>

                {/* 관리 모드 */}
                {isManageMode ? (
                    <div className="manage-section">
                        <div className="manage-header">
                            <h3>퀴즈 문제 관리 ({quizQuestions.length}개)</h3>
                            <button className="add-question-btn" onClick={() => setIsAddModalOpen(true)}>
                                + 문제 추가
                            </button>
                        </div>

                        <div className="questions-list">
                            {quizQuestions.map((q, idx) => (
                                <div key={q.id} className="question-manage-card">
                                    <div className="question-number">Q{idx + 1}</div>
                                    <div className="question-info">
                                        <p className="question-text-small">{q.question}</p>
                                        <div className="options-preview">
                                            {q.options.map((opt, i) => (
                                                <span key={i} className={`option-tag ${i === q.correct ? 'correct' : ''}`}>
                                                    {String.fromCharCode(65 + i)}. {opt}
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

                        {/* 문제 추가 모달 */}
                        {isAddModalOpen && (
                            <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header">
                                        <h3>새 문제 추가</h3>
                                        <button className="modal-close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <input
                                            type="text"
                                            placeholder="문제를 입력하세요"
                                            value={newQuestion.question}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                            className="modal-input"
                                        />
                                        {newQuestion.options.map((opt, idx) => (
                                            <div key={idx} className="option-input-row">
                                                <span className={`option-label ${newQuestion.correct === idx ? 'selected' : ''}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
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
                                                <button
                                                    type="button"
                                                    className={`correct-btn ${newQuestion.correct === idx ? 'active' : ''}`}
                                                    onClick={() => setNewQuestion({ ...newQuestion, correct: idx })}
                                                >
                                                    정답
                                                </button>
                                            </div>
                                        ))}
                                        <textarea
                                            placeholder="설명 (선택사항)"
                                            value={newQuestion.explanation}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                                            className="modal-input modal-textarea"
                                            rows={2}
                                        />
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
                    /* 퀴즈 모드 */
                    <div className="quiz-main-container">
                        <div className="quiz-container">
                            {!showResult ? (
                                <>
                                    <div className="quiz-progress">
                                        <div className="progress-text">문제 {currentQuestion + 1} / {quizQuestions.length}</div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}></div>
                                        </div>
                                        <div className="score-text">현재 점수: {score}점</div>
                                    </div>

                                    <div className="question-card">
                                        <h3 className="question-text">{quizQuestions[currentQuestion]?.question}</h3>

                                        <div className="options-container">
                                            {quizQuestions[currentQuestion]?.options.map((option, index) => (
                                                <button
                                                    key={index}
                                                    className={`option-btn ${isAnswered
                                                        ? index === quizQuestions[currentQuestion]?.correct
                                                            ? 'correct'
                                                            : selectedAnswer === index ? 'wrong' : ''
                                                        : selectedAnswer === index ? 'selected' : ''
                                                        }`}
                                                    onClick={() => handleAnswerClick(index)}
                                                    disabled={isAnswered}
                                                >
                                                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                                    {option}
                                                </button>
                                            ))}
                                        </div>

                                        {isAnswered && (
                                            <div className={`explanation ${selectedAnswer === quizQuestions[currentQuestion]?.correct ? 'correct' : 'wrong'}`}>
                                                <p>{selectedAnswer === quizQuestions[currentQuestion]?.correct ? '✅ 정답입니다!' : '❌ 틀렸습니다.'}</p>
                                                <p>{quizQuestions[currentQuestion]?.explanation}</p>
                                            </div>
                                        )}

                                        {isAnswered && (
                                            <button className="next-btn" onClick={handleNextQuestion}>
                                                {currentQuestion < quizQuestions.length - 1 ? '다음 문제' : '결과 보기'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="result-card">
                                    <div className="result-emoji">{getScoreMessage().emoji}</div>
                                    <h2 className="result-title">퀴즈 완료!</h2>
                                    <div className="result-score">
                                        <span className="score-number">{score}</span>
                                        <span className="score-total">/ {quizQuestions.length}</span>
                                    </div>
                                    <p className="result-message">{getScoreMessage().message}</p>
                                    <div className="result-percentage">정답률: {Math.round((score / quizQuestions.length) * 100)}%</div>
                                    <button className="restart-btn" onClick={handleRestartQuiz}>다시 도전하기</button>
                                </div>
                            )}
                        </div>

                        {/* 랭킹 패널 */}
                        <aside className="ranking-panel">
                            <div className="ranking-card">
                                <h3 className="ranking-title">🏆 명예의 전당</h3>
                                {rankings.length === 0 ? (
                                    <p className="no-rankings">아직 기록이 없어요!</p>
                                ) : (
                                    <div className="ranking-list">
                                        {rankings.slice(0, 10).map((entry, index) => (
                                            <div className={`ranking-item ${entry.name === userName ? 'current-user' : ''}`} key={index}>
                                                <span className="rank-number">{getRankEmoji(index)}</span>
                                                <div className="rank-user">
                                                    {entry.avatar && <img src={entry.avatar} alt="" className="rank-avatar" />}
                                                    <span className="rank-name">{entry.name}</span>
                                                </div>
                                                <div className="rank-score">
                                                    <span className="rank-percentage">{entry.percentage}%</span>
                                                    <span className="rank-detail">{entry.score}/{entry.total}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </div>
    );
}
