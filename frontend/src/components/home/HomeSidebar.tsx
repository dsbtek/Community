import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Group, GroupsResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const HomeSidebar: React.FC = () => {
    const { isAuthenticated, tokens } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [joining, setJoining] = useState<{ [key: number]: boolean }>({});
    const [joinError, setJoinError] = useState<string | null>(null);
    const [suggestedUsers, setSuggestedUsers] = useState<
        { id: number; name: string }[]
    >([]);
    const [usersLoading, setUsersLoading] = useState<boolean>(true);
    const [usersError, setUsersError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    // Pagination state
    const [page, setPage] = useState<number>(1);
    const [pageSize] = useState<number>(5);
    const [totalGroups, setTotalGroups] = useState<number>(0);

    useEffect(() => {
        fetchTrendingGroups();
        fetchSuggestedUsers();
        // eslint-disable-next-line
    }, [page, search]);

    const fetchTrendingGroups = async () => {
        setLoading(true);
        setJoinError(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (tokens?.access)
                headers['Authorization'] = `Bearer ${tokens.access}`;
            // Add pagination and search params
            const params = new URLSearchParams();
            params.append('limit', String(pageSize));
            params.append('offset', String((page - 1) * pageSize));
            if (search) params.append('search', search);
            const response = await fetch(`/api/groups/?${params.toString()}`, {
                headers,
            });
            if (!response.ok) throw new Error('Failed to fetch groups');
            const data: GroupsResponse & { count?: number } =
                await response.json();
            setGroups(data.groups || []);
            setTotalGroups(
                data.count ?? (data.groups ? data.groups.length : 0),
            );
        } catch (error) {
            setGroups([]);
            setTotalGroups(0);
            setJoinError('Failed to load groups.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestedUsers = async () => {
        setUsersLoading(true);
        setUsersError(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (tokens?.access)
                headers['Authorization'] = `Bearer ${tokens.access}`;
            // Adjust endpoint as per your backend
            const response = await fetch('/api/users/suggested/', { headers });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setSuggestedUsers(data.users || []);
        } catch (error) {
            setSuggestedUsers([]);
            setUsersError('Failed to load suggested users.');
        } finally {
            setUsersLoading(false);
        }
    };

    const handleJoin = async (groupId: number) => {
        if (!isAuthenticated || joining[groupId]) return;
        setJoining((prev) => ({ ...prev, [groupId]: true }));
        setJoinError(null);
        if (!isAuthenticated || !tokens || !tokens.access) {
            setJoining((prev) => ({ ...prev, [groupId]: false }));
            setJoinError('You must be logged in to join a group.');
            return;
        }
        try {
            const response = await fetch(`/api/groups/${groupId}/join/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${tokens.access}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                setGroups((prev) =>
                    prev.map((g) =>
                        g.id === groupId ? { ...g, is_member: true } : g,
                    ),
                );
            } else {
                const data = await response.json().catch(() => ({}));
                setJoinError(data.detail || 'Failed to join group.');
            }
        } catch (e) {
            setJoinError('Network error. Please try again.');
        } finally {
            setJoining((prev) => ({ ...prev, [groupId]: false }));
        }
    };

    // No need to filter groups on frontend, handled by backend

    return (
        <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow p-5 mb-6">
                <h4 className="font-bold text-lg mb-3 text-gray-800">
                    Trending Groups
                </h4>
                <input
                    type="text"
                    placeholder="Search groups..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    className="mb-3 w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring"
                />
                {joinError && (
                    <div className="text-red-500 text-xs mb-2">{joinError}</div>
                )}
                {loading ? (
                    <ul className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between animate-pulse"
                            >
                                <div className="bg-gray-200 h-4 w-24 rounded" />
                                <div className="bg-gray-200 h-6 w-6 rounded-full" />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <>
                        <ul className="space-y-2">
                            {groups.map((group) => (
                                <li
                                    key={group.id}
                                    className="flex items-center justify-between group"
                                >
                                    <Link
                                        to={`/groups/${group.id}`}
                                        className="text-blue-600 hover:underline truncate max-w-[120px]"
                                    >
                                        #{group.name}
                                    </Link>
                                    {group.is_member ? (
                                        <span className="ml-2 text-green-600 text-xs font-semibold">
                                            Member
                                        </span>
                                    ) : (
                                        <button
                                            title="Join group"
                                            onClick={() => handleJoin(group.id)}
                                            disabled={joining[group.id]}
                                            className="ml-2 p-1 rounded-full hover:bg-blue-100 transition"
                                        >
                                            {joining[group.id] ? (
                                                <svg
                                                    className="animate-spin h-5 w-5 text-blue-600"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                        fill="none"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="20"
                                                    height="20"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    className="text-blue-600"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 4v16m8-8H4"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    )}
                                </li>
                            ))}
                            {groups.length === 0 && (
                                <li className="text-gray-400 text-sm">
                                    No trending groups.
                                </li>
                            )}
                        </ul>
                        {/* Pagination controls */}
                        {totalGroups > pageSize && (
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span className="text-xs text-gray-500">
                                    Page {page} of{' '}
                                    {Math.ceil(totalGroups / pageSize)}
                                </span>
                                <button
                                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={
                                        page >=
                                        Math.ceil(totalGroups / pageSize)
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {/* <div className="bg-white rounded-xl shadow p-5">
                <h4 className="font-bold text-lg mb-3 text-gray-800">
                    Suggested Users
                </h4>
                {usersError && (
                    <div className="text-red-500 text-xs mb-2">
                        {usersError}
                    </div>
                )}
                {usersLoading ? (
                    <ul className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                            <li
                                key={i}
                                className="bg-gray-200 h-4 w-32 rounded animate-pulse"
                            />
                        ))}
                    </ul>
                ) : (
                    <ul className="space-y-2">
                        {suggestedUsers.map((user) => (
                            <li key={user.id} className="text-gray-700">
                                {user.name}
                            </li>
                        ))}
                        {suggestedUsers.length === 0 && (
                            <li className="text-gray-400 text-sm">
                                No suggestions.
                            </li>
                        )}
                    </ul>
                )}
            </div> */}
        </aside>
    );
};

export default HomeSidebar;
