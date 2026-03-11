import http from "@/request/request.js";

function getRealtimeMonitorData() {
  return http.get("/garageMonitor/realtime");
}

export {
  getRealtimeMonitorData
};
