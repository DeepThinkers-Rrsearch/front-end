'use client';

import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type Props = {
  transitionString: string; // Single string input
  highlightCount?: number;
};

export default function PDAGraph({ transitionString, highlightCount = 0 }: Props) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const transitions = extractTransitions(transitionString);
      const dot = generateDot(transitions, highlightCount);
      const svg = await graphviz.layout(dot, 'svg', 'dot');

      if (isMounted) {
        setSvg(svg);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [transitionString, highlightCount]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function extractTransitions(raw: string): string[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('delta'));
}

function generateDot(transitions: string[], highlightCount = 0): string {
  let dot = 'digraph G {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=circle, fontsize=12];\n';
  dot += '  qf [shape=doublecircle];\n';

  const states = new Set<string>(['qf']);
  const nodeStyles: Record<string, string> = {};
  const edgeDefs: string[] = [];

  const regex = /delta\((\w+),\s*([\wε&]),\s*(\w)\)\s*->\s*\((\w+),\s*(\w+)\)/;

  transitions.forEach((line, idx) => {
    const match = line.match(regex);
    if (!match) return;

    const [_, from, input, stack, to, action] = match;
    const isHighlighted = idx < highlightCount;
    const color = isHighlighted ? 'red' : 'black';
    const fill = isHighlighted ? 'red' : 'white';

    states.add(from);
    states.add(to);

    if (!(from in nodeStyles)) nodeStyles[from] = fill;
    if (!(to in nodeStyles)) nodeStyles[to] = fill;
    if (isHighlighted) nodeStyles[to] = 'red';

    const edgeLabel = `${input}, ${stack} / ${action}`;
    edgeDefs.push(`  "${from}" -> "${to}" [label="${edgeLabel}", color=${color}];`);
  });

  for (const [state, fill] of Object.entries(nodeStyles)) {
    dot += `  "${state}" [style=filled, fillcolor="${fill}"];\n`;
  }

  dot += edgeDefs.join('\n') + '\n';
  dot += '}\n';

  return dot;
}
