import { getKeyFromStorage, setKeyToStorage } from "./keys.utils";
import { getFormIdFromAdminUrl } from "./url.utils";
import {
  GET_KEY,
  SET_ID,
  FORMSG_ADMINFORM_PATH,
  FORMSG_DOMAIN,
  FORMSG_DASHBOARD_PATH,
  FORMSG_LOCALDEV_DOMAIN,
  FORMSG_USE_TEMPLATE_PATH,
} from "./constants";

let lastTabId = -1;
let lastKey = -1;

function resetKey() {
  lastTabId = -1;
  lastKey = -1;
}

function urlHasKeys(url) {
  if (
    url.includes(FORMSG_DASHBOARD_PATH) ||
    url.includes(FORMSG_USE_TEMPLATE_PATH)
  ) {
    return true;
  }
  return false;
}

function handleDownloadCreated(createdItem) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    function callback(data) {
      lastKey = data;
    }

    if (!urlHasKeys(tabs[0].url)) {
      return;
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
chrome.downloads.onCreated.addListener(handleDownloadCreated);

const RULE_NEW_ENCRYPTED_FORM = {
  conditions: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_DOMAIN,
        pathContains: FORMSG_DASHBOARD_PATH,
      },
      css: ["code.chakra-code"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_DOMAIN,
        pathContains: FORMSG_DASHBOARD_PATH,
      },
      css: ["[name='secretKey']"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_DOMAIN,
        pathContains: FORMSG_USE_TEMPLATE_PATH,
      },
      css: ["code.chakra-code"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_DOMAIN,
        pathContains: FORMSG_USE_TEMPLATE_PATH,
      },
      css: ["[name='secretKey']"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_DOMAIN,
        pathContains: FORMSG_ADMINFORM_PATH,
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_LOCALDEV_DOMAIN,
        pathContains: FORMSG_DASHBOARD_PATH,
      },
      css: ["code.chakra-code"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_LOCALDEV_DOMAIN,
        pathContains: FORMSG_DASHBOARD_PATH,
      },
      css: ["[name='secretKey']"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_LOCALDEV_DOMAIN,
        pathContains: FORMSG_ADMINFORM_PATH,
      },
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_LOCALDEV_DOMAIN,
        pathContains: FORMSG_USE_TEMPLATE_PATH,
      },
      css: ["code.chakra-code"],
    }),
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {
        hostSuffix: FORMSG_LOCALDEV_DOMAIN,
        pathContains: FORMSG_USE_TEMPLATE_PATH,
      },
      css: ["[name='secretKey']"],
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

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  const { url } = tab;

  if (status !== "loading") {
    return;
  }

  if (url.includes(FORMSG_ADMINFORM_PATH)) {
    const formId = getFormIdFromAdminUrl(url);

    if (tabId === lastTabId) {
      // user just downloaded a key, go store key to storage
      setKeyToStorage(formId, lastKey);
      resetKey();
      return;
    } else {
      // user enter normal form page, go get key from storage
      const key = await getKeyFromStorage(formId);

      chrome.runtime
        .sendMessage(undefined, {
          command: SET_ID,
          formId,
          key,
        })
        .catch((err) => {});
      return;
    }
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  const { url } = tab;

  if (status !== "loading") {
    return;
  }

  if (!url.includes(FORMSG_ADMINFORM_PATH)) {
    chrome.action.setBadgeText({ text: "", tabId });
  }

  const formId = getFormIdFromAdminUrl(url);

  if (!formId) {
    return;
  }

  // user enter normal form page, go get key from storage
  const key = await getKeyFromStorage(formId);

  if (key) {
    chrome.action.setBadgeBackgroundColor({ color: "#4A61C0", tabId });
    chrome.action.setBadgeTextColor({ color: "#E2E8F0", tabId });
    chrome.action.setBadgeText({ text: "Key", tabId });
  } else {
    chrome.action.setBadgeBackgroundColor({ color: "#E2E8F0", tabId });
    chrome.action.setBadgeTextColor({ color: "#445072", tabId });
    chrome.action.setBadgeText({ text: "None", tabId });
  }
});
