export const getKeyFromStorage = async (formId) => {
  return chrome.storage.local.get([formId]).then((keyPairResult) => {
    console.log({ keyPairResult });
    return keyPairResult[formId];
  });
};

export const getAllKeysFromStorage = async () => {
  return chrome.storage.local.get(null).then((result) => {
    console.log('All stored keys:', result);
    return result;
  });
};

export const setKeyToStorage = async (formId, key) => {
  const keyPair = { [formId]: key };
  chrome.storage.local.set(keyPair, () => {
    console.log(`Key (${key}) was saved in storage for formId (${formId})`);
  });
};
