*** ALL CREDIT TO TITUS WORMER (<https://github.com/wooorm>) FOR ORIGINAL CODE ***

## Description
Generalization of woorm's code in micromark-extension-gfm-strikethrough to allow easy addition of simple span elements Markdown ⇔ HTML by configuring extensions for micromark, mdast and hast.

## Use
Use the function `createDecoration` with appropriate values to create a set of extensions to be used in the different manipulations. See example below.

Note that symbols consisting of multiple identical characters are accepted (e.g. it is possible to use both `~` for subscript and `~~` for strikethrough at the same time).

## Example
<pre><code>
import {createDecoration} from './src/index';
import {fromMarkdown as parseMdastFromMarkdown} from 'mdast-util-from-markdown';
import {toMarkdown as serializeMdastToMarkdown} from 'mdast-util-to-markdown';
import {toHast as mdastToHast} from 'mdast-util-to-hast';
import {toHtml as hastToHtml} from 'hast-util-to-html';
import {fromHtml as hastFromHtml} from 'hast-util-from-html';
import {toMdast as hastToMdast} from 'hast-util-to-mdast';
import type {HastNode} from 'mdast-util-to-hast/lib';
import type {Root} from 'mdast-util-from-markdown/lib';

const superscript = createDecoration({
    mdSymbol: '^',
    mdNode: 'superscript',
    htmlNode: 'sup'
})

const subscript = createDecoration({
    mdSymbol: '~',
    mdNode: 'subscript',
    htmlNode: 'sub'
});

const src = 'Some ^superscript^ and ~subscript~ text.';
let mdast = parseMdastFromMarkdown(src, {
    extensions: [
        superscript.mdParserSyntax,
        subscript.mdParserSyntax
    ],
    mdastExtensions: [
        superscript.mdastNodeInsertion,
        subscript.mdastNodeInsertion
    ]
});
let hast = mdastToHast(mdast, {
    handlers: {
        ...superscript.mdastToHast,
        ...subscript.mdastToHast
    }
});
const html = hastToHtml(<HastNode>hast);
hast = hastFromHtml(html, {fragment: true});
mdast = <Root>hastToMdast(hast, {
    handlers: {
        ...superscript.hastToMdast,
        ...subscript.hastToMdast
    }
});
const dest = serializeMdastToMarkdown(mdast, {
    extensions: [
        superscript.mdastNodeSerialization,
        subscript.mdastNodeSerialization
    ]
});
console.log(`${src} ⇒ ${html} ⇒ ${dest}`);
</code></pre>

Generates `Some ^superscript^ and ~subscript~ text. ⇒ <p>Some <sup>superscript</sup> and <sub>subscript</sub> text.</p> ⇒ Some ^superscript^ and ~subscript~ text.`.
