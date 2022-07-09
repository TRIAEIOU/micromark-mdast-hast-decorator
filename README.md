*** ALL CREDIT TO TITUS WORMER (<https://github.com/wooorm>) FOR ORIGINAL CODE ***

Generalization of woorm's code in micromark-extension-gfm-strikethrough to allow easy addition of simple span elements Markdown ⇔ HTML by configuring extensions to micromark, mdast and hast.

Example:
<pre><code>
import { mm_mdastFromMd, mdast_nodeInsertion, DecoratorConfig, mdast_nodeSerialization, mdastToHast as mdastToHastExt, hastToMdast as hastToMdastExt } from './decoration/index';
import { fromMarkdown as parseMdastFromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown as serializeMdastToMarkdown } from 'mdast-util-to-markdown';
import { toHast as mdastToHast } from 'mdast-util-to-hast';
import { toHtml as hastToHtml } from 'hast-util-to-html';
import { fromHtml as hastFromHtml } from 'hast-util-from-html';
import { toMdast as hastToMdast } from 'hast-util-to-mdast';
import { codes } from 'micromark-util-symbol/codes.js';
import type { HastNode } from 'mdast-util-to-hast/lib';
import type { Root } from 'mdast-util-from-markdown/lib';

const superscript: DecoratorConfig = {
    symbol: '^',
    code: codes.caret,
    type: 'superscript',
    htmlTag: 'sup'
};
const subscript: DecoratorConfig = {
    symbol: '~',
    code: codes.tilde,
    type: 'subscript',
    htmlTag: 'sub'
};

const src = 'Some ^superscript^ and ~subscript~ markdown.';
let mdast = parseMdastFromMarkdown(src, {
    extensions: [
        mm_mdastFromMd(superscript),
        mm_mdastFromMd(subscript)
    ],
    mdastExtensions: [
        mdast_nodeInsertion(superscript),
        mdast_nodeInsertion(subscript)
    ]
});
let hast = mdastToHast(mdast, {
    handlers: {
        superscript: mdastToHastExt(superscript),
        subscript: mdastToHastExt(subscript)
    }
});
const html = hastToHtml(<HastNode>hast);
hast = hastFromHtml(html, {fragment: true});
mdast = <Root>hastToMdast(hast, {
    handlers: {
        'sup': hastToMdastExt(superscript),
        'sub': hastToMdastExt(subscript)
    }
});
const dest = serializeMdastToMarkdown(mdast, {
    extensions: [
        mdast_nodeSerialization(superscript),
        mdast_nodeSerialization(subscript)
    ]
});
console.log(`${src} ⇒ ${html} ⇒ ${dest}`);
</code></pre>

Generates `Some ^superscript^ and ~subscript~ markdown. ⇒ <p>Some <sup>superscript</sup> and <sub>subscript</sub> markdown.</p> ⇒ Some ^superscript^ and ~subscript~ markdown.`.
