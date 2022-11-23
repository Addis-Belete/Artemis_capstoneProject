import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers"
import Header from "./Components/header";
import addresses from "../address.json"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
export default function postTender() {
	const [success, setSuccess] = useState('');
	const [error, setError] = useState("")
	const [tender, setTender] = useState({
		"orgId": "",
		"tenderURI": "",
		"bidPeriod": "",
		"verifyingPeriod": ""
	})

	const handleOnChange = event => {
		const { name, value } = event.target;
		setTender({ ...tender, [name]: value });
	};
	const createTender = async (orgId, tenderURI, bidPeriod, verifyingPeriod) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const value = ethers.utils.parseEther("0.0000000005")
		await tenderSinger.createNewTender(orgId, tenderURI, bidPeriod, verifyingPeriod, { value: value }).then(() => {
			tenderContract.on("NewTenderCreated", (orgId, tenderId, bidEndDate, verifyingEndDate, event) => {
				const message = `New tender posted with Id of ${tenderId}!`
				setSuccess(message)

			})
			setTender({
				"orgId": "",
				"tenderURI": "",
				"bidPeriod": "",
				"verifyingPeriod": ""
			})

		}).catch(() => setError("Tender post failed!"))

	}

	return (
		<div>
			<Header />
			<div className={styles.register}>
				{success ?
					<span className={styles.success}> {success} </span> :
					<span className={styles.error}>{error} </span>
				}
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
