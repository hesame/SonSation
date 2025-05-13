import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import '../components/IntroScreen.css';
import '../App.css';

export default function IntroScreen({ onEnter }) {
    const part1 = 'Son';
    const part2 = 'sation';

    const [typedPart1, setTypedPart1] = useState('');
    const [typedPart2, setTypedPart2] = useState('');
    const [showQuote, setShowQuote] = useState(false);
    const [showClick, setShowClick] = useState(false);
    const [startTyping, setStartTyping] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    const indexRef1 = useRef(0);
    const indexRef2 = useRef(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setStartTyping(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!startTyping) return;

        const typingPart1 = setInterval(() => {
            const i = indexRef1.current;
            if (i < part1.length) {
                setTypedPart1((prev) => prev + part1[i]);
                indexRef1.current += 1;
            } else {
                clearInterval(typingPart1);
                setShowQuote(true);

                setTimeout(() => {
                    const typingPart2 = setInterval(() => {
                        const j = indexRef2.current;
                        if (j < part2.length) {
                            setTypedPart2((prev) => prev + part2[j]);
                            indexRef2.current += 1;
                        } else {
                            clearInterval(typingPart2);
                            setShowClick(true);

                            setTimeout(() => {
                                setFadeOut(true);
                                setTimeout(() => {
                                    onEnter();
                                }, 1200);
                            }, 1000);
                        }
                    }, 150);
                }, 400);
            }
        }, 150);

        return () => clearInterval(typingPart1);
    }, [startTyping]);

    return (
        <motion.div
            className="intro-wrapper"
            initial={{ opacity: 1, y: 0 }}
            animate={fadeOut ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
        >
            {/* ✋ 손 흔들기 애니메이션 */}
            {/**
      <motion.img
        src="/assets/hand.svg"
        alt="Hand waving"
        className="hand"
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: 2, duration: 0.6 }}
      />
      */}

            <div className="centered-container">
                <h1 className="typing-text">
                    <div className="text-block">
                        <span className="text-main">{typedPart1}</span>
                        {showQuote && (
                            <motion.span
                                className="quote-mark"
                                initial={{ y: -40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                                style={{ color: '#66cc66' }}
                            >
                                '
                            </motion.span>
                        )}
                        <span className="text-main">{typedPart2}</span>
                    </div>
                </h1>
            </div>
        </motion.div>
    );
}
