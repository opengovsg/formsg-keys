import { GET_KEY, SET_ID } from "./constants";

const FORMSG_PROD_DOMAIN = "form.gov.sg";
const FORMSG_DASHBOARD_PATH = "/dashboard";
const FORMSG_ADMINFORM_PATH = "/admin/form";

let lastTabId = -1;
let lastFormId = -1;
let lastKey = -1;

function resetKey() {
  lastTabId = -1;
  lastFormId = -1;
  lastKey = -1;
}
function handleCreate(createdItem) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    function callback(data) {
      lastKey = data;
    }

    lastTabId = tabs[0].id;
    chrome.tabs.sendMessage(
      tabs[0].id,
      { command: GET_KEY },
      undefined,
      callback
    );
  });
}
chrome.downloads.onCreated.addListener(handleCreate);

const RULE_NEW_ENCRYPTED_FORM = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_PROD_DOMAIN,
        pathContains: FORMSG_DASHBOARD_PATH,
      },
      css: ["code.chakra-code"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_PROD_DOMAIN,
        pathContains: FORMSG_ADMINFORM_PATH,
      },
    }),
  ],
  actions: [new chrome.declarativeContent.ShowAction()],
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.disable();
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([RULE_NEW_ENCRYPTED_FORM]);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo?.url;
  if (url && url.includes(FORMSG_ADMINFORM_PATH)) {
    const formId = url.split(FORMSG_ADMINFORM_PATH)[1];
    lastFormId = formId;
    if (tabId === lastTabId) {
      // user just downloaded a key, go store key to storage
      const keyPair = { [formId]: lastKey };
      console.log(keyPair);
      chrome.storage.local.set(keyPair, () => {
        console.log("Data was saved in storage");
      });
      resetKey();
      return;
    } else {
      // user enter normal form page, go get key from storage
      chrome.storage.local.get([formId]).then((keyPairResult) => {
        console.log({ keyPairResult });
        chrome.runtime.sendMessage(undefined, {
          command: SET_ID,
          formId: formId,
          key: result.key,
        });
      });
      return;
    }
  }
});
