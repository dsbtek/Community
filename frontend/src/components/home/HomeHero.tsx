import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface HomeHeroProps {
    onCreatePostClick?: () => void;
}

const HomeHero: React.FC<HomeHeroProps> = ({ onCreatePostClick }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div className="bg-gradient-to-r from-blue-100 to-blue-300 rounded-xl p-4 sm:p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow w-full max-w-full md:max-w-5xl mx-auto">
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 md:mb-2">
                    Welcome to ConnectSphere!
                </h1>
                <p className="text-base md:text-lg text-gray-700 mb-2 md:mb-4 max-w-full md:max-w-xl">
                    Join groups, share your thoughts, and connect with
                    like-minded people. Discover trending topics and make your
                    voice heard!
                </p>
                <div className="flex flex-col xs:flex-row items-center gap-3 mt-2">
                    {isAuthenticated ? (
                        <button
                            type="button"
                            onClick={onCreatePostClick}
                            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Create a Post
                        </button>
                    ) : (
                        <Link
                            to="/auth"
                            className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Login to Create a Post
                        </Link>
                    )}
                </div>
            </div>
            <div className="mt-6 md:mt-0 md:ml-8 flex-shrink-0 flex justify-center items-center">
                <img
                    src="/logo.webp"
                    alt="Community"
                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover"
                />
            </div>
        </div>
    );
};

export default HomeHero;
