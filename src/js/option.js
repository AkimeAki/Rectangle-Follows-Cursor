(() => {
	let pointerMode = "2";
	let shapeColor = "#fff9c4";
	const saveButton = document.querySelector("#save-button");
	const pointerModeNodes = document.querySelectorAll('input[name="pointer-mode"]');
	const shapeColorNode = document.querySelector("#shape-color");
	const defaultShapeColorNode = document.querySelector('input[name="default-shape-color"]');

	chrome.storage.sync.get(["pointerMode", "shapeColor"], (value) => {
		if (value.pointerMode !== undefined) {
			pointerMode = value.pointerMode;
		}

		if (value.shapeColor === undefined || value.shapeColor === shapeColor) {
			defaultShapeColorNode.checked = true;
		} else {
			defaultShapeColorNode.checked = false;
		}

		if (value.shapeColor !== undefined) {
			shapeColor = value.shapeColor;
		}

		pointerModeNodes.forEach((node) => {
			if (node.value === pointerMode) {
				node.checked = true;
			}
			node.disabled = false;
		});

		shapeColorNode.value = shapeColor;
		shapeColorNode.disabled = false;
		defaultShapeColorNode.disabled = false;

		saveButton.disabled = false;
	});

	saveButton.addEventListener(
		"click",
		() => {
			pointerModeNodes.forEach((node) => {
				if (node.checked) {
					pointerMode = node.value;
				}
			});
			if (defaultShapeColorNode.checked) {
				shapeColor = defaultShapeColorNode.value;
				shapeColorNode.value = shapeColor;
			} else {
				shapeColor = shapeColorNode.value;
			}
			const options = { pointerMode: pointerMode, shapeColor: shapeColor };

			chrome.storage.sync.set(options);
		},
		false
	);
})();
