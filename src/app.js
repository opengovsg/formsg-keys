import { getKeyFromStorage, getAllKeysFromStorage, downloadKeyToStorage } from "./keys.utils";
import { SET_ID, INSERT_KEY } from "./constants";
import { getFormIdFromAdminUrl } from "./url.utils";
import { FORMSG_ADMINFORM_PATH } from "./constants";

const localstore = {};
function setKeyToContent(formId, key) {
  localstore[formId] = key;
  localstore["currentId"] = formId;
  document.getElementById("formId").innerHTML = formId;
  document.getElementById("key").innerHTML = key || "No key found";
}

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  const currentUrl = tabs[0].url;
  console.log("currentUrl", currentUrl);
  const addKeyContainer = document.getElementById("addkey-btn");

  if (currentUrl.includes(FORMSG_ADMINFORM_PATH)) {
    addKeyContainer.style.display = "block";
  }
});

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
document.getElementById("downloadallkey-btn").addEventListener("click", handleDownloadAllKey);
document.getElementById("downloadthiskey-btn").addEventListener("click", handleDownloadThisKey);

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

async function handleDownloadAllKey() {
  const { currentId } = localstore;
  if (!currentId) return;

  const keys = await getAllKeysFromStorage();
  // Create downloads for each key-value pair
  Object.entries(keys).forEach(([formId, key]) => {
    // Create a blob with the key content
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${formId}.txt`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

async function handleDownloadThisKey() {
  const { currentId } = localstore;
  if (!currentId) return;

  const key = await getKeyFromStorage(currentId);
  const blob = new Blob([key], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentId}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
