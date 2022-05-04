// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "zeppelin-solidity/contracts/math/SafeMath.sol";

contract TopcoderCoin {
    using SafeMath for uint256;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    event ValueReceived(address user, uint256 amount);

    string public symbol;
    string public name;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowed;

    constructor() {
        symbol = "$TCC";
        name = "Topcoder Coin";
        decimals = 18;
        totalSupply = 1000000000 * 10**uint256(decimals);
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    fallback() external payable {
        revert();
    }

    receive() external payable {
        emit ValueReceived(msg.sender, msg.value);
    }

    /**
     * Gets the token balance of any wallet.
     * param _owner Wallet address of the returned token balance.
     * return The balance of tokens in the wallet.
     */
    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balances[_owner];
    }

    /**
     * Transfers tokens from the sender's wallet to the specified `_to` wallet.
     * param _to Address of the transfer's recipient.
     * param _value Number of tokens to transfer.
     * return True if the transfer succeeded, false if not.
     */
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * Transfer tokens from any wallet to the `_to` wallet. This only works if
     *     the `_from` wallet has already allocated tokens for the caller keyset
     *     using `approve`. From wallet must have sufficient balance to
     *     transfer. Caller must have sufficient allowance to transfer.
     * param _from Wallet address that tokens are withdrawn from.
     * param _to Wallet address that tokens are deposited to.
     * param _value Number of tokens transacted.
     * return True if the transfer succeeded, false if not.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        balances[_from] = balances[_from].sub(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    /**
     * Sender allows another wallet to `transferFrom` tokens from their wallet.
     * param _spender Address of `transferFrom` recipient.
     * param _value Number of tokens to `transferFrom`.
     * return True if the approval succeeded, false if not.
     */
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     *To get token approved for transfer to a spender
     * Gets the number of tokens that a `_owner` has approved for a _spender
     *     to `transferFrom`.
     * param _owner Wallet address that tokens can be withdrawn from.
     * param _spender Wallet address that tokens can be deposited to.
     * return The number of tokens allowed to be transferred.
     */
    function allowance(address _owner, address _spender)
        external
        view
        returns (uint256 remaining)
    {
        return allowed[_owner][_spender];
    }
}
