#!bin/bash
read -s -p "Enter circuit name: " circuit
echo "${circuit}.circom"
# compiles the circuit to --c r1cs --wasm --sym
circom "${circuit}.circom" --r1cs --wasm --sym --c

# Genarates a witness by using wasm
node "${circuit}_js/generate_witness.js" "${circuit}_js/${circuit}.wasm" input.json witness.wtns

# First we start a new "powers of tua" ceremony
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Then, we contribute to the ceremony:
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="first contribution" -v

#phase 2
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# generate Zk file
snarkjs groth16 setup "${circuit}.r1cs" pot12_final.ptau "${circuit}_0000.zkey"

# Contribute to phase2 ceremony
snarkjs zkey contribute "${circuit}_0000.zkey" "${circuit}_0001.zkey" --name="1st contribution" -v

# export verification key
snarkjs zkey export verificationkey "${circuit}_0001.zkey" verification_key.json

# Generate proof
snarkjs groth16 prove "${circuit}_0001.zkey" witness.wtns proof.json public.json

# Verify the proof
snarkjs groth16 verify verification_key.json public.json proof.json

# Generate Solidity code
snarkjs zkey export solidityverifier "${circuit}_0001.zkey" verifier.sol

#generate The call for the solidty
snarkjs generatecall 