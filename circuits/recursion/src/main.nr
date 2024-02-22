use dep::std;

fn main(verification_key: [Field; 114], proof: [Field; 93], key_hash: pub Field) {
    std::verify_proof(verification_key.as_slice(), proof.as_slice(), [], key_hash);

    std::verify_proof(verification_key.as_slice(), proof.as_slice(), [], key_hash);
}
