// src/api/firebaseApi.js
import axios from 'axios';

const DATABASE_PRODUCTION = 'https://manage-710a4-default-rtdb.firebaseio.com';
const DATABASE_URL_LOCAL = 'https://manage-dev-a5a0a-default-rtdb.firebaseio.com';
const isLocal = import.meta.env.VITE_IS_LOCAL === 'true';
const DATABASE_URL = isLocal ? DATABASE_URL_LOCAL : DATABASE_PRODUCTION;
console.log("⛷️⛷️⛷️ ~ DATABASE_URL:", DATABASE_URL)
const firebaseApi = {
    get(path,  params = '') {
        return axios.get(`${DATABASE_URL}/${path}.json${params}`);
    },
    post(path, data) {
        return axios.post(`${DATABASE_URL}/${path}.json`, data);
    },

    put(path, data) {
        return axios.put(`${DATABASE_URL}/${path}.json`, data);
    },
    patch(path, data) {
        return axios.patch(`${DATABASE_URL}/${path}.json`, data);
    },
    delete(path) {
        return axios.delete(`${DATABASE_URL}/${path}.json`);
    }
};

export default firebaseApi;
