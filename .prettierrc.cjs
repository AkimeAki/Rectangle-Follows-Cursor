module.exports = {
	singleQuote: false,
	jsxSingleQuote: false,
	printWidth: 120,
	semi: true,
	trailingComma: "none",
	overrides: [
		{
			files: "*.code-workspace",
			options: {
				parser: "json"
			}
		}
	]
};
