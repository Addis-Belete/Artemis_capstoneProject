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
		let suppId_;
		await suppSigner.getYourId().then(res => {
			suppId_ = res.toString()
			setSuppId(suppId_);


		}).catch(err => console.log(err));

		await tenderSigner.getAllYourBids(suppId_).then((res) => {
			setMyBid(res)
			console.log(res);
		}).catch(err => console.log(err));
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

	};

	useEffect(() => {
		getMyBids();
	}, []);

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
