import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import tenderABI from "../../../out/Tender.sol/Tenders.json"
import { BidCalldata } from "../zkproofs/Bid/snarkjsBid";
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
export default function bid() {
	const [bids, setBids] = useState({
		"tenderId": "",
		"suppleirId": "",
		"secretKey": "",
		"bidValue": ""

	})
	const handleOnChange = event => {
		const { name, value } = event.target;
		setBids({ ...bids, [name]: value });
	};
	const giveOffer = async (tenderId, suppleirId, secretKey, bidValue) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContractAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
		const proof = await BidCalldata(tenderId, suppleirId, secretKey, bidValue);
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.bid(tenderId, suppleirId, proof.Input[0], { value: ethers.utils.parseEther("0.5") }).then(() => {
			setBids({
				"tenderId": "",
				"suppleirId": "",
				"secretKey": "",
				"bidValue": ""
			})
			tenderContract.on("NewBidAdded", (tenderId, suppleirId, event) => {
				console.log(`Suppleir of Id ${suppleirId} bids to tender of Id ${tenderId}`)

			})

		}).catch(err => console.log(err));


	}
	/*Needs to be fixed*/
	const verifyOffer = async (tenderId, suppleirId, secretKey, bidValue) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContractAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
		const proof = await VerifyCalldata(tenderId, suppleirId, secretKey, bidValue);
		console.log(proof)
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.verifyBid(proof.a, proof.b, proof.c, proof.Input).then(() => {
			tenderContract.on("bidVerified", (tenderId, suppleirId) => {
				console.log(`Suppleir of Id${suppleirId} verified a bid on a tender Id of ${tenderId}`)

			})
		}).catch(err => console.log(err));

	}
	return (
		<div className={styles.register}>

			<label htmlFor="tenderId"> tender ID</label>
			<input className={styles.input} type="text" value={bids.tenderId} name="tenderId" onChange={handleOnChange} />
			<br />
			<br />
			<label htmlFor="suppleirId">Suppleir ID</label>
			<input className={styles.input} type="text" value={bids.suppleirId} name="suppleirId" onChange={handleOnChange} />
			<br />
			<br />
			<label htmlFor="secretKey">Secret Key</label>
			<input className={styles.input} type="text" value={bids.secretKey} name="secretKey" onChange={handleOnChange} />
			<br />
			<br />
			<label htmlFor="bidValue">Bid Value</label>
			<input className={styles.input} type="text" value={bids.bidValue} name="bidValue" onChange={handleOnChange} />
			<br />
			<br />
			<button className={styles.button} onClick={() => verifyOffer(bids.tenderId, bids.suppleirId, bids.secretKey, bids.bidValue)}>Bid</button>
		</div>
	)

}