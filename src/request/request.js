import axios from "axios";
import qs from "qs";
import router from "@/router";

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL || "http://localhost:9999/garage"
});

instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.token = token;
    }
    if (config.method === "post") {
      config.data = qs.stringify(config.data);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && data.flag === false && data.data === "token_error") {
      router.push("/login");
    }
    return data;
  },
  (error) => {
    if (error && error.response && (error.response.status === 401 || error.response.status === 403)) {
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default instance;
