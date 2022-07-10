import type { HtmlExtension } from 'micromark-util-types';
import type { Element as MdastElement } from 'mdast-util-to-hast/lib';
import type { Decoration, DecoratorConfig } from './types';
import type { H as mdastH } from 'mdast-util-to-hast';
import type { H as hastH } from 'hast-util-to-mdast';
import { all as mdastAll } from 'mdast-util-to-hast/lib/traverse';
import { all as hastAll, MdastNode } from 'hast-util-to-mdast/lib';


function mdastToHast(cfg: DecoratorConfig) {
    return function (h: mdastH, node: Decoration): MdastElement {
        return h(node, cfg.htmlNode, mdastAll(h, node));
    };
}

function hastToMdast(cfg: DecoratorConfig) {
    return function (h: hastH, node: MdastElement): MdastNode {
        return h(node, cfg.mdNode, hastAll(h, node));
    };
}

function insertHtmlTag(cfg: DecoratorConfig): HtmlExtension {
    const tmp = { enter: {}, exit: {} };
    // @ts-ignore
    tmp.enter[cfg.type] = function () { this.tag(`<${cfg.htmlNode}>`); };
    // @ts-ignore
    tmp.exit[cfg.type] = function () { this.tag(`</${cfg.htmlNode}>`); };
    return tmp;
}

export { mdastToHast, hastToMdast, insertHtmlTag };