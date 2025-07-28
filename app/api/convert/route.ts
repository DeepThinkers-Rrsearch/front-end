import { NextRequest, NextResponse } from "next/server";

// Model types
const MODELS = {
  DFA_MINIMIZATION: "DFA-Minimization",
  REGEX_TO_E_NFA: "Regex-to-ε-NFA",
  E_NFA_TO_DFA: "e_NFA-to-DFA",
  PDA: "PDA",
} as const;

type ModelType = (typeof MODELS)[keyof typeof MODELS];

export async function POST(request: NextRequest) {
  try {
    const { model, input } = await request.json();

    if (!model || !input) {
      return NextResponse.json(
        { error: "Model and input are required" },
        { status: 400 }
      );
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Demo conversion logic based on model type
    let result = "";

    switch (model as ModelType) {
      case MODELS.DFA_MINIMIZATION:
        result = generateDFAMinimizationResult(input);
        break;
      case MODELS.REGEX_TO_E_NFA:
        result = generateRegexToENFAResult(input);
        break;
      case MODELS.E_NFA_TO_DFA:
        result = generateENFAToDFAResult(input);
        break;
      case MODELS.PDA:
        result = generatePDAResult(input);
        break;
      default:
        result = `Conversion completed for model: ${model}\nInput: ${input}`;
    }

    return NextResponse.json({
      result,
      model,
      input,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Conversion API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateDFAMinimizationResult(input: string): string {
  return `DFA Minimization Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input DFA: ${input}

Step 1: Remove unreachable states
Original states: {q0, q1, q2, q3, q4}
Reachable states: {q0, q1, q2, q3}

Step 2: Partition states by equivalence
Partition 1: {q0, q1} (non-accepting)
Partition 2: {q2, q3} (accepting)

Step 3: Generate minimized DFA
States: {A, B} where A={q0,q1}, B={q2,q3}
Transitions:
  δ(A, a) = A
  δ(A, b) = B
  δ(B, a) = A
  δ(B, b) = B

Start state: A
Accepting states: {B}

Reduction: 5 states → 2 states (60% reduction)`;
}

function generateRegexToENFAResult(input: string): string {
  return `Regex to ε-NFA Conversion Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input Regex: ${input}

Generated ε-NFA:
States: {q0, q1, q2, q3, q4, q5}

Transitions:
  δ(q0, ε) = {q1, q3}
  δ(q1, ${input.charAt(0) || "a"}) = {q2}
  δ(q2, ε) = {q5}
  δ(q3, ${input.charAt(1) || "b"}) = {q4}
  δ(q4, ε) = {q5}

Start state: q0
Accepting states: {q5}

ε-closure(q0) = {q0, q1, q3}
Total transitions: 6
ε-transitions: 3`;
}

function generateENFAToDFAResult(input: string): string {
  return `ε-NFA to DFA Conversion Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input ε-NFA: ${input}

Subset Construction Algorithm:

Step 1: Compute ε-closures
ε-closure(q0) = {q0, q1, q2}
ε-closure(q3) = {q3, q4}
ε-closure(q5) = {q5}

Step 2: Construct DFA states
A = {q0, q1, q2}
B = {q3, q4}  
C = {q5}
D = ∅

Step 3: Transition table
       a     b
   A   B     C
   B   D     A
   C   D     D
   D   D     D

Start state: A
Accepting states: {C}

Result: 6 ε-NFA states → 4 DFA states`;
}

function generatePDAResult(input: string): string {
  return `PDA Generation Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: ${input}
Language: L = {a^n b^n | n ≥ 0}

PDA Components:
States: Q = {q0, q1, q2}
Input alphabet: Σ = {a, b}
Stack alphabet: Γ = {Z, A}
Start state: q0
Start stack symbol: Z
Accepting states: F = {q2}

Transition Function δ:
1. δ(q0, a, Z) = {(q0, AZ)}     // Push A for first 'a'
2. δ(q0, a, A) = {(q0, AA)}     // Push A for subsequent 'a's
3. δ(q0, b, A) = {(q1, ε)}      // Pop A for first 'b'
4. δ(q1, b, A) = {(q1, ε)}      // Pop A for subsequent 'b's
5. δ(q1, ε, Z) = {(q2, Z)}      // Accept when stack has only Z

Acceptance: By final state
Stack behavior: LIFO for counting a's and b's`;
}
