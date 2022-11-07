pragma circom 2.0.0;

include "../../../lib/circomlib/circuits/mimcsponge.circom";
template bid() {

	signal input tenderId_;
	signal input suppleirId_;
	signal input bidValue;
	signal output hashed;

	component mimc = MiMCSponge(3, 220, 1);
	mimc.ins[0] <== tenderId_;
	mimc.ins[1] <== suppleirId_;
	mimc.ins[2] <== bidValue;
	mimc.k <== 0;
	hashed <== mimc.outs[0];

}

component main {public [tenderId_, suppleirId_, bidValue]} = bid();
//lib/circomlib/circuits/mimcsponge.circom