"use client";
import { useState, useEffect, useRef } from "react";

interface AnimeData {
    id: number;
    title: string;
    main_picture: {
        large: string;
        medium: string;
    };
}

export default function Page() {
    const [leftAnime, setLeftAnime] = useState<AnimeData | null>(null);
    const [rightAnime, setRightAnime] = useState<AnimeData | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinSpeed, setSpinSpeed] = useState(0.5);
    const spinTimeoutRef = useRef<number | null>(null);

    async function fetchAnime(excludeId?: number): Promise<AnimeData | null> {
        try {
            let randomId = Math.floor(Math.random() * 10000) + 1;
            
            // Make sure we don't get the same ID as the excluded one
            if (excludeId && randomId === excludeId) {
                randomId = (randomId % 100) + 1;
            }
            
            const response = await fetch(`http://localhost:3333/api/getAnimeById/${randomId}`);
            
            // If the response is not OK (404, 500, etc.), retry with a new ID
            if (!response.ok) {
                console.log(`Anime ID ${randomId} not found, retrying...`);
                return fetchAnime(excludeId); // Retry with a new random ID
            }
            
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error("Error fetching anime:", error);
            // Retry on error
            console.log("Retrying...");
            return fetchAnime(excludeId);
        }
    }

    async function handleGetLeftAnime() {
        const data = await fetchAnime(rightAnime?.id);
        if (data) setLeftAnime(data);
    }

    async function handleGetRightAnime() {
        const data = await fetchAnime(leftAnime?.id);
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

    // Load both images on mount
    useEffect(() => {
        async function loadInitialAnime() {
            const left = await fetchAnime();
            setLeftAnime(left);
            const right = await fetchAnime(left?.id);
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
                            src={leftAnime.main_picture.large} 
                            alt={leftAnime.title}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-75"
                        />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">

                        <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                            {leftAnime.title}
                        </h2>
                        </div>
                    </>
                )}
               
                
            </div>
            <div className="right-side flex-1 relative flex flex-col items-center justify-end p-8 " onClick={handleGetRightAnime}>
                {rightAnime && (
                    <>
                        <img 
                            src={rightAnime.main_picture.medium} 
                            alt={rightAnime.title}
                            className="absolute inset-0 w-full h-full object-cover hover:opacity-75"
                        />
                        <div className="relative inline-block skew-x-[-15deg] bg-linear-to-r from-black2 to-black1 px-8 py-4 rounded-md">

                        <h2 className="relative z-10 text-4xl font-bold mb-4 text-white drop-shadow-lg inline-block skew-x-15deg">
                            {rightAnime.title}
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

 