import axiosInstance from './utils/axiosInstance';
import { getMediaUrl } from './utils/getMediaUrl';
import React, { useState, useEffect, useRef } from 'react';
import { getApiUrl } from './utils/getApiUrl';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
} from 'react-router-dom';
import { Group, Post, GroupsResponse, PostsResponse } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import CreateGroupForm from './components/groups/CreateGroupForm';
import CreatePostForm from './components/posts/CreatePostForm';
import PostCard from './components/posts/PostCard';
import GroupDetail from './components/groups/GroupDetail';
import { ProfilePage } from './components/profile';
import HomeSidebar from './components/home/HomeSidebar';
import HomeHero from './components/home/HomeHero';
import { useInfiniteScroll } from './utils/useInfiniteScroll';
const BACKEND_URL = getApiUrl('');

function App(): JSX.Element {
    const [search, setSearch] = useState('');
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col bg-gray-100">
                    <AppHeader search={search} setSearch={setSearch} />
                    <main className="container mx-auto py-8 flex-1">
                        <Routes>
                            <Route
                                path="/"
                                element={<Home search={search} />}
                            />
                            <Route path="/groups" element={<Groups />} />
                            <Route
                                path="/groups/:id"
                                element={<GroupDetail />}
                            />
                            <Route path="/posts" element={<Posts />} />
                            <Route path="/auth" element={<AuthPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Routes>
                    </main>
                    <footer className="bg-gray-800 text-white p-4 mt-12">
                        <div className="container mx-auto text-center">
                            <p>
                                &copy; 2023 Community App. Built with React &
                                Django.
                            </p>
                            <div className="mt-2 space-x-4">
                                <a
                                    href={`${BACKEND_URL}/swagger/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Swagger UI
                                </a>
                                <a
                                    href={`${BACKEND_URL}/redoc/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    ReDoc
                                </a>
                            </div>
                        </div>
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

function AppHeader({
    search,
    setSearch,
}: {
    search: string;
    setSearch: (v: string) => void;
}): JSX.Element {
    const { user, logout, isAuthenticated } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    // Close menu on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                avatarRef.current &&
                !avatarRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        }
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const avatarUrl =
        isAuthenticated && (user?.avatar_url || user?.avatar)
            ? getMediaUrl((user?.avatar_url || user?.avatar) ?? '')
            : '/default-avatar.webp';
    // Determine if avatar is active (menu open)
    const avatarActive = menuOpen;
    // Get current path for active nav item (use location from react-router)
    const [pathname, setPathname] = useState(window.location.pathname);
    useEffect(() => {
        const updatePath = () => setPathname(window.location.pathname);
        window.addEventListener('popstate', updatePath);
        return () => window.removeEventListener('popstate', updatePath);
    }, []);
    // Also update on push/replace navigation
    useEffect(() => {
        const origPush = window.history.pushState;
        const origReplace = window.history.replaceState;
        function wrap(fn: typeof window.history.pushState) {
            return function (
                data: any,
                unused: string,
                url?: string | URL | null,
            ) {
                fn.call(window.history, data, unused, url);
                setPathname(window.location.pathname);
            };
        }
        window.history.pushState = wrap(origPush);
        window.history.replaceState = wrap(origReplace);
        return () => {
            window.history.pushState = origPush;
            window.history.replaceState = origReplace;
        };
    }, []);
    const navLinks = [
        { to: '/', label: 'Home', match: (p: string) => p === '/' },
        {
            to: '/groups',
            label: 'Groups',
            match: (p: string) => p === '/groups' || /^\/groups\//.test(p),
        },
        {
            to: '/posts',
            label: 'Posts',
            match: (p: string) => p === '/posts' || /^\/posts\//.test(p),
        },
    ];
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3 bg-white">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 text-[#0d141c]">
                    <div className="size-4">
                        <svg
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z"
                                fill="currentColor"
                            ></path>
                        </svg>
                    </div>
                    <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
                        Community
                    </h2>
                </div>
                <div className="flex items-center gap-9">
                    {navLinks.map((nav) => {
                        const isActive = nav.match(pathname);
                        return (
                            <Link
                                key={nav.to}
                                className={`text-[#0d141c] text-sm font-medium leading-normal hover:text-blue-600 hover:bg-blue-50 rounded transition px-2 py-1 ${
                                    isActive
                                        ? 'bg-blue-100 text-blue-700 font-bold shadow-sm'
                                        : ''
                                }`}
                                to={nav.to}
                            >
                                {nav.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="flex flex-1 justify-end gap-8 items-center">
                <label className="flex flex-col min-w-40 !h-10 max-w-64">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div
                            className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0"
                            data-icon="MagnifyingGlass"
                            data-size="24px"
                            data-weight="regular"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24px"
                                height="24px"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                            >
                                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                            </svg>
                        </div>
                        <input
                            placeholder="Search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                        />
                    </div>
                </label>
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                    <div
                        className="text-[#0d141c]"
                        data-icon="Bell"
                        data-size="20px"
                        data-weight="regular"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20px"
                            height="20px"
                            fill="currentColor"
                            viewBox="0 0 256 256"
                        >
                            <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
                        </svg>
                    </div>
                </button>
                <div className="relative" ref={avatarRef}>
                    <div
                        className={[
                            'bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer border-2 transition',
                            avatarActive
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-blue-200 hover:border-blue-400',
                        ].join(' ')}
                        style={{ backgroundImage: `url('${avatarUrl}')` }}
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label="User menu"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ')
                                setMenuOpen((open) => !open);
                        }}
                    ></div>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            logout();
                                        }}
                                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-800"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/auth"
                                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

function Home({ search }: { search: string }): JSX.Element {
    const { isAuthenticated, tokens } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, true);
        // eslint-disable-next-line
    }, [search]);

    const fetchPosts = async (pageNum = 1, reset = false): Promise<void> => {
        setLoading(true);
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (tokens?.access) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }
            const params = new URLSearchParams();
            params.append('page', String(pageNum));
            if (search) params.append('search', search);
            const { data } = await axiosInstance.get(
                `/api/posts/?${params.toString()}`,
                { headers },
            );
            if (reset) {
                setPosts(data.posts || []);
            } else {
                setPosts((prev) => [...prev, ...(data.posts || [])]);
            }
            setHasMore((data.posts?.length || 0) === 10); // assuming backend page size is 10
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage((prev) => {
                const next = prev + 1;
                fetchPosts(next);
                return next;
            });
        }
    };

    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    const handleLikePost = async (postId: number): Promise<void> => {
        if (!isAuthenticated || !tokens?.access) return;
        try {
            await axiosInstance.post(
                `/api/posts/${postId}/like/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            setPosts((prev) =>
                prev.map((p) =>
                    p.id === postId
                        ? {
                              ...p,
                              is_liked: !p.is_liked,
                              likes_count: p.is_liked
                                  ? p.likes_count - 1
                                  : p.likes_count + 1,
                          }
                        : p,
                ),
            );
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleCreatePostClick = () => {
        setShowCreateForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePostCreated = (newPost: Post): void => {
        setPosts((prev) => [newPost, ...prev]);
        setShowCreateForm(false);
    };

    return (
        <div
            className="relative min-h-screen flex flex-col bg-transparent group/design-root overflow-x-hidden"
            style={{ fontFamily: "Inter, 'Noto Sans', sans-serif" }}
        >
            <div className="flex h-full grow flex-col">
                <div className="px-4 md:px-10 flex flex-1 justify-center py-5 gap-8">
                    <HomeSidebar />
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <HomeHero onCreatePostClick={handleCreatePostClick} />
                        {showCreateForm && isAuthenticated && (
                            <div className="mb-8" id="create-post">
                                <CreatePostForm
                                    onSuccess={handlePostCreated}
                                    onCancel={() => setShowCreateForm(false)}
                                />
                            </div>
                        )}
                        <div className="flex flex-wrap justify-between gap-3 p-4 mb-2">
                            <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
                                All Posts
                            </p>
                        </div>
                        <div className="space-y-6 mt-2">
                            {posts.length === 0 && !loading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg">
                                        No posts found. Be the first to share
                                        something!
                                    </p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        isAuthenticated={isAuthenticated}
                                        onLike={handleLikePost}
                                    />
                                ))
                            )}
                            <div ref={sentinelRef} />
                            {loading && (
                                <div className="text-center py-6">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">
                                        Loading more posts...
                                    </p>
                                </div>
                            )}
                            {!hasMore && posts.length > 0 && (
                                <div className="text-center py-6 text-gray-400">
                                    No more posts to load.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Groups(): JSX.Element {
    const { isAuthenticated, tokens } = useAuth();
    const [groupList, setGroupList] = useState<Group[]>([]);
    const [groupsLoading, setGroupsLoading] = useState<boolean>(true);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async (): Promise<void> => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (tokens?.access) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }
            const url = isAuthenticated
                ? '/api/groups/?mine=1'
                : '/api/groups/';
            const { data } = await axiosInstance.get(url, { headers });
            setGroupList(data.groups || []);
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setGroupsLoading(false);
        }
    };

    const handleGroupCreated = (newGroup: Group): void => {
        setGroupList((prev) => [newGroup, ...prev]);
        setShowCreateForm(false);
    };

    const handleJoinGroup = async (groupId: number): Promise<void> => {
        if (!isAuthenticated || !tokens || !tokens.access) return;

        try {
            await axiosInstance.post(
                `/api/groups/${groupId}/join/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            fetchGroups();
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    if (groupsLoading) {
        return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading groups...</p>
            </div>
        );
    }
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Groups</h2>
                {isAuthenticated ? (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {showCreateForm ? 'Cancel' : 'Create Group'}
                    </button>
                ) : (
                    <Link
                        to="/auth"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Login to Create Group
                    </Link>
                )}
            </div>
            {showCreateForm && isAuthenticated && (
                <div className="mb-8">
                    <CreateGroupForm
                        onSuccess={handleGroupCreated}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupList.map((group) => (
                    <div
                        key={group.id}
                        className="bg-white rounded-lg shadow-md p-6"
                    >
                        <h3 className="text-xl font-semibold mb-2">
                            <Link
                                to={`/groups/${group.id}`}
                                className="hover:underline text-blue-600"
                            >
                                {group.name}
                            </Link>
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {group.description}
                        </p>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-500">
                                Created:{' '}
                                {new Date(
                                    group.created_at,
                                ).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                                {group.members_count} members
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                by{' '}
                                {group.creator?.first_name ||
                                    group.creator?.username}
                            </span>
                            {isAuthenticated ? (
                                group.is_member ? (
                                    <span className="bg-green-100 text-green-800 py-1 px-3 rounded text-sm">
                                        Member
                                    </span>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleJoinGroup(group.id)
                                        }
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                    >
                                        Join
                                    </button>
                                )
                            ) : (
                                <Link
                                    to="/auth"
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Login to Join
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {groupList.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        No groups found. Be the first to create one!
                    </p>
                </div>
            )}
        </div>
    );
}

function Posts(): JSX.Element {
    const { isAuthenticated, tokens } = useAuth();
    const [postList, setPostList] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState<boolean>(true);
    const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (): Promise<void> => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (tokens?.access) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }
            const url = isAuthenticated ? '/api/posts/?mine=1' : '/api/posts/';
            const { data } = await axiosInstance.get(url, { headers });
            setPostList(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    const handlePostCreated = (newPost: Post): void => {
        setPostList((prev) => [newPost, ...prev]);
        setShowCreateForm(false);
    };

    const handleLikePost = async (postId: number): Promise<void> => {
        if (!isAuthenticated || !tokens?.access) return;
        try {
            await axiosInstance.post(
                `/api/posts/${postId}/like/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            fetchPosts();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }
    if (postsLoading) {
        return (
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
        );
    }
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Posts</h2>
                <div className="flex gap-4">
                    {isAuthenticated && (
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {showCreateForm ? 'Cancel' : 'Create Post'}
                        </button>
                    )}
                    <Link
                        to="/groups"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded"
                    >
                        Explore Groups
                    </Link>
                </div>
            </div>
            {showCreateForm && isAuthenticated && (
                <div className="mb-8">
                    <CreatePostForm
                        onSuccess={handlePostCreated}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {postList.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        isAuthenticated={isAuthenticated}
                        onLike={handleLikePost}
                    />
                ))}
            </div>
            {postList.length === 0 && !postsLoading && (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                        No posts found. Create the first post!
                    </p>
                </div>
            )}
        </div>
    );
}

export default App;
