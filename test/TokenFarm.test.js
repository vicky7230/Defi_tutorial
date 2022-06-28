const { assert } = require('chai');

const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, 'Ether');
}


contract('TokenFarm', ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm

    before(async () => {
        //Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp token to farm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //Send tokens to investor
        await daiToken.transfer(investor, tokens('100'), { from: owner });
    })

    //tests here
    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        });
    });

    describe('Mock Dapp deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        });
    });

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp Token Farm")
        });

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'));
        });
    });

    describe('Farming Tokens', async () => {
        it('rewards investors for staking mDai tokens', async () => {
            let result
            //ceck investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor Mock DAI balance correct before staking')

            //stake mock DAI tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            //check staking result    
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'investor mock DAI wallet balance correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token from Mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correctafter staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor stakign status correct after staking')

            //Issue Tokens
            await tokenFarm.issueTokens({from:owner})

            //check balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'),'investor Dapp Token Wallet balance correct after issuance')

            //Ensure that only owner can issue tokens
            await tokenFarm.issueTokens({from: investor}).should.be.rejected;

            //Unstake tokens
            await tokenFarm.unstakeTokens({from: investor})

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor mock DAI wallet balance correct after staking')

            result =  await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm mock Dai balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after unstaking')
        })
    })

})    