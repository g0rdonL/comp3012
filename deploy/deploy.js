let { networkConfig } = require("../helper-hardhat-config");
module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // if we are on a local chain like hardhat, what is the link token address?
  // A: there is none
  // deploy a fake one
  // for real chain we use real one
  //
  let linkTokenAddress, vrfCoordinatorAddress;

  if (chainId == 31337) {
    // we are on local chain
    let linkToken = await get("LinkToken");
    linkTokenAddress = linkToken.address;
    let vrfCoordinatorMock = await get("VRFCoordinatorMock");
    vrfCoordinatorAddress = vrfCoordinatorMock.address;
  } else {
    linkTokenAddress = networkConfig[chainId]["linkToken"];
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinator"];
  }
  const keyHash = networkConfig[chainId]["keyHash"];
  const fee = networkConfig[chainId]["fee"];
  let args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
  log("------------------------");
  const Snake = await deploy("Snake", {
    from: deployer,
    args: args,
    log: true,
  });
  log(`You have deployed an NFT contract to ${Snake.address}`);
  const networkName = networkConfig[chainId]["name"];
  log(
    "Verify with:\n npx hardhat verify --network",
    `${networkName} ${Snake.address} ${args.toString().replace(/,/g, " ")}`
  );
  // fund with LINK
  const linkTokenContract = await ethers.getContractFactory("LinkToken");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const linkToken = new ethers.Contract(
    linkTokenAddress,
    linkTokenContract.interface,
    signer
  );
  let fund_tx = await linkToken.transfer(Snake.address, fee);
  await fund_tx.wait(1);

  // create an NFT by calling random number
  const SnakeContract = await ethers.getContractFactory("Snake");
  const snake = new ethers.Contract(
    Snake.address,
    SnakeContract.interface,
    signer
  );
  let creation_tx = await snake.create({ gasLimit: 300000 });
  let receipt = await creation_tx.wait(1);
  let tokenId = receipt.events[3].topics[2];
  log(`You have made your NFT! This is token number ${tokenId}`);
  log("Let's wait for chainlink node to respond");
  if (chainId == 31337) {
    const VRFCoordinatorMock = await deployments.get("VRFCoordinatorMock");
    vrfCoordinator = await ethers.getContractAt(
      "VRFCoordinatorMock",
      VRFCoordinatorMock.address
    );
    let vrf_tx = await vrfCoordinator.callBackWithRandomness(
      receipt.logs[3].topics[1],
      12345,
      snake.address
    );
    await vrf_tx.wait(1);
    log("Finish the mint");
    let finish_tx = await snake.finishMint(tokenId, { gasLimit: 15000000 });
    await finish_tx.wait(1);
    log(`tokenURI: ${await snake.tokenURI(tokenId)}`);
  } else {
    await new Promise((r) => setTimeout(r, 180000));
    log(`Finish the mint...`);
    let finish_tx = await snake.finishMint(tokenId, { gasLimit: 15000000 });
    await finish_tx.wait(1);
    log(`You can view the tokenURI here ${await snake.tokenURI(tokenId)}`);
  }
};
module.exports.tags = ["all", "rsvg"];
