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

var mainTabId;
var unreadMessages = []; // Messages loaded by facebook.js awaiting main.js connection
var stillAlive;
var stillAliveRefresh = 1000;
var stillAliveMaximum = 3000;

// Store any actions that need to be taken by the facebook script
var facebookTODO = {
  postMessages: [],
  getFriends: false,
  scanDOM: false,
  sendPublicKey: []
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // This event is issued when we are to inject the facebook content script
  if (message.event === 'injectFacebookiFrame') {
    document.getElementById('iframe').src = 'https://facebook.com/messages/';
    chrome.tabs.sendMessage(sender.tab.id, {event: 'stillAlive', data: ''});
    stillAlive = Date.now();

    // Emit periodic poll to content script
    var pollContentScript = function() {
      chrome.tabs.sendMessage(sender.tab.id, {event: 'stillAlive', data: ''});
      setTimeout(pollContentScript, stillAliveRefresh);
    };
    pollContentScript();

    // If content script hasn't responded, emit disconnect
    var checkContentScriptTimeout = function() {
      // If too much time has elapsed, we've disconnected, turn off scanning of DOM
      if (Date.now() - stillAlive > stillAliveMaximum) {
        // Add functionality here
        facebookTODO.scanDOM = false;
      } else {
        setTimeout(checkContentScriptTimeout, stillAliveRefresh);
      }
    };
    checkContentScriptTimeout();
  }
  if (message.event === 'stillAlive') {
    stillAlive = Date.now();
  }

  // This event is issued when the main content script is launched
  if (message.event === "registerTabId") {
    mainTabId = sender.tab.id;

    // Send any unread messages to the client
    if (unreadMessages.length) {
      chrome.tabs.sendMessage(mainTabId, {event: "receivedNewFacebookMessage", data: unreadMessages});
    }
  }

  // The facebook content script is requesting any new actions to be taken
  if (message.event === "updateStatus") {
    sendResponse({
      postMessages: facebookTODO.postMessages.slice(),
      getFriends: facebookTODO.getFriends,
      scanDOM: facebookTODO.scanDOM,
      sendPublicKey: facebookTODO.sendPublicKey
    });

    // TODO: modularize this so it's a 1-line reset to defaults
    facebookTODO.postMessages = [];
    facebookTODO.getFriends = false;
    facebookTODO.sendPublicKey = [];
  }

  // The facebook script has read in new messages
  if (message.event === "receivedNewFacebookMessage") {
    // if the client is already on our app, send the new messages
    if (mainTabId) {
      chrome.tabs.sendMessage(mainTabId, {event: 'receivedNewFacebookMessage', data: message.data});
    }

    // Otherwise, store the new messages for the future
    else {
      unreadMessages = unreadMessages.concat(message.data);
    }
  }

  // The content script is asking for facebook friends
  if (message.event === "getFacebookFriends") {
    facebookTODO.getFriends = true;
  }

  // The facebook script has sent us back its friendslist
  if (message.event === "facebookFriendsList") {
    // Send the friendslist back to the content script (for relay to the app)
    chrome.tabs.sendMessage(mainTabId, {event: 'facebookFriendsList', data: message.data});
  }

  // The content script is giving us a message to send over facebook
  if (message.event === "sendFacebookMessage") {
    facebookTODO.postMessages.push(message.data);
  }

  // The content script is telling us to tell the Facebook script to monitor the DOM
  if (message.event === 'scanFacebookDOM') {
    facebookTODO.scanDOM = true;
  }

  // The content script is telling us to initiate a public key exchange
  if (message.event === 'sendPublicKey') {
    facebookTODO.sendPublicKey.push(message.data);
  }

  // The facebook script has sent us a PGP key
  if (message.event === 'receivedPGPKey') {
    chrome.tabs.sendMessage(mainTabId, {event: 'receivedPGPKey', data: message.data});
  }
});
