import http from "@/request/request.js";

function listGarageRecordPage(data) {
  return http.get("/garageRecord/listGarageRecordPage", { params: data });
}

function addGarageInRecord(data) {
  return http.post("/garageRecord/addGarageInRecord", data);
}

function updateGarageOutRecord(data) {
  return http.post("/garageRecord/updateGarageOutRecord", data);
}

export {
  listGarageRecordPage,
  addGarageInRecord,
  updateGarageOutRecord
};