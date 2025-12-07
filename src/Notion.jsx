import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Notion.css';
import { API_BASE_URL, FASTAPI_BASE_URL } from './config';

import bookIcon from "./picture/Empty-Files.png";
import lampBook from "./picture/Light.png";

export default function Notion() {
    const navigate = useNavigate();

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userName = storedUser?.name || "Guest";
    const userAvatar = storedUser?.avatar;

    const [notionUrl, setNotionUrl] = useState('');
    const [notionTitle, setNotionTitle] = useState('');
    const [notionDesc, setNotionDesc] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sharedLinks, setSharedLinks] = useState([]);

    // 링크 불러오기
    const fetchLinks = async () => {
        try {
            const res = await axios.get(`${FASTAPI_BASE_URL}/api/notion/links`);
            setSharedLinks(res.data);
        } catch (err) {
            console.error("Failed to fetch links:", err);
        }
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleShare = async () => {
        if (!notionUrl.trim()) return;

        try {
            const res = await axios.post(`${FASTAPI_BASE_URL}/api/notion/links`, {
                url: notionUrl,
                title: notionTitle.trim() || `노션 링크`,
                description: notionDesc.trim() || '',
                author: userName,
                avatar: userAvatar,
            });

            setSharedLinks([res.data, ...sharedLinks]);
            setNotionUrl('');
            setNotionTitle('');
            setNotionDesc('');
            setIsModalOpen(false);
            Swal.fire("공유 완료!", "링크가 공유되었습니다.", "success");
        } catch (err) {
            console.error("Failed to share link:", err);
            Swal.fire("오류", "링크 공유에 실패했습니다.", "error");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "삭제하시겠습니까?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "삭제",
            cancelButtonText: "취소",
            confirmButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${FASTAPI_BASE_URL}/api/notion/links/${id}`);
            setSharedLinks(sharedLinks.filter(link => link.id !== id));
            Swal.fire("삭제됨", "링크가 삭제되었습니다.", "success");
        } catch (err) {
            console.error("Failed to delete link:", err);
            Swal.fire("오류", "링크 삭제에 실패했습니다.", "error");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNotionUrl('');
        setNotionTitle('');
        setNotionDesc('');
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
                    <p className="sidebar-menu-item" onClick={() => navigate("/led-test")}>미션</p>
                    <p className="sidebar-menu-item active" onClick={() => navigate("/notion")}>노션</p>
                    <p className="sidebar-menu-item" onClick={() => navigate("/quiz")}>퀴즈</p>
                    <p className="sidebar-menu-item" onClick={() => navigate("/")}>정보</p>
                </div>

                {/* 로그아웃 버튼 */}
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
                        <h2>노션 공유</h2>
                        <p>팀원들과 노션 링크를 공유해보세요!</p>
                    </div>
                    <img src={lampBook} alt="Lamp and book" className="lamp-book-img" />
                </div>

                {/* 새 링크 추가 버튼 */}
                <button className="add-link-btn" onClick={() => setIsModalOpen(true)}>
                    + 새 링크 추가
                </button>

                {/* 모달 */}
                {isModalOpen && (
                    <div className="modal-overlay" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>노션 링크 공유</h3>
                                <button className="modal-close-btn" onClick={closeModal}>×</button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    placeholder="제목을 입력하세요..."
                                    value={notionTitle}
                                    onChange={(e) => setNotionTitle(e.target.value)}
                                    className="notion-input"
                                />
                                <textarea
                                    placeholder="부가 설명을 입력하세요..."
                                    value={notionDesc}
                                    onChange={(e) => setNotionDesc(e.target.value)}
                                    className="notion-input notion-textarea"
                                    rows={3}
                                />
                                <input
                                    type="text"
                                    placeholder="노션 링크를 입력하세요..."
                                    value={notionUrl}
                                    onChange={(e) => setNotionUrl(e.target.value)}
                                    className="notion-input"
                                />
                            </div>
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={closeModal}>취소</button>
                                <button className="share-btn" onClick={handleShare}>공유하기</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 공유된 링크 목록 */}
                <section className="shared-links-section">
                    <h3>공유된 노션 링크</h3>
                    <div className="links-grid">
                        {sharedLinks.map((link) => (
                            <div className="link-card" key={link.id}>
                                <div className="link-content">
                                    <h4>{link.title}</h4>
                                    {link.description && (
                                        <p className="link-description">{link.description}</p>
                                    )}
                                    <p className="link-author">by {link.author}</p>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="link-url">
                                        {link.url.length > 40 ? link.url.substring(0, 40) + '...' : link.url}
                                    </a>
                                </div>
                                <div className="link-actions">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="open-btn">
                                        열기
                                    </a>
                                    <button onClick={() => handleDelete(link.id)} className="delete-btn">
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
