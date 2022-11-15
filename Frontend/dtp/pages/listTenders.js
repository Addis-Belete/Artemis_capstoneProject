import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from "../styles/listTender.module.css";
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
import Header from "./Components/header";
export default function listTenders() {
	const tenderContractAddress = "0x05Aa229Aec102f78CE0E852A812a388F076Aa555"
	const [tenders, setTenders] = useState([])
	const router = useRouter()
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
	const handleClick = (e) => {
		e.preventDefault();
		router.push("/bid")
	}
	return (

		<>
			<Header />
			<div className={styles.list}>
				{tenders.map((tender, index) => {
					return (
						<div className={styles.card}>
							<ul key={index} className={styles.ul}>

								<li className={styles.li} >{`organizationId: ${(tender.organizationId).toString()}`}</li><br></br>
								<li className={styles.li} >{`tenderId: ${index + 1}`}</li><br></br>
								<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
								<li className={styles.li}>{`bidEndDate: ${tender.bidEndTime}`}</li><br></br>
								<li className={styles.li}>{`verifyingEndDate: ${tender.verifyingTime}`}</li><br></br>
								<button className={styles.button} onClick={handleClick}>Bid</button>

							</ul>
						</div>
					)
				})}


			</div>
		</>

	)

}


/*
suppleirAddress: 0xbCF26943C0197d2eE0E5D05c716Be60cc2761508
organizationAddress: 0x59F2f1fCfE2474fD5F0b9BA1E73ca90b143Eb8d0
verifierAddress: 0x1275D096B9DBf2347bD2a131Fb6BDaB0B4882487;
tenderAddress: 0x05Aa229Aec102f78CE0E852A812a388F076Aa555
*/