import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers";
import orgABI from "../../../out/organization.sol/Organizations.json"
import suppABI from "../../../out/Suppleir.sol/Suppleirs.json"
import Header from "./Components/header";
export default function Home() {

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
			const orgAddress = "0x59F2f1fCfE2474fD5F0b9BA1E73ca90b143Eb8d0";
			const OrgContract = new ethers.Contract(orgAddress, orgABI.abi, provider);
			const orgSinger = OrgContract.connect(signer);
			await orgSinger.registerOrganization(name_, address_, uri_).then(() => {
				setData({
					"name_": "",
					"address": "",
					"uri": "",
					"type": 0
				})

			}).catch(err => console.log(err))

			OrgContract.on("NewOrganizatoinRegistered", (tokenId, registeredBy, name, event) => {
				console.log(`${tokenId} is registered by ${registeredBy} and name is ${name}`)

			})
		}
		if (type == 1) {
			const suppAddress = "0xbCF26943C0197d2eE0E5D05c716Be60cc2761508";
			const suppContract = new ethers.Contract(suppAddress, suppABI.abi, provider);
			const suppSinger = suppContract.connect(signer);
			await suppSinger.registerSuppleir(name_, address_, name_, name_, uri_).then(() => {
				setData({
					"name_": "",
					"address": "",
					"uri": "",
					"type": 0
				})

			}).catch(err => console.log(err))

			suppContract.on("NewSuppleirRegistered", (tokenId, owner, name, event) => {
				console.log(`${tokenId} is registered by ${owner} and name is ${name}`)

			})

		}
	}

	return (
		<div>
			<Header />
			<div className={styles.register}>
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