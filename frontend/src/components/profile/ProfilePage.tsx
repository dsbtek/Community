import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../../utils/getApiUrl';
import { getMediaUrl } from '../../utils/getMediaUrl';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileData {
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string; // URL or null
}

const ProfilePage: React.FC = () => {
    const { tokens } = useAuth();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<ProfileData>({ username: '', email: '' });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosInstance.get(
                getApiUrl('/api/auth/profile/'),
                {
                    headers: {
                        Authorization: `Bearer ${tokens?.access}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            setProfile(data);
            setForm(data);
            setAvatarPreview(data.avatar || null);
        } catch (err: any) {
            setError(err.message || 'Error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            let body: FormData | string;
            let headers: any = { Authorization: `Bearer ${tokens?.access}` };
            if (avatarFile) {
                body = new FormData();
                body.append('username', form.username);
                body.append('email', form.email);
                body.append('first_name', form.first_name || '');
                body.append('last_name', form.last_name || '');
                body.append('avatar', avatarFile);
                // Remove content-type for FormData
            } else {
                body = JSON.stringify(form);
                headers['Content-Type'] = 'application/json';
            }
            const { data } = await axiosInstance.put(
                getApiUrl('/api/auth/profile/'),
                body,
                { headers },
            );
            setProfile(data);
            setEditMode(false);
            setSuccess('Profile updated successfully!');
            setAvatarFile(null);
            setAvatarPreview(data.avatar || null);
        } catch (err: any) {
            setError(err.message || 'Error updating profile');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-12">{error}</div>;
    }

    if (!profile) {
        return <div className="text-center py-12">No profile data found.</div>;
    }

    return (
        <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">My Profile</h2>
            {success && <div className="mb-4 text-green-600">{success}</div>}
            <div className="flex flex-col items-center mb-6">
                <div className="relative">
                    <img
                        src={
                            avatarPreview
                                ? avatarPreview
                                : profile.avatar
                                ? getMediaUrl(profile.avatar)
                                : '/default-avatar.png'
                        }
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                    />
                    {editMode && (
                        <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487a2.25 2.25 0 1 1 3.182 3.182M6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75V8.25A2.25 2.25 0 0 0 17.25 6H6.75A2.25 2.25 0 0 0 4.5 8.25v10.5A2.25 2.25 0 0 0 6.75 21z"
                                />
                            </svg>
                        </label>
                    )}
                </div>
                {editMode && avatarFile && (
                    <div className="text-xs text-gray-500 mt-2">
                        Selected: {avatarFile.name}
                    </div>
                )}
            </div>
            {!editMode ? (
                <div>
                    <div className="mb-4">
                        <span className="font-semibold">Username:</span>{' '}
                        {profile.username}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Email:</span>{' '}
                        {profile.email}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">First Name:</span>{' '}
                        {profile.first_name || '-'}
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold">Last Name:</span>{' '}
                        {profile.last_name || '-'}
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => setEditMode(true)}
                    >
                        Edit Profile
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block font-semibold mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="first_name"
                            value={form.first_name || ''}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="last_name"
                            value={form.last_name || ''}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-4 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                            onClick={() => {
                                setEditMode(false);
                                setForm(profile);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfilePage;
