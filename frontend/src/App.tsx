import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Group, Post, GroupsResponse, PostsResponse } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import CreateGroupForm from './components/groups/CreateGroupForm';
import CreatePostForm from './components/posts/CreatePostForm';

function App(): JSX.Element {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <AppHeader />
          <main className="container mx-auto py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>

          <footer className="bg-gray-800 text-white p-4 mt-12">
            <div className="container mx-auto text-center">
              <p>&copy; 2023 Community App. Built with React & Django.</p>
              <div className="mt-2 space-x-4">
                <a
                  href="http://localhost:8000/swagger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Swagger UI
                </a>
                <a
                  href="http://localhost:8000/redoc/"
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

function AppHeader(): JSX.Element {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-200">
          Community App
        </Link>
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200 transition-colors">
            Home
          </Link>
          <Link to="/groups" className="hover:text-blue-200 transition-colors">
            Groups
          </Link>
          <Link to="/posts" className="hover:text-blue-200 transition-colors">
            Posts
          </Link>
          <a
            href="http://localhost:8000/swagger/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
          >
            API Docs
          </a>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Welcome, {user?.first_name || user?.username}!
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="bg-green-500 hover:bg-green-700 px-3 py-1 rounded transition-colors"
            >
              Login / Register
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home(): JSX.Element {
  const [apiStatus, setApiStatus] = useState<string>('checking...');

  useEffect(() => {
    // Check API connectivity
    fetch('/api/groups/')
      .then(response => response.json())
      .then((data: GroupsResponse) => {
        setApiStatus('connected ✅');
      })
      .catch((error: Error) => {
        setApiStatus('disconnected ❌');
      });
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        Welcome to Community App
      </h2>
      <p className="text-gray-600 mb-8">
        Connect with others, create groups, and share your thoughts!
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">API Status</h3>
        <p className="text-gray-700">
          Backend API: <span className="font-mono">{apiStatus}</span>
        </p>
        <div className="mt-4 space-x-4">
          <a
            href="http://localhost:8000/swagger/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            📚 View API Documentation
          </a>
          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            ⚙️ Django Admin
          </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">🏘️ Groups</h3>
          <p className="text-gray-600 mb-4">
            Join communities of like-minded people and participate in discussions.
          </p>
          <Link
            to="/groups"
            className="inline-block bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Explore Groups
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-3">📝 Posts</h3>
          <p className="text-gray-600 mb-4">
            Share your thoughts, ideas, and engage with the community.
          </p>
          <Link
            to="/posts"
            className="inline-block bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            View Posts
          </Link>
        </div>
      </div>
    </div>
  );
}

function Groups(): JSX.Element {
  const { isAuthenticated, tokens } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

      const response = await fetch('/api/groups/', { headers });
      const data: GroupsResponse = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup: Group): void => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateForm(false);
  };

  const handleJoinGroup = async (groupId: number): Promise<void> => {
    if (!isAuthenticated || !tokens?.access) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/join/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh groups to update membership status
        fetchGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  if (loading) {
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
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
            <p className="text-gray-600 mb-4">{group.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                Created: {new Date(group.created_at).toLocaleDateString()}
              </span>
              <span className="text-sm text-gray-500">
                {group.members_count} members
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                by {group.creator?.first_name || group.creator?.username}
              </span>
              {isAuthenticated ? (
                group.is_member ? (
                  <span className="bg-green-100 text-green-800 py-1 px-3 rounded text-sm">
                    Member
                  </span>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
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

      {groups.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No groups found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}

function Posts(): JSX.Element {
  const { isAuthenticated, tokens } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

      const response = await fetch('/api/posts/', { headers });
      const data: PostsResponse = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: Post): void => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreateForm(false);
  };

  const handleLikePost = async (postId: number): Promise<void> => {
    if (!isAuthenticated || !tokens?.access) return;

    try {
      const response = await fetch(`/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh posts to update like status
        fetchPosts();
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
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
        {isAuthenticated ? (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {showCreateForm ? 'Cancel' : 'Create Post'}
          </button>
        ) : (
          <Link
            to="/auth"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login to Create Post
          </Link>
        )}
      </div>

      {showCreateForm && isAuthenticated && (
        <div className="mb-8">
          <CreatePostForm
            onSuccess={handlePostCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-sm text-gray-500">
                  By {typeof post.author === 'string' ? post.author : `${post.author.first_name} ${post.author.last_name}`} in {typeof post.group === 'string' ? post.group : post.group.name} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-4 text-sm text-gray-500">
                <span className={post.is_liked ? 'text-red-500' : ''}>
                  ❤️ {post.likes_count}
                </span>
                <span>💬 {post.comments_count}</span>
              </div>
            </div>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <div className="flex space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`font-medium ${post.is_liked ? 'text-red-500 hover:text-red-700' : 'text-blue-500 hover:text-blue-700'}`}
                >
                  {post.is_liked ? 'Unlike' : 'Like'}
                </button>
              ) : (
                <Link to="/auth" className="text-blue-500 hover:text-blue-700 font-medium">
                  Login to Like
                </Link>
              )}
              <button className="text-blue-500 hover:text-blue-700 font-medium">
                Comment
              </button>
              <button className="text-blue-500 hover:text-blue-700 font-medium">
                Share
              </button>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No posts found. Be the first to share something!</p>
        </div>
      )}
    </div>
  );
}

export default App;
