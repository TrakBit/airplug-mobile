import axios from 'axios';

const RENDER_URL = 'https://airplug-backend.onrender.com/';

const defaultAxiosOptions = {
    baseURL: RENDER_URL
};

export default fetch = axios.create(defaultAxiosOptions);