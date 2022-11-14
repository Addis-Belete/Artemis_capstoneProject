import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json"
export default function postTender() {
	const [tender, setTender] = useState({
		"orgId": 0,
		"tenderURI": "",
		"bidPeriod": 0,
		"verifyingPeriod": 0
	})

	const handleOnChange = event => {
		const { name, value } = event.target;
		setTender({ ...tender, [name]: value });
	};
	const createTender = async (orgId, tenderURI, bidPeriod, verifyingPeriod) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()

		const tenderContractAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const value = ethers.utils.parseEther("0.5")
		await tenderSinger.createNewTender(orgId, tenderURI, bidPeriod, verifyingPeriod, { value: value }).then(() => {
			setTender({
				"orgId": 0,
				"tenderURI": "",
				"bidPeriod": 0,
				"verifyingPeriod": 0
			})

		}).catch(err => console.log(err))

		tenderContract.on("NewTenderCreated", (orgId, tenderId, bidEndDate, verifyingEndDate, event) => {
			console.log(`${orgId} is registered by ${tenderId} and name is ${bidEndDate}`)

		})

	}
	console.log(tender.orgId);
	return (
		<div>
			<div className={styles.register}>
				<h2>Create new Tender</h2>
				<label htmlFor="orgId"> Organization ID</label>
				<input className={styles.input} type="text" name="orgId" value={tender.orgId} onChange={handleOnChange} />
				<br />
				<br />
				<label htmlFor="tenderURI">tenderURI</label>
				<input className={styles.input} type="text" name="tenderURI" value={tender.tenderURI} onChange={handleOnChange} />
				<br />
				<br />
				<label htmlFor="bidPeriod">Bid Period</label>
				<input className={styles.input} type="text" name="bidPeriod" value={tender.bidPeriod} onChange={handleOnChange} />
				<br />
				<br />
				<label htmlFor="verifyingPeriod">Verifying Period</label>
				<input className={styles.input} type="text" id="uri" name="verifyingPeriod" value={tender.verifyingPeriod} onChange={handleOnChange} />
				<br />
				<br />
				<button className={styles.button} onClick={() => createTender(tender.orgId, tender.tenderURI, tender.bidPeriod, tender.verifyingPeriod)}>Create</button>
			</div>
		</div>
	);
}
