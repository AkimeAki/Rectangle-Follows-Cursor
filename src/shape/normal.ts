import { hash, className, pointerMode } from "@/define";
import type { ShapeTransform, BeforeTransitionShape } from "@/interface";

export const normalShape = (
	cursorX: number,
	cursorY: number,
	isTransitionAnimationEnd: boolean,
	beforeTransitionShape: BeforeTransitionShape
): ShapeTransform => {
	let style = "";

	if (!isTransitionAnimationEnd) {
		if (pointerMode === "4") {
			// 遷移アニメーション

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
						transform: ${beforeTransitionShape.transform ?? 0};
						rotate: ${beforeTransitionShape.rotate ?? 0}deg;
					}

					50% {
						transform: ${beforeTransitionShape.transform ?? 0};
						rotate: ${beforeTransitionShape.rotate ?? 0}deg;
					}

					100% {
						rotate: ${Math.round((beforeTransitionShape.rotate ?? 0) / 180) * 180 + 45 + 180}deg;;
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
						transform: ${beforeTransitionShape.transform};
						rotate: ${beforeTransitionShape.rotate}deg;
					}

					to {
						rotate: ${Math.round((beforeTransitionShape.rotate ?? 0) / 180) * 180 + 45 + 180}deg;;
						transform: skew(20deg, 20deg);
					}
				}
			`;
		}
	} else {
		// 遷移アニメーション終了後

		style = "";
	}

	const shapeX = cursorX + 27;
	const shapeY = cursorY + 27;
	return { x: shapeX, y: shapeY, style };
};
