import { ethers } from "ethers";
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import orgABI from "../../../out/Organization.sol/Organizations.json";
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json";
import { useState, useEffect } from "react";
import MyTenderComponent from "./Components/myTenderComponent";
import styles from "../styles/myTenders.module.css";
import addresses from "../address.json"
import Header from "./Components/header";
export default function listTenders() {
	const [myTenders, setMyTenders] = useState([]);

	const getMyTenders = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const tenderContract = new ethers.Contract(
			addresses.tenderContractAddress,
			tenderABI.abi,
			provider
		);
		const orgContract = new ethers.Contract(
			addresses.OrganizationContractAddress,
			orgABI.abi,
			provider
		);

		const tenderSinger = tenderContract.connect(signer);
		const orgSigner = orgContract.connect(signer);

		let orgId;
		await orgSigner
			.getYourOrganiationId()
			.then((res) => (orgId = res.toString()))
			.catch((err) => console.log(err));
		const tend = await tenderSinger.getAllTenders();
		
		const myTender = tend.filter(function (tender) {
			return tender.organizationId.toString() == orgId;
		});
		setMyTenders(myTender);

	};

	useEffect(() => {
		getMyTenders();
	}, []);

	const getURI = async (Id) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const suppContract = new ethers.Contract(
			addresses.suppleirContractAddress,
			suppABI.abi,
			provider
		);
		const suppSigner = suppContract.connect(signer);
		const uri = await suppSigner.tokenURI(Id);
		return;
	};

	return (
		<>
			<Header />

			<div className={styles.list}>
				{myTenders.length == 0 ? <p className={styles.p}>Not Created Tender Yet!</p> : myTenders.map((tender, index) => {
					return <MyTenderComponent key={index} tender={tender} />;
				})}

			</div>
		</>
	);
}
