const EthereumTx = require('ethereumjs-tx').Transaction;
const privateKeys = require('./truffle-keys').private;
const publicKeys = require('./truffle-keys').public;
const TopcoderCoin = artifacts.require('./TopcoderCoin.sol');

contract('TopcoderCoin (integration)', function (accounts) {
  let contract;
  let owner;
  let web3Contract;
  let owner2
  let owner3

  before(async () => {
    contract = await TopcoderCoin.deployed();
    web3Contract = new web3.eth.Contract(contract.abi, contract.address);

    owner = accounts[0];
    console.log('owner:', owner)
    //owner2 = web3.eth.getCoinbase()
    //owner3 = web3.eth.getAccounts()

    //let other = web3.eth.accounts[1];

    // if (publicKeys[0] !== owner || publicKeys[1] !== other) {
    // throw new Error('Use `truffle develop` and /test/truffle-keys.js');
    //}

  });

  it('should pass if contract is deployed', async function () {
    let name = await contract.name();
    assert.strictEqual(name, 'Topcoder Coin');
  });

  it('should return inital Topcoder Coin balance of 1 billion', async function () {

    let ownerBalance = await contract.balanceOf(owner);
    ownerBalance = web3.utils.fromWei(ownerBalance, 'ether')
    //ownerBalance = ownerBalance.toString();
    //console.log('owner balance', ownerBalance)
    assert.strictEqual(ownerBalance, '1000000000');
  });

  it('should transfer some Topcoder Coin', async () => {

    let recipient = accounts[1];
    let tokenWei = 1000000;

    await contract.transfer(recipient, tokenWei);

    let ownerBalance = await contract.balanceOf(owner);
    let recipientBalance = await contract.balanceOf(recipient);

    assert.strictEqual(recipientBalance.toNumber(), tokenWei);
    assert.strictEqual(ownerBalance.toString(), '999999999999999999999000000');
  })


  it('should return the [totalSupply] of Topcoder Coin', async () => {
    let totalSupply = await contract.totalSupply();
    totalSupply = web3.utils.fromWei(totalSupply, 'ether');
    assert.strictEqual(totalSupply, '1000000000');
  });


  it('should [approve] Topcoder Coin for [transferFrom]', async () => {
    let approver = owner;
    let spender = accounts[1];

    let originalAllowance = await contract.allowance(approver, spender);

    let tokenWei = 1000000;
    await contract.approve(spender, tokenWei);
    //console.log('originalAllowance:', originalAllowance.toNumber())
    //after [approve] we have new [allowance]
    let resultAllowance = await contract.allowance(approver, spender);
    console.log('resultAllowance after approval:', resultAllowance.toNumber())
    assert.strictEqual(originalAllowance.toNumber(), 0);
    assert.strictEqual(resultAllowance.toNumber(), tokenWei);
  });

  it('should fail to [transferFrom] more than allowed', async () => {
    //let from = owner;
    let from = accounts[1];
    //let to = accounts[2];
    let to = accounts[2];
    let spenderPrivateKey = privateKeys[2];
    let tokenWei = 1000000;

    //let allowance = await contract.allowance(from, to);
    //let ownerBalance = await contract.balanceOf(from);
    //let spenderBalance = await contract.balanceOf(to);



    await contract.transferFrom(from, to, tokenWei);

    // let errorMessage;
    // try {
    //   await rawTransaction(
    //     to,
    //     spenderPrivateKey,
    //     contract.address,
    //     data,
    //     0
    //   );
    // } catch (error) {
    //   errorMessage = error.message;
    // }

    ownerBalance = await contract.balanceOf(from);
    console.log('Owner balance after transfer', ownerBalance.toString())
    //assert.equal(ownerBalance.toString(), '999999999999999999994000000')

    //assert.strictEqual(
    // errorMessage,
    // 'VM Exception while processing transaction: invalid opcode'
    // 'invalid type'
    // );
  });




});

/*
 * Call a smart contract function from any keyset in which the caller has the
 *     private and public keys.
 * @param {string} senderPublicKey Public key in key pair.
 * @param {string} senderPrivateKey Private key in key pair.
 * @param {string} contractAddress Address of Solidity contract.
 * @param {string} data Data from the function's `getData` in web3.js.
 * @param {number} value Number of Ethereum wei sent in the transaction.
 * @return {Promise}
 */
function rawTransaction(
  senderPublicKey,
  senderPrivateKey,
  contractAddress,
  data,
  value
) {
  return new Promise((resolve, reject) => {

    let key = new Buffer(senderPrivateKey, 'hex');
    let nonce = web3.utils.toHex(web3.eth.getTransactionCount(senderPublicKey));

    let gasPrice = web3.eth.gasPrice;
    let gasPriceHex = web3.utils.toHex(web3.eth.estimateGas({
      from: contractAddress
    }));
    let gasLimitHex = web3.utils.toHex(5500000);

    let rawTx = {
      nonce: nonce,
      gasPrice: gasPriceHex,
      gasLimit: gasLimitHex,
      data: data,
      to: contractAddress,
      value: web3.utils.toHex(value)
    };

    let tx = new EthereumTx(rawTx);
    tx.sign(key);

    let stx = '0x' + tx.serialize().toString('hex');

    web3.eth.sendRawTransaction(stx, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });

  });
}
