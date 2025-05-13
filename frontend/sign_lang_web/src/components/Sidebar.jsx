// src/components/Sidebar.jsx
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        onClose(); // 사이드바 닫기
    };
    return (
        <div className={`sidebar-wrapper ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-glass">
                <button className="close-btn" onClick={onClose}>
                    ×
                </button>
                <ul>
                    <li onClick={() => navigate('/')}>홈</li>
                    <li onClick={() => navigate('/category')}>수어 학습</li>
                    <li onClick={() => navigate('/quiz')}>수어 퀴즈</li>
                </ul>
            </div>
        </div>
    );
}
