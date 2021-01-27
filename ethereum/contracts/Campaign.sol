pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public campaigns;
    
    function createCampaign(uint minimum) public {
        address campaign = new Campaign(msg.sender, minimum);
        campaigns.push(campaign);
    }
    
    function getCampaigns() public view returns(address[]) {
        return campaigns;
    }
}

contract Campaign {
    struct Request {
        address receiver;
        uint amount;
        string description;
        uint approvals;
        mapping(address=>bool) approvers;
        bool complete;
    }

    address public manager;
    uint public minimum;
    uint public totalContributors;
    mapping(address => bool) public contributors;
    Request[] public requests;

    modifier adminRestricted() {
        require(msg.sender == manager);
        _;
    }
    
    modifier approversRestricted() {
        require(contributors[msg.sender]);
        _;
    }

    function Campaign(address creator, uint minimumContribution) public {
        manager = creator;
        minimum = minimumContribution;
    }
    
    function contribute() public payable {
        require(msg.value >= minimum);

        if(!contributors[msg.sender]) {
            totalContributors++;
        }
        contributors[msg.sender] = true;
    }
    
    function createRequest(address receiver, uint amount, string description) public adminRestricted {
        requests.push(
            Request({
                receiver: receiver,
                amount: amount,
                description: description,
                approvals: 0,
                complete: false
            })
        );
    }
    
    function approveRequest(uint index) public approversRestricted {
        Request storage request = requests[index];
        require(!request.complete);
        require(!request.approvers[msg.sender]);
        
        request.approvers[msg.sender] = true;
        request.approvals++;
    }
    
    function finalizeRequest(uint index) public adminRestricted {
        Request storage request = requests[index];
        require(!request.complete);

        uint votesPercentage = (request.approvals * 100) / totalContributors;
        require(votesPercentage > 50);
        
        request.receiver.transfer(request.amount);
        request.complete = true;
    }

    function getSummary() public view returns(
        uint, uint, uint, uint, address
    ) {
        return (
            this.balance,
            minimum,
            totalContributors,
            requests.length,
            manager
        );
    }

    function getRequestCount() public view returns(uint) {
        return requests.length;
    }
}
