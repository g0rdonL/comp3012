import { useState } from 'react'
import { nftContractAddress, linkTokenAddress, fee } from '../config.js'
import { ethers } from 'ethers'

import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import NFT from '../utils/Snake.json'
import LINK from '../utils/LinkToken.json'

const Item = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
}));

export const MintTab = ({ currentAccount, correctNetwork, checkIfWalletIsConnected }) => {

  const [mintingStage, setMintingStage] = useState(0)
  const [txnError, setTxnError] = useState(null)
  const [url, setUrl] = useState(null)


  // Creates transaction to mint NFT on clicking Mint Character button
  const mint = async () => {
    try {
      setTxnError(null)
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const nftContract = new ethers.Contract(
          nftContractAddress,
          NFT.abi,
          signer
        )

        const linkToken = new ethers.Contract(
          linkTokenAddress,
          LINK.abi,
          signer
        );

        setMintingStage(1)
        let fund_tx = await linkToken.transfer(nftContractAddress, fee);
        await fund_tx.wait(1);

        // create an NFT by calling random number
        const snake = new ethers.Contract(
          nftContractAddress,
          nftContract.interface,
          signer
        );
        setMintingStage(2)


        let creation_tx = await snake.create({ gasLimit: 300000 });
        let receipt = await creation_tx.wait(1);
        let tokenId = receipt.events[3].topics[2];
        console.log(`You have made your NFT! This is token number ${tokenId}`);
        setMintingStage(3)
        await new Promise((r) => setTimeout(r, 180000));
        console.log(`Finish the mint...`);
        setMintingStage(4)
        let finish_tx = await snake.finishMint(tokenId, { gasLimit: 15000000 });
        await finish_tx.wait(1);
        setMintingStage(5)

        setUrl(
          `https://rinkeby.rarible.com/token/${nftContractAddress}:${parseInt(tokenId)}?tab=details`
        )
        checkIfWalletIsConnected()
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      setTxnError(error.message)
      setMintingStage(0)
    }
  }

  const messageSwitch = () => {
    switch (mintingStage) {
      case 0:
        return 'Ready to Mint';
      case 1:
        return 'Sending LINK token to VRF...';
      case 2:
        return 'Creating Snake...';
      case 3:
        return 'Waiting for VRF response (this will take a while)...';
      case 4:
        return 'Finishing Mint...';
      case 5:
        return 'Mint Successful';
      default:
        return '';
    }
  }

  return (
    <>
      <Stack spacing={2}>
        <Item>
          Welcome to the Snake game built on Rinkeby (Ethereum) <br /><br />
          Get yourself some LINK and ETH <a href={`https://faucets.chain.link/rinkeby`} target="_blank" rel="noreferrer">here</a> <br /><br />
          View the collection on Rarible <a href={`https://rinkeby.rarible.com/collection/${nftContractAddress}/items`} target="_blank" rel="noreferrer">here</a> <br /><br />
          <span style={{ color: "red" }}> Warning: Please DO NOT close this page while minting</span>
        </Item>
        <Item>
          {txnError ?
            <span style={{ color: "red" }}> {txnError}</span>
            :
            <>
              {messageSwitch()}
            </>
          }
        </Item>
        <Item>
          <LoadingButton
            variant="contained"
            onClick={mint}
            loading={mintingStage !== 0 && mintingStage !== 5}
            disabled={!correctNetwork || currentAccount === ""}
          > Mint
          </LoadingButton>
        </Item>
        <Item>
          {url &&
            <><a href={url} target="_blank" rel="noreferrer"> View your NFT here </a> <>and refresh its metadata</></>
          }
        </Item>
      </Stack>
    </>
  )
}
