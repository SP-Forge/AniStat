import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to AniStat</h1>
                    <p className="text-gray-600 mt-2">Track and analyze anime statistics</p>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Play Game Button */}
                <div className="flex justify-center mb-12">
                    <Link href="/game" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors">
                        🎮 Play the Anime Guessing Game
                    </Link>
                </div>
                <div className="flex justify-center mb-12">
                    <Link href="/game2" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors">
                        🎮 Play the Movie Anime Guessing Game
                    </Link>
                </div>

                <div className="flex justify-center mb-12">
                    <Link href="/game3" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors">
                        🎮 Play the TV Anime Guessing Game
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Anime Comparison</h2>
                        <p className="text-gray-600">Compare popular anime and guess which one has a higher rating!</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Your Knowledge</h2>
                        <p className="text-gray-600">See how well you know anime ratings and build your high score.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Fun & Interactive</h2>
                        <p className="text-gray-600">Enjoy smooth animations and an engaging gaming experience.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}