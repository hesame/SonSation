import './main.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import img1 from '../assets/main1.jpeg';
import img2 from '../assets/main2.jpg';
import img3 from '../assets/main3.jpg';

export default function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="main-intro-wrapper">
            <div className="intro-header">
                <div className="intro-logo">
                    Son<span className="quote">'</span>sation
                </div>
                <h1 className="intro-title">AI 기반 수어 학습 및 인식 플랫폼</h1>
                <p className="intro-subtitle">
                    수어 학습을 쉽고 직관적으로!
                    <br />
                    AI와 웹캠을 통한 실시간 비교예측, 가이드 영상, 퀴즈를 통한 학습까지 한 번에 경험하세요.
                </p>
                <button className="intro-start-button" onClick={() => navigate('/category')}>
                    지금 시작하기
                </button>
            </div>

            <div className="features-section">
                <motion.div
                    className="feature-block"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    <div className="feature-text-left">
                        <h3>AI 웹캠 수어 인식</h3>
                        <p>AI를 활용한 웹캠을 통해 사용자의 수어를 실시간으로 인식합니다.</p>
                    </div>
                    <img className="feature-image" src={img3} alt="웹캠 수어 인식" />
                </motion.div>

                <motion.div
                    className="feature-block reverse"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <img className="feature-image" src={img2} alt="AI 피드백" />
                    <div className="feature-text-right">
                        <h3>AI 정밀 비교 및 예측</h3>
                        <p>AI가 제공하는 정보를 통해 수어 학습 정확도를 높입니다.</p>
                    </div>
                </motion.div>

                <motion.div
                    className="feature-block"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                >
                    <div className="feature-text-left">
                        <h3>퀴즈로 맞춰가는 수화 학습</h3>
                        <p>퀴즈 기반의 문제풀이로 수화를 자연스럽게 익힐 수 있습니다.</p>
                    </div>
                    <img className="feature-image" src={img1} alt="수화 퀴즈" />
                </motion.div>
                <button className="intro-start-button" onClick={() => navigate('/category')}>
                    수어 카테고리
                </button>
            </div>
        </div>
    );
}
