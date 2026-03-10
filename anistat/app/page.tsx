"use client";
import { useState, useEffect, useRef } from "react";

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

export default function Page() {
    const [leftAnime, setLeftAnime] = useState<PopularAnimeItem | null>(null);
    const [rightAnime, setRightAnime] = useState<PopularAnimeItem | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(0.5);
    const spinTimeoutRef = useRef<number | null>(null);
    const [showRightMean, setShowRightMean] = useState(false);
    const [score, setScore] = useState(0);
    const [showModal, setShowModal] = useState(false);

    async function fetchAnime(): Promise<PopularAnimeItem | null> {
        try {
            // Fetch the popular anime list from API
            const response = await fetch(`http://localhost:3333/api/getAnimesByPopularity`);

            if (!response.ok) {
                console.log("Failed to fetch anime list, retrying...");
                return fetchAnime(); // Retry
            }

            const data = await response.json();

            if (!data.data || data.data.length === 0) {
                console.error("No anime data received");
                return null;
            }

            // Pick a random anime from the list
            const randomIndex = Math.floor(Math.random() * data.data.length);
            const selectedAnime = data.data[randomIndex];

            return selectedAnime;
        } catch (error) {
            console.error("Error fetching anime:", error);
            return null;
        }
    }

    async function handleGuess(clickedSide: "left" | "right") {
        if (!leftAnime || !rightAnime) return;

        // Show the right anime's mean
        setShowRightMean(true);

        await timeout(1500); // Wait a bit to let user see the result

        // Determine if the guess was correct
        let guessedCorrectly = false;

        if (rightAnime.node.mean && leftAnime.node.mean) {
            const rightIsHigher = rightAnime.node.mean > leftAnime.node.mean;

            // User guessed right if they clicked the side with higher score
            if (clickedSide === "right" && rightIsHigher) {
                guessedCorrectly = true;
            } else if (clickedSide === "left" && !rightIsHigher) {
                guessedCorrectly = true;
            }

            if (guessedCorrectly) {
                setScore(score + 1);
                // Move the winner to the left
                if (rightIsHigher) {
                    setLeftAnime(rightAnime);
                }
                // If left wins, it stays
            } else {
                // Show modal for wrong guess
                setShowModal(true);
            }
        }

        // Get new anime for right side
        const newRight = await fetchAnime();
        if (newRight) setRightAnime(newRight);

        // Reset the mean visibility
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
        const right = await fetchAnime();
        setRightAnime(right);
    }

    // Load both images on load
    useEffect(() => {
        loadInitialAnime();
    }, []);

    return (
        <main className="flex h-screen">
            {/* Left Side */}
            <div className="left-side flex-1 relative flex flex-col items-center justify-end p-8 ">
                {leftAnime && (
                    <>
                        <img src={leftAnime.node.main_picture.large} alt={leftAnime.node.alternative_titles?.en || leftAnime.node.title} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={leftAnime.node.main_picture.large} alt={leftAnime.node.alternative_titles?.en || leftAnime.node.title} className="relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-xl cursor-pointer select-none" draggable="false" onClick={() => handleGuess("left")} />
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
            <div className="right-side flex-1 relative flex flex-col items-center justify-end p-8 ">
                {rightAnime && (
                    <>
                        <img src={rightAnime.node.main_picture.large} alt={rightAnime.node.alternative_titles?.en || rightAnime.node.title} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={rightAnime.node.main_picture.large} alt={rightAnime.node.alternative_titles?.en || rightAnime.node.title} className="relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-xl cursor-pointer select-none" draggable="false" onClick={() => handleGuess("right")} />
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
