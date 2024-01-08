import { getKeyFromStorage } from "./keys.utils";
import { PAGE_NAV, SET_ID } from "./constants";
import { getFormIdFromAdminUrl } from "./url.utils";

function setKeyToContent(formId, key) {
  document.getElementById("content").innerHTML = `${formId}: ${key}`;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === PAGE_NAV) {
    document.getElementById("content").innerHTML = request.url;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === SET_ID) {
    setKeyToContent(request.formId, request.key);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, async function (tab) {
  const url = tab[0].url;
  const formId = getFormIdFromAdminUrl(url);
  const key = await getKeyFromStorage(formId);
  setKeyToContent(formId, key);
});
