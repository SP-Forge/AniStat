"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimeData {
    id: number;
    title: string;
    main_picture: {
        large: string;
        medium: string;
    };
    alternative_titles?: {
        en: string;
    };
    mean?: number;
}

interface PopularAnimeItem {
    node: AnimeData;
    ranking: {
        rank: number;
    };
}

export default function GamePage() {
    const [leftAnime, setLeftAnime] = useState<PopularAnimeItem | null>(null);
    const [rightAnime, setRightAnime] = useState<PopularAnimeItem | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(0.5);
    const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showRightMean, setShowRightMean] = useState(false);
    const [score, setScore] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animatingAnime, setAnimatingAnime] = useState<PopularAnimeItem | null>(null);
    const [consecutiveWins, setConsecutiveWins] = useState(0);
    const [leftBorderColor, setLeftBorderColor] = useState("");
    const [rightBorderColor, setRightBorderColor] = useState("");

    async function fetchAnime(excludeIds: number[] = []): Promise<PopularAnimeItem | null> {
        try {
            // Fetch the popular anime list from local JSON file
            const response = await fetch("/movieAnimes.json");
            if (!response.ok) {
                console.log("Failed to fetch anime list, retrying...");
                return fetchAnime(excludeIds); // Retry
            }
            const data = await response.json();
            if (!data.data || data.data.length === 0) {
                console.error("No anime data received");
                return null;
            }
            // Filter out excluded anime IDs
            const availableAnime = data.data.filter((item: PopularAnimeItem) => !excludeIds.includes(item.node.id));
            // If no anime available after filtering, return any random one
            const animeList = availableAnime.length > 0 ? availableAnime : data.data;
            // Pick a random anime from the list
            const randomIndex = Math.floor(Math.random() * animeList.length);
            const selectedAnime = animeList[randomIndex];
            return selectedAnime;
        } catch (error) {
            console.error("Error fetching anime:", error);
            return null;
        }
    }

    async function handleGuess(clickedSide: "left" | "right") {
        if (!leftAnime || !rightAnime || isAnimating) return;

        // Show the right anime's mean
        setShowRightMean(true);

        await timeout(1000); // Wait to let user see the scores

        // Determine if the guess was correct
        let guessedCorrectly = false;

        if (rightAnime.node.mean && leftAnime.node.mean) {
            const rightIsHigher = rightAnime.node.mean >= leftAnime.node.mean;

            // User guessed right if they clicked the side with higher score
            if (clickedSide === "right" && rightIsHigher) {
                guessedCorrectly = true;
            } else if (clickedSide === "left" && !rightIsHigher) {
                guessedCorrectly = true;
            }

            if (guessedCorrectly) {
                // Show green border on correct choice
                if (clickedSide === "left") {
                    setLeftBorderColor("border-4 border-green-500");
                } else {
                    setRightBorderColor("border-4 border-green-500");
                }

                await timeout(800); // Show feedback
                setScore(score + 1);

                if (rightIsHigher) {
                    // Right anime won - animate it sliding to the left
                    await animationFromRightAnimeToLeftAnime(rightAnime);
                    setLeftAnime(rightAnime);
                    setConsecutiveWins(0); // Reset counter when right anime wins
                } else {
                    // Left anime won - it stays on the left
                    const newWins = consecutiveWins + 1;
                    setConsecutiveWins(newWins);

                    // If left anime won 2 times in a row, replace it with a new anime
                    if (newWins >= 2) {
                        // First, fetch the new anime completely
                        const excludeIds = [leftAnime.node.id, rightAnime.node.id];
                        const newLeft = await fetchAnime(excludeIds);

                        if (newLeft) {
                            // Once loaded, place it on the right side
                            setRightAnime(newLeft);
                            await timeout(200); // Wait for state to update and render

                            // Now animate the new anime sliding from right to left
                            await animationFromRightAnimeToLeftAnime(newLeft);
                            setLeftAnime(newLeft);
                        }
                        setConsecutiveWins(0);
                    }
                }
            } else {
                // Show red border on incorrect choice
                if (clickedSide === "left") {
                    setLeftBorderColor("border-4 border-red-500");
                } else {
                    setRightBorderColor("border-4 border-red-500");
                }

                await timeout(800); // Show feedback

                // Show modal for wrong guess
                setShowModal(true);
                setConsecutiveWins(0); // Reset on loss
            }
        }

        // Get new anime for right side (exclude the winner that's now on left)
        const excludeIds = leftAnime ? [leftAnime.node.id] : [];
        const newRight = await fetchAnime(excludeIds);
        if (newRight) setRightAnime(newRight);

        // Reset borders and mean visibility
        setLeftBorderColor("");
        setRightBorderColor("");
        setShowRightMean(false);
    }

    function handleVsClick() {
        setIsSpinning(true);

        // Increase spin speed
        setSpinSpeed((prevSpeed: number) => prevSpeed + 0.5);

        // Clear any existing timeout
        if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
        }

        // Set timeout to stop spinning
        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            setSpinSpeed(1);
        }, 1000);
    }

    function timeout(delay: number) {
        return new Promise((res) => setTimeout(res, delay));
    }

    async function loadInitialAnime() {
        const left = await fetchAnime();
        setLeftAnime(left);
        // Ensure right anime is different from left
        const excludeIds = left ? [left.node.id] : [];
        const right = await fetchAnime(excludeIds);
        setRightAnime(right);
    }

    async function animationFromRightAnimeToLeftAnime(animeToAnimate: PopularAnimeItem) {
        if (!animeToAnimate) return;

        setIsAnimating(true);
        setAnimatingAnime(animeToAnimate);

        // Wait for animation to complete
        await timeout(800);

        setAnimatingAnime(null);
        setIsAnimating(false);
    }

    // Load both images on load
    useEffect(() => {
        loadInitialAnime();
    }, []);

    return (
        <main className="flex h-screen relative overflow-hidden">
            {/* Animating Anime Overlay */}
            <AnimatePresence>
                {animatingAnime && (
                    <motion.div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div className="absolute w-1/2 h-full flex flex-col items-center justify-end p-8" initial={{ right: 0 }} animate={{ right: "50%" }} transition={{ duration: 0.8, ease: "easeInOut" }}>
                            <img src={animatingAnime.node.main_picture.large} alt={animatingAnime.node.alternative_titles?.en || animatingAnime.node.title} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                            <img src={animatingAnime.node.main_picture.large} alt={animatingAnime.node.alternative_titles?.en || animatingAnime.node.title} className="relative inset-0 h-full object-cover object-center m-25 rounded-xl select-none" draggable="false" />
                            <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                                <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                    {animatingAnime.node.alternative_titles?.en || animatingAnime.node.title}
                                    {animatingAnime.node.mean ? ` - ${animatingAnime.node.mean.toFixed(2)}` : ""}
                                </h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Left Side */}
            <div className="left-side flex-1 relative flex flex-col items-center justify-end p-8 ">
                {leftAnime && (
                    <>
                        <img src={leftAnime.node.main_picture.large} alt={leftAnime.node.alternative_titles?.en || leftAnime.node.title} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={leftAnime.node.main_picture.large} alt={leftAnime.node.alternative_titles?.en || leftAnime.node.title} className={`relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-xl cursor-pointer select-none transition-all ${leftBorderColor}`} draggable="false" onClick={() => handleGuess("left")} />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                            <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                {leftAnime.node.alternative_titles?.en || leftAnime.node.title}
                                {leftAnime.node.mean ? ` - ${leftAnime.node.mean.toFixed(2)}` : ""}
                            </h2>
                        </div>
                    </>
                )}
            </div>

            {/* Right Side */}
            <div className="right-side flex-1 relative flex flex-col items-center justify-end p-8">
                {rightAnime && (
                    <>
                        <img src={rightAnime.node.main_picture.large} alt={rightAnime.node.alternative_titles?.en || rightAnime.node.title} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={rightAnime.node.main_picture.large} alt={rightAnime.node.alternative_titles?.en || rightAnime.node.title} className={`relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-xl cursor-pointer select-none transition-all ${rightBorderColor}`} draggable="false" onClick={() => handleGuess("right")} />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                            <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                {rightAnime.node.alternative_titles?.en || rightAnime.node.title}
                                {rightAnime.node.mean && showRightMean ? ` - ${rightAnime.node.mean.toFixed(2)}` : ""}
                            </h2>
                        </div>
                    </>
                )}
            </div>

            {/* VS Button */}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className={`rounded-full bg-white w-50 h-50 shadow-lg justify-center flex items-center font-bold text-8xl pointer-events-auto cursor-pointer select-none transition-transform text-black ${isSpinning ? "animate-spin" : ""}`} style={isSpinning ? { animationDuration: `${1 / spinSpeed}s` } : {}} onClick={handleVsClick}>
                    VS
                </div>
            </div>

            {/* Score Display */}
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-lg shadow-lg z-50">
                <p className="text-2xl font-bold text-black">Score: {score}</p>
            </div>

            {/* Wrong Guess Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md">
                        <h2 className="text-3xl font-bold mb-4 text-black">Wrong Guess!</h2>
                        <p className="text-xl mb-6 text-black">Your score: {score}</p>
                        <button
                            type="button"
                            className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800"
                            onClick={() => {
                                setShowModal(false);
                                setScore(0);
                                setConsecutiveWins(0);
                                setLeftBorderColor("");
                                setRightBorderColor("");
                                loadInitialAnime();
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
