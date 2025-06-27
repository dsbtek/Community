import React from 'react';
import { Link } from 'react-router-dom';

const HomeSidebar: React.FC = () => {
    // Placeholder trending groups and users
    const trendingGroups = [
        { id: 1, name: 'React Developers' },
        { id: 2, name: 'Django Enthusiasts' },
        { id: 3, name: 'AI & ML' },
    ];
    const suggestedUsers = [
        { id: 1, name: 'Jane Doe' },
        { id: 2, name: 'John Smith' },
    ];
    return (
        <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow p-5 mb-6">
                <h4 className="font-bold text-lg mb-3 text-gray-800">
                    Trending Groups
                </h4>
                <ul className="space-y-2">
                    {trendingGroups.map((group) => (
                        <li key={group.id}>
                            <Link
                                to={`/groups/${group.id}`}
                                className="text-blue-600 hover:underline"
                            >
                                #{group.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
                <h4 className="font-bold text-lg mb-3 text-gray-800">
                    Suggested Users
                </h4>
                <ul className="space-y-2">
                    {suggestedUsers.map((user) => (
                        <li key={user.id} className="text-gray-700">
                            {user.name}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default HomeSidebar;
