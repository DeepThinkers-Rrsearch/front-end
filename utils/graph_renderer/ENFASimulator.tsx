import { useEffect, useState } from 'react';
import { Graphviz } from '@hpcc-js/wasm';

type ENFASimulatorProps = {
  enfaString: string;
  isOpen: boolean;
  onClose: () => void;
};

// ENFA Graph component with simulation support
function ENFAGraphWithSimulation({ 
  enfaString, 
  currentState,
  highlightedTransition 
}: {
  enfaString: string;
  currentState?: string;
  highlightedTransition?: { from: string; to: string; label: string } | null;
}) {
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const graphviz = await Graphviz.load();
      const dot = generateDotForENFAWithSimulation(
        enfaString, 
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
  }, [enfaString, currentState, highlightedTransition]);

  return (
    <div
      className="border p-4 rounded border-yellow-300 shadow overflow-auto max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function generateDotForENFAWithSimulation(
  input: string, 
  currentState?: string,
  highlightedTransition?: { from: string; to: string; label: string } | null
): string {
  const segments = input
    .split(",")
    .map((seg) => seg.trim())
    .filter(Boolean);

  const transitions: Array<{ from: string; to: string; label: string }> = [];
  let startState: string | null = null;
  const finalStates = new Set<string>();

  for (const seg of segments) {
    const hasStart = seg.includes("[start]");
    const hasEnd = seg.includes("[end]");
    const cleaned = seg.replace("[start]", "").replace("[end]", "").trim();
    const parts = cleaned
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);

    for (let i = 0; i < parts.length - 2; i += 2) {
      transitions.push({
        from: parts[i],
        to: parts[i + 2],
        label: parts[i + 1],
      });
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

  // Generate DOT
  let dot = 'digraph ENFA {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=circle, fontsize=12];\n';

  // Start state pointer
  if (startState) {
    dot += '  start [shape=plaintext, label=""];\n';
    dot += `  start -> "${startState}" [label="start"];\n`;
  }

  // Nodes with simulation highlighting
  for (const state of allStates) {
    const shape = finalStates.has(state) ? 'doublecircle' : 'circle';
    let fillColor = 'white';
    let penWidth = '1';
    
    // Highlight current state during simulation
    if (currentState && currentState.split(',').includes(state)) {
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

// Main ENFASimulator component with input field
export function ENFASimulator({ 
  enfaString, 
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

  // Parse ENFA from string
  const parseENFA = (enfaString: string) => {
    const segments = enfaString
      .split(",")
      .map((seg) => seg.trim())
      .filter(Boolean);

    const transitions: Array<{ from: string; to: string; label: string }> = [];
    const finalStates = new Set<string>();
    let startState: string | null = null;

    for (const seg of segments) {
      const hasStart = seg.includes("[start]");
      const hasEnd = seg.includes("[end]");
      const cleaned = seg.replace("[start]", "").replace("[end]", "").trim();
      const parts = cleaned
        .split("-")
        .map((p) => p.trim())
        .filter(Boolean);

      for (let i = 0; i < parts.length - 2; i += 2) {
        transitions.push({
          from: parts[i],
          to: parts[i + 2],
          label: parts[i + 1],
        });
      }

      if (hasStart && parts.length > 0) {
        startState = parts[0];
      }

      if (hasEnd && parts.length > 0) {
        finalStates.add(parts[parts.length - 1]);
      }
    }

    return { transitions, finalStates, startState };
  };

  // Epsilon closure function for ENFA simulation
  const epsilonClosure = (states: Set<string>, transitions: Array<{ from: string; to: string; label: string }>): Set<string> => {
    const closure = new Set<string>(states);
    let changed = true;

    while (changed) {
      changed = false;
      for (const state of closure) {
        for (const transition of transitions) {
          if (transition.from === state && transition.label === 'ε' && !closure.has(transition.to)) {
            closure.add(transition.to);
            changed = true;
          }
        }
      }
    }

    return closure;
  };

  // Start simulation with the input string
  const startSimulation = () => {
    if (!inputString.trim()) {
      alert("Please enter a string to simulate");
      return;
    }

    const { transitions, finalStates, startState } = parseENFA(enfaString);
    
    if (!startState) {
      alert("No start state found in ENFA");
      return;
    }

    // Build simulation path
    const path: Array<{
      state: string;
      transition?: { from: string; to: string; label: string };
      inputChar?: string;
    }> = [];
    
    // Start with epsilon closure of start state
    let currentStates = epsilonClosure(new Set([startState]), transitions);
    path.push({ state: Array.from(currentStates).join(',') });

    // Process each character
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString[i];
      const nextStates = new Set<string>();

      // For each current state, find transitions on the current character
      for (const state of currentStates) {
        for (const transition of transitions) {
          if (transition.from === state && transition.label === char) {
            nextStates.add(transition.to);
          }
        }
      }

      if (nextStates.size === 0) {
        // No valid transition - rejection
        path.push({ 
          state: 'REJECT', 
          transition: { from: Array.from(currentStates).join(','), to: 'REJECT', label: char },
          inputChar: char 
        });
        break;
      }

      // Take epsilon closure of next states
      const nextStatesWithEpsilon = epsilonClosure(nextStates, transitions);
      path.push({ 
        state: Array.from(nextStatesWithEpsilon).join(','), 
        transition: { from: Array.from(currentStates).join(','), to: Array.from(nextStatesWithEpsilon).join(','), label: char },
        inputChar: char 
      });
      currentStates = nextStatesWithEpsilon;
    }

    // Check if any final state is in current states
    const hasFinalState = Array.from(currentStates).some(state => finalStates.has(state));
    const accepted = hasFinalState && path[path.length - 1].state !== 'REJECT';
    
    setSimulationPath(path);
    setCurrentStep(0);
    setCurrentState(path[0].state); // Set to initial state from path
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
              ε-NFA Simulation
            </h1>
          </div>
          <br />
          
          {!isSimulationStarted ? (
            // Input Phase
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter a string to simulate on the ε-NFA:
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="e.g., 00, 01, 10, 11, etc."
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
              
              {/* Show ENFA Graph */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">ε-NFA Structure</h4>
                <ENFAGraphWithSimulation 
                  enfaString={enfaString}
                />
              </div>
            </div>
          ) : (
            // Simulation Phase
            <div className="space-y-4">
              {/* Graph Display */}
              <div className="mb-6">
                <ENFAGraphWithSimulation 
                  enfaString={enfaString}
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
                  Current States: 
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