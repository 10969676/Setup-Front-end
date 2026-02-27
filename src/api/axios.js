import axios from 'axios';

const App_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: App_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;