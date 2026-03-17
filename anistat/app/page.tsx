import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="bg-cover bg-[url('/red%20and%20black.png')] min-h-screen">
            
               
            <header className="bg-black1 shadow ">
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-white">Welcome to AniStat</h1>
                    <p className="text-white mt-2">Track and analyze anime statistics</p>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-7xl mx-auto border-red1 border-4 bg-black2/70  flex justify-center items-center flex-col rounded-lg shadow-lg p-8 mb-12">
                <div className="bg-red1 flex justify-center items-center  rounded-lg shadow-lg p-15 py-3 mb-12 -my-8 text-white text-4xl font-bold"> 
                    Anime
                </div>

                <div className="flex flex-wrap justify-center gap-6 w-full">
                    <Link href="/Anime/AllAnime" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/image1.png" alt="Play anime guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Play Anime Guessing Game</div>
                    </Link>

                    <Link href="/Anime/MovieAnime" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/image2.png" alt="Play movie anime guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Play Movie Anime Guessing Game</div>
                    </Link>

                    <Link href="/Anime/TVAnime" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/image3.png" alt="Play TV anime guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Play TV Anime Guessing Game</div>
                    </Link>

                </div>

                    <h1 className="font-bold text-2xl text-white mt-8">
                        Guess the rating of animes
                    </h1>
            </div>


             <div className="max-w-7xl mx-auto border-red1 border-4 bg-black2/70  flex justify-center items-center flex-col rounded-lg shadow-lg p-8 mb-12">
                <div className="bg-red1 flex justify-center items-center  rounded-lg shadow-lg p-15 py-3 mb-12 -my-8 text-white text-4xl font-bold"> 
                    Pokemon
                </div>


                <div className="flex flex-wrap justify-center gap-6 w-full">
                    <Link href="/Pokemon/JourneyTogether" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/pokemon1.png" alt="Play pokemon guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Journey Together</div>
                    </Link>

                    <Link href="/Pokemon/Pokemon151" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/151.png" alt="Play movie pokemon guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Scarlet & Violet 151</div>
                    </Link>

                    <Link href="/Pokemon/PrismaticEvolutions" className="w-62 rounded-xl border border-red1/60 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform">
                        <img className="w-full h-80 object-cover" src="/prismatic.png" alt="Play TV pokemon guessing game" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-white/90">Prismatic Evolutions</div>
                    </Link>
                </div>

                {/* Pokémon Card Battle lobby link */}
                <div className="flex justify-center mt-8">
                    <Link href="/PokemonGameFrontend" className="w-62 rounded-xl border border-yellow-400 bg-black1/85 shadow-lg overflow-hidden hover:scale-105 transition-transform flex flex-col items-center">
                        <img className="w-full h-80 object-cover" src="/cardbattle.png" alt="Pokémon Card Battle Lobby" />
                        <div className="px-3 py-2 text-center text-xl font-bold text-yellow-300">Pokémon Card Battle Lobby</div>
                    </Link>
                </div>

                    <h1 className="font-bold text-2xl text-white mt-8">
                        Guess the Highest price of pokemons
                    </h1>
            </div>
                
            </main>
        </div>
    );
}