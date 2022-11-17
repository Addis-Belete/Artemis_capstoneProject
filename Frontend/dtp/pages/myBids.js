import { ethers } from "ethers"
import { useState, useEffect } from "react";
import styles from "../styles/myBids.module.css"
import Header from "./Components/header"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json"
import { VerifyCalldata } from "../zkproofs/Verify/snarkjsVerify"
export default function myBid() {
	const tenderContractAddress = "0x05Aa229Aec102f78CE0E852A812a388F076Aa555";
	const suppleirAddress = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";
	const [myBids, setMyBid] = useState([])
	const [disp, setDisp] = useState(false)
	const [verified, setVerified] = useState({
		"secretKey": "",
		"bidValue": "",

	})
	const [suppId, setSuppId] = useState("")

	const getMyBids = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		let bidsArray = []
		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider);
		const suppContract = new ethers.Contract(suppleirAddress, suppABI.abi, provider);
		const suppSigner = suppContract.connect(signer);
		const tenderSigner = tenderContract.connect(signer);

		const suppId_ = await suppSigner.getYourId();
		setSuppId(suppId_.toString())


		const myBids = await tenderSigner.getAllYourBids(suppId_.toString());

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

		setMyBid(bidsArray);

	}

	const handleClick = (e) => {
		e.preventDefault()
		setDisp(!disp)
	}
	const handleOnChange = event => {
		const { name, value } = event.target;
		setVerified({ ...verified, [name]: value });
	};

	useEffect(() => {
		getMyBids()

	}, [])
	const verifyOffer = async (tenderId, suppleirId, secretKey, bidValue) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const proof = await VerifyCalldata(tenderId, suppleirId, secretKey, bidValue);
		console.log(proof)

		const tenderContract = new ethers.Contract(tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.verifyBid(proof.a, proof.b, proof.c, proof.Input).then(() => {
			tenderContract.on("bidVerified", (tenderId, suppleirId) => {
				console.log(`Suppleir of Id${suppleirId} verified a bid on a tender Id of ${tenderId}`)

			})
		}).catch(err => console.log(err));

	}

	return (
		<div>
			<Header />
			<div>
				{myBids.map((bid, index) => {
					return (
						<div key={index}>
							<ul className={styles.ul} >
								<li>{`tenderId : ${bid.toString()}`}</li>
								<li>{`tender URI : ${bid.tenderURI}`}</li>
								<button className={styles.button} onClick={handleClick} >Verify</button>
								<button className={styles.button}>ClaimFund</button>
							</ul>
							{disp &&
								<div className={styles.div} >
									<label htmlFor="secretKey"> Secret Key</label>
									<input className={styles.input} type="text" name="secretKey" onChange={handleOnChange} />
									<br />
									<br />
									<label htmlFor="bidValue">Bid Value</label>
									<input className={styles.input} type="text" name="tenderURI" onChange={handleOnChange} />
									<br />
									<br />
									<button className={styles.button} onClick={() => verifyOffer(bid.toString(), suppId, verified.secretKey, verified.bidValue)}>Verify</button>
								</div>}
						</div>
					)

				})}

			</div>

		</div>

	)

}