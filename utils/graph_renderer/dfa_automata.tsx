'use client';

import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type Props = {
  dfaString: string; // DFA model output string
  highlightCount?: number; // Optional: highlight first n transitions
};

export default function DFAGraph({ dfaString, highlightCount = 0 }: Props) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const { dot } = parseDFAToDot(dfaString, highlightCount);
      const svg = await graphviz.layout(dot, 'svg', 'dot');

      if (isMounted) setSvg(svg);
    })();

    return () => {
      isMounted = false;
    };
  }, [dfaString, highlightCount]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function parseDFAToDot(raw: string, highlightCount = 0): { dot: string } {
  const parts: Record<string, string> = {};
  raw = raw.trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

  raw.split(';').forEach(section => {
    if (!section) return;
    const [key, value] = section.split(':', 2);
    if (key && value) parts[key.trim()] = value.trim();
  });

  const initialMatch = parts['In']?.match(/\{(.*?)\}/);
  const finalMatches = [...(parts['Fi']?.matchAll(/\{(.*?)\}/g) || [])];
  const finalStates = finalMatches.map(m => m[1]);

  const transitionsRaw = parts['Trn'] || '';
  const transitionList = transitionsRaw
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const transitions: Array<{ from: string; to: string; label: string }> = [];
  const states = new Set<string>();

  transitionList.forEach((t, idx) => {
    const match = t.match(/\{(.*?)\}->(.*?)\->\{(.*?)\}/);
    if (match) {
      const [_, from, label, to] = match;
      transitions.push({ from, to, label });
      states.add(from);
      states.add(to);
    }
  });

  const dotLines: string[] = [];
  dotLines.push('digraph DFA {');
  dotLines.push('  rankdir=LR;');
  dotLines.push('  node [shape=circle];');
  dotLines.push('  init [shape=point, style=invis];');
  
  if (initialMatch?.[1]) {
    dotLines.push(`  init -> "${initialMatch[1]}";`);
  }

  // All states
  for (const state of states) {
    const isFinal = finalStates.includes(state);
    dotLines.push(`  "${state}" [shape=${isFinal ? 'doublecircle' : 'circle'}];`);
  }

  // Transitions with highlighting
  transitions.forEach(({ from, to, label }, idx) => {
    const color = idx < highlightCount ? 'red' : 'black';
    dotLines.push(`  "${from}" -> "${to}" [label="${label}", color=${color}];`);
  });

  dotLines.push('}');

  return { dot: dotLines.join('\n') };
}
