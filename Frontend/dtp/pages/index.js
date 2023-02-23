import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import orgABI from "../../../out/Organization.sol/Organizations.json"
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json"
import Header from "./Components/header";
import addresses from "../address.json"
export default function Home() {
	const [success, setSuccess] = useState('');
	const [error, setError] = useState("")

	const [data, setData] = useState({
		"name_": "",
		"address": "",
		"uri": "",
		"type": 0
	})
	const handleOnChange = event => {
		const { name, value } = event.target;
		setData({ ...data, [name]: value });
	};



	const registerOrg = async (type, name_, address_, uri_) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		if (type == 0) {

			const OrgContract = new ethers.Contract(addresses.OrganizationContractAddress, orgABI.abi, provider);
			const orgSinger = OrgContract.connect(signer);
			await orgSinger.registerOrganization(name_, address_, uri_).then(() => {
				OrgContract.on("NewOrganizatoinRegistered", (tokenId, registeredBy, name, event) => {
					const message = `New organization registered With Id of ${tokenId}`
					setSuccess(message);

				})
				setData({
					"name_": "",
					"address": "",
					"uri": "",
					"type": 0
				})


			}).catch((err) => setError("Registaration Failed"))

		}
		if (type == 1) {
			const suppContract = new ethers.Contract(addresses.suppleirContractAddress, suppABI.abi, provider);
			const suppSinger = suppContract.connect(signer);
			await suppSinger.registerSuppleir(name_, address_, name_, name_, uri_).then(() => {
				suppContract.on("NewSuppleirRegistered", (tokenId, owner, name, event) => {
					const message = `New Suppleir Registerd with ID  of ${tokenId}`
					setSuccess(message)

				})
				setData({
					"name_": "",
					"address": "",
					"uri": "",
					"type": 0
				})


			}).catch(() => setError("Registaration Failed"))

		}
	}

	return (
		<div>
			<Header />
			<div className={styles.register}>
				{success ?
					<span className={styles.success}> {success} </span> :
					<span className={styles.error}>{error} </span>
				}
				<div className={styles.org}>
					<h2>Register as</h2>
					<select className={styles.select} name="type" onChange={handleOnChange}>
						<option value={0}>Orginization</option>
						<option value={1}>Suppleir</option>
					</select>

				</div>

				<label htmlFor="name"> Name:</label>
				<input className={styles.input} type="text" name="name_" value={data.name_} onChange={handleOnChange} /><br /><br />
				<label htmlFor="address">Address:</label>
				<input className={styles.input} type="text" name="address" value={data.address} onChange={handleOnChange} /><br /><br />
				<label htmlFor="lname">TokenURI:</label>
				<input className={styles.input} type="text" id="uri" name="uri" value={data.uri} onChange={handleOnChange} /><br /><br />
				<button className={styles.button} onClick={() => registerOrg(data.type, data.name_, data.address, data.uri)} >Register</button>

			</div>

		</div>
	)
}


/*
		TODO
1. Add pop or some message when organization successfully created or failed
2. Optimize code

*/