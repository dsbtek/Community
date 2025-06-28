import React from 'react';

interface HomeHeroProps {
    onCreatePostClick?: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onCreatePostClick }) => (
    <div className="bg-gradient-to-r from-blue-100 to-blue-300 rounded-xl p-2 xs:p-4 sm:p-8 mb-8 flex flex-col md:flex-row items-center md:items-stretch justify-between shadow w-full max-w-full md:max-w-5xl mx-auto">
        <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Welcome to ConnectSphere!
            </h1>
            <p className="text-base sm:text-lg text-gray-700 mb-4 max-w-full sm:max-w-xl">
                Join groups, share your thoughts, and connect with like-minded
                people. Discover trending topics and make your voice heard!
            </p>
            <button
                type="button"
                onClick={onCreatePostClick}
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
                Create a Post
            </button>
        </div>
        <img
            src="/logo.webp"
            alt="Community"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg mt-6 md:mt-0 object-cover"
        />
    </div>
);

export default HomeHero;
