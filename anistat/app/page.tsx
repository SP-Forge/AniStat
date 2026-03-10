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
            
            console.log(selectedAnime);
            return selectedAnime;
        } catch (error) {
            console.error("Error fetching anime:", error);
            return null;
        }
    }

    async function handleGetLeftAnime() {
        const data = await fetchAnime();
        if (data) setLeftAnime(data);
    }

    async function handleGetRightAnime() {
        const data = await fetchAnime();
        if (data) setRightAnime(data);
    }

    function handleVsClick() {
        if (spinTimeoutRef.current) {
            clearTimeout(spinTimeoutRef.current);
        }

       
        setIsSpinning(true);
        
        setSpinSpeed(prev => Math.min(prev + 1, 100));
        
        spinTimeoutRef.current = setTimeout(() => {
            setIsSpinning(false);
            setSpinSpeed(1); 
        }, 1000); 
    }

    // Load both images on load
    useEffect(() => {
        async function loadInitialAnime() {
            const left = await fetchAnime();
            setLeftAnime(left);
            const right = await fetchAnime();
            setRightAnime(right);
        }
        loadInitialAnime();
    }, []);

    return (
        <main className="flex h-screen">
            <div className="left-side flex-1 relative flex flex-col items-center justify-end p-8 " onClick={handleGetLeftAnime}>
                {leftAnime && (
                    <>
                        <img 
                            src={leftAnime.node.main_picture.large} 
                            alt={leftAnime.node.alternative_titles?.en || leftAnime.node.title}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-75"
                        />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">

                        <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                            {leftAnime.node.alternative_titles?.en || leftAnime.node.title}
                            {leftAnime.node.mean ? ` - ${leftAnime.node.mean.toFixed(2)}` : ""}
                        </h2>
                        </div>
                    </>
                )}
               
                
            </div>
            <div className="right-side flex-1 relative flex flex-col items-center justify-end p-8 " onClick={handleGetRightAnime}>
                {rightAnime && (
                    <>
                        <img 
                            src={rightAnime.node.main_picture.large} 
                            alt={rightAnime.node.alternative_titles?.en || rightAnime.node.title}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-75 "
                        />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">

                        <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                            {rightAnime.node.alternative_titles?.en || rightAnime.node.title}
                        </h2>
                        </div>
                    </>
                )}
            </div>

             <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                
          <div 
            className={`rounded-full bg-white w-50 h-50 shadow-lg justify-center flex items-center font-bold text-8xl pointer-events-auto cursor-pointer select-none transition-transform ${isSpinning ? 'animate-spin' : ''}`}
            style={isSpinning ? { animationDuration: `${1 / spinSpeed}s` } : {}}
            onClick={handleVsClick}
          >
            VS
          </div>
        </div>

        </main>
    );
}

 