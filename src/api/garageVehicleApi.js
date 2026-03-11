import http from "@/request/request.js";

function listGarageVehiclePage(data) {
  return http.get("/garageVehicle/listGarageVehiclePage", { params: data });
}

function listGarageVehicle(data) {
  return http.get("/garageVehicle/listGarageVehicle", { params: data });
}

function addGarageVehicle(data) {
  return http.post("/garageVehicle/addGarageVehicle", data);
}

function updateGarageVehicle(data) {
  return http.post("/garageVehicle/updateGarageVehicle", data);
}

function delGarageVehicle(data) {
  return http.get("/garageVehicle/delGarageVehicle", { params: data });
}

export {
  listGarageVehiclePage,
  listGarageVehicle,
  addGarageVehicle,
  updateGarageVehicle,
  delGarageVehicle
};