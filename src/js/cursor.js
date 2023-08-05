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
			animation-timing-function: ease;
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

	// 遷移アニメーション終了時の処理
	cursor.addEventListener("animationend", () => {
		cursor.style.animationName = toAnimationName;
		cursor.style.animationTimingFunction = "";
		cursor.style.animationDirection = "";
		cursor.style.animationDuration = "";
		cursor.style.animationIterationCount = "";
		if (status === "pointer") {
			cursor.style.animationTimingFunction = "linear";
		} else {
			cursor.style.transitionDuration = "";
		}
	});

	const toAnimation = (toName) => {
		cursor.style.animationTimingFunction = "ease";
		cursor.style.animationDirection = "normal";
		cursor.style.animationDuration = "500ms";
		cursor.style.animationIterationCount = 1;
		cursor.style.transitionDuration = "500ms";
		if (status === "normal") {
			cursor.style.transitionDuration = "200ms";
		}
		toAnimationName = toName;
	};

	const pointer = () => {
		if (target === null) {
			cursor.style.opacity = 0;
		} else {
			cursor.style.opacity = 1;
			let x = clientX + 27;
			let y = clientY + 27;

			const style = getComputedStyle(cursor);
			if (getComputedStyle(target).cursor === "pointer") {
				if (status !== "pointer") {
					// 遷移前の形状を記憶
					transform = style.getPropertyValue("transform");
					cursor.style.setProperty("--currentTransform", transform);

					// 遷移アニメーションを実行
					cursor.style.animationName = `toPointer-${hash}`;
					toAnimation(`pointer-${hash}`);
				}

				status = "pointer";
				x = clientX - pointerSize / 2;
				y = clientY - pointerSize / 2;
			} else {
				if (status !== "normal") {
					// 遷移前の形状を記憶
					transform = style.getPropertyValue("transform");
					cursor.style.setProperty("--currentTransform", transform);

					// 遷移アニメーションを実行
					cursor.style.animationName = `toMove-${hash}`;
					toAnimation(`move-${hash}`);
				}
				status = "normal";
			}

			cursor.style.top = `${y}px`;
			cursor.style.left = `${x}px`;
		}

		requestAnimationFrame(pointer);
	};

	document.addEventListener(
		"mousemove",
		(event) => {
			clientX = event.clientX;
			clientY = event.clientY;
			target = event.target;
		},
		false
	);

	document.body.addEventListener(
		"mouseleave",
		() => {
			cursor.style.opacity = 0;
		},
		false
	);

	pointer();
})();
