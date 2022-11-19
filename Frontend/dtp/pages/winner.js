import Header from "./Components/header"
import addresses from "../address.json";
import styles from "../styles/myBids.module.css"
import tenderABI from "../../../out/Tender.sol/Tenders.json"
export default function winnerList() {

	const getWinners = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);

	}

	return (
		<div>
			<Header />
			<div>
				<ul className={styles.ul} style={{ width: "70%" }}>
					<li>{`TenderID: 1`}</li>
					<li>{`TenderURI: "www.tender1.com"`}</li>
					<li>{`SuppleirId of winner: 1`}</li>
					<li>{`Winnig Price: 2000000`}</li>
				</ul>
			</div>
		</div>
	)


}