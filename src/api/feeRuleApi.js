import http from "@/request/request.js";

function getCurrentFeeRule() {
  return http.get("/feeRule/getCurrent");
}

function updateCurrentFeeRule(data) {
  return http.post("/feeRule/updateCurrent", data);
}

export {
  getCurrentFeeRule,
  updateCurrentFeeRule
};

