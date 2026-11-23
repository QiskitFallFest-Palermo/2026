/* Workshop adaptations of IBM Quantum Learning's introductory classroom notebook. */
"use strict";
const lessons = [
  {
    title: "Bits & logic", intro: "A classical bit stores one of two values, 0 or 1. Put bits side by side and their positions give them different weights. In a three-bit number, the positions are worth 4, 2 and 1.",
    example: "In binary, 101 means 1 × 4 + 0 × 2 + 1 × 1 = 5. Try making 6 with the switches. To add two bits, a half-adder uses XOR for the sum (1 when the inputs differ) and AND for the carry (1 when both are 1).",
    widget: "bits",
    questions: [
      ["How many different strings can three bits store?", ["6", "8", "9"], 1, "Each bit doubles the number of possible strings. Multiply 2 × 2 × 2."],
      ["Add the bits 1 and 1. What are the sum and carry bits, in that order?", ["1 and 0", "1 and 1", "0 and 1"], 2, "One plus one is binary 10. The carry is the left digit and the sum is the right digit."]
    ]
  },
  {
    title: "Qubits & measurement", intro: "The symbols |0⟩ and |1⟩ name two basis states. A pure qubit state can be written as α|0⟩ + β|1⟩. The complex numbers α and β are amplitudes. Squaring their magnitudes gives the probabilities of reading 0 and 1.",
    formula: "P(0) = |α|²     P(1) = |β|²     P(0) + P(1) = 1",
    example: "One shot is one run of the circuit. In Qiskit, qc.measure(0, 0) measures q0 in the computational (Z) basis and stores the result in classical bit c0. In an ideal circuit, immediately repeating this measurement gives the same bit. To sample the original probabilities again, prepare the state afresh.",
    questions: [
      ["The magnitude of the |1⟩ amplitude is ½. How often should 1 appear over many fresh trials?", ["About 25%", "About 50%", "Every time"], 0, "Square the magnitude of the amplitude. One half squared is one quarter."],
      ["An ideal Z-basis measurement gives 0. Measure again immediately in the same basis. What do you get?", ["A fresh random bit", "0 with certainty", "Both amplitudes"], 1, "The first measurement leaves the qubit in |0⟩. It stays there until another operation changes it."]
    ]
  },
  {
    title: "Gates & phase", intro: "An ideal quantum gate acts reversibly on one or more qubits. X swaps |0⟩ and |1⟩. H (Hadamard) takes |0⟩ to |+⟩ and |1⟩ to |−⟩. The plus and minus states give the same probabilities in the Z basis, but their relative signs matter.",
    formula: "|+⟩ = (|0⟩ + |1⟩)/√2     |−⟩ = (|0⟩ − |1⟩)/√2",
    example: "H is its own inverse. A second H brings |+⟩ back to |0⟩ and |−⟩ back to |1⟩. Z leaves |0⟩ alone and changes the sign of |1⟩.",
    questions: [
      ["Start at |0⟩ and apply H twice. Which state do you reach?", ["|+⟩", "|1⟩", "|0⟩"], 2, "The first H prepares |+⟩. The second reverses the first."],
      ["How could you tell |+⟩ and |−⟩ apart in one ideal trial?", ["Measure immediately in Z", "Apply H, then measure in Z", "Apply X twice, then measure in Z"], 1, "Choose a gate that converts the relative sign into different measurement outcomes."]
    ]
  },
  {
    title: "Read a circuit", intro: "Read a circuit diagram from left to right. Each quantum wire represents a qubit. Classical wires store measurement results. By default q0 is the top quantum wire. In a two-qubit basis label |q1 q0⟩, q0 is on the right. In a two-bit measurement result c1c0, the right digit is c0. The measure calls tell you which qubit was recorded there.",
    formula: "qc.x(0)     |00⟩  →  |01⟩",
    example: "A controlled-X gate, qc.cx(control, target), flips the target when the control is 1. On each basis state, two CX gates with the same control and target either flip the target twice or leave it alone twice. In both cases the original state is restored.",
    questions: [
      ["A Qiskit result is 10, with q0 measured into c0 and q1 into c1. Which qubit read 1?", ["q0", "q1", "Both"], 1, "The rightmost bit is c0. The leftmost bit is c1."],
      ["Starting from |01⟩, what does qc.cx(0, 1) produce?", ["|11⟩", "|01⟩", "|10⟩"], 0, "q0 is the rightmost 1, so the control activates and flips q1."]
    ]
  },
  {
    title: "Entanglement", intro: "Prepare q0 in |+⟩ and use it as the control of a CX targeting q1, initially |0⟩. This prepares a Bell pair. Its two-qubit state cannot be written as two independent single-qubit states.",
    formula: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2",
    example: "For this ideal Bell pair, measuring both qubits in the Z basis gives 00 or 11, each with probability ½. The results agree in every shot. Changing the plus sign to a minus sign gives a different Bell state with the same Z-basis probabilities.",
    questions: [
      ["Which results appear when you measure this Bell pair in the Z basis?", ["00 and 01", "All four strings equally", "00 and 11"], 2, "Only |00⟩ and |11⟩ have nonzero amplitudes in this state."],
      ["You measured q0 of this pair and obtained 1. What do you predict for q1 in the same basis?", ["Always 1", "Always 0", "Either value equally"], 0, "The joint state has support only on matching pairs."]
    ]
  },
  {
    title: "From problem to circuit", intro: "The IBM notebook builds a reversible half-adder. It keeps the two inputs A and B and adds two fresh |0⟩ wires for sum and carry. Two controlled flips write XOR into the sum wire. A Toffoli (CCX) flips the carry only when both controls are 1.",
    formula: "|carry sum B A⟩     1 + 1  →  |1011⟩",
    example: "IBM’s Qiskit patterns workflow has four steps. Map the problem to a circuit, adapt it to the gates and connections of the target processor (transpilation), execute it, then interpret the results. In the next stage an ideal simulator gives you exact probabilities.",
    questions: [
      ["Which gate writes the carry to a fresh qubit?", ["H", "CX with A as its only control", "CCX with A and B as controls"], 2, "The carry must activate only when both inputs are 1."],
      ["You have mapped the adder to a circuit. What comes next in the four-step workflow?", ["Interpret the results", "Optimize the circuit for the target", "Discard the inputs"], 1, "The order is map, optimize, execute, post-process."]
    ]
  }
];

