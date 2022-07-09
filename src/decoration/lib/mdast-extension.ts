import type { Parent, PhrasingContent } from 'mdast';
import type { Extension, Handle as FromHandle } from 'mdast-util-from-markdown';
import { Options, TrackFields, Context, Parent as nodeParent } from 'mdast-util-to-markdown/lib/types';
import { containerPhrasing } from 'mdast-util-to-markdown/lib/util/container-phrasing.js';
import { track } from 'mdast-util-to-markdown/lib/util/track.js';
import { DecoratorConfig } from './types';

interface Decoration extends Parent {
    type: string;
    children: PhrasingContent[];
}

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
        canContainEols: [cfg.type],
        enter: {},
        exit: {}
    };
    tmp.enter[cfg.type] = function (token: FromHandle) { (<Runtime>this).enter({ type: cfg.type, children: [] }, token); };
    tmp.exit[cfg.type] = function (token: FromHandle) { (<Runtime>this).exit(token); };
    return tmp;
}

function nodeSerialization(cfg: DecoratorConfig): Options {
    const tmp = {
        unsafe: [{ character: cfg.symbol[0], inConstruct: 'phrasing' }],
        handlers: {}
    };
    tmp.handlers[cfg.type] = function (node: Decoration, _: nodeParent, context: Context, safeOptions: TrackFields) {
        const tracker = track(safeOptions);
        const exit = context.enter('emphasis');
        let value = tracker.move(cfg.symbol);
        value += containerPhrasing(node, context, {
            ...tracker.current(),
            before: value,
            after: cfg.symbol[0]
        });
        value += tracker.move(cfg.symbol);
        exit();
        return value;
    };
    tmp.handlers[cfg.type]['peek'] = function () { return cfg.symbol[0]; };
    return tmp;
}

export type { Decoration };
export { nodeInsertion, nodeSerialization };