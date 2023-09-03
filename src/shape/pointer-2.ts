import { hash, className } from "@/define";
import type { BeforeTransitionShape, ShapeTransform } from "@/interface";

export const pointer2 = (
	cursorX: number,
	cursorY: number,
	isTransitionAnimationEnd: boolean,
	beforeTransitionShape: BeforeTransitionShape
): ShapeTransform => {
	let style = "";

	if (!isTransitionAnimationEnd) {
		// 遷移アニメーション

		style = /* css */ `
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
					transform: ${beforeTransitionShape.transform ?? 0};
					rotate: ${beforeTransitionShape.rotate ?? 0}deg;
				}

				to {
					rotate: ${Math.round((beforeTransitionShape.rotate ?? 0) / 180) * 180}deg;
					transform: skew(0);
				}
			}
		`;
	} else {
		// 遷移アニメーション終了後

		style = /* css */ `
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
	}

	const shapeX = cursorX - 25;
	const shapeY = cursorY - 25;
	return { x: shapeX, y: shapeY, style };
};
