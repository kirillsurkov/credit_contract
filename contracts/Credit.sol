pragma solidity ^0.5.12;

contract Credit {
    struct Request {
        address payable sender;
        uint256 amount;
        bool approved;
    }

    event OrderId(uint256 id);
    
    address public owner;
    mapping(uint256 => Request) public requests;
    uint256 order_id;
    uint256 locked_balance;
    
    modifier onlyowner() {
        require(msg.sender == owner);
        _;
    }
    
    function() payable external {
    }
    
    constructor() public {
        owner = msg.sender;
        order_id = 0;
    }
    
    function _user_request(address payable sender, uint256 amount) private {
        require(amount > 0);
        requests[++order_id] = Request(sender, amount, false);
        emit OrderId(order_id);
    }
    
    function _user_take(address sender, uint256 id) private {
        Request storage req = requests[id];
        require(req.sender == sender);
        require(req.approved);
        locked_balance -= req.amount;
        req.sender.transfer(req.amount);
    }
    
    function _user_deny(address sender, uint256 id) private {
        Request storage req = requests[id];
        require(req.sender == sender);
        require(req.approved);
        locked_balance -= req.amount;
        delete requests[id];
    }
    
    function extract_sender(bytes memory data, uint8 v, bytes32 r, bytes32 s) private view returns (address payable signer) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 hash = keccak256(abi.encodePacked(prefix, keccak256(data)));
        signer = address(uint160(ecrecover(hash, v, r, s)));

        address _signer;
        assembly {
            _signer := mload(add(data, add(20, 20)))
        }
        require(signer == _signer);
        
        address _this;
        assembly {
            _this := mload(add(data, 20))
        }
        require(_this == address(this));
        
        return signer;
    }

    function user_request_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s) public {
        address payable sender = extract_sender(data, v, r, s);
        uint256 amount;
        assembly {
            amount := mload(add(data, add(32, 44)))
        }
        _user_request(sender, amount);
    }
    
    function user_take_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s) public {
        address payable sender = extract_sender(data, v, r, s);
        uint256 id;
        assembly {
            id := mload(add(data, add(32, 44)))
        }
        _user_take(sender, id);
    }
    
    function user_deny_delegated(bytes memory data, uint8 v, bytes32 r, bytes32 s) public {
        address payable sender = extract_sender(data, v, r, s);
        uint256 id;
        assembly {
            id := mload(add(data, add(32, 44)))
        }
        _user_deny(sender, id);
    }
    
    function user_request(uint256 amount) public {
        _user_request(msg.sender, amount);
    }
    
    function user_take(uint256 id) public {
        _user_take(msg.sender, id);
    }
    
    function user_deny(uint256 id) public {
        _user_deny(msg.sender, id);
    }

    function approve(uint256 id, uint256 amount) public onlyowner {
        Request storage req = requests[id];
        require(amount <= req.amount);
        require(amount <= address(this).balance - locked_balance);
        locked_balance += amount;
        req.amount = amount;
        req.approved = true;
    }
    
    function refuse(uint256 id) public onlyowner {
        delete requests[id];
    }
}
