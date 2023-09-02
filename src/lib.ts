export const getPointerElement = (
	element: HTMLElement,
	checkHref = false,
	savedLinkElement?: HTMLElement
): HTMLElement => {
	if (
		element.parentElement !== null &&
		getComputedStyle(element.parentElement).getPropertyValue("cursor") === "pointer"
	) {
		// aタグのhrefが違う場合、内側のhrefを採用するかどうか
		if (checkHref) {
			// 対象の要素にhrefがある時
			if ((element as HTMLLinkElement).href !== undefined) {
				// 対象の要素にあるhrefと記録されている最後のhrefが違う時は記録されている最後のhrefを返す
				if (
					savedLinkElement !== undefined &&
					(savedLinkElement as HTMLLinkElement).href !== undefined &&
					(element as HTMLLinkElement).href !== (savedLinkElement as HTMLLinkElement).href
				) {
					return savedLinkElement;
				}

				// 対象の要素にあるhrefと記録されている最後のhrefが一致、もしくは要素が記録されていない場合は対象の要素を記録して実行
				return getPointerElement(element.parentElement, checkHref, element);
			}

			// 対象の要素にhrefがない時は記録されている要素をそのまま残し実行
			return getPointerElement(element.parentElement, checkHref, savedLinkElement);
		} else {
			return getPointerElement(element.parentElement);
		}
	}

	// aタグのhrefが違う時は内側のhrefを採用する場合
	if (checkHref && savedLinkElement !== undefined) {
		// 記録している要素のhrefが存在する場合だけ処理
		if ((savedLinkElement as HTMLLinkElement).href !== undefined) {
			// 対象の要素にhrefがない場合、もしくは対象の要素と記録している要素のhrefが一致していない場合は記録している要素を返す
			if ((element as HTMLLinkElement).href === undefined) {
				return savedLinkElement;
			} else if ((element as HTMLLinkElement).href !== (savedLinkElement as HTMLLinkElement).href) {
				return savedLinkElement;
			}
		}
	}

	return element;
};
