pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "Dapp Token Farm";
    DaiToken public daiToken;
    DappToken public dappToken;
    address public owner;

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    address[] public stakers;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        daiToken = _daiToken;
        dappToken = _dappToken;
        owner = msg.sender;
    }

    //1. Stakes Dai Tokens(Deposit)
    function stakeTokens(uint256 _amount) public {
        //require amount greater than 0
        require(_amount > 0, "amount cannotbe zero");

        //Transfer Mock Dai tokens to this contract for staking
        daiToken.transferFrom((msg.sender), address(this), _amount);

        //update staking balance
        stakingBalance[msg.sender] += _amount;

        //add user to stakers array only if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //2. Issue Dapp tokens
    function issueTokens() public {
        require(msg.sender == owner, "caller must be the owner");
        for (uint256 i = 0; i < stakers.length; ++i) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }

    //3. Unstaking Tokens (Withdraw)
    function unstakeTokens() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "staking balabce cannot be 0");
        daiToken.transfer(msg.sender, balance);
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    } 
}
