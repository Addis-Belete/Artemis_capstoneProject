import Link from "next/link"
import styles from "../../styles/header.module.css"
import { useState } from "react";
import { ethers } from "ethers";
import { useRouter } from 'next/router';
export default () => {
	const [provider, setProvider] = useState("");
	const router = useRouter();
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
					<Link href="/listTenders" legacyBehavior>
						<a style={{ color: router.pathname == "/listTenders" ? "#28435c" : "" }}>
							Home
						</a>
					</Link>
				</li>
				<li>
					<Link href="/" legacyBehavior>
						<a style={{ color: router.pathname == "/" ? "#28435c" : "" }}>
							Register
						</a>
					</Link>
				</li>
				<li>
					<Link href="/postTender" legacyBehavior>
						<a style={{ color: router.pathname == "/postTender" ? "#28435c" : "" }}>
							Post Tender
						</a>
					</Link>
				</li>
				<li>
					<Link href="/myTenders" legacyBehavior>
						<a style={{ color: router.pathname == "/myTenders" ? "#28435c" : "" }}>
							My Tenders
						</a>
					</Link>
				</li>
				<li>
					<Link href="/bid" legacyBehavior>
						<a style={{ color: router.pathname == "/bid" ? "#28435c" : "" }}>
							Bid
						</a>
					</Link>
				</li>
				<li>
					<Link href="/myBids" legacyBehavior>
						<a style={{ color: router.pathname == "/myBids" ? "#28435c" : "" }}>
							My Bid
						</a>
					</Link>
				</li>
				<li>
					<Link href="/myBids" legacyBehavior>
						<a style={{ color: router.pathname == "/myBids" ? "#28435c" : "" }}>
							Winners
						</a>
					</Link>
				</li>

			</ul>
			<button className={styles.button} onClick={() => connect()} >{provider == "" ? "Connect" : "Disconnect"}</button>

		</header >
	)
}