import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Rnd } from 'react-rnd';
import * as mpHolistic from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { RxCross1 } from 'react-icons/rx';
import '../App.css';

export default function VideoModeSwitcher() {
    const { id } = useParams();
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const holisticRef = useRef(null);
    const cameraRef = useRef(null);

    const tempSequence = useRef([]);
    const collecting = useRef(false);
    const lastFrame = useRef(null);
    const CHANGE_THRESHOLD = 0.003;

    const [webcamOn, setWebcamOn] = useState(true);
    const [webcamError, setWebcamError] = useState(false);
    const [isGuideOn, setIsGuideOn] = useState(true);
    const [showPip, setShowPip] = useState(false);
    const [infoText, setInfoText] = useState('');
    const [resultText, setResultText] = useState('');
    const [countdown, setCountdown] = useState('');
    const [videoData, setVideoData] = useState({ name: '', description: '', url: null });

    useEffect(() => {
        if (id) {
            fetch(`http://localhost:8080/api/sign/${id}`)
                .then((res) => res.json())
                .then((res) => {
                    if (res.success) setVideoData(res.data);
                })
                .catch((err) => console.error('영상 데이터 가져오기 실패:', err));
        }
    }, [id]);

    useEffect(() => {
        if (webcamOn) {
            tryWebcam();
        } else {
            if (webcamRef.current && webcamRef.current.srcObject) {
                const tracks = webcamRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
                webcamRef.current.srcObject = null;
            }
        }
    }, [webcamOn]);

    useEffect(() => {
        setShowPip(!isGuideOn);
        if (webcamOn) {
            tryWebcam();
        }
    }, [isGuideOn]);

    const tryWebcam = () => {
        setWebcamError(false);
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
                console.error('웹캠 재시도 실패:', err);
                setWebcamError(true);
            });
    };

    const stopWebcam = () => {
        if (webcamRef.current && webcamRef.current.srcObject) {
            webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
            webcamRef.current.srcObject = null;
        }
    };

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

    const drawLandmarks = (results) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !webcamRef.current) return;

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
    };

    const average = (arr) => {
        const sum = arr.reduce((acc, val) => acc.map((s, i) => s + val[i]), [0, 0, 0]);
        return sum.map((s) => s / arr.length);
    };

    const onResults = (results) => {
        drawLandmarks(results);
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
            const res = await fetch(`http://localhost:8000/predict/learn?sign=${videoData.name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sequence: padded }),
            });
            const data = await res.json();

            // ✅ 서버에서 message를 문자열로 반환 → 그대로 출력
            setResultText(`${data.message}`);
            console.log(`(신뢰도: ${(data.confidence * 100).toFixed(1)}%)`);
        } catch (err) {
            setResultText('❌ 서버 연결 실패: ' + err.message);
        }
    };

    const handleStart = () => {
        tempSequence.current = [];
        collecting.current = false; // ❌ 인식 시작을 나중에!
        lastFrame.current = null;

        let sec = 3;
        setCountdown(`⏳ ${sec}초 뒤에 시작합니다...`);

        const timer = setInterval(() => {
            sec--;
            if (sec > 0) {
                setCountdown(`⏳ ${sec}초 뒤에 시작합니다...`);
            } else {
                clearInterval(timer);
                setCountdown('✋ 수어를 입력하세요...');
                collecting.current = true;

                // 수어 입력 시간 예: 3초간 수집 후 자동 종료
                setTimeout(() => {
                    collecting.current = false;
                    setCountdown('');
                    sendSequence(); // 결과 전송
                }, 3000); // 수어 입력 3초
            }
        }, 1000);
    };

    return (
        <div className="video-mode-wrapper">
            <div className="quiz-result">
                {!resultText && !countdown && (
                    <>
                        👉 수화를 한 뒤 결과가 여기에 표시됩니다.
                        <br />
                    </>
                )}

                {countdown && <div>{countdown}</div>}

                {resultText && <strong>{resultText}</strong>}
            </div>

            {infoText && (
                <div className="info-text-box">
                    <span>{infoText}</span>
                    <button onClick={() => setInfoText('')}>닫기</button>
                </div>
            )}

            {isGuideOn && !webcamError && (
                <div className="learn-video-area">
                    <div className="video-box" style={{ position: 'relative' }}>
                        {webcamOn ? (
                            <>
                                <video ref={webcamRef} autoPlay muted width="640" height="480" />
                                <canvas
                                    ref={canvasRef}
                                    width="640"
                                    height="480"
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                />
                            </>
                        ) : (
                            <div className="webcam-off-placeholder">📷❌</div>
                        )}
                    </div>
                    <div className="video-box guide-align">
                        <div className="video-wrapper styled-guide-box">
                            <div
                                className="video-title"
                                style={{ fontWeight: 'bold', marginBottom: '8px', marginLeft: '48%' }}
                            >
                                {videoData.name || '가이드 영상'}
                            </div>
                            {videoData.url && (
                                <video
                                    src={videoData.url}
                                    controls
                                    style={{
                                        marginLeft: '10%',
                                        width: '80%',
                                        height: '240px',
                                        borderRadius: '8px',
                                        backgroundColor: '#000',
                                    }}
                                />
                            )}
                            <div className="video-description">{videoData.description}</div>
                        </div>
                    </div>
                </div>
            )}

            {!isGuideOn && !webcamError && (
                <div className="single-video-wrapper" style={{ position: 'relative' }}>
                    {webcamOn ? (
                        <>
                            <video ref={webcamRef} autoPlay muted width="640" height="480" />
                            <canvas
                                ref={canvasRef}
                                width="640"
                                height="480"
                                style={{ position: 'absolute', top: 0, left: 0 }}
                            />
                        </>
                    ) : (
                        <div className="webcam-off-placeholder">📷 웹캠 꺼짐</div>
                    )}
                </div>
            )}

            {showPip && (
                <Rnd
                    className="rnd-container"
                    default={{ x: 20, y: 20, width: 300, height: 170 }}
                    bounds="window"
                    style={{ zIndex: 1000 }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <button
                            onClick={() => setShowPip(false)}
                            style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'transparent',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                zIndex: 10,
                                fontSize: '20px',
                            }}
                        >
                            <RxCross1 />
                        </button>
                        <video src={videoData.url} controls style={{ width: '100%', height: '100%' }} />
                    </div>
                </Rnd>
            )}

            <div className="webcam-toggle-area">
                <button className="webcam-toggle-button" onClick={() => setWebcamOn(!webcamOn)}>
                    {webcamOn ? '웹캠 끄기' : '웹캠 켜기'}
                </button>
                <button className="webcam-toggle-button" onClick={handleStart}>
                    시작
                </button>
                <button className="webcam-toggle-button" onClick={() => setIsGuideOn(!isGuideOn)}>
                    {isGuideOn ? '학습영상 끄기' : '학습영상 켜기'}
                </button>
            </div>

            {webcamError && (
                <div className="webcam-error">
                    ⚠️ 웹캠을 사용할 수 없습니다. 브라우저 권한을 확인해주세요.
                    <button onClick={tryWebcam}>🔁 웹캠 다시 시도하기</button>
                </div>
            )}

            {/* {countdown && <div className="countdown-text">{countdown}</div>} */}

            <div className="learning-tip">
                <h3>💡 학습 Tip</h3>
                <ul>
                    <li>
                        <strong>첫 번째:</strong> 3~4초간 수화 동작을 1회 해주세요!
                    </li>
                    <li>
                        <strong>두 번째:</strong> AI가 여러분의 수화를 분석해 정답을 알려줄 거예요!
                    </li>
                    <li>
                        <strong>세 번째:</strong> <em>웹캠만 보기</em> 버튼을 눌러 혼자 연습해보세요!
                    </li>
                </ul>
            </div>
        </div>
    );
}
