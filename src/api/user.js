import firebaseApi from "@/api/firebaseApi.js";

export const registerUser = (user) => {
    return firebaseApi.post("/user", user);
}
export const getAllUsers = () => {
    return firebaseApi.get("/user");
}