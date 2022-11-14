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
    event NewBidAdded(uint256 indexed tenderId, uint256 indexed suppleirId);
    event BidStatusChanged(uint256 indexed tenderId, uint256 indexed suppleirId, Tenders.Status status);
    event BidVerified(uint256 indexed tenderId, uint256 indexed suppleirId);
    event WinnerAnnounced(uint256 indexed tenderId, uint256 indexed suppleirId, uint256 indexed winningValue);
    event TenderStatus(uint256 indexed tenderId, bool isPaused);

    function setUp() public {
        supp = new Suppleirs();
        org = new Organizations();
        verifier = new Verifier();
        tender = new Tenders(address(org), address(supp), address(verifier));
    }

    function testCreateTender() public {
        createOrg();
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

    function testFailCreateTender() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.5 ether}(2, "www.tender1.com", 5, 2);
        vm.expectRevert("Not allowed for you!");
    }

    function testFailCreateTender1() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.5 ether}(3, "www.tender1.com", 5, 2);
        vm.expectRevert("invalid token ID");
    }

    function testFailCreateTender2() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.2 ether}(1, "www.tender1.com", 5, 2);
        vm.expectRevert(" 0.5 ether platform fee");
    }

    function testFailCreateTender3() public {
        createOrg();
        hoax(address(40));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.expectRevert("Not allowed for you!");
    }

    function testBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        vm.expectEmit(true, true, false, false);

        emit NewBidAdded(1, 1);

        tender.bid{value: 0.5 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);

        Tenders.Bid memory bid = tender.getYourBid(1, 1);

        assertEq(bid.proof, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        assertEq(bid.value, 0);
        assertEq(bid.claimable, true);
    }

    function testFailBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.5 ether}(1, 2, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.expectRevert("tender not found");
    }

    function testFailBid1() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(20));
        tender.bid{value: 0.5 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.expectRevert("is not allowed for you!");
    }

    function testFailBid2() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.25 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.expectRevert("0.5 ether platform fee");
    }

    function testFailBid3() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        uint256 skip_ = 432002;
        skip(skip_);

        tender.bid{value: 0.5 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.expectRevert("Bidding closed or paused");
    }

    function testApproveOrDeclineBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.5 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.stopPrank();
        startHoax(address(30));
        uint256 skip_ = 432002;
        skip(skip_);
        vm.expectEmit(true, true, false, false);

        emit BidStatusChanged(1, 1, Tenders.Status.approved);
        tender.approveOrDeclineBid(1, 1, Tenders.Status.approved);
    }

    function testFailApproveOrDeclineBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.5 ether}(1, 1, 0x06a1ecbd07743fd48b1aa60d1dd8c086e3f907bd5a74b6e31ba339638af473a4);
        vm.stopPrank();
        startHoax(address(30));

        console.log(block.timestamp, "block.timestamp");
        tender.approveOrDeclineBid(1, 1, Tenders.Status.approved);
        vm.expectRevert("bidding closed");
    }

    function testVerifyBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.5 ether}(1, 1, 0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826);
        vm.stopPrank();
        startHoax(address(30));
        uint256 skip_ = 432002;
        skip(skip_);
        tender.approveOrDeclineBid(1, 1, Tenders.Status.approved);
        vm.stopPrank();
        startHoax(address(10));
        /**
         * Verifying started
         */

        uint256[2] memory a = [
            0x1fffbc4865cc11c63997348d724bbcba6ed0f125e3ca5ed242418dab912ce628,
            0x2c4844c608d8c9e47e70946a81c167db7ef209d704b1e81677f257bfbf3213bc
        ];
        uint256[2][2] memory b = [
            [
                0x29b4926bf991400805fb95030844a3c56d22df6f2a559debb68e1826453cef2b,
                0x078d311c95f1e55b468031df80a8f8299b5d0323a7628cf39a927a0d90e60bae
            ],
            [
                0x2c6d73faf0831295eb7c803e3978ab4f09410bfaf79b13f7115a68bd1715e342,
                0x1847801f1cfce3718d32b0a2f5a3b3e52d878e9b3839a863a5a43dafda7c94c8
            ]
        ];
        uint256[2] memory c = [
            0x029bb6c2d992b572ecee3060b2465a5f99df4b6495e2a4b564fdd3f2d46e6e51,
            0x15f00ca4bf304833418c74a0954167d9a00d0e0a5192d1211d436b38a0bceaec
        ];

        uint256[4] memory input = [
            0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x0000000000000000000000000000000000000000000000000000000000030d40
        ];
        vm.expectEmit(true, true, false, false);
        emit BidVerified(1, 1);
        tender.verifyBid(a, b, c, input);

        Tenders.Bid memory bid = tender.getYourBid(1, 1);

        assertEq(bid.proof, 0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826);
        assertEq(bid.value, 200000);
        assertEq(bid.claimable, true);
        vm.stopPrank();
    }

    function testFailVerifyBid() public {
        createOrg();
        createSupp();
        startHoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        startHoax(address(10));
        tender.bid{value: 0.5 ether}(1, 1, 0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826);
        vm.stopPrank();
        startHoax(address(30));
        uint256 skip_ = 432002;
        skip(skip_);
        tender.approveOrDeclineBid(1, 1, Tenders.Status.approved);
        vm.stopPrank();
        startHoax(address(10));
        /**
         * Verifying started
         */

        uint256[2] memory a = [
            0x1fffbc4865cc11c63997348d724bbcba6ed0f125e3ca5ed242418dab912ce628,
            0x2c4844c608d8c9e47e70946a81c167db7ef209d704b1e81677f257bfbf3213bc
        ];
        uint256[2][2] memory b = [
            [
                0x29b4926bf991400805fb95030844a3c56d22df6f2a559debb68e1826453cef2b,
                0x078d311c95f1e55b468031df80a8f8299b5d0323a7628cf39a927a0d90e60bae
            ],
            [
                0x2c6d73faf0831295eb7c803e3978ab4f09410bfaf79b13f7115a68bd1715e342,
                0x1847801f1cfce3718d32b0a2f5a3b3e52d878e9b3839a863a5a43dafda7c94c8
            ]
        ];
        uint256[2] memory c = [
            0x029bb6c2d992b572ecee3060b2465a5f99df4b6495e2a4b564fdd3f2d46e6e51,
            0x15f00ca4bf304833418c74a0954167d9a00d0e0a5192d1211d436b38a0bceaec
        ];

        uint256[4] memory input = [
            0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826,
            0x0000000000000000000000000000000000000000000000000000000000000002,
            0x0000000000000000000000000000000000000000000000000000000000000001,
            0x0000000000000000000000000000000000000000000000000000000000030d40
        ];

        tender.verifyBid(a, b, c, input);
        vm.expectRevert("Proof not valid");
        vm.stopPrank();
    }

    function testAnnounceWinner() public {
        testVerifyBid();
        uint256 skip1 = 604802;
        skip(skip1);

        startHoax(address(30));

        vm.expectEmit(true, true, true, false);
        emit WinnerAnnounced(1, 1, 200000);
        tender.announceWinner(1);
        vm.stopPrank();
        startHoax(address(10));
        Tenders.Bid memory bid = tender.getYourBid(1, 1);
        assertEq(bid.proof, 0x168c1d608e56211024837c5e5a8296d386255f49e0c51250eb32e321fc734826);
        assertEq(bid.value, 200000);
        assertEq(bid.claimable, false);
    }

    function testFailAnnounceWinner() public {
        testVerifyBid();
        uint256 skip1 = 604802;
        skip(skip1);

        startHoax(address(20));
        tender.announceWinner(1);
        vm.expectRevert("Not allowed for you!");
        vm.stopPrank();
    }

    function testFailAnnounceWinner1() public {
        testVerifyBid();
        uint256 skip1 = 604802;
        skip(skip1);

        startHoax(address(30));
        tender.announceWinner(1);
        tender.announceWinner(1);
        vm.expectRevert("Winner already announceds");
        vm.stopPrank();
    }

    function testPauseTender() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        vm.startPrank(address(30));
        vm.expectEmit(true, false, false, false);
        emit TenderStatus(1, true);
        tender.pauseTender(1);
        Tenders.Tender memory tender_ = tender.getTender(1);
        assertEq(tender_.isPaused, true);
        vm.stopPrank();
    }

    function testFailPauseTender() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        vm.startPrank(address(10));
        tender.pauseTender(1);
        vm.expectRevert("Not allowed for you!");
        vm.stopPrank();
    }

    function testRestartTender() public {
        testPauseTender();
        vm.startPrank(address(30));
        uint256 time = 5 days;
        skip(time);
        vm.expectEmit(true, false, false, false);

        emit TenderStatus(1, false);
        tender.restartTender(1, 5, 2);
        Tenders.Tender memory tender_ = tender.getTender(1);
        assertEq(tender_.isPaused, false);
    }

    function testFailRestartTender() public {
        createOrg();
        hoax(address(30));
        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        vm.stopPrank();
        vm.startPrank(address(30));
        uint256 time = 5 days;
        skip(time);
        tender.restartTender(1, 5, 2);
        vm.expectRevert("Tender not paused");
    }

    function testReturnFunds() public {
        //Todo
    }

    function testGetAllTenders() public {
        createOrg();
        hoax(address(30));

        tender.createNewTender{value: 0.5 ether}(1, "www.tender1.com", 5, 2);
        tender.getAllTenders();
    }

    function createOrg() internal {
        // Organization one
        vm.startPrank(address(30));
        org.registerOrganization("Abissinia Bank", "Addis Ababa", "www.abbisinia.com");
        vm.stopPrank();

        //Organization two
        vm.startPrank(address(40));
        org.registerOrganization("Kaki", "Addis Ababa", "www.kaki.com");
        vm.stopPrank();
    }

    function createSupp() internal {
        //Suppleir one
        vm.startPrank(address(10));
        supp.registerSuppleir("Mebeat", "Addis Ababa", "Belete", "Electronic", "www.mebeat.com");
        vm.stopPrank();

        //Suppleir two
        vm.startPrank(address(20));
        supp.registerSuppleir("Gebeya", "Robe", "Alemitu", "Electronic", "www.gebeya.com");
        vm.stopPrank();
    }
}
