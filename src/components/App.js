import React, { Component } from 'react'
import Web3 from 'web3'
import DaiToken from '../abis/DaiToken.json'
import DappToken from '../abis/DappToken.json'
import TokenFarm from '../abis/TokenFarm.json'
import Navbar from './Navbar'
import './App.css'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    // await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    //const web3 = window.web3
    //const accounts = await web3.eth.getAccountss()
    this.web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");
    window.web3 = this.web3
    const accounts = await this.web3.eth.requestAccounts();
    const networkID = await this.web3.eth.net.getId();
    console.log(accounts)
    console.log(networkID)

    this.setState({ account: accounts[0] })

    //Load DaiToken contract
    const daiTokenData = DaiToken.networks[networkID]
    if (daiTokenData) {
      const daiToken = new this.web3.eth.Contract(DaiToken.abi, daiTokenData.address)
      this.setState({ daiToken })
      let daiTokenBalance = await daiToken.methods.balanceOf(this.state.account).call()
      this.setState({ daiTokenBalance: daiTokenBalance.toString() })
      console.log({ DAI_balance: daiTokenBalance })
    } else {
      window.alert("DaiToken Contract not deployed to detected network.")
    }

    //Load DappToken contract
    const dappTokenData = DappToken.networks[networkID]
    if (daiTokenData) {
      const dappToken = new this.web3.eth.Contract(DappToken.abi, dappTokenData.address)
      this.setState({ dappToken })
      let dappTokenBalance = await dappToken.methods.balanceOf(this.state.account).call()
      this.setState({ dappTokenBalance: dappTokenBalance.toString() })
      console.log({ DAPP_balance: dappTokenBalance })
    } else {
      window.alert("DappToken Contract not deployed to detected network.")
    }

    //Load TokenFarm contract
    const tokenFarmData = TokenFarm.networks[networkID]
    if (daiTokenData) {
      const tokenFarm = new this.web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
      this.setState({ tokenFarm })
      let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
      this.setState({ stakingBalance: stakingBalance.toString() })
      console.log({ SATKING_balance: stakingBalance })
    } else {
      window.alert("TokenFarm Contract not deployed to detected network.")
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.etheruem) {
      window.web3 = new Web3(window.etheruem)
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non etheruem browser detected. You should consider trying to install metamask')
    }
  }

  stakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.tokenFarm.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  unstakeTokens = (amount) => {
    this.setState({ loading: true })
    this.state.tokenFarm.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: '0',
      dappTokenBalance: '0',
      stakingBalance: '0',
      loading: true
    }
  }

  render() {

    let content

    if (this.state.loading) {
      content = <p id="loader" className='text-center'>Loading....</p>
    } else {
      content = <Main
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
