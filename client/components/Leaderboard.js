import { useState, useEffect } from 'react'
import { leaderboardContractAddress } from '../config.js'
import { ethers } from 'ethers'
import SnakeGame from "./SnakeGame"

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import LB from '../utils/Leaderboard.json'

export const Leaderboard = ({ color }) => {

  const [scores, setScores] = useState([])
  const [users, setUsers] = useState([])



  const getScores = async () => {
    let tmpUsers = []
    let tmpScores = []

    const { ethereum } = window
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)

      let chainId = await ethereum.request({ method: 'eth_chainId' })
      const rinkebyChainId = '0x4'

      if (chainId !== rinkebyChainId) return

      const leaderboardContract = new ethers.Contract(leaderboardContractAddress, LB.abi, provider)

      for (var i = 0; i < 10; i++) {
        let data = await leaderboardContract.leaderboard(i)
        tmpScores[i] = data.score.toNumber()
        tmpUsers[i] = data.user
      }
      setScores(tmpScores)
      setUsers(tmpUsers)
    }
  }

  useEffect(() => {
    getScores()
  })

  return (<>
    <SnakeGame snakeColor={color} getScores={getScores} />
    <TableContainer component={Paper} sx={{ mt: "2rem" }}>
      <Table aria-label="simple table" size="small">
        <TableHead>
          <TableRow>
            <TableCell align="right">User</TableCell>
            <TableCell align="left">Highscore</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(10)].map((x, i) => (
            <TableRow
              key={i}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row" align="right">
                {users[i]}
              </TableCell>
              <TableCell align="left">
                {scores[i]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>


  </>
  );
}
