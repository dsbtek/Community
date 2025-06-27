import React from 'react';

const HomeHero: React.FC = () => (
    <div className="bg-gradient-to-r from-blue-100 to-blue-300 rounded-xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow">
        <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Welcome to ConnectSphere!
            </h1>
            <p className="text-lg text-gray-700 mb-4 max-w-xl">
                Join groups, share your thoughts, and connect with like-minded
                people. Discover trending topics and make your voice heard!
            </p>
            <a
                href="#create-post"
                className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
                Create a Post
            </a>
        </div>
        <img
            src="/default-avatar.png"
            alt="Community"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg mt-6 md:mt-0"
        />
    </div>
);

export default HomeHero;
