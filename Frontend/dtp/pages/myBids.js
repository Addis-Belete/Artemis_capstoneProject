import { ethers } from "ethers";
import { useState, useEffect } from "react";

import Header from "./Components/header";
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json";
import styles from "../styles/myBids.module.css"
import VerifyComponent from "./Components/verifyComponent";
import addresses from "../address.json"
export default function myBid() {
	const [myBids, setMyBid] = useState([]);
	const [suppId, setSuppId] = useState("");

	const getMyBids = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		let bidsArray = [];
		const tenderContract = new ethers.Contract(
			addresses.tenderContractAddress,
			tenderABI.abi,
			provider
		);
		const suppContract = new ethers.Contract(
			addresses.suppleirContractAddress,
			suppABI.abi,
			provider
		);
		const suppSigner = suppContract.connect(signer);
		const tenderSigner = tenderContract.connect(signer);

		const suppId_ = await suppSigner.getYourId();
		setSuppId(suppId_.toString());

		const myBids = await tenderSigner.getAllYourBids(suppId_.toString());
		/*
					myBids.map(async (val, ind) => {
						let bidObj = {
							tenderId: "",
							tenderURI: "",
						}
						const tender = await tenderContract.getTender(val)
						const tenderURI = tender.tenderURI;
			
						bidObj.tenderId = val.toString();
						bidObj.tenderURI = tenderURI
						bidsArray[ind] = bidObj;
					})
			*/
		setMyBid(myBids);
	};

	useEffect(() => {
		getMyBids();
	}, []);
	console.log(myBids);
	return (
		<div>
			<Header />

			{myBids.length == 0 ? <p className={styles.p}>Not Bidded To Any Tender Yet!</p> : myBids.map((bid, index) => {
				return (
					<VerifyComponent
						bid={bid.toString()}
						key={index}
						suppId={suppId}
					/>
				);
			})}

		</div>
	);
}
