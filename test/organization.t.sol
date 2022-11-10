// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "forge-std/Test.sol";
import "../src/Core/organization.sol";

contract OrganizationTest is Test {
    Organizations organizations;

    event NewOrganizatoinRegistered(uint256 indexed tokenId, address registeredBy, string name);
    event OrganizationProfileUpdated(uint256 indexed tokenId, address updatedBy, string name);
    event OrganizationRemoved(uint256 indexed tokenId, string name);

    function setUp() public {
        organizations = new Organizations();
    }

    function testCreateOrganization() public {
        vm.startPrank(address(20));
        vm.expectEmit(true, true, false, false);

        emit NewOrganizatoinRegistered(1, address(20), "Awash Bank");
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        (Organizations.Organization memory org, string memory tokenURI) = organizations.getOrganizationProfile(1);

        assertEq(org.name, "Awash Bank");
        assertEq(org.location, "Addis Ababa");
        assertEq(tokenURI, "www.ipfs.com");

        vm.stopPrank();
    }

    function testFailCreateOrganization() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");
        organizations.registerOrganization("CBE", "Addis Ababa", "www.ipfs.com");

        vm.expectRevert("Already Registered");
    }

    function testUpdateOrganizationProfile() public {
        vm.startPrank(address(20));

        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");
        (Organizations.Organization memory org, string memory tokenURI) = organizations.getOrganizationProfile(1);

        assertEq(org.name, "Awash Bank");
        assertEq(org.location, "Addis Ababa");
        assertEq(tokenURI, "www.ipfs.com");

        vm.expectEmit(true, false, false, false);
        emit OrganizationProfileUpdated(1, address(20), "CBE");
        organizations.updateOrganizationProfile(1, "CBE", "Robe", "www.ipfs2.com");

        (Organizations.Organization memory org1, string memory tokenURI1) = organizations.getOrganizationProfile(1);

        assertEq(org1.name, "CBE");
        assertEq(org1.location, "Robe");
        assertEq(tokenURI1, "www.ipfs2.com");

        vm.stopPrank();
    }

    function testFailUpdateOrganizationProfile() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        vm.startPrank(address(30));
        organizations.updateOrganizationProfile(1, "CBE", "Robe", "www.ipfs2.com");
        vm.expectRevert("Not allowed for you!");
    }

    function testFailUpdateOrganizationProfile1() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        organizations.updateOrganizationProfile(2, "CBE", "Robe", "www.ipfs2.com");
        vm.expectRevert("Not Registered");
    }

    function testRemoveOrganization() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        vm.expectEmit(true, false, false, false);
        emit OrganizationRemoved(1, "Awash Bank");
        organizations.removeOrganization(1);
    }

    function testFailRemoveOrganization() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        vm.stopPrank();
        vm.startPrank(address(30));
        organizations.removeOrganization(1);
        vm.expectRevert("Not allowed for you!");
    }

    function testFailRemoveOrganization1() public {
        vm.startPrank(address(20));
        organizations.registerOrganization("Awash Bank", "Addis Ababa", "www.ipfs.com");

        organizations.removeOrganization(2);
        vm.expectRevert("Not Registered");
    }
}
