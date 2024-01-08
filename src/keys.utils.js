export const getKeyFromStorage = async (formId) => {
  return chrome.storage.local.get([formId]).then((keyPairResult) => {
    console.log({ keyPairResult });
    return keyPairResult[formId];
  });
};
