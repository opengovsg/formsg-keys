export const getKeyFromStorage = async (formId) => {
  return chrome.storage.local.get([formId]).then((keyPairResult) => {
    console.log({ keyPairResult });
    return keyPairResult[formId];
  });
};


export const downloadKeyToStorage = async (formId, key) => {
  const keyPair = { [formId]: key };
  chrome.storage.local.set(keyPair, () => {
    console.log(`Key (${key}) was saved in storage for formId (${formId})`);
  });
};
