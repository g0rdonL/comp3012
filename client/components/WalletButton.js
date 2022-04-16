import { RightButton } from "../styled"

export const WalletButton = ({ correctNetwork, currentAccount, setCurrentAccount }) => {

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:' + chainId)

      const rinkebyChainId = '0x4'

      const devChainId = 1337
      const localhostChainId = `0x${Number(devChainId).toString(16)}`

      if (chainId !== rinkebyChainId && chainId !== localhostChainId) {
        alert('You are not connected to the Rinkeby Testnet!')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log('Found account', accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log('Error connecting to metamask', error)
    }
  }

  return (
    <>
      {!correctNetwork ? (
        <RightButton style={{ color: 'red' }}>
          Wrong Network
        </RightButton>
      ) : (
        currentAccount == '' ? (
          <RightButton
            style={{ color: 'black' }}
            onClick={connectWallet}
          >
            Connect Wallet
          </RightButton>
        ) : (
          <RightButton style={{ color: 'green' }}>
            Connected {currentAccount.substring(0, 6)}
          </RightButton>
        )
      )}
    </>
  )
}


