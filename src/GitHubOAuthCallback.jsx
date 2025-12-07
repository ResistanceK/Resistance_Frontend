import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function GitHubOAuthCallback() {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    // StrictMode에서 두 번 실행되는 것을 방지
    if (processed.current) return;

    const params = new URL(window.location.href).searchParams;
    const name = params.get("name");
    const avatar = params.get("avatar");
    const token = params.get("token");

    console.log("GitHub OAuth 결과:", { name, avatar, token });

    if (!name || !avatar) {
      console.error("GitHub OAuth 정보 없음");
      // 이미 localStorage에 user가 있으면 리다이렉트하지 않음
      if (!localStorage.getItem("user")) {
        navigate("/login");
      }
      return;
    }

    processed.current = true;

    // 사용자 정보 저장
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: name,
        avatar: avatar,
        token: token,
      })
    );

    console.log("로컬스토리지에 저장됨:", { name, avatar });

    // 회원가입 페이지로 이동
    navigate("/signup");
  }, [navigate]);

  return <div style={{ textAlign: "center", marginTop: "50px" }}>로그인 처리 중...</div>;
}
