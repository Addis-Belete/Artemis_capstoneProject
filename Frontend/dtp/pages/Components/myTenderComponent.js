import styles from "../../styles/myTenders.module.css"
import { useState, useEffect } from "react";
import tenderABI from "../../../../out/Tender.sol/Tenders.json";
import addresses from "../../address.json"
import { ethers } from "ethers"
export default function myTenderComponent({ tender = {Id: 0, tenderURI: "www"} }) {
	const [bidders, setBidders] = useState([]);
	const [disp, setDisp] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("")

	const getBidders = async (tenderId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const bidders_ = await tenderSinger.getListOfbidders(tenderId);
		setBidders(bidders_)

	}

	const handleClick = (tenderId) => {

		setDisp(!disp)
		getBidders(tenderId)
	}

	const approveOrDeclineBid = async (tenderId, suppleirId, status) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);

		await tenderSinger.approveOrDeclineBid(tenderId, suppleirId, status).then(() => {
			tenderContract.on("BidStatusChanged", (tenderId, suppleirId, status) => {
				console.log(`Bid id ${suppleirId} is ${status}`)
				const message = `Bid id ${suppleirId} is ${status == 1 ? "Approved" : "Declined"}`
				setSuccess(message)
			})
		}).catch(() => setError("Transaction Failed!"))

	}


	const announceWinner = async (tenderId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.announceWinner(tenderId).then(() => {
			tenderContract.on("WinnerAnnounced", (tenderId, suppleirId, winningValue) => {
				const message = `Suppleir of Id ${suppleirId} won tender of Id ${tenderId} with ${winningValue} price!!`
				setSuccess(message);

			})

		}).catch(() => setError("Transaction failed"))

	}

	return (

		<div >
			{success ? <p className={styles.success}>{success}</p> : <p className={styles.error}>{error}</p>}
			<ul className={styles.ul}>
				<li className={styles.li} >{`tenderId: ${(tender.Id)}`}</li><br></br>
				<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
				<button className={styles.button} onClick={() => handleClick((tender.Id))}>{disp ? "Hide Bids" : "Show Bids"}</button>
				{(tender.stage) == 0 ? <button className={styles.button} onClick={() => announceWinner(tender.Id)}>Announce Winner</button> : <button className={styles.button}>Winner Announced</button>}
			</ul>

			{disp && bidders.map((bidId, index) => {

				return (
					<ul key={index} className={styles.ul1} >
						<li className={styles.li} >{`Suppleir Id: ${(bidId)} `}</li><br></br>
						<li className={styles.li}>{`Suppleir URI: www.awash.com`}</li><br></br>
						<button className={styles.buttonC} onClick={() => approveOrDeclineBid((tender.Id), bidId, 1)}>Approve</button>
						<button className={styles.buttonC} onClick={() => approveOrDeclineBid(tender.Id, bidId, 2)}>Decline</button>
					</ul>

				)

			})}

		</div>
	)

}

