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

	let transform = ""; // 遷移時の形状記憶用変数
	let toAnimationName = ""; //遷移時のアニメーション用変数
	let status = "normal"; // 四角いのの状態記憶用変数
	let clientX = 0;
	let clientY = 0;
	let target = null;
	let mouseleave = true; // 四角いのを描画するかどうか
	let pointerTimerId = null; // 遷移時に変化するまでの余裕をもたせるためのタイマーID
	let fullscreen = false; // フルスクリーンかどうか
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

	let count = 0; // ループを間引く用のカウント
	// ループ
	const pointer = () => {
		// 間引く
		if (count > 10) {
			// 移動を検知した際にbackground.jsに合図を送る
			// iframe内で動作した際に他のページでの動作を停止するため、現在動いてるページ検知用の合図
			if (oldClientX !== clientX || oldClientY !== clientY) {
				chrome.runtime.sendMessage("a", () => {});
			}

			count = 0;
		}

		// 過去の座標を保存
		oldClientX = clientX;
		oldClientY = clientY;

		// 図形の描画をさせない場合
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
				// ポインターモードの時はカーソルに近づける
				x = clientX - pointerSize / 2;
				y = clientY - pointerSize / 2;
			}

			// 追従
			cursor.style.top = `${y}px`;
			cursor.style.left = `${x}px`;
		}

		count++;
		requestAnimationFrame(pointer);
	};

	// マウスカーソルを動かした時
	document.addEventListener(
		"mousemove",
		(event) => {
			clientX = event.clientX;
			clientY = event.clientY;
			target = event.target;

			// フルスクリーン時じゃない時に描画をさせる
			if (!fullscreen) {
				mouseleave = false;
			}

			// iframeの上に乗っかると描画をやめる
			if (event.target.nodeName === "IFRAME" || event.target.localName === "iframe") {
				mouseleave = true;
			}
		},
		false
	);

	// マウスカーソルが画面外に行った時
	document.body.addEventListener(
		"mouseleave",
		() => {
			mouseleave = true;
		},
		false
	);

	// フルスクリーンモードの切り替えが起こった時
	document.addEventListener("fullscreenchange", () => {
		// フルスクリーンモードになった場合に描画をやめる。
		// 主にYouTubeなどの動画サービス用の処理だが、もっと良い処理を考えたい。
		if (document.fullscreenElement) {
			mouseleave = true;
			fullscreen = true;
		} else {
			mouseleave = false;
			fullscreen = false;
		}
	});

	// backgroundからのメッセージを受信
	chrome.runtime.onMessage.addListener((request) => {
		// 移動してるページのみ描画する
		if (location.href === request) {
			mouseleave = false;
		} else {
			mouseleave = true;
		}
	});

	pointer();
})();
