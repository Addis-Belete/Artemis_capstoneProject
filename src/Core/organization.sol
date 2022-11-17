// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

import "openzeppelin-contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @notice Is a contract that stores all organization informations
 * @title Organization contract
 * @author Addis Belete
 */
contract Organizations is ERC721URIStorage {
    struct Organization {
        string name; // name of organization or company
        string location; // address of organization or company
        uint256 registeredAt; // registeration date
        uint256 updatedAt; // the date where the profile updated
    }

    uint256 tokenId;
    mapping(uint256 => Organization) private organizations; // tokenId -> Organization
    mapping(address => uint256) private Ids;
    /**
     * @notice Emitted when new organization or company registered
     * @param tokenId The unique Id of the token that represents the organization or company
     * @param registeredBy The address who registered the organization or company
     * @param name The name of the organization
     */

    event NewOrganizatoinRegistered(uint256 indexed tokenId, address registeredBy, string name);

    /**
     * @notice Emitted when new organization or company profile updated
     * @param tokenId The unique Id of the token that represents the organization or company
     * @param updatedBy The address who updates the organization or company profile
     * @param name The name of the organization
     */
    event OrganizationProfileUpdated(uint256 indexed tokenId, address updatedBy, string name);

    /**
     * @notice Emitted when organization or company removed
     * @param tokenId The unique Id of the token that represents the organization or company
     * @param name The name of the organization
     */
    event OrganizationRemoved(uint256 indexed tokenId, string name);

    constructor() ERC721("Organization's profile", "OPF") {}

    /**
     * @notice Register's new organization or company
     * @dev One address can only register one company or organization
     * @param name_ Name of organization or company
     * @param location_ The location of the organization
     * @param tokenURI_ The metadata URL that contains all company or organiztion information
     */

    function registerOrganization(string memory name_, string memory location_, string memory tokenURI_) external {
        require(balanceOf(msg.sender) == 0, "Already Registered");
        tokenId++;

        Organization memory organization_ =
            Organization({name: name_, location: location_, registeredAt: block.timestamp, updatedAt: 0});

        organizations[tokenId] = organization_;

        _mint(msg.sender, tokenId);

        _setTokenURI(tokenId, tokenURI_);
        Ids[msg.sender] = tokenId;

        emit NewOrganizatoinRegistered(tokenId, msg.sender, name_);
    }

    /**
     * @notice Updates organization or company profile
     * @dev Only owner or allowed address can update
     * @param name_ Name of organization or company
     * @param location_ The location of the organization
     * @param tokenURI_ The metadata URL that contains all company or organiztion information
     */
    function updateOrganizationProfile(
        uint256 tokenId_,
        string memory name_,
        string memory location_,
        string memory tokenURI_
    ) external {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Not Registered");
        address owner = ownerOf(tokenId_);
        require(
            msg.sender == owner || getApproved(tokenId_) == msg.sender || isApprovedForAll(owner, msg.sender),
            "Not allowed for you!"
        );

        Organization storage organization_ = organizations[tokenId_];
        organization_.name = name_;
        organization_.location = location_;

        _setTokenURI(tokenId_, tokenURI_);

        emit OrganizationProfileUpdated(tokenId, msg.sender, name_);
    }

    /**
     * @notice Used to remove organization or contract from the contract
     * @dev Only called by owner or by address that have allowance
     * @param tokenId_ The Id of token that represent's the organization or company
     */
    function removeOrganization(uint256 tokenId_) external {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Not Registered");
        address owner = ownerOf(tokenId_);
        require(
            msg.sender == owner || getApproved(tokenId_) == msg.sender || isApprovedForAll(owner, msg.sender),
            "Not allowed for you!"
        );
        _burn(tokenId);

        Organization storage organization_ = organizations[tokenId_];

        emit OrganizationRemoved(tokenId, organization_.name);
        delete Ids[msg.sender];
        delete organization_.name;
        delete organization_.location;
        delete organization_.registeredAt;
        delete organization_.updatedAt;
    }

    function getOrganizationProfile(uint256 tokenId_) external view returns (Organization memory, string memory) {
        require(tokenId_ > 0 && tokenId_ <= tokenId, "Organization not found");

        Organization memory organization_ = organizations[tokenId_];

        string memory tokenURI_ = tokenURI(tokenId_);

        return (organization_, tokenURI_);
    }

    function getYourOrganiationId() external view returns (uint256) {
        uint256 id = Ids[msg.sender];
        require(id > 0, "This address not registered");
        return id;
    }
}
