import { exportCallDataGroth16 } from "../snarkjsZkproof";

export async function VerifyCalldata(tenderId, suppleirId, secretKey, bidValue) {
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
			"/verifyzkproof/verifyBid.wasm",
			"/verifyzkproof/verifyBid_final.zkey"
		);
	} catch (error) {
		// console.log(error);
		window.alert("Wrong answer");
	}

	return dataResult;
}

