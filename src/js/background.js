"use strict";

chrome.runtime.onMessage.addListener((request, sender) => {
	chrome.tabs.sendMessage(sender.tab.id, request).catch(() => {});

	return true;
});
