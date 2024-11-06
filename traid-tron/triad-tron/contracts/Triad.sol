//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }

    function _msgValue() internal view virtual returns (uint256 value) {
        return msg.value;
    }
}

abstract contract Owner is Context {
    address public owner;

    constructor() {
        owner = _msgSender();
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_msgSender() == owner, "Not the contract owner");
        _;
    }

    /**
     * @dev Check if the current caller is the contract owner.
     */
    function isOwner() internal view returns (bool) {
        return owner == _msgSender();
    }
}

contract Triad is Owner {
    struct Ad {
        string name;
        string description;
        string mediaFileLink;
        string linkToTarget;
        uint64 impressionsCountLimit;
        uint64 impressionsCount;
        uint64 budget;
        address advertiserAddress;
    }

    struct Publisher {
        address creatorAddress;
        uint64 impressions;
        uint256 earnings;
    }

    uint256 public adId;
    uint256 public publisherId;
    uint256 public ratePerImpression;

    mapping(uint256 => Ad) public ads;
    mapping(uint256 => Publisher) public publishers;

    constructor() {
        ratePerImpression = 1; // Default rate per impression
    }

    function setRatePerImpression(uint256 _rate) public onlyOwner {
        ratePerImpression = _rate;
    }

    function getRatePerImpression() public view returns (uint256) {
        return ratePerImpression;
    }

    function createAd(
        string memory name,
        string memory description,
        string memory mediaFileLink,
        string memory linkToTarget,
        uint64 impressionsCountLimit,
        uint64 impressionsCount,
        uint64 budget
    ) public payable returns (bool success) {
        require(msg.value == budget, "Budget not sent with correct value");

        ads[adId] = Ad({
            name: name,
            description: description,
            mediaFileLink: mediaFileLink,
            linkToTarget: linkToTarget,
            impressionsCountLimit: impressionsCountLimit,
            impressionsCount: impressionsCount,
            budget: budget,
            advertiserAddress: _msgSender()
        });

        emit NewAd(adId++);

        return true;
    }

    function incrementImpressionsCount(
        uint256 _adId,
        uint256 _publisherId
    ) public {
        require(_adId < adId, "Invalid ad ID");
        require(_publisherId < publisherId, "Invalid publisher ID");
        require(
            ads[_adId].impressionsCount < ads[_adId].impressionsCountLimit,
            "Impression count limit reached"
        );

        ads[_adId].impressionsCount++;
        publishers[_publisherId].impressions++;
        publishers[_publisherId].earnings += ratePerImpression;
    }

    function createPublisher() public returns (bool success) {
        publishers[publisherId] = Publisher({
            creatorAddress: _msgSender(),
            impressions: 0,
            earnings: 0
        });

        emit NewPublisher(publisherId);
        publisherId++;

        return true;
    }

    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }

    function removeAdIfLimitReached(uint256 _adId) public onlyOwner {
        require(_adId < adId, "Invalid ad ID");

        Ad storage ad = ads[_adId];
        require(
            ad.impressionsCount >= ad.impressionsCountLimit,
            "Impressions count is below the limit"
        );

        delete ads[_adId];

        emit AdRemoved(_adId);
    }

    function checkPublisherDetails(
        uint256 _publisherId
    )
        public
        view
        returns (address creatorAddress, uint256 impressions, uint256 earnings)
    {
        require(
            publishers[_publisherId].creatorAddress == msg.sender,
            "Only the publisher can check their details"
        );
        return (
            publishers[_publisherId].creatorAddress,
            publishers[_publisherId].impressions,
            publishers[_publisherId].earnings
        );
    }

    function withdrawEarnings(uint256 publisherId) public {
        uint256 earnings = publishers[publisherId].earnings;
        require(
            publishers[publisherId].creatorAddress == msg.sender,
            "Only the publisher can withdraw their earnings"
        );
        require(earnings > 0, "No earnings available for withdrawal");

        publishers[publisherId].earnings = 0;
        uint256 convertedEarnings = earnings * 1000000;
        payable(msg.sender).transfer(convertedEarnings);
        emit EarningsWithdrawn(msg.sender, earnings);
    }

    function withdrawSurplus(uint256 amountToWithdraw) public onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(
            contractBalance >= amountToWithdraw,
            "Insufficient contract balance for withdrawal"
        );

        uint256 totalEarnings = 0;
        for (uint256 i = 0; i < publisherId; i++) {
            totalEarnings += publishers[i].earnings;
        }

        uint256 totalImpressions = 0;
        for (uint256 i = 0; i < adId; i++) {
            totalImpressions +=
                ads[i].impressionsCountLimit -
                ads[i].impressionsCount;
        }

        uint256 surplus = contractBalance -
            totalEarnings -
            (totalImpressions * ratePerImpression);
        require(
            surplus >= amountToWithdraw,
            "Insufficient surplus funds for withdrawal"
        );

        payable(owner).transfer(amountToWithdraw);
        emit SurplusWithdrawn(owner, amountToWithdraw);
    }

    event NewAd(uint256 indexed adId);
    event NewPublisher(uint256 indexed publisherId);
    event AdRemoved(uint256 indexed adId);
    event EarningsWithdrawn(address indexed publisher, uint256 amount);
    event SurplusWithdrawn(address indexed owner, uint256 surplus);
}
