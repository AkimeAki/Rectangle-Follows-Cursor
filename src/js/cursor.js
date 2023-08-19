"use strict";

(() => {
	const cursor = document.createElement("span");
	const hash = Date.now();
	const className = `behind-cursor-${hash}`;
	cursor.classList.add(className);
	document.body.appendChild(cursor);

	const style = document.createElement("style");
	const skew = "skew(20deg, 20deg)";
	const normalSize = 20;
	const pointerSize = 50;
	style.innerText = /* css */ `
		.${className} {
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
	let shapeStatus = "normal"; // 四角いのの状態記憶用変数

	// 遷移アニメーション終了時の処理
	cursor.addEventListener("animationend", () => {
		cursor.style.animationName = toAnimationName;
		cursor.style.animationTimingFunction = "";
		cursor.style.animationDirection = "";
		cursor.style.animationDuration = "";
		cursor.style.animationIterationCount = "";
		if (shapeStatus === "pointer") {
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
		if (shapeStatus === "normal") {
			cursor.style.transitionDuration = "200ms";
		}
		toAnimationName = toName;
	};

	let target = null;
	let clientX = 0;
	let clientY = 0;
	let oldClientX = clientX;
	let oldClientY = clientY;
	let count = 0; // ループを間引く用のカウント
	let cursorAfkTimer = 0; // カーソルを放置時間を測るタイマーID
	let toNormalShapeTimerId = 0; // ノーマル状態に変化するまでの余裕をもたせるためのタイマーID
	let cursorAfk = true; // カーソルを放置しているかどうか
	let cursorInWindow = true; // カーソルが画面内かどうか
	let activeFrame = false; // 現在のフレームにカーソルがあるかどうか
	const pointer = () => {
		// 間引く
		if (count > 10) {
			// 移動を検知した際にbackground.jsに合図を送る
			// iframe内で動作した際に他のページでの動作を停止するため、現在動いてるページ検知用の合図
			if (oldClientX !== clientX || oldClientY !== clientY) {
				chrome.runtime.sendMessage(location.href, () => {});
			}

			count = 0;
		}

		// カーソルが放置されているかどうかを検知
		if (oldClientX === clientX && oldClientY === clientY) {
			if (!cursorAfk && cursorAfkTimer === 0) {
				cursorAfkTimer = setTimeout(() => {
					cursorAfk = true;
				}, 5000);
			}
		} else {
			cursorAfk = false;
			clearTimeout(cursorAfkTimer);
			cursorAfkTimer = 0;
		}

		// 過去の座標を保存
		oldClientX = clientX;
		oldClientY = clientY;

		// 以下の条件の時のみ四角いのを描画する
		//  現在のフレームがアクティブである
		//  カーソルがウィンドウの中にいる
		//  カーソルが一定時間放置されていない
		if (activeFrame && cursorInWindow && !cursorAfk && target !== null) {
			cursor.style.opacity = 1;
		} else {
			cursor.style.opacity = 0;

			count++;
			requestAnimationFrame(pointer);

			return;
		}

		// 四角いのの描画位置
		let shapeX = clientX + 27;
		let shapeY = clientY + 27;

		const currentShapeStyle = getComputedStyle(cursor);
		if (getComputedStyle(target).cursor === "pointer") {
			// カーソルがポインターなのでノーマル状態に遷移するまでのタイマーをリセット
			clearTimeout(toNormalShapeTimerId);
			toNormalShapeTimerId = 0;

			// カーソルがポインターなのに四角いのがポインター状態じゃない時にポインター状態への遷移処理を開始
			if (shapeStatus !== "pointer") {
				// 遷移前の形状を記憶
				transform = currentShapeStyle.getPropertyValue("transform");
				cursor.style.setProperty("--currentTransform", transform);

				// 遷移アニメーションを実行
				cursor.style.animationName = `toPointer-${hash}`;
				toAnimation(`pointer-${hash}`);
			}

			// 四角いのをポインター状態にする
			shapeStatus = "pointer";
		} else if (toNormalShapeTimerId === 0) {
			toNormalShapeTimerId = setTimeout(() => {
				// 四角いのの状態変化猶予時間終了後、四角いのがノーマル状態に戻す
				if (shapeStatus !== "normal") {
					// 遷移前の形状を記憶
					transform = currentShapeStyle.getPropertyValue("transform");
					cursor.style.setProperty("--currentTransform", transform);

					// 遷移アニメーションを実行
					cursor.style.animationName = `toMove-${hash}`;
					toAnimation(`move-${hash}`);
				}

				// 四角いのをノーマル状態にする
				shapeStatus = "normal";
			}, 350);
		}

		if (shapeStatus === "pointer") {
			// ポインターモードの時はカーソルに近づける
			shapeX = clientX - pointerSize / 2;
			shapeY = clientY - pointerSize / 2;
		}

		// 追従
		cursor.style.top = `${shapeY}px`;
		cursor.style.left = `${shapeX}px`;

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
		},
		false
	);

	// マウスカーソルが画面外に行った時
	document.body.addEventListener(
		"mouseleave",
		() => {
			cursorInWindow = false;
		},
		false
	);

	// マウスカーソルが画面内に行った時
	document.body.addEventListener(
		"mouseenter",
		() => {
			cursorInWindow = true;
		},
		false
	);

	// backgroundからのメッセージを受信
	chrome.runtime.onMessage.addListener((request) => {
		// 移動してるページのみ描画する
		if (location.href === request) {
			activeFrame = true;
		} else {
			activeFrame = false;
		}
	});

	pointer();
})();
