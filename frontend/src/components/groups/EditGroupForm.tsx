import React, { useState } from 'react';
import { getApiUrl } from '../../utils/getApiUrl';
import axiosInstance from '../../utils/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';
import { Group } from '../../types';

interface EditGroupFormProps {
    group: Group;
    onSuccess: (group: Group) => void;
    onCancel: () => void;
}

const EditGroupForm: React.FC<EditGroupFormProps> = ({
    group,
    onSuccess,
    onCancel,
}) => {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { tokens } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (tokens?.access) {
                headers['Authorization'] = `Bearer ${tokens.access}`;
            }
            const { data } = await axiosInstance.put(
                getApiUrl(`/api/groups/${group.id}/`),
                { name, description },
                { headers },
            );
            onSuccess(data.group || data);
        } catch (e) {
            setError('Failed to update group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default EditGroupForm;
