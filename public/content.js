import { GET_KEY, INSERT_KEY } from "../src/constants";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === GET_KEY) {
    const keyData = document.querySelector("code.chakra-code");
    sendResponse(keyData.innerText);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === INSERT_KEY) {
    const keyInputEl = document.querySelector("[name='secretKey']");
    keyInputEl.value = request.key;

    ["input", "change", "keydown"].forEach((eventType) => {
      const event = new Event(eventType, { bubbles: true });
      keyInputEl.dispatchEvent(event);
    });
  }
});
