import type { Extension, State, TokenizeContext, Event, Effects, Code } from 'micromark-util-types';
import type { DecoratorConfig } from './types';
import { splice } from 'micromark-util-chunked';
import { classifyCharacter } from 'micromark-util-classify-character';
import { resolveAll } from 'micromark-util-resolve-all';
import { constants } from 'micromark-util-symbol/constants.js';
import { types } from 'micromark-util-symbol/types.js';

function fromMd(cfg: DecoratorConfig): Extension {
  const sequence = `${cfg.type}Sequence`;
  const tempSequence = `${cfg.type}TempSequence`;
  const typeText = `${cfg.type}Text`;

  const tokenizer = {
    tokenize: tokenizeDecoration,
    resolveAll: resolveAllDecoration
  };
  return {
    text: { [cfg.code]: tokenizer },
    insideDecoration: { null: [tokenizer] },
    attentionMarkers: { null: [cfg.code] }
  };

  function resolveAllDecoration(events: Event[], context: TokenizeContext): Event[] {
    let index = -1;

    // Walk through all events.
    while (++index < events.length) {
      // Find a token that can close.
      if (
        events[index][0] === 'enter' &&
        events[index][1].type === tempSequence &&
        events[index][1]._close
      ) {
        let open = index;

        // Now walk back to find an opener.
        while (open--) {
          // Find a token that can open the closer.
          if (
            events[open][0] === 'exit' &&
            events[open][1].type === tempSequence &&
            events[open][1]._open &&
            // If the sizes are the same:
            events[index][1].end.offset - events[index][1].start.offset ===
            events[open][1].end.offset - events[open][1].start.offset
          ) {
            events[index][1].type = sequence;
            events[open][1].type = sequence;

            const decoration = {
              type: cfg.type,
              start: Object.assign({}, events[open][1].start),
              end: Object.assign({}, events[index][1].end)
            };

            const text = {
              type: typeText,
              start: Object.assign({}, events[open][1].end),
              end: Object.assign({}, events[index][1].start)
            };

            // Opening.
            const nextEvents: Event[] = [
              ['enter', decoration, context],
              ['enter', events[open][1], context],
              ['exit', events[open][1], context],
              ['enter', text, context]
            ];

            // Between.
            splice(
              nextEvents,
              nextEvents.length,
              0,
              resolveAll(
                context.parser.constructs.insideSpan.null,
                events.slice(open + 1, index),
                context
              )
            );

            // Closing.
            splice(nextEvents, nextEvents.length, 0, [
              ['exit', text, context],
              ['enter', events[index][1], context],
              ['exit', events[index][1], context],
              ['exit', decoration, context]
            ]);

            splice(events, open - 1, index - open + 3, nextEvents);

            index = open + nextEvents.length - 2;
            break;
          }
        }
      }
    }

    index = -1;

    while (++index < events.length) {
      if (events[index][1].type === tempSequence) {
        events[index][1].type = types.data;
      }
    }

    return events;
  }

  function tokenizeDecoration(effects: Effects, ok: State, nok: State): State {
    // @ts-ignore
    const previous = this.previous;
    // @ts-ignore
    const events = this.events;
    let size = 0;

    return start;

    /** @-type {State} */
    function start(code: Code): State | void {
      if (
        previous === cfg.code &&
        events[events.length - 1][1].type !== types.characterEscape
      ) {
        return nok(code);
      }

      effects.enter(tempSequence);
      return more(code);
    }

    function more(code: Code): State | void {
      const before = classifyCharacter(previous);
      const len = cfg.symbol.length;

      if (code === cfg.code) {
        if (size >= len) return nok(code);
        effects.consume(code);
        size++;
        return more;
      }

      if (size < len) return nok(code);
      const token = effects.exit(tempSequence);
      const after = classifyCharacter(code);
      token._open =
        !after || (after === constants.attentionSideAfter && Boolean(before));
      token._close =
        !before || (before === constants.attentionSideAfter && Boolean(after));
      return ok(code);
    }
  }
}

export { fromMd };