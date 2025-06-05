import firebaseApi from "@/api/firebaseApi.js";

export const getAllBox = () => {
    return firebaseApi.get('data-box');
}
export const addBox = (data) => {
    return firebaseApi.post('data-box', data);
}
export const editBox = ( data) => {
    return firebaseApi.put(`data-box/${data.id}`, data);
}
export const deleteBox = (id) => {
    return firebaseApi.delete(`data-box/${id}`);
}
export const getAllTypePassword = () => {
    return firebaseApi.get('list-password');
}
export const addTypePassword = (data) => {
    return firebaseApi.post('list-password', data);
}
export const deleteTypePassword = (id) => {
    return firebaseApi.delete(`list-password/${id}`);
}
export const editTypePassword = (data) => {
    return firebaseApi.patch(`list-password/${data.key}`, data);
}