const challenges = [
  {
    id: "hadamard", title: "A Hadamard gate", goal: "Implement the Hadamard transformation on q0. It must send |0⟩ to |+⟩ and |1⟩ to |−⟩.",
    example: "qc.x(0)  # apply X to qubit 0", note: "A gate call names the operation first and the wire inside the parentheses. Change the example to the gate you need.",
    starter: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(1)\n# Apply your gate to q0 here.\n",
    hints: ["Look back at “Gates & phase” for the gate that prepares |+⟩.", "Qiskit spells Hadamard with a lowercase h.", "Use qc.h(0) on the supplied circuit."]
  },
  {
    id: "bell", title: "Prepare a Bell pair", goal: "Start at |00⟩ and prepare (|00⟩ + |11⟩)/√2. Leave the qubits unmeasured so the grader can check the relative phase.",
    example: "qc.cx(1, 0)  # q1 controls a flip of q0", note: "The first argument is the control. A control in superposition lets the two branches evolve differently.",
    starter: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2)\n# Prepare a superposition, then entangle the qubits.\n",
    hints: ["Create a superposition on one wire first.", "Use that wire as the control of a CX.", "One circuit uses qc.h(0) followed by qc.cx(0, 1)."]
  },
  {
    id: "adder", title: "Build a half-adder", goal: "Use q0 and q1 as inputs. Write their sum (XOR) to q2 and carry (AND) to q3. Both output wires start at |0⟩. Preserve the inputs and their relative phases.",
    example: "qc.ccx(1, 2, 0)  # controls q1 and q2, target q0", note: "The simulator prepares the inputs for you. For the public run it supplies 1 + 1, so the expected output string is 1011.",
    starter: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(4)\n# Write the sum into q2.\n\n# Write the carry into q3.\n",
    hints: ["Flipping the same wire twice restores its original value.", "Apply a CX from each input to the sum wire.", "Use qc.cx(0, 2), qc.cx(1, 2) and qc.ccx(0, 1, 3)."]
  }
];
const teleport = {
  id: "teleport", title: "Reproduce the protocol", goal: "The simulator places an unknown state |ψ⟩ on Alice’s q0. Her second qubit q1 and Bob’s q2 start in |0⟩. Reproduce the diagram so that Bob recovers |ψ⟩. Alice’s two measurement results tell Bob which gates to apply. Each possible pair of results must leave him with the same state Alice started with.",
  starter: "from qiskit import QuantumCircuit\n\nqc = QuantumCircuit(3, 2)\n# Share a Bell pair between q1 and q2.\n\n# Couple Alice’s input to her half of the pair.\n\n# Measure Alice’s wires into c0 and c1.\n\n# Correct Bob’s qubit using Alice’s two bits.\n",
  hints: ["First use H and CX to entangle q1 with q2. Then use q0 as the control of a CX targeting q1 and apply H to q0.", "Measure q0 into c0 and q1 into c1. These are the only wires Alice sends information through after measurement.", "Use with qc.if_test((qc.clbits[1], 1)): above an indented qc.x(2). Use the same pattern with c0 for qc.z(2)."]
};
