import http from "@/request/request.js";

function listGarageReservationPage(data) {
  return http.get("/garageReservation/listGarageReservationPage", { params: data });
}

function createReservation(data) {
  return http.post("/garageReservation/createReservation", data);
}

function cancelReservation(data) {
  return http.post("/garageReservation/cancelReservation", data);
}

function checkInReservation(data) {
  return http.post("/garageReservation/checkInReservation", data);
}

export {
  listGarageReservationPage,
  createReservation,
  cancelReservation,
  checkInReservation
};
