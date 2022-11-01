// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

import "../../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Organization is ERC721URIStorage {
    constructor() ERC721("Suppleir's profile", "SPF") {}
}
