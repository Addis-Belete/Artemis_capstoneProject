import { ethers } from "ethers";
import { useState, useEffect } from "react";

import Header from "./Components/header";
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json";

import VerifyComponent from "./Components/verifyComponent";
export default function myBid() {
	const tenderContractAddress = "0x05Aa229Aec102f78CE0E852A812a388F076Aa555";
	const suppleirAddress = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";
	const [myBids, setMyBid] = useState([]);
	const [suppId, setSuppId] = useState("");

	const getMyBids = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		let bidsArray = [];
		const tenderContract = new ethers.Contract(
			tenderContractAddress,
			tenderABI.abi,
			provider
		);
		const suppContract = new ethers.Contract(
			suppleirAddress,
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

	return (
		<div>
			<Header />

			{myBids.map((bid, index) => {
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
