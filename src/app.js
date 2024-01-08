import { PAGE_NAV, SET_ID } from "./constants";
function callback(data) {
  document.getElementById("content").innerHTML = data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === PAGE_NAV) {
    document.getElementById("content").innerHTML = request.url;
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === SET_ID) {
    document.getElementById(
      "content"
    ).innerHTML = `${request.formId}: ${request.key}`;
  }
});
