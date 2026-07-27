import { Fragment, type ReactNode } from "react";

// Formatação simples digitada pelo admin na descrição: **negrito**, >destaque<
// (podendo aninhar um dentro do outro, ex: >**texto**< ou **>texto<**) e uma
// linha começando com "* " (um asterisco só, não "**") vira item de lista,
// com o "*" trocado por "•". Nunca usa dangerouslySetInnerHTML — só monta
// elementos React a partir do texto.

const BULLET_LINE_PATTERN = /^\*(?!\*)\s+(.*)$/;

function parseRange(
  text: string,
  start: number,
  end: number,
  keyPrefix: string,
  counter: { n: number },
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = start;
  let plainStart = start;

  while (i < end) {
    if (text.startsWith("**", i)) {
      const closeIdx = text.indexOf("**", i + 2);
      if (closeIdx !== -1 && closeIdx < end) {
        if (i > plainStart) nodes.push(text.slice(plainStart, i));
        const inner = parseRange(text, i + 2, closeIdx, keyPrefix, counter);
        nodes.push(
          <strong key={`${keyPrefix}-${counter.n++}`} className="font-bold">
            {inner}
          </strong>,
        );
        i = closeIdx + 2;
        plainStart = i;
        continue;
      }
    } else if (text[i] === ">") {
      const closeIdx = text.indexOf("<", i + 1);
      if (closeIdx !== -1 && closeIdx < end) {
        if (i > plainStart) nodes.push(text.slice(plainStart, i));
        const inner = parseRange(text, i + 1, closeIdx, keyPrefix, counter);
        nodes.push(
          <span
            key={`${keyPrefix}-${counter.n++}`}
            className="inline-block rounded-brand bg-brand-gray-100 px-2 py-0.5 text-brand-black"
          >
            {inner}
          </span>,
        );
        i = closeIdx + 1;
        plainStart = i;
        continue;
      }
    }
    i++;
  }

  if (plainStart < end) nodes.push(text.slice(plainStart, end));
  return nodes;
}

function parseLine(line: string, keyPrefix: string): ReactNode[] {
  const bulletMatch = BULLET_LINE_PATTERN.exec(line);
  if (bulletMatch) {
    const rest = bulletMatch[1];
    return [
      <span key={`${keyPrefix}-bullet`} className="mr-1.5">
        •
      </span>,
      ...parseRange(rest, 0, rest.length, keyPrefix, { n: 0 }),
    ];
  }

  return parseRange(line, 0, line.length, keyPrefix, { n: 0 });
}

export function FormattedDescription({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");

  return (
    <p className={className}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {parseLine(line, `l${i}`)}
        </Fragment>
      ))}
    </p>
  );
}
