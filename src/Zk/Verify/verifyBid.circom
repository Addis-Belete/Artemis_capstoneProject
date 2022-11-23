pragma circom 2.0.0;

include "../../../lib/circomlib/circuits/mimcsponge.circom";
template bid() {

	signal input tenderId_;
	signal input suppleirId_;
	signal input secretKey;
	signal input bidValue;
	signal output hashed;

	component mimc = MiMCSponge(4, 220, 1);
	mimc.ins[0] <== tenderId_;
	mimc.ins[1] <== suppleirId_;
	mimc.ins[2] <== secretKey;
	mimc.ins[3] <== bidValue;
	mimc.k <== 0;
	hashed <== mimc.outs[0];

}

component main {public [tenderId_, suppleirId_, bidValue]} = bid();
//lib/circomlib/circuits/mimcsponge.circom

// hash of the bid
// add secret value
// open tender close tender 
// generate hash 

