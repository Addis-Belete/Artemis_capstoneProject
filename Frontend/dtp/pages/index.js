import styles from "../styles/Home.module.css";
import { useState } from "react";
import { ethers } from "ethers"
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

	const connect = async () => {
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		return signer
	}

	const registerOrg = async (type, name_, address_, uri_) => {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner()
		if (type == 0) {
			const orgAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
			const orgABI = [
				"function registerOrganization(string memory name_, string memory location_, string memory tokenURI_) external",
				"event NewOrganizatoinRegistered(uint256 indexed tokenId, address registeredBy, string name)"
			]
			const OrgContract = new ethers.Contract(orgAddress, orgABI, provider);
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
			const suppAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
			const suppABI = [
				"function registerSuppleir(string memory name_, string memory addr_, string memory owner_, string memory categories_, string memory tokenURI_) external",
				"event NewSuppleirRegistered(uint256 indexed tokenId, address owner, string name)"
			]

			const suppContract = new ethers.Contract(suppAddress, suppABI, provider);
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
			<div className={styles.header_}>
				<h2 className={styles.h2}>Decentralized Tender Platform</h2>
				<button className={styles.button} onClick={connect}>Connect</button>
			</div>
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