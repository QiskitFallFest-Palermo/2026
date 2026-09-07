from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

# Create a 2-qubit circuit
qc = QuantumCircuit(2)

# Create a Bell state
qc.h(0)
qc.cx(0, 1)

# Measure all qubits
qc.measure_all()

# Display the circuit
qc.draw("mpl", style="iqp-dark")

# Sampler V2
sampler = StatevectorSampler()

# Run the circuit
job = sampler.run([qc])

# Retrieve the result
result = job.result()

# Get measurement counts
counts = result[0].data.meas.get_counts()

print(counts)
