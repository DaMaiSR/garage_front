import http from "@/request/request.js";

function listGarageSpacePage(data) {
  return http.get("/garageSpace/listGarageSpacePage", { params: data });
}

function listMyGarageSpacePage(data) {
  return http.get("/garageSpace/listMyGarageSpacePage", { params: data });
}

function addGarageSpace(data) {
  return http.post("/garageSpace/addGarageSpace", data);
}

function updateGarageSpace(data) {
  return http.post("/garageSpace/updateGarageSpace", data);
}

function delGarageSpace(data) {
  return http.get("/garageSpace/delGarageSpace", { params: data });
}

export {
  listGarageSpacePage,
  listMyGarageSpacePage,
  addGarageSpace,
  updateGarageSpace,
  delGarageSpace
};