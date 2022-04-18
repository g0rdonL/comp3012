let { networkConfig } = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const Leaderboard = await deploy("Leaderboard", {
    from: deployer,
    log: true,
  });

  log(`You have deployed contract to ${Leaderboard.address}`);
  const networkName = networkConfig[chainId]["name"];
  log(
    "Verify with:\n npx hardhat verify --network",
    `${networkName} ${Leaderboard.address}`
  );
};

module.exports.tags = ["all", "leaderboard"];
