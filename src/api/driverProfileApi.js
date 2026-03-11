import http from "@/request/request.js";

function listDriverProfilePage(data) {
  return http.get("/driverProfile/listDriverProfilePage", { params: data });
}

function addDriverProfile(data) {
  return http.post("/driverProfile/addDriverProfile", data);
}

function updateDriverProfile(data) {
  return http.post("/driverProfile/updateDriverProfile", data);
}

function delDriverProfile(data) {
  return http.get("/driverProfile/delDriverProfile", { params: data });
}

export {
  listDriverProfilePage,
  addDriverProfile,
  updateDriverProfile,
  delDriverProfile
};