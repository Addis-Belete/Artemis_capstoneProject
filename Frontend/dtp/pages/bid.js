import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import tenderABI from "../../../out/Tender.sol/Tenders.json"
import { BidCalldata } from "../zkproofs/Bid/snarkjsBid";
import addresses from "../address.json"
import Header from "./Components/header";
export default function bid() {
	const [bids, setBids] = useState({
		"tenderId": "",
		"suppleirId": "",
		"secretKey": "",
		"bidValue": ""

	})
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');
	const handleOnChange = event => {
		const { name, value } = event.target;
		setBids({ ...bids, [name]: value });
	};
	const giveOffer = async (tenderId, suppleirId, secretKey, bidValue) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const proof = await BidCalldata(tenderId, suppleirId, secretKey, bidValue);
		console.log(proof.Input[0], "bid proof");
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.bid(suppleirId, tenderId, proof.Input[0], { value: ethers.utils.parseEther("0.0000000005") }).then(() => {
			setBids({
				"tenderId": "",
				"suppleirId": "",
				"secretKey": "",
				"bidValue": ""
			})
			tenderContract.on("NewBidAdded", (tenderId, suppleirId, event) => {
				const message = `Suppleir of Id ${suppleirId} bids to tender of Id ${tenderId}`
				setSuccess(message);

			})

		}).catch(() => setError("Bidding Failed!"));


	}

	return (
		<>
			<Header />

			<div className={styles.register}>
				{success ? <p className={styles.success}>{success}</p> : <p className={styles.error}>{error}</p>}
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