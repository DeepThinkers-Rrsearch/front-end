import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type ENFASimulatorProps = {
  dfaString: string;
  isOpen: boolean;
  onClose: () => void;
};

// Updated MinimizedDFAGraph component with simulation support
function DFAGraphWithSimulation({ 
  dfaString, 
  currentState,
  highlightedTransition 
}: {
  dfaString: string;
  currentState?: string;
  highlightedTransition?: { from: string; to: string; label: string } | null;
}) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const dot = generateDotForDFAWithSimulation(
        dfaString, 
        currentState, 
        highlightedTransition
      );
      const svgOutput = await graphviz.layout(dot, 'svg', 'dot');

      if (isMounted) {
        setSvg(svgOutput);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [dfaString, currentState, highlightedTransition]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function generateDotForDFAWithSimulation(
  input: string, 
  currentState?: string,
  highlightedTransition?: { from: string; to: string; label: string } | null
): string {
  const lines = [input];
  const transitions: Array<{ from: string; to: string; label: string }> = [];
  const finalStates = new Set<string>();
  const allStates = new Set<string>();
  let startState: string | null = null;

for (let rawLine of lines) {
  const line = rawLine.trim().replace(/^"+|"+$/g, ''); //remove starting & ending "

  const parts = line.split(';').map(p => p.trim()).filter(Boolean); //Correct split

  for (const part of parts) {
    if (part.startsWith('In:')) {
      const match = part.match(/\{(.*?)\}/);
      if (match) {startState = match[1]; } 
    } else if (part.startsWith('Fi:')) {
      const matches = [...part.matchAll(/\{(.+?)\}/g)];
      matches.forEach(m => finalStates.add(m[1]));
    } else if (part.startsWith('Trn:')) {
      const trns = part.slice(4).split(',').map(t => t.trim()).filter(Boolean);
      for (const t of trns) {
        const match = t.match(/\{(.+?)\}->(.*?)\->\{(.+?)\}/);
        if (match) {
          const [_, from, label, to] = match;
          transitions.push({ from, to, label });
          allStates.add(from);
          allStates.add(to);
        }
      }
    }
    console.log('Parts:', parts);

  }
  if (startState) {
  allStates.add(startState); // ✅ ensures initial state is drawn
}

}

  // Generate DOT
  let dot = 'digraph DFA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=circle, fontsize=12];\n';

  // Start state pointer
  dot += '  init [shape=point, style=invis];\n';
  dot += `  init -> "${startState}";\n`;

  // Nodes with simulation highlighting
  for (const state of allStates) {
    const shape = finalStates.has(state) ? 'doublecircle' : 'circle';
    let fillColor = 'white';
    let penWidth = '1';
    
    // Highlight current state during simulation
    if (currentState === state) {
      fillColor = 'lightblue';
      penWidth = '3';
    }
    
    dot += `  "${state}" [shape=${shape}, style=filled, fillcolor="${fillColor}", penwidth="${penWidth}"];\n`;
  }

  // Edges with simulation highlighting
  transitions.forEach((t) => {
    let color = 'black';
    let penWidth = '1';
    
    // Highlight the transition being taken
    if (highlightedTransition && 
        t.from === highlightedTransition.from && 
        t.to === highlightedTransition.to && 
        t.label === highlightedTransition.label) {
      color = 'red';
      penWidth = '3';
    }
    
    dot += `  "${t.from}" -> "${t.to}" [label="${t.label}", color="${color}", penwidth="${penWidth}"];\n`;
  });

  dot += '}';
  return dot;
}

// Main DFASimulator component with input field
export function ENFASimulator({ 
  dfaString, 
  isOpen, 
  onClose 
}: ENFASimulatorProps) {
  const [inputString, setInputString] = useState("");
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentState, setCurrentState] = useState<string>('');
  const [highlightedTransition, setHighlightedTransition] = useState<{ from: string; to: string; label: string } | null>(null);
  const [simulationPath, setSimulationPath] = useState<Array<{
    state: string;
    transition?: { from: string; to: string; label: string };
    inputChar?: string;
  }>>([]);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [simulationComplete, setSimulationComplete] = useState(false);

// Parse DFA from string
const parseDFA = (dfaString: string) => {
dfaString = dfaString.trim().replace(/^"+|"+$/g, ''); // ✅ Fix here

  const transitions: Array<{ from: string; to: string; label: string }> = [];
  const finalStates = new Set<string>();
  let startState: string | null = null;

  const parts = dfaString.split(';').map(p => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith('In:')) {
      const match = part.match(/In:\{([^}]*)\}/); // more specific
      if (match) startState = match[1];
    } else if (part.startsWith('Fi:')) {
      const matches = [...part.matchAll(/\{([^}]+)\}/g)];
      matches.forEach(m => finalStates.add(m[1]));
    } else if (part.startsWith('Trn:')) {
      const trns = part.slice(4).split(',').map(t => t.trim()).filter(Boolean);
      for (const t of trns) {
        const match = t.match(/\{(.+?)\}->(.*?)\->\{(.+?)\}/);
        if (match) {
          const [_, from, label, to] = match;
          transitions.push({ from, to, label });
        }
      }
    }
  }

  return { transitions, finalStates, startState };
};


  // Start simulation with the input string
  const startSimulation = () => {
    if (!inputString.trim()) {
      alert("Please enter a string to simulate");
      return;
    }

    const { transitions, finalStates, startState } = parseDFA(dfaString);
    
    if (!startState) {
      alert("No start state found in DFA");
      return;
    }

    // Build simulation path
    const path: Array<{
      state: string;
      transition?: { from: string; to: string; label: string };
      inputChar?: string;
    }> = [];
    
    let state = startState;
    path.push({ state });

    // Process each character
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString[i];
      const transition = transitions.find(t => t.from === state && t.label === char);
      
      if (!transition) {
        // No valid transition - rejection
        path.push({ 
          state: 'REJECT', 
          transition: { from: state, to: 'REJECT', label: char },
          inputChar: char 
        });
        break;
      }
      
      path.push({ 
        state: transition.to, 
        transition,
        inputChar: char 
      });
      state = transition.to;
    }

    // Check if final state is accepting
    const finalState = path[path.length - 1].state;
    const accepted = finalState !== 'REJECT' && finalStates.has(finalState) && path.length - 1 === inputString.length;
    
    setSimulationPath(path);
    setCurrentStep(0);
    setCurrentState(startState);
    setHighlightedTransition(null);
    setIsAccepted(accepted);
    setSimulationComplete(false);
    setIsSimulationStarted(true);
  };

  // Reset simulation
  const resetSimulation = () => {
    setIsSimulationStarted(false);
    setInputString("");
    setCurrentStep(0);
    setCurrentState('');
    setHighlightedTransition(null);
    setSimulationPath([]);
    setIsAccepted(null);
    setSimulationComplete(false);
  };

  const simulateForward = () => {
    if (currentStep >= simulationPath.length - 1) {
      setSimulationComplete(true);
      return;
    }

    const nextStep = currentStep + 1;
    const nextPathItem = simulationPath[nextStep];
    
    setCurrentStep(nextStep);
    setCurrentState(nextPathItem.state);
    setHighlightedTransition(nextPathItem.transition || null);
    
    if (nextStep === simulationPath.length - 1) {
      setSimulationComplete(true);
    }
  };

  const simulateBackward = () => {
    if (currentStep <= 0) return;

    const prevStep = currentStep - 1;
    const prevPathItem = simulationPath[prevStep];
    
    setCurrentStep(prevStep);
    setCurrentState(prevPathItem.state);
    setHighlightedTransition(prevStep > 0 ? simulationPath[prevStep].transition || null : null);
    setSimulationComplete(false);
  };

  const getCurrentInputHighlight = () => {
    return Math.max(0, currentStep - 1);
  };

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetSimulation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full sm:w-3/4 md:w-2/3 lg:w-3/4 max-h-[90vh] rounded-2xl shadow-2xl relative overflow-hidden border-t-[6px] border-[#FFD700] bg-[#FFF8DE]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold z-10"
          aria-label="Close"
        >
          ×
        </button>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <div>
            <h1 className="text-2xl font-bold text-[#FFD700] mb-2 tracking-wide">
              DFA Simulation
            </h1>
          </div>
          <br />
          
          {!isSimulationStarted ? (
            // Input Phase
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter a string to simulate on the DFA:
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="e.g., abb, aabbb, etc."
                    className="flex-1 px-4 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        startSimulation();
                      }
                    }}
                  />
                  <button
                    onClick={startSimulation}
                    disabled={!inputString.trim()}
                    className="px-6 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Start Simulation
                  </button>
                </div>
              </div>
              
              {/* Show DFA Graph */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">DFA Structure</h4>
                <DFAGraphWithSimulation 
                  dfaString={dfaString}
                />
              </div>
            </div>
          ) : (
            // Simulation Phase
            <div className="space-y-4">
              {/* Graph Display */}
              <div className="mb-6">
                <DFAGraphWithSimulation 
                  dfaString={dfaString}
                  currentState={currentState}
                  highlightedTransition={highlightedTransition}
                />
              </div>
              
              {/* Input Display */}
              <div className="mb-4">
                <p className="font-mono text-lg tracking-wide bg-white px-4 py-2 rounded border border-[#FFD700] inline-block mr-2">
                  Input String: 
                </p>
                <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm">
                  {inputString.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`${index < getCurrentInputHighlight() ? 'text-green-600 font-bold' : 
                                 index === getCurrentInputHighlight() ? 'text-red-600 font-bold bg-yellow-200' : 
                                 'text-gray-600'}`}
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>

              {/* Current State Display */}
              <div className="mb-4">
                <p className="font-mono text-lg tracking-wide bg-white px-4 py-2 rounded border border-[#FFD700] inline-block mr-2">
                  Current State: 
                </p>
                <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm font-bold">
                  {currentState}
                </p>
              </div>

              {/* Step Information */}
              <div className="mb-4">
                <p className="font-mono text-lg tracking-wide bg-white px-4 py-2 rounded border border-[#FFD700] inline-block mr-2">
                  Step: 
                </p>
                <p className="inline-block rounded-md border border-[#FFD700] bg-[#FFF8DE] px-4 py-2 text-lg font-mono tracking-wide shadow-sm">
                  {currentStep} / {simulationPath.length - 1}
                </p>
              </div>

              {/* Result Display */}
              {simulationComplete && (
                <div className="mb-4">
                  <p className="font-mono text-lg tracking-wide bg-white px-4 py-2 rounded border border-[#FFD700] inline-block mr-2">
                    Result: 
                  </p>
                  <p className={`inline-block rounded-md border px-4 py-2 text-lg font-mono tracking-wide shadow-sm font-bold ${
                    isAccepted 
                      ? 'border-green-500 bg-green-100 text-green-800' 
                      : 'border-red-500 bg-red-100 text-red-800'
                  }`}>
                    {isAccepted ? 'ACCEPTED' : 'REJECTED'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={resetSimulation}
                  className="px-5 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  ← New Input
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={simulateBackward}
                    disabled={currentStep <= 0}
                    className="px-5 py-2 rounded-lg border border-[#FFD700] text-[#8B8000] hover:bg-[#FFECB3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={simulateForward}
                    disabled={simulationComplete}
                    className="px-5 py-2 rounded-lg bg-[#FFD700] text-white font-semibold hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}