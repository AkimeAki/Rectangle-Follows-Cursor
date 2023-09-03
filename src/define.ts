export const hash = Date.now();
export const className = `behind-cursor-${hash}`;
export const defaultPointerMode = "2";
export let pointerMode = defaultPointerMode;
export const defaultColor = "#fff9c4";

chrome.storage.sync.get(["pointerMode"], (value) => {
	if (value.pointerMode !== undefined) {
		pointerMode = value.pointerMode;
	}
});
