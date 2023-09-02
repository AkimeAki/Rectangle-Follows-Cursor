import { getPointerElement } from "./lib";

const start = () => {
	const cursor = document.createElement("span");
	const hash = Date.now();
	const className = `behind-cursor-${hash}`;
	cursor.classList.add(className);
	document.body.appendChild(cursor);

	const defaultStyle = document.createElement("style");
	defaultStyle.innerHTML = /* css */ `
		.${className} {
			position: fixed;
			display: block;
			border-color: ${shapeColor};
			border-style: solid;
			border-width: 3px;
			box-shadow: 0px 0px 15px -3px ${shapeColor};
			width: 20px;
			height: 20px;
			z-index: 2147483647;
			user-select: none;
			pointer-events: none;
			rotate: 45deg;
			transform: skew(20deg, 20deg);
			transition-property: all;
			transition-timing-function: ease-out;
			transition-duration: 400ms;
			box-sizing: border-box;
			animation-name: normal-animation-${hash};
			animation-duration: 10s;
			animation-iteration-count: infinite;
			animation-direction: alternate;
			animation-timing-function: ease-in-out;
			animation-fill-mode: both;
		}

		@keyframes normal-animation-${hash} {
			0% {
				rotate: 45deg
			}

			25% {
				rotate: 45deg
			}

			75% {
				rotate: 765deg;
			}

			100% {
				rotate: 765deg
			}
		}
	`;

	document.body.appendChild(defaultStyle);

	const changeStyle = document.createElement("style");
	document.body.appendChild(changeStyle);

	// 遷移アニメーション終了時の処理
	let isToAnimationEnd = true;
	cursor.addEventListener("animationend", () => {
		isToAnimationEnd = true;
	});

	let target: HTMLElement | null = null;
	let pointerTarget: HTMLElement | null = null; // ポインター時のターゲット
	let clientX = 0;
	let clientY = 0;
	let oldClientX = clientX;
	let oldClientY = clientY;
	let loopCount = 0; // ループカウント
	let sendBGMessageCount = 0; // backgroundにメッセージを送る際の間引く用カウント
	let cursorAfkTimer = 0; // カーソルを放置時間を測るタイマーID
	let scrollTimerId = 0; // スクロール中を判定するタイマーID
	let isScroll = false;
	let toNormalShapeTimerId = 0; // ノーマル状態に変化するまでの余裕をもたせるためのタイマーID
	let cursorAfk = true; // カーソルを放置しているかどうか
	let cursorInWindow = true; // カーソルが画面内かどうか
	let activeFrame = false; // 現在のフレームにカーソルがあるかどうか
	let pointerMode = "2"; // ポインター状態のモード
	let beforeTransitionShapeRotate: number | null = null; // 遷移前の角度
	let beforeTransitionShapeTransform: number | null = null; // 遷移前の変形
	const pointer = () => {
		// backgroundと通信
		if (sendBGMessageCount > 10) {
			// 移動を検知した際にbackground.jsに合図を送る
			// iframe内で動作した際に他のページでの動作を停止するため、現在動いてるページ検知用の合図
			if (oldClientX !== clientX || oldClientY !== clientY) {
				chrome.runtime.sendMessage(location.href, () => {});
			}

			sendBGMessageCount = 0;
		} else {
			sendBGMessageCount++;
		}

		// 間引く
		if (loopCount > 0) {
			loopCount = 0;
		} else {
			loopCount++;
			requestAnimationFrame(pointer);
			return;
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
			cursor.style.opacity = "1";
		} else {
			cursor.style.opacity = "0";

			requestAnimationFrame(pointer);

			return;
		}

		// 四角いのの描画位置
		let shapeX = 0;
		let shapeY = 0;
		const currentRotate = Number(getComputedStyle(cursor).getPropertyValue("rotate").replace("deg", ""));

		let overrideShapeStatus = null; // 強制的にステータスを変更した場合のステータス

		if (shapeStatus === "pointer" && (pointerMode === "1" || pointerMode === "4")) {
			pointerTarget = getPointerElement(pointerTarget, true);

			const rect = pointerTarget.getBoundingClientRect();
			if (rect.right - rect.left <= 1 || rect.bottom - rect.top <= 1) {
				shapeStatus = "normal";
				overrideShapeStatus = "normal";
			}
		}

		// ポインターモード3は常にノーマルモード
		if (pointerMode === "3") {
			shapeStatus = "normal";
			overrideShapeStatus = "normal";
		}

		// スクロール中の処理
		if (isScroll) {
			if (shapeStatus === "pointer") {
				if (pointerMode === "1" || pointerMode === "4") {
					shapeStatus = "normal";
					overrideShapeStatus = "normal";
				}
			}
		}

		if (shapeStatus === "pointer") {
			if (pointerMode === "1") {
				const margin = 5;
				const pointerTargetRect = pointerTarget.getBoundingClientRect();
				let targetLeft = pointerTargetRect.left;
				let targetTop = pointerTargetRect.top;
				let targetBottom = pointerTargetRect.bottom;
				let targetRight = pointerTargetRect.right;

				const checkChildren = (parent) => {
					if (Array.from(parent.children).length === 0) {
						return;
					}

					if (getComputedStyle(parent).getPropertyValue("overflow") === "hidden") {
						return;
					}

					Array.from(parent.children).forEach((element) => {
						if (Array.from(element.children).length !== 0) {
							checkChildren(element);
						}

						if (getComputedStyle(element).getPropertyValue("display") === "none") {
							return;
						}

						const childRect = element.getBoundingClientRect();
						const childWidth = childRect.right - childRect.left;
						const childHeight = childRect.bottom - childRect.top;

						if (targetBottom < childRect.bottom && childWidth !== 0 && childHeight !== 0) {
							targetBottom = childRect.bottom;
						}

						if (targetRight < childRect.right && childWidth !== 0 && childHeight !== 0) {
							targetRight = childRect.right;
						}

						if (targetTop > childRect.top && childWidth !== 0 && childHeight !== 0) {
							targetTop = childRect.top;
						}

						if (targetLeft > childRect.left && childWidth !== 0 && childHeight !== 0) {
							targetLeft = childRect.left;
						}
					});
				};

				checkChildren(pointerTarget);

				const width = targetRight - targetLeft + margin * 2;
				const height = targetBottom - targetTop + margin * 2;

				if (!isToAnimationEnd) {
					// 遷移アニメーション

					if (beforeTransitionShapeRotate === null) {
						beforeTransitionShapeRotate = currentRotate;
					}

					if (beforeTransitionShapeTransform === null) {
						beforeTransitionShapeTransform = getComputedStyle(cursor).getPropertyValue("transform");
					}

					const style = /* css */ `
						.${className} {
							width: ${width}px;
							height: ${height}px;
							transition-duration: 200ms;
							animation-name: to-pointer-${hash};
							animation-duration: 200ms;
							animation-iteration-count: 1;
							animation-timing-function: linear;
						}

						@keyframes to-pointer-${hash} {
							from {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							to {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180}deg;
								transform: skew(0);
							}
						}
					`;

					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				} else {
					// 遷移アニメーション終了後

					beforeTransitionShapeRotate = null;
					beforeTransitionShapeTransform = null;

					const style = /* css */ `
						.${className} {
							width: ${width}px;
							height: ${height}px;
							rotate: 0deg;
							transform: skew(0);
							transition-duration: 200ms;
							animation-name: none;
						}
					`;

					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				}

				shapeX = targetLeft - margin;
				shapeY = targetTop - margin;
			} else if (pointerMode === "2") {
				if (!isToAnimationEnd) {
					// 遷移アニメーション

					if (beforeTransitionShapeRotate === null) {
						beforeTransitionShapeRotate = currentRotate;
					}

					if (beforeTransitionShapeTransform === null) {
						beforeTransitionShapeTransform = getComputedStyle(cursor).getPropertyValue("transform");
					}

					const style = /* css */ `
						.${className} {
							width: 50px;
							height: 50px;
							transition-duration: 200ms;
							animation-name: to-pointer-${hash};
							animation-duration: 200ms;
							animation-iteration-count: 1;
							animation-timing-function: linear;
						}

						@keyframes to-pointer-${hash} {
							from {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							to {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180}deg;
								transform: skew(0);
							}
						}
					`;

					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				} else {
					// 遷移アニメーション終了後

					beforeTransitionShapeRotate = null;
					beforeTransitionShapeTransform = null;

					const style = /* css */ `
						.${className} {
							transform: skew(0);
							width: 50px;
							height: 50px;
							transition-duration: 200ms;
							animation-name: pointer-${hash};
							animation-duration: 800ms;
							animation-iteration-count: infinite;
							animation-timing-function: linear;
							animation-direction: normal
						}

						@keyframes pointer-${hash} {
							from {
								rotate: 0deg;
							}

							to {
								rotate: 90deg;
							}
						}
					`;
					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				}

				// ポインターモードの時はカーソルに近づける
				shapeX = clientX - cursor.clientWidth / 2;
				shapeY = clientY - cursor.clientHeight / 2;
			} else if (pointerMode === "4") {
				const margin = 5;
				const pointerTargetRect = pointerTarget.getBoundingClientRect();
				let targetLeft = pointerTargetRect.left;
				let targetTop = pointerTargetRect.top;
				let targetBottom = pointerTargetRect.bottom;
				let targetRight = pointerTargetRect.right;

				const checkChildren = (parent) => {
					if (Array.from(parent.children).length === 0) {
						return;
					}

					if (getComputedStyle(parent).getPropertyValue("overflow") === "hidden") {
						return;
					}

					Array.from(parent.children).forEach((element) => {
						if (Array.from(element.children).length !== 0) {
							checkChildren(element);
						}

						if (getComputedStyle(element).getPropertyValue("display") === "none") {
							return;
						}

						const childRect = element.getBoundingClientRect();
						const childWidth = childRect.right - childRect.left;
						const childHeight = childRect.bottom - childRect.top;

						if (targetBottom < childRect.bottom && childWidth !== 0 && childHeight !== 0) {
							targetBottom = childRect.bottom;
						}

						if (targetRight < childRect.right && childWidth !== 0 && childHeight !== 0) {
							targetRight = childRect.right;
						}

						if (targetTop > childRect.top && childWidth !== 0 && childHeight !== 0) {
							targetTop = childRect.top;
						}

						if (targetLeft > childRect.left && childWidth !== 0 && childHeight !== 0) {
							targetLeft = childRect.left;
						}
					});
				};

				checkChildren(pointerTarget);

				const width = targetRight - targetLeft + margin * 2;
				const height = targetBottom - targetTop + margin * 2;

				if (!isToAnimationEnd) {
					// 遷移アニメーション

					if (beforeTransitionShapeRotate === null) {
						beforeTransitionShapeRotate = currentRotate;
					}

					if (beforeTransitionShapeTransform === null) {
						beforeTransitionShapeTransform = getComputedStyle(cursor).getPropertyValue("transform");
					}

					const style = /* css */ `
						.${className} {
							width: ${width}px;
							height: ${height}px;
							translate: -50% -50%;
							transition: width 400ms, height 400ms, top 200ms, left 200ms;
							animation-name: to-pointer-${hash};
							animation-duration: 400ms;
							animation-iteration-count: 1;
							animation-timing-function: linear;
						}

						@keyframes to-pointer-${hash} {
							0% {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							10% {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180}deg;
								transform: skew(0);
							}

							100% {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180}deg;
								transform: skew(0);
							}
						}
					`;

					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				} else {
					// 遷移アニメーション終了後

					beforeTransitionShapeRotate = null;
					beforeTransitionShapeTransform = null;

					const style = /* css */ `
						.${className} {
							width: ${width}px;
							height: ${height}px;
							translate: -50% -50%;
							rotate: 0deg;
							transform: skew(0);
							transition-duration: 200ms;
							animation-name: none;
						}
					`;

					if (changeStyle.innerHTML !== style) {
						changeStyle.innerHTML = style;
					}
				}

				shapeX = targetLeft + (targetRight - targetLeft) / 2;
				shapeY = targetTop + (targetBottom - targetTop) / 2;
			}
		} else if (shapeStatus === "normal") {
			if (!isToAnimationEnd) {
				if (beforeTransitionShapeRotate === null) {
					beforeTransitionShapeRotate = currentRotate;
				}

				if (beforeTransitionShapeTransform === null) {
					beforeTransitionShapeTransform = getComputedStyle(cursor).getPropertyValue("transform");
				}

				// 遷移アニメーション

				let style = "";
				if (pointerMode === "4") {
					style = /* css */ `
						.${className} {
							translate: -50% -50%;
							transition-timing-function: ease-out;
							transition: width 200ms, height 200ms, top 400ms, left 400ms;
							animation-name: to-normal-${hash};
							animation-duration: 400ms;
							animation-iteration-count: 1;
							animation-timing-function: ease-out;
						}

						@keyframes to-normal-${hash} {
							0% {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							50% {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							100% {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180 + 45 + 180}deg;;
								transform: skew(20deg, 20deg);
							}
						}
					`;
				} else {
					style = /* css */ `
						.${className} {
							transition-duration: 400ms;
							transition-timing-function: ease-out;
							animation-name: to-normal-${hash};
							animation-duration: 500ms;
							animation-iteration-count: 1;
							animation-timing-function: ease-out;
						}

						@keyframes to-normal-${hash} {
							from {
								transform: ${beforeTransitionShapeTransform};
								rotate: ${beforeTransitionShapeRotate}deg;
							}

							to {
								rotate: ${Math.round(beforeTransitionShapeRotate / 180) * 180 + 45 + 180}deg;;
								transform: skew(20deg, 20deg);
							}
						}
					`;
				}

				if (changeStyle.innerHTML !== style) {
					changeStyle.innerHTML = style;
				}
			} else {
				// 遷移アニメーション終了後

				beforeTransitionShapeRotate = null;
				beforeTransitionShapeTransform = null;
				if (changeStyle.innerHTML !== "") {
					changeStyle.innerHTML = "";
				}
			}

			shapeX = clientX + 27;
			shapeY = clientY + 27;
		}

		// 追従
		cursor.style.top = `${shapeY}px`;
		cursor.style.left = `${shapeX}px`;

		if (getComputedStyle(target).cursor === "pointer") {
			// カーソルがポインターなのでノーマル状態に遷移するまでのタイマーをリセット
			clearTimeout(toNormalShapeTimerId);
			toNormalShapeTimerId = 0;
			pointerTarget = target;

			if (shapeStatus !== "pointer" && overrideShapeStatus === null) {
				isToAnimationEnd = false;
			}

			// 四角いのをポインター状態にする
			shapeStatus = "pointer";
		} else {
			if (toNormalShapeTimerId === 0) {
				toNormalShapeTimerId = setTimeout(() => {
					if (shapeStatus !== "normal") {
						isToAnimationEnd = false;
					}

					// 四角いのをノーマル状態にする
					shapeStatus = "normal";
				}, 350);
			}
		}

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

	document.addEventListener(
		"wheel",
		() => {
			isScroll = true;

			clearTimeout(scrollTimerId);
			scrollTimerId = 0;

			scrollTimerId = setTimeout(() => {
				isScroll = false;
			}, 350);
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

	chrome.storage.sync.get(["pointerMode"], (value) => {
		if (value.pointerMode !== undefined) {
			pointerMode = value.pointerMode;
		}
	});

	pointer();
};

(() => {
	chrome.storage.sync.get(["shapeColor"], (value) => {
		if (value.shapeColor !== undefined) {
			shapeColor = value.shapeColor;
		}

		start();
	});
})();
