const Credit = artifacts.require("./Credit.sol");
const BigNumber = require("bignumber.js");
const gasPrice = new BigNumber("2000000000");

contract("Credit", async accounts => {
    async function delegate_args(contract, signer, method, args) {
        let data = contract.address + signer.slice(2) + contract.contract.methods[method].apply(null, args).encodeABI().slice(2);
        let signature = (await web3.eth.sign(web3.utils.sha3(data), signer)).slice(2);
        let r = "0x" + signature.slice(0, 64);
        let s = "0x" + signature.slice(64, 128);
        let v = parseInt(signature.slice(128));
        if (v < 27) {
            v += 27;
        }
        return [data, v, r, s];
    }

    async function delegate(contract, signer, from, method, abi, args) {
        return await contract[method].apply(null, (await delegate_args(contract, signer, abi, args)).concat([{from: from}]));
    }

    it("test request-approve-take", async () => {
        let contract = await Credit.deployed();
        await web3.eth.sendTransaction({from: accounts[0], to: contract.address, value: web3.utils.toWei("5", "ether")});

        let order = (await contract.user_request(web3.utils.toWei("10", "ether"), {from: accounts[1]})).logs[0].args[0].toString();

        await contract.approve(order, web3.utils.toWei("1", "ether"), {from: accounts[0]});

        let balance = new BigNumber(await web3.eth.getBalance(accounts[1]));
        balance = balance.minus(gasPrice.multipliedBy((await contract.user_take(order, {from: accounts[1]})).receipt.gasUsed));
        assert.equal(await web3.eth.getBalance(accounts[1]), balance.plus(web3.utils.toWei("1", "ether")).toString());
    });

    it("test request-approve-deny", async () => {
        let contract = await Credit.deployed();
        let order = (await contract.user_request(web3.utils.toWei("10", "ether"), {from: accounts[1]})).logs[0].args[0].toString();
        await contract.approve(order, web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await contract.user_deny(order, {from: accounts[1]});
    });

    it("test request-refuse", async () => {
        let contract = await Credit.deployed();
        let order = (await contract.user_request(web3.utils.toWei("10", "ether"), {from: accounts[1]})).logs[0].args[0].toString();
        await contract.refuse(order, {from: accounts[0]});
    });

    it("test delegated request-approve-take", async () => {
        let contract = await Credit.deployed();
        let balance = new BigNumber(await web3.eth.getBalance(accounts[1]));

        let order = (await delegate(contract, accounts[1], accounts[2], "user_request_delegated", "user_request", [web3.utils.toWei("10", "ether")])).logs[0].args[0].toString();
        await contract.approve(order, web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await delegate(contract, accounts[1], accounts[2], "user_take_delegated", "user_take", [order]);

        assert.equal(await web3.eth.getBalance(accounts[1]), balance.plus(web3.utils.toWei("1", "ether")).toString());
    });

    it("test delegated request-approve-deny", async () => {
        let contract = await Credit.deployed();
        let balance = new BigNumber(await web3.eth.getBalance(accounts[1]));

        let order = (await delegate(contract, accounts[1], accounts[2], "user_request_delegated", "user_request", [web3.utils.toWei("10", "ether")])).logs[0].args[0].toString();
        await contract.approve(order, web3.utils.toWei("1", "ether"), {from: accounts[0]});
        await delegate(contract, accounts[1], accounts[2], "user_deny_delegated", "user_deny", [order]);

        assert.equal(await web3.eth.getBalance(accounts[1]), balance);
    });
});
