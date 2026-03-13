import http from "@/request/request.js";

function createCheckoutOrder(data) {
  return http.post("/payment/createCheckoutOrder", data);
}

function queryCheckoutOrder(data) {
  return http.get("/payment/queryCheckoutOrder", { params: data });
}

function completeCheckout(data) {
  return http.post("/payment/completeCheckout", data);
}

export {
  createCheckoutOrder,
  queryCheckoutOrder,
  completeCheckout
};
