let Credit = artifacts.require("./Credit.sol");

module.exports = (deployer, network, accounts) => {
    deployer.deploy(Credit);
};
