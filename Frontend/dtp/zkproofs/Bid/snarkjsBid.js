import { exportCallDataGroth16 } from "../snarkjsZkproof";

export async function BidCalldata(tenderId, suppleirId, secretKey, bidValue) {
	const input = {
		tenderId_: tenderId,
		suppleirId_: suppleirId,
		secretKey: secretKey,
		bidValue: bidValue
	};

	let dataResult;

	try {
		dataResult = await exportCallDataGroth16(
			input,
			"/bidzkproofs/bid.wasm",
			"/bidzkproofs/bid_final.zkey"
		);
	} catch (error) {
		// console.log(error);
		window.alert("Wrong answer");
	}

	return dataResult;
}

