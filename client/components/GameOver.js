import React from 'react'
import { leaderboardContractAddress } from '../config.js'
import { ethers } from 'ethers'

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import LB from '../utils/Leaderboard.json'

const Item = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
}));

function GameOver(props) {

  const uploadScore = async () => {
    try {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const leaderboardContract = new ethers.Contract(
          leaderboardContractAddress,
          LB.abi,
          signer
        )

        console.log(props.user)
        console.log(props.score)

        let txn = await leaderboardContract.addScore(props.user, props.score)
        await txn.wait(1)

        props.resetGame()

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <div
      id='GameBoard'
      style={{
        width: props.width,
        height: props.height,
        borderWidth: props.width / 50,
      }}>
      <div id='GameOver' style={{ fontSize: props.width / 20 }}>
        <Stack spacing={2}>
          <Item id='GameOverText'>GAME OVER</Item>
          <Item>Your score: {props.score}</Item>
          <Item>
            <TextField value={props.user}
              onChange={props.handleInput}
              label="Your Name"
              variant="outlined" />
          </Item>
          <Item>
            <Button color="success"

              onClick={uploadScore}
              disabled={props.user === ""}
              variant="contained">
              Upload Score and Restart
            </Button>
          </Item>
          <Item>
            <Button
              color="error"
              variant="contained"
              onClick={props.resetGame}
            >
              Discard Score and Restart
            </Button>
          </Item>
        </Stack>
      </div>
    </div>
  )
}

export default GameOver
