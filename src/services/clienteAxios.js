import axios from "axios";

const UrlBase = import.meta.env.VITE_API_BASE_URL;

const clienteAxios = axios.create({
    baseURL: UrlBase,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default clienteAxios;
