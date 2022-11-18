import styles from "../../styles/myTenders.module.css"
import { useState, useEffect } from "react";
import tenderABI from "../../../../out/Tender.sol/Tenders.json";
import addresses from "../../address.json"
import { ethers } from "ethers"
export default function myTenderComponent({ tender }) {
	const [bidders, setBidders] = useState([]);
	const [disp, setDisp] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');
	const getBidders = async (tenderId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const bidders_ = await tenderSinger.getListOfbidders(tenderId);
		setBidders(bidders_)

	}

	const handleClick = (e) => {
		e.preventDefault()
		setDisp(!disp)
		getBidders(2)
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
			})
		}).catch(err => console.log(err))

	}

	const announceWinner = async (tenderId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.announceWinner(tenderId).then(() => {
			tenderContract.on("WinnerAnnounced", (tenderId, suppleirId, winningValue) => {
				const message = `Suppleir of Id ${suppleirId} won tender of Id ${tenderId} with ${winningValue} price!!`
				setSuccess(message);

			}).catch(() => setError("Transaction failed"))

		})

	}
	return (

		<div >
			<ul className={styles.ul}>
				<li className={styles.li} >{`OrganizationId: ${(tender.organizationId).toString()}`}</li><br></br>
				<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
				<button className={styles.button} onClick={handleClick}>{disp ? "Hide Bids" : "Show Bids"}</button>
				<button className={styles.button} onClick={() => announceWinner(tender.organizationId)}>Announce Winner</button>
			</ul>
			{disp && bidders.map((bidId, index) => {
				return (
					<ul key={index} className={styles.ul1} >
						<li className={styles.li} >{`Suppleir Id: ${(bidId).toString()} `}</li><br></br>
						<li className={styles.li}>{`Suppleir URI: www.awash.com`}</li><br></br>
						<button className={styles.buttonC} onClick={() => approveOrDeclineBid(2, bidId.toString(), 1)}>Approve</button>
						<button className={styles.buttonC} onClick={() => approveOrDeclineBid(2, bidId.toString(), 2)}>Decline</button>
					</ul>
				)

			})}

		</div>
	)

}