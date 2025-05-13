import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './Category.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResult = () => {
    const query = useQuery();
    const keyword = query.get('q') || '';
    const navigate = useNavigate();

    const [results, setResults] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const videosPerPage = 6;
    const indexOfLast = currentPage * videosPerPage;
    const indexOfFirst = indexOfLast - videosPerPage;
    const currentResults = results.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(results.length / videosPerPage);

    useEffect(() => {
        if (!keyword) return;
        setCurrentPage(1);
        fetch(`http://localhost:8080/api/sign?keyword=${encodeURIComponent(keyword)}`)
            .then((res) => res.json())
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    setResults(res.data);
                } else {
                    setResults([]);
                }
            })
            .catch((err) => {
                console.error('검색 API 실패:', err);
                setResults([]);
            });
    }, [keyword]);

    return (
        <Container className="category-wrapper">
            <h2 className="category-title">"{keyword}" 검색 결과</h2>

            {results.length === 0 ? (
                <p className="text-muted">검색 결과가 없습니다.</p>
            ) : (
                <>
                    <Row>
                        {currentResults.map((video) => (
                            <Col key={video.id} xs={12} md={6} lg={4} className="mb-4">
                                <SearchCard {...video} />
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
            )}

            <div className="text-center mt-4">
                <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate(-1)}>
                    ← 돌아가기
                </Button>
            </div>
        </Container>
    );
};

const SearchCard = ({ id, name, url }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState('');
    const videoRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const loaded = () => {
                const mins = Math.floor(video.duration / 60);
                const secs = Math.floor(video.duration % 60);
                setDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
                video.currentTime = 0.1;
                video.pause();
            };
            video.addEventListener('loadedmetadata', loaded);
            return () => video.removeEventListener('loadedmetadata', loaded);
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
                <Card.Title className="fs-5 text-truncate">{name}</Card.Title>
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

export default SearchResult;
