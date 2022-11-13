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
		const signer = provider.getSigner([4])
		return signer
	}

	const registerOrg = async (type, name_, address_, uri_) => {
		const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
		await provider.send("eth_requestAccounts", []);
		const signer = provider.getSigner("0xa0ee7a142d267c1f36714e4a8f75612f20a79720")
		if (type == 0) {
			const orgAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
			const orgABI = [
				"function registerOrganization(string memory name_, string memory location_, string memory tokenURI_) external",
				"event NewOrganizatoinRegistered(uint256 indexed tokenId, address registeredBy, string name)"
			]
			const OrgContract = new ethers.Contract(orgAddress, orgABI, provider);
			const orgSinger = OrgContract.connect(signer);
			await orgSinger.registerOrganization(name_, address_, uri_).then((res) => {
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
	}
	console.log(data.type);
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
				<input className={styles.input} type="text" name="address" value={data.address_} onChange={handleOnChange} /><br /><br />
				<label htmlFor="lname">TokenURI:</label>
				<input className={styles.input} type="text" id="uri" name="uri" value={data.uri} onChange={handleOnChange} /><br /><br />
				<button className={styles.button} onClick={() => registerOrg(data.type, data.name_, data.address, data.uri)} >Register</button>

			</div>
		</div>
	)
}
