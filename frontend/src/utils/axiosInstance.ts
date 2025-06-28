import axios from 'axios';
import { getApiUrl } from './getApiUrl';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
    withCredentials: true,
});

export default axiosInstance;
