import axios from "axios";
import qs from "qs";
import router from "@/router";

function buildErrorMessage(error) {
  if (!error) {
    return "请求失败，请稍后重试";
  }

  const status = error.response && error.response.status;
  if (status === 400) {
    return "请求参数有误，请检查后重试";
  }
  if (status === 401 || status === 403) {
    return "登录状态已失效，请重新登录";
  }
  if (status === 404) {
    return "接口不存在，请联系管理员";
  }
  if (status >= 500) {
    return "服务暂不可用，请稍后重试";
  }
  if (String(error.message || "").includes("timeout")) {
    return "请求超时，请重试";
  }
  return "网络异常，请检查网络后重试";
}

function normalizeRequestError(error) {
  const normalized = new Error(buildErrorMessage(error));
  normalized.userMessage = normalized.message;
  normalized.status = error && error.response ? error.response.status : "";
  normalized.originalError = error;
  return normalized;
}

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL || "http://localhost:9999/garage",
  timeout: 12000
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
  (error) => Promise.reject(normalizeRequestError(error))
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
    const status = error && error.response ? error.response.status : 0;
    if (status === 401 || status === 403) {
      router.push("/login");
    }
    return Promise.reject(normalizeRequestError(error));
  }
);

export default instance;
