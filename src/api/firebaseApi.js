// src/api/firebaseApi.js
import axios from 'axios';

const DATABASE_URL = 'https://manage-710a4-default-rtdb.firebaseio.com';

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
