console.log('background');

chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ '*://*/*' ], // Pattern to match all http(s) pages
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);

$(document).ready(function() {
  console.log(document.getElementById('iframe'));
});

var tabIds = {
}
chrome.runtime.onMessage.addListener(function(message, sender) {
  console.log('message data',message.data);
  if (message.event === "registerTabId") {
    tabIds[message.data] = sender.tab.id;
  }
  if (message.event === "sendNewMessage") {
    if (tabIds['facebook']) {
      chrome.tabs.sendMessage(tabIds['facebook'], message.data);
    }
  }
  console.log('tabIds', tabIds);
});