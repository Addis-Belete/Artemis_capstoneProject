import styles from "../../styles/myBids.module.css"
import { ethers } from "ethers"
import { useState, useEffect } from "react";
import { VerifyCalldata } from "../../zkproofs/Verify/snarkjsVerify";
import tenderABI from "../../../../out/Tender.sol/Tenders.json"
import addresses from "../../address.json"
export default function VerifyComponent({ bid, suppId }) {


	const [disp, setDisp] = useState(false);
	const [winner, setWinner] = useState(false);
	const [verified, setVerified] = useState({
		"secretKey": "",
		"bidValue": "",

	})
	const [success, setSuccess] = useState('');
	const [error, setError] = useState("");
	const handleClick = (e) => {
		e.preventDefault();
		setDisp(!disp);
	}

	const handleOnChange = event => {
		const { name, value } = event.target;
		setVerified({ ...verified, [name]: value });
	};

	const verifyOffer = async (tenderId, suppleirId, secretKey, bidValue) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const proof = await VerifyCalldata(tenderId, suppleirId, secretKey, bidValue);
		console.log(proof.Input[0], "Verify Proof");

		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.verifyBid(proof.a, proof.b, proof.c, proof.Input).then(() => {
			tenderContract.on("BidVerified", (tenderId, suppleirId) => {
				console.log(`Suppleir of Id${suppleirId} verified a bid on a tender Id of ${tenderId}`)
				const message = `Suppleir of Id${suppleirId} verified a bid on a tender Id of ${tenderId}`
				setSuccess(message);

			})
		}).catch(() => setError("Verifying Failed!"));

	}
	const checkIfCliamable = async () => {

		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.getYourBid(bid, suppId).then((res) => {
			setWinner(res.claimable)
		})
	}
	const claimFund = async (tenderId, suppleirId) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider)
		const tenderSigner = tenderContract.connect(signer);
		await tenderSigner.returnFunds(tenderId, suppleirId).then(() => {
			tenderContract.on("FundReturned", (tenderId, suppleirId) => {
				console.log(`Fund returned for supplier of Id ${suppleirId} for tender Id of ${tenderId}`)
				const message = `Fund returned for supplier of Id ${suppleirId} for tender Id of ${tenderId}`
				setSuccess(message);

			})

		}).catch(() => setError("Fund Transfer Failed!"))

	}

	useEffect(() => {
		checkIfCliamable()
	}, []);

	return (

		<div >
			{success ? <p className={styles.success}>{success}</p> : <p className={styles.error}>{error}</p>}
			<ul className={styles.ul}  >
				<li>{`tenderId : ${bid}`}</li>
				<li>{`tender URI : ${bid.tenderURI}`}</li>
				<button className={styles.button} onClick={handleClick} >Verify</button>
				{winner == true ?
					<button className={styles.button} onClick={() => claimFund(bid, suppId)}>Claim Fund</button> : <button className={styles.button}>Your Winner</button>}
			</ul>
			{disp &&
				<div className={styles.div} >
					<label htmlFor="secretKey"> Secret Key</label>
					<input className={styles.input} type="text" name="secretKey" onChange={handleOnChange} />
					<br />
					<br />
					<label htmlFor="bidValue">Bid Value</label>
					<input className={styles.input} type="text" name="bidValue" onChange={handleOnChange} />
					<br />
					<br />
					<button className={styles.button} onClick={() => verifyOffer(bid, suppId, verified.secretKey, verified.bidValue)}>Verify</button>
				</div>}
		</div>
	)

} 