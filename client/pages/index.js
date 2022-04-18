import { useState, useEffect } from 'react'
import { nftContractAddress, linkTokenAddress, fee } from '../config.js'

import axios from 'axios'

import { WalletButton } from "../components/WalletButton"
import { SnakeSelect } from "../components/SnakeSelect"

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';



import { MintTab } from "./MintTab"
import { GameTab } from "./GameTab"

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <>{children}</>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}



export default function index() {

    // states
    const [tab, setTab] = useState(0);
    const [hasSnakes, setHasSnakes] = useState(false)
    const [snakes, setSnakes] = useState([])
    const [color, setColor] = useState("")
    const [currentAccount, setCurrentAccount] = useState('')
    const [correctNetwork, setCorrectNetwork] = useState(false)

    // Checks if wallet is connected
    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window
        if (ethereum) {
            console.log('Got the ethereum obejct: ', ethereum)
        } else {
            console.log('No Wallet found. Connect Wallet')
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' })

        if (accounts.length !== 0) {
            console.log('Found authorized Account: ', accounts[0])
            setCurrentAccount(accounts[0])
            getSnakes(accounts[0])
        } else {
            console.log('No authorized account found')
        }
    }

    // Checks if wallet is connected to the correct network
    const checkCorrectNetwork = async () => {
        const { ethereum } = window
        let chainId = await ethereum.request({ method: 'eth_chainId' })
        const rinkebyChainId = '0x4'

        if (chainId !== rinkebyChainId) {
            setCorrectNetwork(false)
        } else {
            setCorrectNetwork(true)
        }
    }

    const getSnakes = async (account) => {
        // get snakes from rarible api
        let data = await axios.get(`https://api-staging.rarible.com/protocol/v0.1/ethereum/nft/items/byOwner?owner=${account}`)
        let items = data.data.items
        let tmp = []
        items.forEach((item) => {
            if (item.contract === nftContractAddress) tmp.push(item)

        })

        if (items.length > 0) {
            setHasSnakes(true)
            setSnakes(tmp)
        }

    }

    useEffect(() => {
        checkIfWalletIsConnected()
        checkCorrectNetwork()

        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                checkIfWalletIsConnected()
                checkCorrectNetwork()
            })
            window.ethereum.on('accountsChanged', () => {
                checkIfWalletIsConnected()
                checkCorrectNetwork()
            })
        }


    }, [])


    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} aria-label="basic tabs example">
                    <Tab label="Mint" {...a11yProps(0)} />
                    <Tab label="Game" {...a11yProps(1)} />
                    <WalletButton correctNetwork={correctNetwork} currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} />
                </Tabs>
                <SnakeSelect
                    color={color}
                    setColor={setColor}
                    snakes={correctNetwork && snakes}
                    hasSnakes={hasSnakes}
                />
            </Box>
            <TabPanel value={tab} index={0}>
                <MintTab
                    checkIfWalletIsConnected={checkIfWalletIsConnected}
                    currentAccount={currentAccount}
                    correctNetwork={correctNetwork} />
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <GameTab
                    color={color}

                />
            </TabPanel>
        </Box>
    );
}
