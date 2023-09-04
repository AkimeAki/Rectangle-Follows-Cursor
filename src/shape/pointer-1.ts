import { hash, className } from "@/define";
import type { BeforeTransitionShape, ShapeTransform } from "@/interface";

export const pointer1 = (
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
				width: ${width}px;
				height: ${height}px;
				rotate: 0deg;
				transform: skew(0);
				transition-duration: 200ms;
				animation-name: none;
			}
		`;
	}

	const shapeX = rect.left - margin;
	const shapeY = rect.top - margin;
	return { x: shapeX, y: shapeY, style };
};
