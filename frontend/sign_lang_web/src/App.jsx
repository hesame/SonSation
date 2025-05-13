import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import IntroScreen from './components/IntroScreen';
import Sidebar from './components/Sidebar';
import VideoModeSwitcher from './components/VideoModeSwitcher';
import QuizPage from './components/Quiz';
import Category from './components/Category';
import SearchResult from './components/SearchResult';
import { RxHamburgerMenu } from 'react-icons/rx';

import './App.css';

export default function App() {
    const [showIntro, setShowIntro] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (showIntro) {
        return <IntroScreen onEnter={() => setShowIntro(false)} />;
    }

    return (
        <BrowserRouter>
            <div className="app-wrapper">
                {/* ⬆️ 네비게이션 */}
                <div className="main-navbar">
                    <div className="navbar-content">
                        <div className="navbar-left">
                            <span className="hamburger-icon" onClick={() => setSidebarOpen(true)}>
                                <RxHamburgerMenu />
                            </span>
                        </div>
                        <div className="site-logo" onClick={() => (window.location.href = '/')}>
                            Son<span className="quote">'</span>sation
                        </div>
                        <div className="navbar-right" />
                    </div>
                </div>

                {/* ⬅️ 사이드바 */}
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* 🏠 페이지 내용 */}
                <main className="page-content">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/video/:id" element={<VideoModeSwitcher />} />
                        <Route path="/quiz" element={<QuizPage />} />
                        <Route path="/category" element={<Category />} />
                        <Route path="/search" element={<SearchResult />} />
                    </Routes>
                </main>

                {/* ⬇️ 푸터 */}
                <footer className="footer-info">
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>© 2025 Sonsation Team</p>
                </footer>
            </div>
        </BrowserRouter>
    );
}
