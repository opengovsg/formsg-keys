import { GET_KEY } from "../src/constants";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === GET_KEY) {
    const keyData = document.querySelector("code.chakra-code");
    sendResponse(keyData.innerText);
  }
});
