'use client';

import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type Props = {
  enfaString: string;
  highlightCount?: number;
};

export default function ENFAGraph({ enfaString, highlightCount = 0 }: Props) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const { dot } = parseENFAToDot(enfaString, highlightCount);
      const svg = await graphviz.layout(dot, 'svg', 'dot');
      if (isMounted) setSvg(svg);
    })();

    return () => {
      isMounted = false;
    };
  }, [enfaString, highlightCount]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function parseENFAToDot(raw: string, highlightCount = 0): { dot: string } {
  const segments = raw
    .split(',')
    .map(seg => seg.trim())
    .filter(Boolean);

  const transitions: Array<{ from: string; to: string; label: string }> = [];
  let startState: string | null = null;
  const finalStates = new Set<string>();

  for (const seg of segments) {
    const hasStart = seg.includes('[start]');
    const hasEnd = seg.includes('[end]');
    const cleaned = seg.replace('[start]', '').replace('[end]', '').trim();
    const parts = cleaned.split('-').map(p => p.trim()).filter(Boolean);

    for (let i = 0; i < parts.length - 2; i += 2) {
      transitions.push({ from: parts[i], to: parts[i + 2], label: parts[i + 1] });
    }

    if (hasStart && parts.length > 0) {
      startState = parts[0];
    }

    if (hasEnd && parts.length > 0) {
      finalStates.add(parts[parts.length - 1]);
    }
  }

  const allStates = new Set<string>();
  transitions.forEach(({ from, to }) => {
    allStates.add(from);
    allStates.add(to);
  });

  const dotLines: string[] = [];
  dotLines.push('digraph ENFA {');
  dotLines.push('  rankdir=LR;');
  dotLines.push('  node [shape=circle];');
  dotLines.push('  start [shape=plaintext label=""];');

  if (startState) {
    dotLines.push(`  start -> "${startState}" [label="start"];`);
  }

  // Draw all states
  allStates.forEach(state => {
    const shape = finalStates.has(state) ? 'doublecircle' : 'circle';
    dotLines.push(`  "${state}" [shape=${shape}];`);
  });

  // Draw transitions
  transitions.forEach(({ from, to, label }, idx) => {
    const color = idx < highlightCount ? 'red' : 'black';
    dotLines.push(`  "${from}" -> "${to}" [label="${label}", color=${color}];`);
  });

  dotLines.push('}');

  return { dot: dotLines.join('\n') };
}
