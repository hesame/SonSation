import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SpinningWheel from './SpinningWheel';
import * as mpHolistic from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import './QuizPage.css';

export default function QuizPage() {
    const [words, setWords] = useState([]); // API 데이터로 초기화
    const [isSpinning, setIsSpinning] = useState(false);
    const [selectedWord, setSelectedWord] = useState('');
    const [resultText, setResultText] = useState('');
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

    const [showReviewButton, setShowReviewButton] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const navigate = useNavigate();
    // MediaPipe refs
    const holisticRef = useRef(null);
    const cameraRef = useRef(null);
    const tempSequence = useRef([]);
    const collecting = useRef(false);
    const lastFrame = useRef(null);
    const CHANGE_THRESHOLD = 0.003;
    useEffect(() => {
        fetch('http://localhost:8080/api/sign/name')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    setWords(data.data); // ✅ 객체 배열 저장
                } else {
                    console.error('API returned error:', data);
                }
            })
            .catch((err) => {
                console.error('API Fetch Error:', err);
            });
    }, []);

    // 웹캠 설정 + MediaPipe 초기화
    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                if (webcamRef.current) {
                    webcamRef.current.srcObject = stream;
                    webcamRef.current.onloadedmetadata = () => {
                        initHolistic();
                    };
                }
            })
            .catch((err) => {
                console.error('웹캠 연결 실패:', err);
            });

        return () => {
            if (webcamRef.current && webcamRef.current.srcObject) {
                webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const initHolistic = () => {
        const holistic = new mpHolistic.Holistic({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
        });

        holistic.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        holistic.onResults(onResults);
        holisticRef.current = holistic;

        if (webcamRef.current) {
            const camera = new Camera(webcamRef.current, {
                onFrame: async () => {
                    if (holisticRef.current) {
                        await holisticRef.current.send({ image: webcamRef.current });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
            cameraRef.current = camera;
        }
    };

    const onResults = (results) => {
        if (!canvasRef.current || !webcamRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(webcamRef.current, 0, 0, canvas.width, canvas.height);

        const draw = (landmarks, color) => {
            if (!landmarks) return;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            for (const lm of landmarks) {
                const x = lm.x * canvas.width;
                const y = lm.y * canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        draw(results.leftHandLandmarks, 'red');
        draw(results.rightHandLandmarks, 'blue');
        draw(results.poseLandmarks, 'green');

        if (!collecting.current) return;

        const getLandmarks = (lmList, count) =>
            lmList ? lmList.map((lm) => [lm.x, lm.y, lm.z]) : Array(count).fill([0, 0, 0]);

        const pose = getLandmarks(results.poseLandmarks, 33);
        const left = getLandmarks(results.leftHandLandmarks, 21);
        const right = getLandmarks(results.rightHandLandmarks, 21);
        let full = [...pose, ...left, ...right];

        const hasRight = right.some(([x, y, z]) => x !== 0 || y !== 0 || z !== 0);
        const origin = hasRight ? right[0] : average(full);
        full = full.map(([x, y, z]) => [x - origin[0], y - origin[1], z - origin[2]]);

        const mean = [0, 1, 2].map((i) => full.reduce((acc, val) => acc + val[i], 0) / full.length);
        const std = [0, 1, 2].map((i) => {
            const variance = full.reduce((acc, val) => acc + Math.pow(val[i] - mean[i], 2), 0) / full.length;
            return Math.sqrt(variance) + 1e-6;
        });

        full = full.map(([x, y, z]) => [(x - mean[0]) / std[0], (y - mean[1]) / std[1], (z - mean[2]) / std[2]]);

        const flat = full.flat();

        if (lastFrame.current) {
            const diff = flat.reduce((acc, val, i) => acc + Math.pow(val - lastFrame.current[i], 2), 0) ** 0.5;
            if (diff < CHANGE_THRESHOLD) return;
        }

        lastFrame.current = flat;
        tempSequence.current.push(flat);
    };

    const average = (arr) => {
        const sum = arr.reduce((acc, val) => acc.map((s, i) => s + val[i]), [0, 0, 0]);
        return sum.map((s) => s / arr.length);
    };

    // const sendSequence = async () => {
    //     const frames = tempSequence.current;
    //     if (frames.length === 0) {
    //         setResultText('⚠️ 프레임 수집 실패');
    //         return;
    //     }

    //     let padded = [...frames];
    //     while (padded.length < 100) padded.push(padded[padded.length - 1]);
    //     padded = padded.slice(0, 100);

    //     try {
    //         setResultText('🧠 예측 중...');
    //         const res = await fetch(`http://localhost:8000/predict?sign=${selectedWord}`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ sequence: padded }),
    //         });
    //         const data = await res.json();
    //         if (data.error) {
    //             setResultText('❌ 오류: ' + data.error);
    //         } else {
    //             setResultText(`✅ 예측 결과: ${data.label} (${(data.confidence * 100).toFixed(1)}%)`);
    //         }
    //     } catch (err) {
    //         setResultText('❌ 서버 연결 실패: ' + err.message);
    //     }
    // };
    const sendSequence = async () => {
        const frames = tempSequence.current;
        if (frames.length === 0) {
            setResultText('⚠️ 프레임 수집 실패');
            return;
        }

        let padded = [...frames];
        while (padded.length < 100) padded.push(padded[padded.length - 1]);
        padded = padded.slice(0, 100);

        try {
            setResultText('🧠 예측 중...');
            const res = await fetch(`http://localhost:8000/predict/quiz?sign=${selectedWord}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sequence: padded }),
            });
            const data = await res.json();

            if (data.match) {
                setResultText(`🥳 ${data.message} (신뢰도: ${(data.confidence * 100).toFixed(1)}%)`);
                setShowReviewButton(false); // 복습 버튼 감춤
            } else {
                setResultText(`🤔 ${data.message} (신뢰도: ${(data.confidence * 100).toFixed(1)}%)`);

                // ✅ selectedId 찾기
                const selectedItem = words.find((item) => item.name === selectedWord);
                if (selectedItem) {
                    setSelectedId(selectedItem.id);
                    setShowReviewButton(true); // 복습 버튼 보여줌
                }
            }
        } catch (err) {
            setResultText('❌ 서버 연결 실패: ' + err.message);
            setShowReviewButton(false);
        }
    };

    const handleStart = () => {
        if (!selectedWord) {
            setResultText('⚠️ 먼저 단어를 선택하세요!');
            return;
        }

        tempSequence.current = [];
        collecting.current = false;
        lastFrame.current = null;

        let sec = 3;
        setResultText(`⏳ ${sec}초 뒤에 '${selectedWord}' 수화를 시작합니다...`);

        const prepTimer = setInterval(() => {
            sec--;
            if (sec > 0) {
                setResultText(`⏳ ${sec}초 뒤에 '${selectedWord}' 수화를 시작합니다...`);
            } else {
                clearInterval(prepTimer);
                collecting.current = true;
                setResultText(`✋ '${selectedWord}' 수어를 입력하세요...`);

                // 입력 시간: 3초간 수어 수집 후 자동 종료
                setTimeout(() => {
                    collecting.current = false;
                    setResultText('🧠 예측 중...');
                    sendSequence();
                }, 3000); // 수어 입력 시간 (ms)
            }
        }, 1000);
    };

    const handleSelectWord = (word) => {
        setSelectedWord(word);
        setResultText('');
    };

    return (
        <div className="quiz-page-wrapper">
            <div className="quiz-result">
                {!resultText && (
                    <>
                        👉 수화를 한 뒤 결과가 여기에 표시됩니다.
                        <br />
                    </>
                )}

                {selectedWord && (
                    <div>
                        선택된 단어: <strong>{selectedWord}</strong>
                    </div>
                )}

                {resultText && <div>{resultText}</div>}

                {showReviewButton && selectedId && (
                    <button
                        style={{
                            marginTop: '10px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/video/${selectedId}`)}
                    >
                        복습하기
                    </button>
                )}
            </div>

            <div className="quiz-main-content">
                <div className="quiz-left">
                    <div className="webcam-box">
                        <video ref={webcamRef} className="webcam-video" autoPlay muted />
                        <canvas
                            ref={canvasRef}
                            width="640"
                            height="480"
                            style={{ position: 'absolute', top: 0, left: 0, height: '90%' }}
                        />
                    </div>
                    <div className="button-wrapper">
                        <button className="start-button" onClick={handleStart}>
                            시작하기
                        </button>
                    </div>
                </div>
                <div className="quiz-right">
                    <SpinningWheel
                        words={words.map((w) => w.name)}
                        isSpinning={isSpinning}
                        setIsSpinning={setIsSpinning}
                        onSelectWord={handleSelectWord}
                    />
                    <div className="learning-tip" style={{ marginTop: '5%' }}>
                        <h3>💡 학습 Tip</h3>
                        <ul>
                            <li>
                                <strong>첫 번째:</strong> 랜덤의 단어를 선택하고 수화를 해주세요!
                            </li>
                            <li>
                                <strong>두 번째:</strong> AI가 여러분의 수화를 분석하여 정답을 알려줍니다!
                            </li>
                            <li>
                                <strong>세 번째:</strong> 정답을 틀린 경우 복습 버튼을 통해 다시 학습 해봐요!
                            </li>
                        </ul>
                    </div>
                    <div className="button-wrapper">
                        <button
                            className="select-word-button"
                            onClick={() => setIsSpinning(true)}
                            disabled={isSpinning || words.length === 0}
                        >
                            단어 선택하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
