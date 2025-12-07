import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Mainpage.css";
import icon1 from "./picture/feedback.png";
import icon2 from "./picture/link.png";
import icon3 from "./picture/people.png";
import icon4 from "./picture/type.png";

export default function Mainpage() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/dash"); // 버튼 클릭 시 Login 페이지로 이동
  };

  return (
    <div className="container">
      {/* 상단 메뉴 */}
      <nav>
  
      </nav>

      {/* 1페이지: Hero */}
      <section id="hero" className="hero">
        <div className="hero-image left"></div>
        <div className="hero-image right"></div>

        <div className="hero-content">
          <h1>
            HELLO, HERE <br /> RESISTANCE
          </h1>
          <button onClick={handleStart}>START</button> {/* ← 클릭 이벤트 */}
        </div>
      </section>

      {/* 2페이지: ABOUT */}
      <section id="about" className="about">
        <h2>ABOUT</h2>
        <p className="subtitle">RESISTANCE는요...</p>
        <div className="about-grid">
          <div className="item">
            <img src={icon1} alt="아이콘1" className="about-icon" />
            <div>
              <h3>전기·전자 원리에 대한 이해 증진</h3>
              <p>
                교과서 속의 공식이 아닌, <br/>
                "실제 데이터를 통해 배우는 전자 회로
                원리"<br/>를 실현하는 것이 핵심 목표입니다.
              </p>
            </div>
          </div>

          <div className="item">
            <img src={icon2} alt="아이콘2" className="about-icon" />
            <div>
              <h3>실시간 데이터 기반, 창의적 탐구 촉진</h3>
              <p>단순 실험에서 끝나지 않고,<br/> “데이터로 사고하는 습관”을 <br/>
                  만드는 것이 저희의 목적입니다.</p>
            </div>
          </div>

          <div className="item">
            <img src={icon3} alt="아이콘3" className="about-icon" />
            <div>
              <h3>IoT 응용 개발로 확장 가능한 시스템</h3>
              <p>
                실제 데이터를 통해 배우는 전자 회로 원리로<br/>
                이제 IoT 기술로 확상해나가는 것이 <br/>
                저희의 목적입니다.              
              </p>
            </div>
          </div>

          <div className="item">
            <img src={icon4} alt="아이콘4" className="about-icon" />
            <div>
              <h3>하드웨어·소프트웨어 융합 경험 제공</h3>
              <p>
                전자회로, 데이터 송신, 웹 실시간 제어라는<br/>
                물리적 세계와 디지털 세계의<br/>
                연결 경험을 목표로 합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3페이지: FUNCTION */}
      <section id="function" className="function">
  <h2>FUNCTION</h2>
  <div className="function-list">
    <div className="function-item left">
      <div className="box white">
        <h3>실시간 데이터 기반 학습</h3>
        <p>
          - 아두이노·센서를 통해 전압, 전류, 저항 등 실제 데이터를 측정<br/>
          - 웹 대시보드에서 실시간으로 확인
        </p>
      </div>
    </div>

    <div className="function-item right">
      <div className="box white">
        <h3>데이터 기록과 분석</h3>
        <p>
          - 웹 또는 모바일에서 LED, 모터, 센서 등을 원격 조작<br/>
          - IoT 디바이스 간 연동 실습 가능
        </p>
      </div>
    </div>

    <div className="function-item left">
      <div className="box white">
        <h3>원격 제어 및 응용</h3>
        <p>
          - 측정 데이터를 서버에 기록하여 시각화<br/>
          - 전자 회로 특성을 분석하며 이론과 실제를 비교
        </p>
      </div>
    </div>
  </div>
</section>

      
    </div>
  );
}
