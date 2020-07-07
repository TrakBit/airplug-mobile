import fetch from './Config';
import * as SecureStore from 'expo-secure-store';

export const login = (email, password) => {
    const body = {email, password};
    return fetch.post('/login/', body);
};

export const getTables = (token) => {
    const headers = {
        Authorization: 'Token ' + token
    };
    const body = {token};
    return fetch.post('/tables/', body, {headers});
};