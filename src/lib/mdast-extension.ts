import { Decoration, DecoratorConfig } from './types';
import type { Extension, Handle as FromHandle } from 'mdast-util-from-markdown';
import { Options, TrackFields, Context, Parent as nodeParent } from 'mdast-util-to-markdown/lib/types';
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js';
import { track } from 'mdast-util-to-markdown/lib/util/track.js';

interface Runtime {
    enter({ type: string, children: Array }, token: FromHandle): void;
    exit(token: FromHandle): void;
}

declare module 'mdast' {
    interface StaticPhrasingContentMap {
        decoration: Decoration;
    }
}

function nodeInsertion(cfg: DecoratorConfig): Extension {
    const tmp = {
        canContainEols: [cfg.mdNode],
        enter: {},
        exit: {}
    };
    tmp.enter[cfg.mdNode] = function (token: FromHandle) { (<Runtime>this).enter({ type: cfg.mdNode, children: [] }, token); };
    tmp.exit[cfg.mdNode] = function (token: FromHandle) { (<Runtime>this).exit(token); };
    return tmp;
}

function nodeSerialization(cfg: DecoratorConfig): Options {
    const tmp = {
        unsafe: [{ character: cfg.mdSymbol[0], inConstruct: 'phrasing' }],
        handlers: {}
    };
    tmp.handlers[cfg.mdNode] = function (node: Decoration, _: nodeParent, context: Context, safeOptions: TrackFields) {
        const tracker = track(safeOptions);
        const exit = context.enter('emphasis');
        let value = tracker.move(cfg.mdSymbol);
        value += containerPhrasing(node, context, {
            ...tracker.current(),
            before: value,
            after: cfg.mdSymbol[0]
        });
        value += tracker.move(cfg.mdSymbol);
        exit();
        return value;
    };
    tmp.handlers[cfg.mdNode]['peek'] = function () { return cfg.mdSymbol[0]; };
    return tmp;
}

export type { Decoration };
export { nodeInsertion, nodeSerialization };