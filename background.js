chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            } else if (header == 'content-security-policy') {
              console.log(headers[i]);
              headers[i].value = "default-src * data: blob:;script-src *.facebook.com *.fbcdn.net *.facebook.net *.google-analytics.com *.virtualearth.net *.google.com 127.0.0.1:* *.spotilocal.com:* 'unsafe-inline' 'unsafe-eval' *.akamaihd.net *.atlassolutions.com blob: chrome-extension://lifbcibllhkdhoafpjfnlhfpfgnpldfl *.messenger.com;style-src * 'unsafe-inline' *.messenger.com;connect-src *.facebook.com *.fbcdn.net *.facebook.net *.spotilocal.com:* *.akamaihd.net wss://*.facebook.com:* https://fb.scanandcleanlocal.com:* *.atlassolutions.com attachment.fbsbx.com blob: 127.0.0.1:* *.messenger.com;font-src *.messenger.com data:;";
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
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
  if(request.loaded){
    // we have access to use that message we were passed over here
    // If you used a pattern, do extra checks here:
    // if(request.loaded == "https://website.com/index.php")
    console.log('loaded');
  }
});

$(document).ready(function() {
  var msg = $('#messenger');
  msg.on('load', function() {
    console.log('ready');
    var test = document.getElementById('messenger');
    console.log(msg);
    console.log(test.contentDocument);
    // console.log(msg.contents());
  });
});

/*var xhr = new XMLHttpRequest();
xhr.open("GET", "https://www.messenger.com", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    // WARNING! Might be evaluating an evil script!
    //var resp = eval("(" + xhr.responseText + ")");
    //console.log(xhr.responseText);
    var apple = $(xhr.responseText);
    console.log(apple.find('._3058').text());
  }
}
xhr.send();*/

// var xhr = new XMLHttpRequest();
// xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
// xhr.open("GET", 'www.google.com', true);
// xhr.send();
/*console.log('test');
var xhttp = new XMLHttpRequest();
xhttp.open("Get", "www.google.com", false);
xhttp.send();

console.log('resp',xhttp.response);
/*var http = require('node_modules/http');
if(http) { console.log('loaded http'); }*/
