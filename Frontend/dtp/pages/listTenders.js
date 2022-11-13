import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import { useState, useEffect } from "react";
import styles from "../styles/listTender.module.css";
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
export default function listTenders() {

	const bid = async () => {
		let proof = await VerifyCalldata(1, 2, 3, 5);
		console.log(proof);

	}
	return (
		<div className={styles.list}>

			<div className={styles.card}>
				<ul className={styles.ul}>
					<li className={styles.li} >OrganizationID: 20</li><br></br>
					<li className={styles.li}>tenderURI: www.tender1.com</li><br></br>
					<li className={styles.li}>bidEndDate: 200000</li><br></br>
					<li className={styles.li}>verifyingEndDate: 30000</li><br></br>
				</ul>
				<button className={styles.button} onClick={bid}>Bid</button>
			</div>

		</div>
	)

}
/*

export async function getServerSideProps() {
	const [provider, setProvider] = useState({});
	let tenders;
	useEffect(async () => {
		if (typeof window.ethereum !== 'undefined' || (typeof window.web3 !== 'undefined')) {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			setProvider(provider);
			// other stuff using provider here
			await provider.send("eth_requestAccounts", []);
			const signer = provider.getSigner()

			const tenderContractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F"

			const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
			const tenderSinger = tenderContract.connect(signer);
			tenders = await tenderSinger.getAllTenders();
		}
	}, []);



	// Pass data to the page via props
	return { props: { tenders } }
}
*/