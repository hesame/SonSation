import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SpinningWheel({ words, isSpinning, setIsSpinning, onSelectWord }) {
    const [selectedIndex, setSelectedIndex] = useState(null); // 내부 계산용
    const [visibleIndex, setVisibleIndex] = useState(null); // 사용자에게 보여줄 border용
    const containerRef = useRef(null);

    const slotHeight = 60;
    const visibleCount = 5;
    const centerIndex = Math.floor(visibleCount / 2);
    const repeatedWords = [...Array(30)].flatMap(() => words);

    useEffect(() => {
        if (isSpinning) {
            const randomIdx = Math.floor(Math.random() * words.length);
            setSelectedIndex(randomIdx);
            setVisibleIndex(null); // 회전 중에는 border 숨김

            const scrollRounds = 2;
            const totalDistance = scrollRounds * words.length * slotHeight + (randomIdx - centerIndex) * slotHeight;

            // 초기화
            containerRef.current.style.transition = 'none';
            containerRef.current.style.transform = `translateY(0px)`;
            void containerRef.current.offsetWidth;

            // 애니메이션 적용
            containerRef.current.style.transition = 'transform 3s ease-out';
            containerRef.current.style.transform = `translateY(-${totalDistance}px)`;

            // 끝나고 visibleIndex 설정
            setTimeout(() => {
                setIsSpinning(false);
                setVisibleIndex(randomIdx); // 이때만 border 보이게
                onSelectWord(words[randomIdx]);
            }, 3100);
        }
    }, [isSpinning, words, setIsSpinning, onSelectWord]);

    return (
        <div
            className="position-relative w-100 bg-light rounded border p-3"
            style={{ height: `${slotHeight * visibleCount}px`, overflow: 'hidden' }}
        >
            <div ref={containerRef}>
                {repeatedWords.map((word, idx) => {
                    const showBorder = visibleIndex !== null && idx % words.length === visibleIndex;
                    return (
                        <div
                            key={idx}
                            className={`d-flex justify-content-center align-items-center fw-semibold ${
                                showBorder ? 'text-success fs-4 fw-bold border border-success rounded' : 'text-dark'
                            }`}
                            style={{
                                height: `${slotHeight}px`,
                                boxSizing: 'border-box',
                            }}
                        >
                            {word}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
