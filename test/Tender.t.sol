//SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "forge-std/Test.sol";
import "../src/Core/organization.sol";
import "../src/Core/Suppleir.sol";
import "../src/Core/Tender.sol";
import "../src/Core/verifier.sol";
import "forge-std/console.sol";

contract TestTender is Test {
    Tenders tender;
    Suppleirs supp;
    Organizations org;
    Verifier verifier;

    event NewTenderCreated(
        uint256 indexed orgId, uint256 indexed tenderId, uint256 indexed bidEndDate, uint256 verifyingEndDate
    );

    function setUp() public {
        supp = new Suppleirs();
        org = new Organizations();
        verifier = new Verifier();
        tender = new Tenders(address(org), address(supp), address(verifier));
    }

    function testCreateTender() public {
        createOrgAndSupp();
        hoax(address(30));

        vm.expectEmit(true, true, true, false);
        emit NewTenderCreated(1, 1, 432001, 604801);
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);

        Tenders.Tender memory tender_ = tender.getTender(1);

        assertEq(tender_.organizationId, 1);
        assertEq(tender_.tenderURI, "www.tender1.com");
        assertEq(tender_.bidStartTime, block.timestamp);
        assertEq(tender_.bidEndTime, 432001);
        assertEq(tender_.verifyingTime, 604801);
        assertEq(tender_.isPaused, false);
    }

    function createOrgAndSupp() internal {
        //Suppleir one
        vm.startPrank(address(10));
        supp.registerSuppleir("Mebeat", "Addis Ababa", "Belete", "Electronic", "www.mebeat.com");
        vm.stopPrank();

        //Suppleir two
        vm.startPrank(address(20));
        supp.registerSuppleir("Gebeya", "Robe", "Alemitu", "Electronic", "www.gebeya.com");
        vm.stopPrank();

        // Organization one
        vm.startPrank(address(30));
        org.registerOrganization("Abissinia Bank", "Addis Ababa", "www.abbisinia.com");
        vm.stopPrank();

        //Organization two
        vm.startPrank(address(40));
        org.registerOrganization("Kaki", "Addis Ababa", "www.kaki.com");
        vm.stopPrank();
    }
}
