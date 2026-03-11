import http from "@/request/request.js";

function login(data) {
  return http.get("/user/login", { params: data });
}

function register(data) {
  return http.post("/user/register", data);
}

function logout() {
  return http.get("/user/logout");
}

function profileSummary() {
  return http.get("/user/profileSummary");
}

function updateProfile(data) {
  return http.post("/user/updateProfile", data);
}

export {
  login,
  register,
  logout,
  profileSummary,
  updateProfile
};
