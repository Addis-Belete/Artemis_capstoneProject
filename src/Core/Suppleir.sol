// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

import "../../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @notice Is a contract used to manage suppliers profile
 * @title Suppleirs contract
 * @author Addis Belete
 */
contract Suppleirs is ERC721URIStorage {
    struct SuppleirProfile {
        string name; // name of the supplier
        string addr; // location of supplier
        string owner; // owner or manager name
        string categories; // The category of the material a suppleir can provide
        uint256 registeredAt; // registration date
    }

    uint256 tokenId;

    mapping(uint256 => SuppleirProfile) private suppleirs; // tokenId -> SuppleirProfile

    /**
     * @notice Is Emitted when a new suppleir is registered
     * @param tokenId The unique ID of the supplier
     * @param owner The address of owner who registered the suppleir
     * @param name Name of the suppleir
     */
    event NewSuppleirRegistered(uint256 indexed tokenId, address owner, string name);
    /**
     * @notice Is Emitted when a existing profile updated
     * @param tokenId The unique ID of the supplier
     * @param updatedBy The address who updated the profile
     * @param name Name of the suppleir
     */
    event ProfileUpdated(uint256 indexed tokenId, address updatedBy, string name);
    /**
     * @notice Is Emitted when a suppleir is removed from contract
     * @param tokenId The unique ID of the supplier
     * @param removedBy The address who removed the suppleir
     * @param name Name of the suppleir
     */
    event SuppleirRemoved(uint256 indexed tokenId, address removedBy, string name);

    constructor() ERC721("Suppleir's profile", "SPF") {}

    /**
     * @notice Is used to register a new suppleir
     * @dev one address can only registered once
     * @param name_ Name of the supplier
     * @param addr_ Location of supplier
     * @param owner_ Owner or manager name
     * @param categories_ The categorier of material the suppleir can provide
     * @param tokenURI_ The Metadata that contains all suppleir valid in licenses
     */
    function registerSuppleir(
        string memory name_,
        string memory addr_,
        string memory owner_,
        string memory categories_,
        string memory tokenURI_
    ) external {
        require(balanceOf(msg.sender) == 0, "Already Registered");
        tokenId++;

        SuppleirProfile memory _suppleir = SuppleirProfile({
            name: name_,
            addr: addr_,
            owner: owner_,
            categories: categories_,
            registeredAt: block.timestamp
        });
        suppleirs[tokenId] = _suppleir;

        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, tokenURI_);

        emit NewSuppleirRegistered(tokenId, msg.sender, name_);
    }
    /**
     * @notice Updates the profile of the suppleir
     * @dev Only called by owner or by addresses that have approvals
     * @param tokenId_ The unique Id of the profile to be updated
     * @param name_ Name of the supplier
     * @param addr_ Location of supplier
     * @param owner_ Owner or manager name
     * @param categories_ The categorier of material the suppleir can provide
     * @param tokenURI_ The Metadata that contains all suppleir valid in licenses
     */

    function updateSuppleirProfile(
        uint256 tokenId_,
        string memory name_,
        string memory addr_,
        string memory owner_,
        string memory categories_,
        string memory tokenURI_
    ) external {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Not Registered");
        address owner = ownerOf(tokenId_);
        require(
            msg.sender == owner || getApproved(tokenId_) == msg.sender || isApprovedForAll(owner, msg.sender),
            "Not allowed for you!"
        );
        SuppleirProfile storage _suppleir = suppleirs[tokenId_];
        _suppleir.addr = addr_;
        _suppleir.name = name_;
        _suppleir.owner = owner_;
        _suppleir.categories = categories_;

        _setTokenURI(tokenId_, tokenURI_);

        emit ProfileUpdated(tokenId_, msg.sender, name_);
    }
    /**
     * @notice Remove All suppleir's data from the contract
     * @dev Only called by owner or by addresses that have approvals
     * @param tokenId_ The unique Id of the profile to be removed
     */

    function removeSuppleir(uint256 tokenId_) external {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Suppleir Profile not found");
        address owner = ownerOf(tokenId_);
        require(
            msg.sender == owner || getApproved(tokenId_) == msg.sender || isApprovedForAll(owner, msg.sender),
            "Not allowed for you!"
        );
        _burn(tokenId_);
        SuppleirProfile storage _suppleir = suppleirs[tokenId_];

        emit SuppleirRemoved(tokenId_, msg.sender, _suppleir.name);

        delete _suppleir.name;
        delete _suppleir.addr;
        delete _suppleir.categories;
        delete _suppleir.owner;
        delete _suppleir.registeredAt;
    }

    /**
     * @notice Used to get suppleir information
     * @param tokenId_ the Id of a particular suppleir
     */
    function getSuppleirProfile(uint256 tokenId_) external view returns (SuppleirProfile memory, string memory) {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Suppleir not found");

        SuppleirProfile memory suppleir_ = suppleirs[tokenId_];

        string memory tokenURI_ = tokenURI(tokenId_);

        return (suppleir_, tokenURI_);
    }
}
