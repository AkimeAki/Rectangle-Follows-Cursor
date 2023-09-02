export let shapeColor = "#fff9c4";

export let shapeStatus = "normal"; // 四角いのの状態記憶用変数
export let target = null;
export let pointerTarget = null; // ポインター時のターゲット
export let clientX = 0;
export let clientY = 0;
export let oldClientX = clientX;
export let oldClientY = clientY;
export let scrollTimerId = 0; // スクロール中を判定するタイマーID
export let isScroll = false;
export let toNormalShapeTimerId = 0; // ノーマル状態に変化するまでの余裕をもたせるためのタイマーID
export let cursorInWindow = true; // カーソルが画面内かどうか
export let activeFrame = false; // 現在のフレームにカーソルがあるかどうか
export let pointerMode = "2"; // ポインター状態のモード
export let beforeTransitionShapeRotate = null; // 遷移前の角度
export let beforeTransitionShapeTransform = null; // 遷移前の変形
