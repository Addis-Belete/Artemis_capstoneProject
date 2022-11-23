import Header from "./Components/header";
import addresses from "../address.json";
import styles from "../styles/myBids.module.css";
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
export default function winnerList() {
	const [winners, setWinners] = useState([]);
	const getWinners = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const tenderContract = new ethers.Contract(
			addresses.tenderContractAddress,
			tenderABI.abi,
			provider
		);
		const tenderSinger = tenderContract.connect(signer);
		await tenderSinger
			.getAllTenders()
			.then((res) => {
				const winner = res.filter(function (tender) {
					return tender.stage == 1;
				});
				setWinners(winner);

			})
			.catch((err) => console.log(err));
	};
	useEffect(() => {
		getWinners()

	}, [])
	console.log(winners, "winner")
	return (
		<div>
			<Header />
			<div>
				{winners.length == 0 ? (
					<p className={styles.p}>Winners not annouced yet!</p>
				) : (
					<div>

						{winners.map((win, index) => {
							return (
								<ul className={styles.ul} style={{ width: "70%" }} key={index}>
									<li>{`TenderID: ${(win.Id).toString()}`}</li>
									<li>{`TenderURI: ${win.tenderURI}`}</li>
									<li>{`SuppleirId of winner: ${(win.winner.suppleirId).toString()}`}</li>
									<li>{`Winnig Price: ${(win.winner.winningValue).toString()}`}</li>
								</ul>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
