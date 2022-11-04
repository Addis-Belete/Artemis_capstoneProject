// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.7;

import "../../lib/openzeppelin-contracts/contracts/interfaces/IERC721.sol";

/**
 * @notice Is contract that makes org to create tender and
 * @title Tenders contract
 * @author Addis Belete
 */
contract Tenders {
    enum Stages {
        bidding, // is when bidding is possible
        verifying, // is when bidding finished and bidder can verify his proof
        closed // is when proposal closed
    }

    // status of suppleir bid. Organization can look at there profile and approve or decline the bid from supplier
    enum Status {
        pending,
        approved,
        declined
    }

    struct Tender {
        uint256 organizationId;
        string tenderURI;
        Stages stage; // The stage of the tender
        uint256 bidStartTime; //The time where bidding started;
        uint256 bidEndTime; // The time where bidding ends
        uint256 verifyingTime; // the duration where bidders verify there proofs
        uint256 winnerId; // The Id of the winner
    }
    //Suppleir bid information

    struct Bid {
        bytes32 proof;
        uint256 value;
        Status status;
        bool claimable;
    }

    struct Winner {
        uint256 suppleirId;
        uint256 winningValue;
    }

    uint256 tenderId;
    address owner; // deployer address

    IERC721 Org; // Interface for Organization contract
    IERC721 supp; // Interface for suppleir contract
    mapping(uint256 => Tender) private tenders; // tenderId -> Tender
    mapping(uint256 => mapping(uint256 => Bid)) private bidding; // tenderId -> tokenId -> Bid
    mapping(uint256 => uint256[]) private biddersId; // tenderId -> bidders(suppliers) Id
    mapping(uint256 => Winner) private winner;

    /**
     * @notice Emitted when a new tender created.
     * @param orgId The Id of the organization who created the tender
     * @param tenderId The Id of the created tender
     * @param bidEndDate The Date where bidding ends
     */
    event NewTenderCreated(
        uint256 indexed orgId, uint256 indexed tenderId, uint256 indexed bidEndDate, uint256 verifyingEndDate
    );

    /**
     * @notice Emitted when there is new bid for a particular tender
     * @param tenderId The Id of the tender
     * @param suppleirId The Id of the suppleir who bids
     */
    event NewBidAdded(uint256 indexed tenderId, uint256 indexed suppleirId);

    /**
     * @notice Emitted when the status of the bid changed. wether approved or declined
     * @param tenderId The Id of the tender where the suppleir bids
     * @param suppleirId The Id of suppleir who bids
     */
    event BidStatusChanged(uint256 indexed tenderId, uint256 indexed suppleirId, Status status);

    /**
     * @notice Emitted When Fund is returned to a user
     * @param tenderId The Id of tender
     * @param suppleirId The Id of the suppleir
     */
    event FundReturned(uint256 indexed tenderId, uint256 indexed suppleirId);

    constructor(address organizationAddress_, address suppleirAddress_) {
        Org = IERC721(organizationAddress_);
        supp = IERC721(suppleirAddress_);
        owner = msg.sender;
    }
    /**
     * @notice Add's new tender to the contract
     * @dev The creator can pay 2gwei to list his tender and only registered organization or company call this function
     * @param orgId_ The Id of the organization or company
     * @param tenderURI_ The metadata of the tender
     * @param bidPeriod The duration of the bid
     * @param verifyingPeriod The duration of verifying the proof
     */

    function createNewTender(uint256 orgId_, string memory tenderURI_, uint256 bidPeriod, uint256 verifyingPeriod)
        external
        payable
    {
        require(Org.ownerOf(orgId_) != address(0), "Organization not found");

        require(
            Org.ownerOf(orgId_) == msg.sender || Org.getApproved(orgId_) == msg.sender
                || Org.isApprovedForAll(Org.ownerOf(orgId_), msg.sender),
            "Not allowed for you!"
        );

        require(msg.value == 0.5 ether, " 0.5 ether platform fee");
        tenderId++;
        uint256 bidEnd_ = (bidPeriod * 1 days) + block.timestamp;
        uint256 verifyingEndDate_ = bidEnd_ + verifyingPeriod * 1 days;
        tenders[tenderId] = Tender({
            organizationId: orgId_,
            tenderURI: tenderURI_,
            stage: Stages.bidding,
            bidStartTime: block.timestamp,
            bidEndTime: bidEnd_,
            verifyingTime: verifyingEndDate_,
            winnerId: 0
        });

        emit NewTenderCreated(orgId_, tenderId, bidEnd_, verifyingEndDate_);
    }

    /**
     * @notice User can bid for tender using this function and pay 0.5 eth for bidding.
     * @dev The eth deducted from winner only. other bidder can claim there funds after bidding closed
     * @param suppleirId_ The Id of the suppleir
     * @param tenderId_ The Id of the tender
     * @param proof_ The proof a user can provide
     */
    function bid(uint256 suppleirId_, uint256 tenderId_, bytes32 proof_) external payable {
        require(tenderId_ > 0 && tenderId_ <= tenderId, "tender not found");
        require(supp.ownerOf(suppleirId_) != address(0), "suppleir not found");
        require(
            supp.ownerOf(suppleirId_) == msg.sender || supp.getApproved(suppleirId_) == msg.sender
                || supp.isApprovedForAll(supp.ownerOf(suppleirId_), msg.sender),
            "Not allowed for you!"
        );
        require(msg.value == 0.5 ether, "0.5 ether platform fee");
        Tender memory tender_ = tenders[tenderId_];
        uint256 endDate = tender_.bidEndTime;
        require(block.timestamp < endDate, "Bidding closed");

        bidding[tenderId][suppleirId_] = Bid({proof: proof_, value: 0, status: Status.pending, claimable: true});

        biddersId[tenderId].push(suppleirId_);

        emit NewBidAdded(tenderId_, suppleirId_);
    }
    /**
     * @notice Changes the status of the bid from pending to approve or decline
     * @dev only called by tender owner
     * @param tenderId_ The id of the tender
     * @param suppleirId_ The Id of the suppleir
     * @param status_ The Status of the bid to be changed
     */

    function changeStatus(uint256 tenderId_, uint256 suppleirId_, Status status_) external {
        require(tenderId_ > 0 && tenderId_ <= tenderId, "tender not found");
        Tender memory tender_ = tenders[tenderId_];
        uint256 tenderOwner_ = tender_.organizationId;

        require(
            Org.ownerOf(tenderOwner_) == msg.sender || Org.getApproved(tenderOwner_) == msg.sender
                || Org.isApprovedForAll(Org.ownerOf(tenderOwner_), msg.sender),
            "Not allowed for you!"
        );
        require(tender_.bidEndTime < block.timestamp || tender_.stage != Stages(2), "tender closed or on bidding stage");
        bidding[tenderId_][suppleirId_].status = status_;

        emit BidStatusChanged(tenderId_, suppleirId_, status_);
    }
    /**
     * @notice Verifies the proof
     */

    function verifyProof() external {}

    function getWinner(uint256 tenderId_) external returns (uint256, uint256) {}

    /**
     * @notice Used to return funds of user who not won the bid for a particular tenders
     * @param tenderId_ The Id of the tender
     * @param suppleirId_ The Id of the suppleir
     */
    function returnFunds(uint256 tenderId_, uint256 suppleirId_) external returns (bool success) {
        require(tenderId_ > 0 && tenderId_ <= tenderId, "tender not found");
        require(supp.ownerOf(suppleirId_) != address(0), "suppleir not found");
        require(
            supp.ownerOf(suppleirId_) == msg.sender || supp.getApproved(suppleirId_) == msg.sender
                || supp.isApprovedForAll(supp.ownerOf(suppleirId_), msg.sender),
            "Not allowed for you!"
        );

        Tender memory tender_ = tenders[tenderId_];

        require(tender_.stage == Stages(2), "Tender not closed");
        Bid storage bid_ = bidding[tenderId_][suppleirId_];

        require(bid_.proof != bytes32(0x0), "Bid not found");
        require(bid_.claimable, "Winner or already fund returned");

        bid_.claimable = false;
        (success,) = msg.sender.call{value: 0.05 ether}("");
        require(success, "fund return failed");

        emit FundReturned(tenderId_, suppleirId_);
    }
    /**
     * @notice Used to get the bidders Id for a particular tender
     * @param tenderId_ The Id of a tender
     */

    function getListOfbidders(uint256 tenderId_) external view returns (uint256[] memory) {
        return biddersId[tenderId_];
    }
}
