function callback(data) {
  console.log({ data });
  document.getElementById("content").innerHTML = data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "PAGE_NAV") {
    document.getElementById("content").innerHTML = request.url;
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.command === "SET_ID") {
    document.getElementById(
      "content"
    ).innerHTML = `${request.formId}: ${request.key}`;
  }
});
