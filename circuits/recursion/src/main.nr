use dep::std;

fn main(verification_key: [Field; 114], key_hash: pub Field, proof: [Field; 93]) {
    std::verify_proof(verification_key.as_slice(), proof.as_slice(), [], key_hash);
    std::verify_proof(verification_key.as_slice(), proof.as_slice(), [], key_hash);
    std::verify_proof(verification_key.as_slice(), proof.as_slice(), [], key_hash);
}
