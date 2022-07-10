import type {Extension as Mm_Extension, HtmlExtension} from 'micromark-util-types';
import type {Extension as Mdast_Extension} from 'mdast-util-from-markdown';
import type {Options as Mdast_Options} from 'mdast-util-to-markdown/lib/types';
import type {Parent, PhrasingContent} from 'mdast';

interface Decoration extends Parent {
    type: string;
    children: PhrasingContent[];
}

interface Decorator {
    mdParserSyntax: Mm_Extension,
    mdastNodeInsertion: Mdast_Extension,
    mdastNodeSerialization: Mdast_Options,
    mdastToHast: object,
    hastToMdast: object,
    insertHtmlTag: HtmlExtension,
    htmlNode: string
}

interface DecoratorConfig {
    mdSymbol: string;
    mdNode: string;
    htmlNode: string;
}

interface _DecoratorConfig extends DecoratorConfig {
    code: number;
    sequence: string;
    tempSequence: string;
    typeText: string;
    symbolLen: number;
}

export { Decoration, Decorator, DecoratorConfig, _DecoratorConfig };