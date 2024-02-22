import { BarretenbergBackend, CompiledCircuit } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import assert from "assert";

class Program {
  compiledCircuit: CompiledCircuit;
  backend: BarretenbergBackend;
  noir: Noir;

  constructor(circuitName: string) {
    this.compiledCircuit = require(getCircuitCompilation(circuitName)) as CompiledCircuit;
    this.backend = new BarretenbergBackend(this.compiledCircuit, { threads: 8 });
    this.noir = new Noir(this.compiledCircuit, this.backend);
  }
}

function getCircuitCompilation(circuit: string): string {
  return `${process.cwd()}/circuits/${circuit}/target/${circuit}.json`;
}

async function callEqualityProof() {
  const program = new Program("equality");

  const proof = await program.noir.generateFinalProof({ x: 1, y: 1 });
  const verification = await program.noir.verifyFinalProof(proof);

  return verification;
}


async function callRecursionProof() {
  const equalityProgram = new Program("equality");

  const { witness: equalityWitness } = await equalityProgram.noir.execute({ x: 1, y: 1 });
  const equalityProof = await equalityProgram.backend.generateIntermediateProof(equalityWitness);
  const equalityVerified = await equalityProgram.backend.verifyIntermediateProof(equalityProof);
  assert.equal(equalityVerified, true);

  const { proofAsFields: equalityProofAsFields, vkAsFields: equalityVkAsFields, vkHash: equalityVkHash } = await equalityProgram.backend.generateIntermediateProofArtifacts(equalityProof, equalityProof.publicInputs.length);

  // verification_key: [Field; 114], proof: [Field; 93], key_hash: pub Field
  const recursionInputs = {
    verification_key: equalityVkAsFields,
    key_hash: equalityVkHash,
    proof: equalityProofAsFields,
  };

  const recursionProgram = new Program("recursion");
  const { witness: recursionWitness } = await recursionProgram.noir.execute(recursionInputs);
  const recursionProof = await recursionProgram.backend.generateFinalProof(recursionWitness);
  const recursionVerified = await recursionProgram.backend.verifyFinalProof(recursionProof);

  return recursionVerified;
}

async function main() {
  console.log(`equality circuit: ${await callEqualityProof()}`);
  console.log(`recursion circuit: ${await callRecursionProof()}`);
}

main().then(() => {
  console.log("Finished");
}).catch(err => {
  console.log(`Error: ${err}`);
});