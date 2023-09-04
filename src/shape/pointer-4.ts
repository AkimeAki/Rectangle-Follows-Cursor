import { hash, className } from "@/define";
import type { BeforeTransitionShape, ShapeTransform } from "@/interface";

export const pointer4 = (
	isTransitionAnimationEnd: boolean,
	beforeTransitionShape: BeforeTransitionShape,
	rect: { top: number; bottom: number; left: number; right: number }
): ShapeTransform => {
	let style = "";

	const margin = 5;
	const width = rect.right - rect.left + margin * 2;
	const height = rect.bottom - rect.top + margin * 2;

	if (!isTransitionAnimationEnd) {
		// 遷移アニメーション

		style = /* css */ `
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
					transform: ${beforeTransitionShape.transform ?? 0};
					rotate: ${beforeTransitionShape.rotate ?? 0}deg;
				}

				10% {
					rotate: ${Math.round((beforeTransitionShape.rotate ?? 0) / 180) * 180}deg;
					transform: skew(0);
				}

				100% {
					rotate: ${Math.round((beforeTransitionShape.rotate ?? 0) / 180) * 180}deg;
					transform: skew(0);
				}
			}
		`;
	} else {
		// 遷移アニメーション終了後

		style = /* css */ `
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
	}

	const shapeX = rect.left + (rect.right - rect.left) / 2;
	const shapeY = rect.top + (rect.bottom - rect.top) / 2;

	return { x: shapeX, y: shapeY, style };
};
