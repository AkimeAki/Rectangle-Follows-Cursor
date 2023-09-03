import { getPointerElement } from "@/lib";
import { normalShape } from "@/shape/normal";
import { pointer1 } from "@/shape/pointer-1";
import { pointer2 } from "@/shape/pointer-2";
import { pointer4 } from "@/shape/pointer-4";
import { hash, className, pointerMode } from "@/define";
import type { BeforeTransitionShape, ShapeTransform } from "@/interface";

const start = (shapeColor = "#fff9c4") => {
	const cursor = document.createElement("span");
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
	let isTransitionAnimationEnd = true;
	cursor.addEventListener("animationend", () => {
		isTransitionAnimationEnd = true;
	});

	let shapeStatus: "normal" | "pointer" = "normal";
	let target: HTMLElement | null = null;
	let pointerTarget: HTMLElement | null = null; // ポインター時のターゲット
	let clientX = 0;
	let clientY = 0;
	let oldClientX = clientX;
	let oldClientY = clientY;
	let loopCount = 0; // ループカウント
	let sendBGMessageCount = 0; // backgroundにメッセージを送る際の間引く用カウント
	let cursorAfkTimerId = 0; // カーソルを放置時間を測るタイマーID
	let scrollTimerId = 0; // スクロール中を判定するタイマーID
	let isScroll = false;
	let toNormalShapeTimerId = 0; // ノーマル状態に変化するまでの余裕をもたせるためのタイマーID
	let cursorAfk = true; // カーソルを放置しているかどうか
	let cursorInWindow = true; // カーソルが画面内かどうか
	let activeFrame = false; // 現在のフレームにカーソルがあるかどうか
	const beforeTransitionShape: BeforeTransitionShape = {
		rotate: null, // 遷移前の角度
		transform: null // 遷移前の変形
	};
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
			if (!cursorAfk && cursorAfkTimerId === 0) {
				cursorAfkTimerId = window.setTimeout(() => {
					cursorAfk = true;
				}, 5000);
			}
		} else {
			cursorAfk = false;
			clearTimeout(cursorAfkTimerId);
			cursorAfkTimerId = 0;
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

		const currentRotate = Number(getComputedStyle(cursor).getPropertyValue("rotate").replace("deg", ""));

		if (beforeTransitionShape.rotate === null) {
			beforeTransitionShape.rotate = currentRotate;
		}

		if (beforeTransitionShape.transform === null) {
			beforeTransitionShape.transform = Number(getComputedStyle(cursor).getPropertyValue("transform"));
		}

		const {
			x: shapeX,
			y: shapeY,
			style: shapeTransformStyle
		} = ((): ShapeTransform => {
			if (shapeStatus === "pointer" && pointerTarget !== null) {
				if (pointerMode === "1") {
					if (isScroll) {
						return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
					}

					pointerTarget = getPointerElement(pointerTarget, true);

					const rect = pointerTarget.getBoundingClientRect();
					if (rect.right - rect.left <= 1 || rect.bottom - rect.top <= 1) {
						return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
					}

					return pointer1(pointerTarget, isTransitionAnimationEnd, beforeTransitionShape);
				} else if (pointerMode === "2") {
					return pointer2(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
				} else if (pointerMode === "3") {
					return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
				} else if (pointerMode === "4") {
					if (isScroll) {
						return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
					}

					pointerTarget = getPointerElement(pointerTarget, true);

					const rect = pointerTarget.getBoundingClientRect();
					if (rect.right - rect.left <= 1 || rect.bottom - rect.top <= 1) {
						return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
					}

					return pointer4(pointerTarget, isTransitionAnimationEnd, beforeTransitionShape);
				}
			}

			return normalShape(clientX, clientY, isTransitionAnimationEnd, beforeTransitionShape);
		})();

		Object.keys(beforeTransitionShape).forEach((beforeStyle) => {
			const style = beforeStyle as keyof BeforeTransitionShape;
			if (beforeTransitionShape[style] === null) {
				beforeTransitionShape[style] = null;
			}
		});

		// 追従
		cursor.style.top = `${shapeY}px`;
		cursor.style.left = `${shapeX}px`;

		// スタイル変更
		if (changeStyle.innerHTML !== shapeTransformStyle) {
			changeStyle.innerHTML = shapeTransformStyle;
		}

		if (getComputedStyle(target).cursor === "pointer" && pointerMode !== "3") {
			// カーソルがポインターなのでノーマル状態に遷移するまでのタイマーをリセット
			clearTimeout(toNormalShapeTimerId);
			toNormalShapeTimerId = 0;
			pointerTarget = target;

			if (shapeStatus !== "pointer") {
				isTransitionAnimationEnd = false;
			}

			// 四角いのをポインター状態にする
			shapeStatus = "pointer";
		} else {
			if (toNormalShapeTimerId === 0) {
				toNormalShapeTimerId = window.setTimeout(() => {
					if (shapeStatus !== "normal") {
						isTransitionAnimationEnd = false;
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
			target = event.target as HTMLElement;
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

			scrollTimerId = window.setTimeout(() => {
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

	pointer();
};

chrome.storage.sync.get(["shapeColor"], (value) => {
	start(value.shapeColor);
});
