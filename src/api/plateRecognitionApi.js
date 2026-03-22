import http from "@/request/request.js";

function recognizeAndTransit(formData) {
  return http.post("/plateRecognition/recognizeAndTransit", formData);
}

export {
  recognizeAndTransit
};
