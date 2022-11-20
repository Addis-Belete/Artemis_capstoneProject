import { ethers } from "ethers"
import tenderABI from "../../../out/Tender.sol/Tenders.json";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import styles from "../styles/listTender.module.css";
import Header from "./Components/header";
import addresses from "../address.json"
export default function listTenders() {
	const [tenders, setTenders] = useState([])
	const router = useRouter()



	const getTenders = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const accounts = await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner();
		const tenderContract = new ethers.Contract(addresses.tenderContractAddress, tenderABI.abi, provider);
		const tenderSinger = tenderContract.connect(signer);

		await tenderSinger.getAllTenders().then((res) => {
			const tenders_ = res.filter(function (tender) {
				console.log(tender);
				return (tender.stage).toString() == 0;

			});
			setTenders(tenders_);
		})
			.catch((err) => console.log(err));;


	}

	useEffect(() => {
		getTenders()


	}, [])

	const handleClick = (e) => {
		e.preventDefault();
		router.push("/bid")
	}
	const changeToDate = (timestamp) => {
		let dateFormat = new Date(timestamp);
		const date = dateFormat.getDate() +
			"/" + (dateFormat.getMonth() + 1) +
			"/" + dateFormat.getFullYear() +
			" " + dateFormat.getHours() +
			":" + dateFormat.getMinutes() +
			":" + dateFormat.getSeconds();
		return date
	}
	return (

		<>
			<Header />
			{tenders.length == 0 ? <p className={styles.p}>Tenders Not Available!</p> : <div className={styles.list}>{tenders.map((tender, index) => {
				return (

					<div className={styles.card} key={index}>
						<ul className={styles.ul}>

							<li className={styles.li} >{`organizationId: ${(tender.organizationId).toString()}`}</li><br></br>
							<li className={styles.li} >{`tenderId: ${tender.Id}`}</li><br></br>
							<li className={styles.li}>{`tenderURI: ${tender.tenderURI}`}</li><br></br>
							<li className={styles.li}>{`bidEndDate: ${changeToDate((tender.bidEndTime).toNumber() * 1000)}`}</li><br></br>
							<li className={styles.li}>{`verifyingEndDate: ${changeToDate((tender.verifyingTime).toNumber() * 1000)}`}</li><br></br>
							<button className={styles.button} onClick={handleClick}>Bid</button>

						</ul>
					</div>
				)
			})}
			</div>
			}
		</>

	)

}


