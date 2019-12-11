const TestRPC = require("ganache-cli");
const web3 = require("web3");

module.exports = {
	networks: {
		test: {
			network_id: "*",
			provider: TestRPC.provider({
				accounts: ["10", "10", "10"].map(balance => ({balance: web3.utils.toWei(balance, "ether")})),
			}),
			gas: 4000000,
			gasPrice: 2000000000
		}
	}
};
