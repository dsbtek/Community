import React from 'react';
import { Link } from 'react-router-dom';
import { Post, User, Group } from '../../types';
import { timeAgo } from '../../utils/timeAgo';

interface PostCardProps {
    post: Post;
    isAuthenticated: boolean;
    onLike?: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    isAuthenticated,
    onLike,
}) => {
    const author =
        typeof post.author === 'string' ? null : (post.author as User);
    const group = typeof post.group === 'string' ? null : (post.group as Group);
    const authorAvatar =
        author?.avatar_url || author?.avatar || '/default-avatar.png';
    return (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-200 p-6 border border-gray-100 group">
            <div className="flex items-start gap-4">
                {/* Post image */}
                {post.image || post.image_url ? (
                    <div
                        className="w-40 h-32 bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 border border-gray-200"
                        style={{
                            backgroundImage: `url('${
                                post.image || post.image_url
                            }')`,
                        }}
                    ></div>
                ) : (
                    <div className="w-40 h-32 flex items-center justify-center bg-gray-200 rounded-lg flex-shrink-0 border border-gray-200">
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2zm0 0l7 7 4-4 5 5"
                            />
                        </svg>
                    </div>
                )}
                {/* Main content */}
                <div className="flex-1 flex flex-col justify-between min-h-32">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src={authorAvatar}
                            alt="Author avatar"
                            className="w-9 h-9 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                            <div className="font-semibold text-gray-900 text-base">
                                {author
                                    ? `${author.first_name ?? ''} ${
                                          author.last_name ?? ''
                                      }`.trim() || author.username
                                    : typeof post.author === 'string'
                                    ? post.author
                                    : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                                {timeAgo(post.created_at)}
                            </div>
                        </div>
                        {group && (
                            <Link
                                to={`/groups/${group.id}`}
                                className="ml-3 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200"
                            >
                                {group.name}
                            </Link>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors cursor-pointer">
                        {post.title}
                    </h3>
                    <p className="text-gray-700 mb-2 line-clamp-3">
                        {post.content}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                        <span className={post.is_liked ? 'text-red-500' : ''}>
                            ❤️ {post.likes_count}
                        </span>
                        <span>💬 {post.comments_count}</span>
                    </div>
                    <div className="flex gap-4 mt-2">
                        {isAuthenticated ? (
                            <button
                                onClick={() => onLike && onLike(post.id)}
                                className={`font-medium flex items-center gap-1 px-3 py-1 rounded transition-colors duration-150 ${
                                    post.is_liked
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                            >
                                {post.is_liked ? 'Unlike' : 'Like'}
                            </button>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-blue-500 hover:text-blue-700 font-medium"
                            >
                                Login to Like
                            </Link>
                        )}
                        <button className="text-gray-600 hover:text-blue-600 font-medium px-3 py-1 rounded transition-colors duration-150">
                            Comment
                        </button>
                        <button className="text-gray-600 hover:text-blue-600 font-medium px-3 py-1 rounded transition-colors duration-150">
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
