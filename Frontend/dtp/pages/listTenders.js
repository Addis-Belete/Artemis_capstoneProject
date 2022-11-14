import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import { useState, useEffect } from "react";
import styles from "../styles/listTender.module.css";
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
export default function listTenders() {
	const tenderContractAddress = "0x712516e61C8B383dF4A63CFe83d7701Bce54B03e"
	const [tenders, setTenders] = useState([])
	const getTenders = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);
		const tenders = await tenderSinger.getAllTenders();
		setTenders(tenders);
	}

	useEffect(() => {
		getTenders()

	}, [])


	const bid = async () => {
		let proof = await VerifyCalldata(1, 2, 3, 5);
		console.log(proof);

	}

	return (


		<div className={styles.list}>
			{tenders.map((tender, index) => {
				return (
					<div className={styles.card}>
						<ul key={index} className={styles.ul}>

							<li className={styles.li} >{`OrganizationId: ${(tender.organizationId).toString()}`}</li><br></br>
							<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
							<li className={styles.li}>{`bidEndDate: ${tender.bidEndTime}`}</li><br></br>
							<li className={styles.li}>{`verifyingEndDate: ${tender.verifyingTime}`}</li><br></br>
							<button className={styles.button} onClick={bid}>Bid</button>

						</ul>
					</div>
				)
			})}


		</div>


	)

}


/*
suppleirAddress: 0x8464135c8F25Da09e49BC8782676a84730C318bC
organizationAddress: 0x71C95911E9a5D330f4D621842EC243EE1343292e
verifierAddress: 0x948B3c65b89DF0B4894ABE91E6D02FE579834F8F;
tenderAddress: 0x712516e61C8B383dF4A63CFe83d7701Bce54B03e
*/