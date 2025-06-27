import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Group, Post, PostsResponse } from '../../types';
import PostCard from '../posts/PostCard';
import { useAuth } from '../../contexts/AuthContext';

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const [group, setGroup] = useState<Group | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGroup();
        fetchGroupPosts();
        // eslint-disable-next-line
    }, [id]);

    const fetchGroup = async () => {
        const res = await fetch(`/api/groups/${id}/`);
        if (res.ok) {
            const data = await res.json();
            setGroup(data.group || data);
        }
    };

    const fetchGroupPosts = async () => {
        const res = await fetch(`/api/posts/?group_id=${id}`);
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
                <p className="text-sm text-gray-500">
                    Members: {group.members_count}
                </p>
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
