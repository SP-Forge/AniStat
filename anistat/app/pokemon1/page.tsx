"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface PokemonData {
    id: number;
    image: string;
    name: string;
    variant: string;
    prices?: {
        ebay?: {
            NEAR_MINT?: {
                avg?: number;
            };
        };
    };
}

interface PokemonResponse {
    data: PokemonData[];
}

const POKEMON_JOURNEY_TOGETHER_FILE = "/pokemonJourneyTogether.json";
const POKEMON_JOURNEY_TOGETHER_ENDPOINT = "/api/getPokemonJourneyTogether";

function getPrice(card: PokemonData): number {
    return card.prices?.ebay?.NEAR_MINT?.avg ?? 0;
}

function formatVariantName(variant: string): string {
    return variant.replaceAll("_", " ");
}

export default function PokemonGame() {
    const [leftPokemon, setLeftPokemon] = useState<PokemonData | null>(null);
    const [rightPokemon, setRightPokemon] = useState<PokemonData | null>(null);
    const [animatingPokemon, setAnimatingPokemon] = useState<PokemonData | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(0.5);
    const [showRightPrice, setShowRightPrice] = useState(false);
    const [score, setScore] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [consecutiveWins, setConsecutiveWins] = useState(0);
    const [leftBorderColor, setLeftBorderColor] = useState("");
    const [rightBorderColor, setRightBorderColor] = useState("");
    const spinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pokemonPoolRef = useRef<PokemonData[]>([]);

    function timeout(delay: number) {
        return new Promise((res) => setTimeout(res, delay));
    }

    async function ensurePokemonPool(): Promise<PokemonData[]> {
        if (pokemonPoolRef.current.length > 0) {
            return pokemonPoolRef.current;
        }

        try {
            const fileResponse = await fetch(POKEMON_JOURNEY_TOGETHER_FILE);
            if (fileResponse.ok) {
                const payload = (await fileResponse.json()) as PokemonResponse;
                if (payload.data && payload.data.length > 0) {
                    pokemonPoolRef.current = payload.data;
                    return pokemonPoolRef.current;
                }
            }
        } catch {
            // Fall through to API fallback.
        }

        const apiResponse = await fetch(POKEMON_JOURNEY_TOGETHER_ENDPOINT);
        if (!apiResponse.ok) {
            return [];
        }

        const apiPayload = (await apiResponse.json()) as PokemonResponse;
        pokemonPoolRef.current = apiPayload.data ?? [];
        return pokemonPoolRef.current;
    }

    async function fetchPokemon(excludeIds: number[] = []): Promise<PokemonData | null> {
        try {
            const pool = await ensurePokemonPool();
            if (pool.length === 0) {
                return null;
            }

            const available = pool.filter((item) => !excludeIds.includes(item.id));
            const list = available.length > 0 ? available : pool;
            const randomIndex = Math.floor(Math.random() * list.length);
            return list[randomIndex];
        } catch {
            return null;
        }
    }

    async function animationFromRightPokemonToLeftPokemon(pokemonToAnimate: PokemonData) {
        setIsAnimating(true);
        setAnimatingPokemon(pokemonToAnimate);
        await timeout(800);
        setAnimatingPokemon(null);
        setIsAnimating(false);
    }

    async function loadInitialPokemon() {
        const left = await fetchPokemon();
        setLeftPokemon(left);
        const excludeIds = left ? [left.id] : [];
        const right = await fetchPokemon(excludeIds);
        setRightPokemon(right);
    }

    async function handleGuess(clickedSide: "left" | "right") {
        if (!leftPokemon || !rightPokemon || isAnimating) {
            return;
        }

        setShowRightPrice(true);
        await timeout(1000);

        const leftPrice = getPrice(leftPokemon);
        const rightPrice = getPrice(rightPokemon);
        const rightIsHigher = rightPrice >= leftPrice;
        const guessedCorrectly = (clickedSide === "right" && rightIsHigher) || (clickedSide === "left" && !rightIsHigher);

        if (guessedCorrectly) {
            if (clickedSide === "left") {
                setLeftBorderColor("border-4 border-green-500");
            } else {
                setRightBorderColor("border-4 border-green-500");
            }

            await timeout(800);
            setScore((prev) => prev + 1);

            if (rightIsHigher) {
                await animationFromRightPokemonToLeftPokemon(rightPokemon);
                setLeftPokemon(rightPokemon);
                setConsecutiveWins(0);
            } else {
                const newWins = consecutiveWins + 1;
                setConsecutiveWins(newWins);

                if (newWins >= 2) {
                    const excludeIds = [leftPokemon.id, rightPokemon.id];
                    const newLeft = await fetchPokemon(excludeIds);

                    if (newLeft) {
                        setRightPokemon(newLeft);
                        await timeout(200);
                        await animationFromRightPokemonToLeftPokemon(newLeft);
                        setLeftPokemon(newLeft);
                    }
                    setConsecutiveWins(0);
                }
            }
        } else {
            if (clickedSide === "left") {
                setLeftBorderColor("border-4 border-red-500");
            } else {
                setRightBorderColor("border-4 border-red-500");
            }

            await timeout(800);
            setShowModal(true);
            setConsecutiveWins(0);
        }

        const excludeIds = leftPokemon ? [leftPokemon.id] : [];
        const newRight = await fetchPokemon(excludeIds);
        if (newRight) {
            setRightPokemon(newRight);
        }

        setLeftBorderColor("");
        setRightBorderColor("");
        setShowRightPrice(false);
    }

    function handleVsClick() {
        setIsSpinning(true);
        setSpinSpeed((prevSpeed) => prevSpeed + 0.5);

        if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
        }

        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            setSpinSpeed(1);
        }, 1000);
    }

    useEffect(() => {
        loadInitialPokemon();
    }, []);

    return (
        <main className="flex h-screen relative overflow-hidden">
            <AnimatePresence>
                {animatingPokemon && (
                    <motion.div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <motion.div className="absolute w-1/2 h-full flex flex-col items-center justify-end p-8" initial={{ right: 0 }} animate={{ right: "50%" }} transition={{ duration: 0.8, ease: "easeInOut" }}>
                            <img src={animatingPokemon.image} alt={animatingPokemon.name} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                            <img src={animatingPokemon.image} alt={animatingPokemon.name} className="relative inset-0 h-full object-cover object-center m-25 rounded-3xl select-none" draggable="false" />
                            <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                                <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                    {animatingPokemon.name} ({formatVariantName(animatingPokemon.variant)}) - ${getPrice(animatingPokemon).toFixed(2)}
                                </h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="left-side flex-1 relative flex flex-col items-center justify-end p-8 ">
                {leftPokemon && (
                    <>
                        <img src={leftPokemon.image} alt={leftPokemon.name} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={leftPokemon.image} alt={leftPokemon.name} className={`relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-3xl cursor-pointer select-none transition-all ${leftBorderColor}`} draggable="false" onClick={() => handleGuess("left")} />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                            <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                {leftPokemon.name} ({formatVariantName(leftPokemon.variant)}) - ${getPrice(leftPokemon).toFixed(2)}
                            </h2>
                        </div>
                    </>
                )}
            </div>

            <div className="right-side flex-1 relative flex flex-col items-center justify-end p-8">
                {rightPokemon && (
                    <>
                        <img src={rightPokemon.image} alt={rightPokemon.name} className="absolute inset-0 w-full h-full blur-lg select-none" draggable="false" />
                        <img src={rightPokemon.image} alt={rightPokemon.name} className={`relative inset-0 h-full object-cover object-center hover:brightness-75 m-25 rounded-3xl cursor-pointer select-none transition-all ${rightBorderColor}`} draggable="false" onClick={() => handleGuess("right")} />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">
                            <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                                {rightPokemon.name} ({formatVariantName(rightPokemon.variant)}){showRightPrice ? ` - $${getPrice(rightPokemon).toFixed(2)}` : ""}
                            </h2>
                        </div>
                    </>
                )}
            </div>

            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className={`rounded-full bg-white w-50 h-50 shadow-lg justify-center flex items-center font-bold text-8xl pointer-events-auto cursor-pointer select-none transition-transform text-black ${isSpinning ? "animate-spin" : ""}`} style={isSpinning ? { animationDuration: `${1 / spinSpeed}s` } : {}} onClick={handleVsClick}>
                    VS
                </div>
            </div>

            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white px-8 py-4 rounded-lg shadow-lg z-50">
                <p className="text-2xl font-bold text-black">Score: {score}</p>
            </div>

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
                                loadInitialPokemon();
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
