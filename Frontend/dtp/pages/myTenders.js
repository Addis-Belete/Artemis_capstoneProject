import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import orgABI from "../../../out/organization.sol/Organizations.json"
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json"
import { useState, useEffect } from "react";
import styles from "../styles/myTenders.module.css";

import Header from "./Components/header";
export default function listTenders() {
	const tenderContractAddress = "0x05Aa229Aec102f78CE0E852A812a388F076Aa555";
	const orgContractAddress = "0x59F2f1fCfE2474fD5F0b9BA1E73ca90b143Eb8d0";
	const suppleirAddress = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508"
	const [myTenders, setMyTenders] = useState([])
	const [disp, setDisp] = useState(false);
	const [bidders, setBidders] = useState([]);
	const getMyTenders = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const orgContract = new ethers.Contract(orgContractAddress, orgABI.abi, provider);

		const tenderSinger = tenderContract.connect(signer);
		const orgSigner = orgContract.connect(signer);

		let orgId;
		await orgSigner.getYourOrganiationId().then(res => orgId = res.toString()).catch(err => console.log(err));
		const tend = await tenderSinger.getAllTenders();
		const myTender = tend.filter(function (tender, index) {
			return ((tender.organizationId).toString() == (orgId));


		})
		setMyTenders(myTender);

	}

	useEffect(() => {
		getMyTenders()

	}, [])

	const getBidders = async (tenderId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const orgContract = new ethers.Contract(orgContractAddress, orgABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const orgSigner = orgContract.connect(signer);
		const bidders_ = await tenderSinger.getListOfbidders(tenderId);
		setBidders(bidders_)

	}

	const getURI = async (Id) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const suppContract = new ethers.Contract(suppleirAddress, suppABI.abi, provider);
		const suppSigner = suppContract.connect(signer);
		const uri = await suppSigner.tokenURI(Id)
		return


	}

	const approveOrDeclineBid = async (tenderId, suppleirId, status) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);

		await tenderSinger.approveOrDeclineBid(tenderId, suppleirId, status).then(() => {
			tenderContract.on("BidStatusChanged", (tenderId, suppleirId, status) => {
				console.log(`Bid id ${suppleirId} is ${status}`)
			})
		}).catch(err => console.log(err))




	}
	const handleClick = (e) => {
		e.preventDefault()
		setDisp(!disp)
		getBidders(2)
	}

	return (

		<>
			<Header />
			<div className={styles.list}>

				{myTenders.map((tender, index) => {

					return (

						<div key={index}>
							<ul key={index} className={styles.ul}>
								<li className={styles.li} >{`OrganizationId: ${(tender.organizationId).toString()}`}</li><br></br>
								<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
								<button className={styles.button} onClick={handleClick}>{disp ? "Hide Bids" : "Show Bids"}</button>
							</ul>
							{disp && bidders.map((bidId, index) => {
								return (
									<ul key={index} className={styles.ul1} >
										<li className={styles.li} >{`Suppleir Id: ${(bidId).toString()} `}</li><br></br>
										<li className={styles.li}>{`Suppleir URI: www.awash.com`}</li><br></br>
										<button className={styles.button} onClick={() => approveOrDeclineBid(2, bidId.toString(), 1)}>Approve</button>
										<button className={styles.button} onClick={() => approveOrDeclineBid(2, bidId.toString(), 2)}>Decline</button>
									</ul>
								)

							})}


						</div>
					)
				})}


			</div>
		</>

	)

}