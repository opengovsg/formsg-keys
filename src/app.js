import { getKeyFromStorage, downloadKeyToStorage } from "./keys.utils";
import { SET_ID, INSERT_KEY } from "./constants";
import { getFormIdFromAdminUrl } from "./url.utils";

const localstore = {};
function setKeyToContent(formId, key) {
  localstore[formId] = key;
  localstore["currentId"] = formId;
  document.getElementById("formId").innerHTML = formId;
  document.getElementById("key").innerHTML = key || "No key found";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === SET_ID) {
    setKeyToContent(request.formId, request.key);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const url = tab.url;
  const formId = getFormIdFromAdminUrl(url);
  if (!formId) {
    return;
  }

  const key = await getKeyFromStorage(formId);
  setKeyToContent(formId, key);
});

chrome.tabs.query({ active: true, currentWindow: true }, async function (tab) {
  const url = tab[0].url;
  const formId = getFormIdFromAdminUrl(url);

  if (!formId) {
    return;
  }
  const key = await getKeyFromStorage(formId);
  setKeyToContent(formId, key);
  handleInsertKey();
});

// document
//   .getElementById("insertkey-btn")
//   .addEventListener("click", handleInsertKey);

document.getElementById("copykey-btn").addEventListener("click", handleCopyKey);
document.getElementById("addkey-btn").addEventListener("click", handleAddKey);

function handleInsertKey() {
  const { currentId } = localstore;
  if (currentId) {
    const key = localstore[currentId];
    chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
      chrome.tabs.sendMessage(tab[0].id, {
        command: INSERT_KEY,
        key,
      });
    });
  }
}

function handleCopyKey() {
  const valueToCopy = document.getElementById("key").innerText;
  document.getElementById("key").innerHTML = "Copied!";
  navigator.clipboard.writeText(valueToCopy);
}

async function handleAddKey() {
  const { currentId } = localstore;
  if (!currentId) return;

  // Create and trigger file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.key,.txt';

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const key = await file.text();
    await downloadKeyToStorage(currentId, key);
    setKeyToContent(currentId, key);
  };

  fileInput.click();
}
