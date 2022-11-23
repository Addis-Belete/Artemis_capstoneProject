// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.7;

import "forge-std/Script.sol";
import "../src/Core/Organization.sol";
import "../src/Core/Suppleir.sol";
import "../src/Core/Tender.sol";
import "../src/Core/verifier.sol";

contract MyScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        Organizations org = new Organizations();
        Suppleirs supp = new Suppleirs();
        Verifier verify = new Verifier();
        Tenders tender = new Tenders(address(org), address(supp), address(verify));
        console.log("Organization deployed too -->", address(org));
        console.log("Suppleir deployed to -->", address(supp));
        console.log("Verifier deployed to -->", address(verify));
        console.log("Tender Deployed to -->", address(tender));
        vm.stopBroadcast();
    }
}
