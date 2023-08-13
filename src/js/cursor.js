"use strict";

(() => {
	const cursor = document.createElement("span");
	const hash = Date.now();
	const className = `behind-cursor-${hash}`;
	cursor.classList.add(className);
	cursor.dataset.extension = "Aki";
	document.body.appendChild(cursor);

	const style = document.createElement("style");
	const skew = "skew(20deg, 20deg)";
	const normalSize = 20;
	const pointerSize = 50;
	style.innerText = /* css */ `
		.${className}[data-extension="Aki"] {
			position: fixed;
			display: block;
			border-color: #fff9c4;
			border-style: solid;
			border-width: 3px;
			box-shadow: 0px 0px 15px -3px #fff9c4;
			width: ${normalSize}px;
			height: ${normalSize}px;
			z-index: 2147483647;
			user-select: none;
			pointer-events: none;
			transform: rotate(45deg) ${skew};
			transition-property: top, left, width, height, transform, opacity;
			transition-timing-function: ease-out;
			transition-duration: 400ms;
			box-sizing: border-box;
			animation-name: move-${hash};
			animation-duration: 10s;
			animation-iteration-count: infinite;
			animation-direction: alternate;
			animation-timing-function: ease-in-out;
			animation-fill-mode: both;
		}

		@keyframes move-${hash} {
			0% {
				transform: rotate(45deg) ${skew};
			}

			25% {
				transform: rotate(45deg) ${skew};
			}

			75% {
				transform: rotate(765deg) ${skew};
			}

			100% {
				transform: rotate(765deg) ${skew};
			}
		}

		@keyframes pointer-${hash} {
			0% {
				transform: rotate(0deg) skew(0);
				width: ${pointerSize}px;
				height: ${pointerSize}px;
			}

			100% {
				transform: rotate(360deg) skew(0);
				width: ${pointerSize}px;
				height: ${pointerSize}px;
			}
		}

		@keyframes toPointer-${hash} {
			from {
				transform: var(--currentTransform);
			}

			to {
				transform: rotate(-360deg) skew(0);
				width: ${pointerSize}px;
				height: ${pointerSize}px;
			}
		}

		@keyframes toMove-${hash} {
			from {
				transform: var(--currentTransform);
				width: ${pointerSize}px;
				height: ${pointerSize}px;
			}

			to {
				transform: rotate(45deg) ${skew};
				width: ${normalSize}px;
				height: ${normalSize}px;
			}
		}
	`;

	document.body.appendChild(style);

	let transform = "";
	let toAnimationName = "";
	let status = "normal";
	let clientX = 0;
	let clientY = 0;
	let target = null;
	let mouseleave = true;
	let pointerTimerId = null;
	let fullscreen = false;
	let oldClientX = clientX;
	let oldClientY = clientY;

	// 遷移アニメーション終了時の処理
	cursor.addEventListener("animationend", () => {
		cursor.style.animationName = toAnimationName;
		cursor.style.animationTimingFunction = "";
		cursor.style.animationDirection = "";
		cursor.style.animationDuration = "";
		cursor.style.animationIterationCount = "";
		if (status === "pointer") {
			cursor.style.animationTimingFunction = "linear";
			cursor.style.animationDirection = "normal";
		} else {
			cursor.style.transitionDuration = "";
		}
	});

	const toAnimation = (toName) => {
		cursor.style.animationTimingFunction = "ease-out";
		cursor.style.animationDirection = "normal";
		cursor.style.animationDuration = "500ms";
		cursor.style.animationIterationCount = 1;
		cursor.style.transitionDuration = "500ms";
		if (status === "normal") {
			cursor.style.transitionDuration = "200ms";
		}
		toAnimationName = toName;
	};

	let count = 0;
	const pointer = () => {
		if (count > 10) {
			if (oldClientX !== clientX || oldClientY !== clientY) {
				chrome.runtime.sendMessage("a", () => {});
			}

			count = 0;
		}

		oldClientX = clientX;
		oldClientY = clientY;

		if (mouseleave) {
			cursor.style.opacity = 0;
		}

		if (target === null) {
			cursor.style.opacity = 0;
		} else if (!mouseleave) {
			cursor.style.opacity = 1;
			let x = clientX + 27;
			let y = clientY + 27;

			const style = getComputedStyle(cursor);
			if (getComputedStyle(target).cursor === "pointer") {
				if (pointerTimerId !== null) {
					clearTimeout(pointerTimerId);
					pointerTimerId = null;
				}

				if (status !== "pointer") {
					// 遷移前の形状を記憶
					transform = style.getPropertyValue("transform");
					cursor.style.setProperty("--currentTransform", transform);

					// 遷移アニメーションを実行
					cursor.style.animationName = `toPointer-${hash}`;
					toAnimation(`pointer-${hash}`);
				}

				status = "pointer";
			} else {
				if (pointerTimerId === null) {
					pointerTimerId = setTimeout(() => {
						if (status !== "normal") {
							// 遷移前の形状を記憶
							transform = style.getPropertyValue("transform");
							cursor.style.setProperty("--currentTransform", transform);

							// 遷移アニメーションを実行
							cursor.style.animationName = `toMove-${hash}`;
							toAnimation(`move-${hash}`);
						}
						status = "normal";
					}, 350);
				}
			}

			if (status === "pointer") {
				x = clientX - pointerSize / 2;
				y = clientY - pointerSize / 2;
			}

			cursor.style.top = `${y}px`;
			cursor.style.left = `${x}px`;
		}

		count++;
		requestAnimationFrame(pointer);
	};

	document.addEventListener(
		"mousemove",
		(event) => {
			clientX = event.clientX;
			clientY = event.clientY;
			target = event.target;

			if (!fullscreen) {
				mouseleave = false;
			}

			if (event.target.nodeName === "IFRAME" || event.target.localName === "iframe") {
				mouseleave = true;
			}
		},
		false
	);

	document.body.addEventListener(
		"mouseleave",
		() => {
			mouseleave = true;
		},
		false
	);

	document.addEventListener("fullscreenchange", () => {
		if (document.fullscreenElement) {
			mouseleave = true;
			fullscreen = true;
		} else {
			mouseleave = false;
			fullscreen = false;
		}
	});

	chrome.runtime.onMessage.addListener((request) => {
		if (location.href === request) {
			mouseleave = false;
		} else {
			mouseleave = true;
		}
	});

	pointer();
})();
