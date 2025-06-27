import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PostCreate, Group } from '../../types';

interface CreatePostFormProps {
    selectedGroupId?: number;
    onSuccess?: (post: any) => void;
    onCancel?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({
    selectedGroupId,
    onSuccess,
    onCancel,
}) => {
    const { tokens } = useAuth();
    const [formData, setFormData] = useState<PostCreate>({
        title: '',
        content: '',
        group_id: selectedGroupId || 0,
        image_url: '',
    });
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchUserGroups();
    }, []);

    useEffect(() => {
        if (selectedGroupId) {
            setFormData((prev) => ({ ...prev, group_id: selectedGroupId }));
        }
    }, [selectedGroupId]);

    const fetchUserGroups = async (): Promise<void> => {
        try {
            const response = await fetch('/api/groups/', {
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                // Filter to only show groups where user is a member
                const userGroups = data.groups.filter(
                    (group: Group) => group.is_member,
                );
                setGroups(userGroups);
            }
        } catch (err) {
            console.error('Error fetching groups:', err);
        } finally {
            setLoadingGroups(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'group_id' ? parseInt(value) : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        } else {
            setImageFile(null);
        }
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.group_id) {
            setError('Please select a group');
            setLoading(false);
            return;
        }

        try {
            const form = new FormData();
            form.append('title', formData.title);
            form.append('content', formData.content);
            form.append('group_id', String(formData.group_id));
            if (imageFile) {
                form.append('image', imageFile);
            }
            const response = await fetch('/api/posts/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${tokens?.access}`,
                },
                body: form,
            });

            if (response.ok) {
                const data = await response.json();
                onSuccess?.(data.post);
                // Reset form
                setFormData({
                    title: '',
                    content: '',
                    group_id: selectedGroupId || 0,
                    image_url: '',
                });
                setImageFile(null);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create post');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingGroups) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-center mt-2 text-gray-600">
                    Loading groups...
                </p>
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Create New Post
                </h3>
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                        You need to be a member of at least one group to create
                        posts.
                    </p>
                    <button
                        onClick={onCancel}
                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                        Browse Groups
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Create New Post
            </h3>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
                encType="multipart/form-data"
            >
                <div>
                    <label
                        htmlFor="group_id"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Group *
                    </label>
                    <select
                        id="group_id"
                        name="group_id"
                        value={formData.group_id}
                        onChange={handleChange}
                        required
                        disabled={!!selectedGroupId}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                        <option value="">Select a group</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength={200}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter post title"
                    />
                </div>

                <div>
                    <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Content *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What would you like to share?"
                    />
                </div>

                <div>
                    <label
                        htmlFor="image"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        Image Upload
                    </label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imageFile && (
                        <img
                            src={URL.createObjectURL(imageFile)}
                            alt="Preview"
                            className="mt-2 max-h-32 rounded"
                        />
                    )}
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Post'}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreatePostForm;
