// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "forge-std/Test.sol";
import "../src/Core/Suppleir.sol";

contract TestSuppleir is Test {
    Suppleirs suppleirs;

    event NewSuppleirRegistered(uint256 indexed tokenId, address owner, string name);
    event ProfileUpdated(uint256 indexed tokenId, address updatedBy, string name);
    event SuppleirRemoved(uint256 indexed tokenId, address removedBy, string name);

    function setUp() public {
        suppleirs = new Suppleirs();
    }

    function testRegisterSuppleir() public {
        vm.startPrank(address(20));
        vm.expectEmit(true, false, false, false);
        emit NewSuppleirRegistered(1, address(20), "Donsa");

        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        (Suppleirs.SuppleirProfile memory prof, string memory tokenURI) = suppleirs.getSuppleirProfile(1);

        assertEq(prof.name, "Donsa");
        assertEq(prof.addr, "Addis Ababa");
        assertEq(prof.owner, "Addis");
        assertEq(prof.categories, "Electronics");
        assertEq(tokenURI, "www.suppleir.com");
        vm.stopPrank();
    }

    function testFailRegisterSuppleir() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        vm.expectRevert("Already Registered");
    }

    function testUpdateSuppleirProfile() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        vm.expectEmit(true, false, false, false);

        emit ProfileUpdated(1, address(20), "Gebeya");
        suppleirs.updateSuppleirProfile(1, "Gebeya", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        (Suppleirs.SuppleirProfile memory prof, string memory tokenURI) = suppleirs.getSuppleirProfile(1);

        assertEq(prof.name, "Gebeya");
        assertEq(prof.addr, "Addis Ababa");
        assertEq(prof.owner, "Addis");
        assertEq(prof.categories, "Electronics");
        assertEq(tokenURI, "www.suppleir.com");
        vm.stopPrank();
    }

    function testFailUpdateSuppleirProfile() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");
        vm.stopPrank();
        vm.startPrank(address(30));

        suppleirs.updateSuppleirProfile(1, "Gebeya", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");
        vm.expectRevert("Not allowed for you!");
    }

    function testFailUpdateSuppleirProfile1() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        suppleirs.updateSuppleirProfile(2, "Gebeya", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");
        vm.expectRevert("Not Registered");
    }

    function testRemoveSuppleir() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        vm.expectEmit(true, false, false, false);

        emit SuppleirRemoved(1, address(20), "Donsa");
        suppleirs.removeSuppleir(1);
    }

    function testFailRemoveSuppleir() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        vm.stopPrank();
        vm.startPrank(address(30));
        suppleirs.removeSuppleir(1);

        vm.expectRevert("Not allowed for you!");
    }

    function testFailRemoveSuppleir1() public {
        vm.startPrank(address(20));
        suppleirs.registerSuppleir("Donsa", "Addis Ababa", "Addis", "Electronics", "www.suppleir.com");

        suppleirs.removeSuppleir(2);

        vm.expectRevert("Not found");
    }
}
