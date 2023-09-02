"use strict";

chrome.runtime.onMessage.addListener((request, sender) => {
	if (sender.tab?.id === undefined) {
		return true;
	}

	chrome.tabs.sendMessage(sender.tab.id, request).catch(() => {});

	return true;
});
