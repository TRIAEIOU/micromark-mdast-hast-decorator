import { nodeInsertion, nodeSerialization } from './lib/mdast-extension';
import { fromMd } from './lib/micromark-extension';
import type { Decorator, DecoratorConfig, _DecoratorConfig } from './lib/types';
import { hastToMdast, insertHtmlTag, mdastToHast } from './lib/utils';

function createDecoration(cfg: DecoratorConfig): Decorator {
    const _cfg = cfg as _DecoratorConfig;
    _cfg.code = cfg.mdSymbol.charCodeAt(0);
    _cfg.sequence = `${cfg.mdNode}Sequence`;
    _cfg.tempSequence = `${cfg.mdNode}TempSequence`;
    _cfg.typeText = `${cfg.mdNode}Text`;
    _cfg.symbolLen = cfg.mdSymbol.length;

    const out: Decorator = {
        mdParserSyntax: fromMd(_cfg),
        mdastNodeInsertion: nodeInsertion(_cfg),
        mdastNodeSerialization: nodeSerialization(_cfg),
        mdastToHast: {},
        hastToMdast: {},
        insertHtmlTag: insertHtmlTag(_cfg),
        htmlNode: cfg.htmlNode
    };
    out.mdastToHast[_cfg.mdNode] = mdastToHast(_cfg);
    out.hastToMdast[_cfg.htmlNode] = hastToMdast(_cfg);
    return out;
}

export {createDecoration};
