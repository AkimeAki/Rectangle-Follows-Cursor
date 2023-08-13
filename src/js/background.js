"use strict";

chrome.runtime.onMessage.addListener((request, sender) => {
	if (request === "a") {
		chrome.tabs.sendMessage(sender.tab.id, sender.url).catch(() => {});
	}

	return true;
});
