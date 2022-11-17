import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import tenderABI from "../../../out/Tender.sol/Tenders.json"
import { BidCalldata } from "../zkproofs/Bid/snarkjsBid";
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
import Header from "./Components/header";
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
		const tenderContractAddress = "0x05Aa229Aec102f78CE0E852A812a388F076Aa555"
		const proof = await BidCalldata(tenderId, suppleirId, secretKey, bidValue);
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.bid(suppleirId, tenderId, proof.Input[0], { value: ethers.utils.parseEther("0.5") }).then(() => {
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
	

	return (
		<>
			<Header />
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
				<button className={styles.button} onClick={() => giveOffer(bids.tenderId, bids.suppleirId, bids.secretKey, bids.bidValue)}>Bid</button>
			</div>
		</>
	)

}