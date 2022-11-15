import Link from "next/link"
import styles from "../../styles/header.module.css"
import { useState } from "react";
import { ethers } from "ethers";
export default () => {
	const [provider, setProvider] = useState("");
	const connect = () => {
		if (provider == "") {
			const provider = new ethers.providers.Web3Provider(window.ethereum)
			setProvider(provider);
		}
		else {
			setProvider("");
		}
	}

	return (
		<header className={styles.header}>
			<h2 className={styles.h2}><Link href="/">Decentralized Tender Platfrom</Link></h2>
			<ul className={styles.ul}>
				<li>
					<Link href="/listTenders">
						Home
					</Link>
				</li>
				<li>
					<Link href="/">
						Register
					</Link>
				</li>
				<li>
					<Link href="/postTender">
						Post Tender
					</Link>
				</li>
				<li>
					<Link href="/myTenders">
						My Tenders
					</Link>
				</li>
				<li>
					<Link href="/bid">
						Bid
					</Link>
				</li>
				<li>
					<Link href="/myBids">
						My Bid
					</Link>
				</li>

			</ul>
			<button className={styles.button} onClick={() => connect()} >{provider == "" ? "Connect" : "Disconnect"}</button>

		</header>
	)
}