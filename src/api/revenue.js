import firebaseApi from "@/api/firebaseApi.js";

export const getAllRevenue = () => {
    return firebaseApi.get('revenue');
}
export const addRevenue = (data) => {
    return firebaseApi.post('revenue', data);
}
export const editRevenue = (data) => {
    return firebaseApi.patch(`revenue/${data.key}`, data);
}
export const deleteRevenue = (id) => {
    return firebaseApi.delete(`revenue/${id}`);
}