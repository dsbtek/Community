import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../utils/getApiUrl';
import { useParams } from 'react-router-dom';
import { Group, Post, PostsResponse } from '../../types';
import PostCard from '../posts/PostCard';
import { useAuth } from '../../contexts/AuthContext';
import EditGroupForm from './EditGroupForm';

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, tokens, user } = useAuth();
    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showEdit, setShowEdit] = useState(false);

    useEffect(() => {
        fetchGroup();
        fetchGroupPosts();
        // eslint-disable-next-line
    }, [id]);

    const fetchGroup = async () => {
        let headers: HeadersInit = {};
        if (isAuthenticated && tokens?.access) {
            headers['Authorization'] = `Bearer ${tokens.access}`;
        }
        const res = await fetch(getApiUrl(`/api/groups/${id}/`), { headers });
        if (res.ok) {
            const data = await res.json();
            setGroup(data.group || data);
        }
    };
    const handleLeaveGroup = async () => {
        if (!isAuthenticated || !tokens?.access || !group) return;
        setActionLoading(true);
        setError(null);
        try {
            const res = await fetch(
                getApiUrl(`/api/groups/${group.id}/leave/`),
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${tokens.access}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (res.ok) {
                await fetchGroup();
            } else {
                const data = await res.json();
                setError(data.error || 'Failed to leave group');
            }
        } catch (e) {
            setError('Failed to leave group');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchGroupPosts = async () => {
        const res = await fetch(getApiUrl(`/api/posts/?group_id=${id}`));
        if (res.ok) {
            const data: PostsResponse = await res.json();
            setPosts(data.posts || []);
        }
        setLoading(false);
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!group)
        return <div className="text-center py-12">Group not found.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
                <p className="text-gray-600 mb-2">{group.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                    Created: {new Date(group.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                    Members: {group.members_count}
                </p>
                {/* Only group creator can edit */}
                {isAuthenticated &&
                    group.creator &&
                    group.creator.id &&
                    user &&
                    group.creator.id === user.id && (
                        <button
                            onClick={() => setShowEdit((v) => !v)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mt-2 mr-2"
                        >
                            {showEdit ? 'Cancel Edit' : 'Edit Group'}
                        </button>
                    )}
                {showEdit && (
                    <EditGroupForm
                        group={group}
                        onSuccess={(updated) => {
                            setGroup(updated);
                            setShowEdit(false);
                        }}
                        onCancel={() => setShowEdit(false)}
                    />
                )}
                {isAuthenticated && group.is_member && (
                    <button
                        onClick={handleLeaveGroup}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2 disabled:opacity-60"
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Leaving...' : 'Leave Group'}
                    </button>
                )}
                {error && (
                    <div className="text-red-600 mt-2 text-sm">{error}</div>
                )}
            </div>
            <h3 className="text-xl font-semibold mb-4">Posts in this group</h3>
            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-gray-600">
                        No posts in this group yet.
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            isAuthenticated={isAuthenticated}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default GroupDetail;
