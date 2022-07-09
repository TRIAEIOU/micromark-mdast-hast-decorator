interface DecoratorConfig {
    symbol: string; // syntaxFromMarkdown, mdastToMarkdown
    code: number; // syntaxFromMarkdown
    type: string;  // syntaxFromMarkdown, mdastFromMarkdown
    htmlTag: string
}

export { DecoratorConfig };