"use strict";

const cursor = document.createElement("span");
cursor.classList.add("behind-cursor");
cursor.dataset.extension = "Aki";
document.body.appendChild(cursor);

let flag = true;
let x = 0;
let y = 0;

document.body.addEventListener("mouseleave", () => {
	flag = false;
}, false);

document.body.addEventListener("mouseenter", () => {
	flag = true;
}, false);

document.addEventListener("mousemove", (event) => {
	x = event.clientX;
	y = event.clientY
}, false);

function position(){
	let mouseX = x + 27;
	let mouseY = y + 27;
	let width = 20;
	let height = 20;
	let rotate = 45;
	let skewX = 20;
	let skewY = 20;
	let duration = 400;

	const elements = document.querySelectorAll(":hover");

	for(let i = 0; i < elements.length; i++){
		if(getComputedStyle(elements[i]).cursor === "pointer"){
			const rect = elements[i].getBoundingClientRect();

			if(rect.right - rect.left > 250 || rect.bottom - rect.top > 250){
				break;
			}

			if(rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom){
				mouseX = rect.left - 5;
				mouseY = rect.top - 5;
				width = rect.right - rect.left + 10;
				height = rect.bottom - rect.top + 10;
				rotate = 0;
				skewX = 0;
				skewY = 0;
				duration = 200;
			}

			break;
		}
	}

	cursor.style.top = `${mouseY}px`;
	cursor.style.left = `${mouseX}px`;
	cursor.style.width = `${width}px`;
	cursor.style.height = `${height}px`;
	cursor.style.transform = `rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg)`;
	cursor.style.transitionDuration = `${duration}ms`;

	requestAnimationFrame(position);
}

position();
