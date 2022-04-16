import { Fragment } from 'react'
import { nftContractAddress, linkTokenAddress, fee } from '../config.js'
import { ethers } from 'ethers'

import NFT from '../utils/Snake.json'
import LINK from '../utils/LinkToken.json'

export const MintTab = ({ setTxError }) => {


  // Creates transaction to mint NFT on clicking Mint Character button
  const mint = async () => {
    console.log("mint")
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

        // const vrfContract = new ethers.Contract(
        //     vrfContractAddress,
        //     VRF.abi,
        //     signer
        // )
        // let nftTx = await nftContract.createEternalNFT()
        // console.log('Minting....', nftTx.hash)
        // setMiningStatus(0)

        // let tx = await nftTx.wait()
        // setLoadingState(1)
        // console.log('Minted!', tx)
        // let event = tx.events[0]
        // let value = event.args[2]
        // let tokenId = value.toNumber()

        // const linkTokenContract = await ethers.getContractFactory("LinkToken");
        const linkToken = new ethers.Contract(
          linkTokenAddress,
          LINK.abi,
          signer
        );
        let fund_tx = await linkToken.transfer(nftContractAddress, fee);
        await fund_tx.wait(1);

        // create an NFT by calling random number
        const snake = new ethers.Contract(
          nftContractAddress,
          nftContract.interface,
          signer
        );
        let creation_tx = await snake.create({ gasLimit: 300000 });
        let receipt = await creation_tx.wait(1);
        let tokenId = receipt.events[3].topics[2];
        console.log(`You have made your NFT! This is token number ${tokenId}`);
        await new Promise((r) => setTimeout(r, 180000));
        console.log(`Finish the mint...`);
        let finish_tx = await snake.finishMint(tokenId, { gasLimit: 15000000 });
        await finish_tx.wait(1);
        console.log(`You can view the tokenURI here ${await snake.tokenURI(tokenId)}`);

        console.log(
          `Minted, see transaction: https://rinkeby.etherscan.io/tx/${nftTx.hash}`
        )

        getMintedNFT(tokenId)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log('Error minting character', error)
      setTxError(error.message)
    }
  }

  // Gets the minted NFT data
  const getMintedNFT = async (tokenId) => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

        let tokenUri = await nftContract.tokenURI(tokenId)
        let data = await axios.get(tokenUri)
        let meta = data.data

        setMintingStatus(1)
        setMintedNFT(meta.image)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
      setTxError(error.message)
    }
  }
  return (


    <Fragment>This is tab mint content

      <button
        onClick={mint}
      > Mint
      </button>


    </Fragment>

  )



}
