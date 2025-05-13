import React, { useState, useEffect, useRef } from 'react';
import { Tab, Tabs, Card, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Category.css';
import { setCachedVideoData } from './VideoCache';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [videoData, setVideoData] = useState({});
    const [activeTab, setActiveTab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/api/sign') // GET 수어 리스트 API
            .then((res) => res.json())
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    const newCategories = res.data.map((cat) => ({
                        key: cat.category,
                        label: cat.category,
                    }));

                    const newVideoData = {};
                    res.data.forEach((cat) => {
                        newVideoData[cat.category] = cat.items.map((item) => ({
                            id: item.id,
                            title: item.name,
                            url: item.url,
                        }));
                    });

                    setCategories(newCategories);
                    setCachedVideoData(newVideoData); // ✅ 저장
                    setVideoData(newVideoData);
                    setActiveTab(newCategories[0]?.key || '');
                } else {
                    console.error('서버 응답 실패:', res);
                }
            })
            .catch((err) => console.error('API 호출 실패:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleSearchEnter = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleTabSelect = (key) => {
        setActiveTab(key);
        setCurrentPage(1);
    };

    return (
        <Container className="category-wrapper">
            <h1 className="category-title">Son'sation</h1>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="success" />
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4 category-tabs">
                        <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="flex-grow-1 me-3">
                            {categories.map((cat) => (
                                <Tab key={cat.key} eventKey={cat.key} title={cat.label} />
                            ))}
                        </Tabs>

                        <input
                            type="text"
                            className="form-control w-auto"
                            style={{ minWidth: '200px' }}
                            placeholder="단어 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearchEnter}
                        />
                    </div>

                    {activeTab && (
                        <VideoGrid
                            videos={videoData[activeTab] || []}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                        />
                    )}
                </>
            )}
        </Container>
    );
};

const VideoGrid = ({ videos, currentPage, setCurrentPage }) => {
    const videosPerPage = 6;
    const totalPages = Math.ceil(videos.length / videosPerPage);
    const indexOfLast = currentPage * videosPerPage;
    const indexOfFirst = indexOfLast - videosPerPage;
    const currentVideos = videos.slice(indexOfFirst, indexOfLast);

    return (
        <>
            <Row>
                {currentVideos.map((video, idx) => (
                    <Col key={idx} xs={12} md={6} lg={4} className="mb-4">
                        <VideoCard {...video} />
                    </Col>
                ))}
            </Row>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                            key={page}
                            variant={page === currentPage ? 'success' : 'outline-success'}
                            className="mx-1 mb-2 rounded-pill"
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
        </>
    );
};

const VideoCard = ({ id, title, url }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('');
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                const mins = Math.floor(video.duration / 60);
                const secs = Math.floor(video.duration % 60);
                setDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
                video.currentTime = 0.1;
                video.pause();
            };
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
    }, []);

    return (
        <Card className="category-card h-100">
            <div className="category-video-thumbnail">
                {!isPlaying ? (
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setIsPlaying(true)}
                    >
                        <video
                            ref={videoRef}
                            src={url}
                            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                            preload="metadata"
                            muted
                            playsInline
                        />
                        <div className="video-duration">{duration || '...'}</div>
                        <div className="position-relative z-3">
                            <svg className="play-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                        </div>
                    </div>
                ) : (
                    <video
                        src={url}
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        controls
                        autoPlay
                    />
                )}
            </div>
            <Card.Body>
                <Card.Title className="fs-5 text-truncate">{title}</Card.Title>
            </Card.Body>
            <Card.Footer className="category-card-footer">
                <Button variant="link" size="sm" className="watch-button" onClick={() => navigate(`/video/${id}`)}>
                    학습하러 가기
                </Button>
                <Button variant="link" size="sm" className="watch-button" onClick={() => setIsPlaying(true)}>
                    재생하기
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default Category;
