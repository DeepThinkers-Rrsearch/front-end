'use client';

import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type Props = {
  minimizedDfaString: string; 
  highlightCount?: number;
};

export default function MinimizedDFAGraph({ minimizedDfaString , highlightCount = 0}: Props) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const dot = generateDotForMinimizedDFA(minimizedDfaString, highlightCount);
      const svgOutput = await graphviz.layout(dot, 'svg', 'dot');

      if (isMounted) {
        setSvg(svgOutput);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [minimizedDfaString]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function generateDotForMinimizedDFA(input: string , highlightCount = 0): string {
  const lines = [input];
  console.log("Saman",lines);
  const transitions: Array<{ from: string; to: string; label: string }> = [];
  type item = {
    state : string,
    transitions : string[]
  }
  const finalStates = new Set<string>();
  const allStates = new Set<string>();
  let startState: string | null = null;
  let transitonsWithCorrespondingState : Array<item> = []

  for (const line of lines) {
    const parts = line.split(';').map(p => p.trim()).filter(Boolean);
    console.log("john",parts);
    for (const part of parts) {
      if (part.startsWith('in:')) {
        startState = part.replace('in:', '').trim();
      } else if (part.startsWith('fi:')) {
        part
          .replace('fi:', '')
          .split(',')
          .map(s => s.trim())
          .forEach(s => finalStates.add(s));
      } else if (part.includes(':')) {
        const [state, rest] = part.split(':', 2);
        const transitionsList = rest.split(',').map(s => s.trim());

        for (const t of transitionsList) {
          if (!t.includes('-->')) continue;
          const [label, to] = t.split('-->').map(s => s.trim());
          transitions.push({ from: state.trim(), to, label });
          allStates.add(state.trim());
          allStates.add(to);
        }


        const transitionItem : item = {
          state : state,
          transitions : transitionsList
        }
        transitonsWithCorrespondingState.push(transitionItem)
        console.log("Nimal 2",transitionsList,state,typeof(transitionsList));
      }
    }
  }

  console.log("Nimal",finalStates,allStates,startState)
  console.log("Kamal",transitonsWithCorrespondingState);

  // make the transitions in a correct order
  const orederedTransitions = [];
  // for(const transitionItem ){

  // }
  

  // Generate DOT
  let dot = 'digraph DFA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=circle, fontsize=12];\n';

  // Start state pointer
  if (startState) {
    dot += '  start [shape=plaintext, label=""];\n';
    dot += `  start -> "${startState}" [label="start"];\n`;
  }

  const highlightedStates = new Set<string>();
  transitions.slice(0, highlightCount).forEach(t => {
    highlightedStates.add(t.from);
    highlightedStates.add(t.to);
  });

  // Nodes
  for (const state of allStates) {
    const shape = finalStates.has(state) ? 'doublecircle' : 'circle';
        const fillColor = highlightedStates.has(state) ? 'red' : 'white';
    dot += `  "${state}" [shape=${shape}, style=filled, fillcolor="${fillColor}"];\n`;
    // dot += `  "${state}" [shape=${shape}];\n`;
  }

//   // Edges
//   for (const { from, to, label } of transitions) {
//     dot += `  "${from}" -> "${to}" [label="${label}"];\n`;
//   }
  transitions.forEach((t, idx) => {
    const color = idx < highlightCount ? 'red' : 'black';
    dot += `  "${t.from}" -> "${t.to}" [label="${t.label}", color="${color}"];\n`;
  });

  dot += '}';

  return dot;
}
