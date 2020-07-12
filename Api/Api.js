import fetch from './Config';

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

export const getRows = (token, table_id) => {
    const headers = {
        Authorization: 'Token ' + token
    };
    const body = {token, table_id};
    return fetch.post('/rows/', body, {headers});
};

export const getAllRows = (token) => {
    const headers = {
        Authorization: 'Token ' + token
    };
    const body = {token};
    return fetch.post('/allrows/', body, {headers});
};

export const authenticate = (token) => {
    const headers = {
        Authorization: 'Token ' + token
    };
    return fetch.get('/authenticate/', {headers});
};

