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
  const seenTransitions = new Set<string>();

  const regex = /delta\((\w+),\s*([\wε&]),\s*(\w)\)\s*->\s*\((\w+),\s*(\w+)\)/;

  let initialState: string | null = null;

  transitions.forEach((line, idx) => {
    const match = line.match(regex);
    if (!match) return;

    const [_, from, input, stack, to, action] = match;

    // Check for duplicate transition key
    const transitionKey = `${from}->${to}|${input},${stack}/${action}`;
    if (seenTransitions.has(transitionKey)) return;
    seenTransitions.add(transitionKey);

    if (!initialState) initialState = from; // first seen state as initial

    const isHighlighted = idx < highlightCount;
    const color = isHighlighted ? 'yellow' : 'black';
    const fill = isHighlighted ? 'yellow' : 'white';

    states.add(from);
    states.add(to);

    if (!(from in nodeStyles)) nodeStyles[from] = fill;
    if (!(to in nodeStyles)) nodeStyles[to] = fill;
    if (isHighlighted) nodeStyles[to] = 'yellow';

    const edgeLabel = `${input}, ${stack} / ${action}`;
    edgeDefs.push(`  "${from}" -> "${to}" [label="${edgeLabel}", color=${color}];`);
  });

  // Apply node styles
  for (const [state, fill] of Object.entries(nodeStyles)) {
    dot += `  "${state}" [style=filled, fillcolor="${fill}"];\n`;
  }

  // Add arrow to initial state
  if (initialState) {
    dot += `  "" [shape=none, label=""];\n`;
    dot += `  "" -> "${initialState}";\n`;
  }

  dot += edgeDefs.join('\n') + '\n';
  dot += '}\n';

  return dot;
}

