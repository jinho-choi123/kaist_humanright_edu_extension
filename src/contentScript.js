// This is the content script for the extension. It is injected into the page and runs in the context of the page.

var s = document.createElement('script');
s.src = chrome.runtime.getURL('dist/inject.bundle.js');
s.type = "module";
console.log(s.src);
document.head.appendChild(s); 