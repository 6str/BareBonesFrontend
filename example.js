
// global vars
let userWalletAddr 
let receivedProof
let contractAddress, abi

userWalletAddr = "<user's address>" // assign when wallet connected
receivedProof = proof   // assign when proof received from worldId
contractAddress = "<imported from somewhere>"
abi = "<imported from somewhere>"



async function verifyProof() {
    try {
      const { ethereum } = window;
      if (ethereum) {
  
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(contractAddress, abi, signer);
  
        var signal = userWalletAddr
        var root = ethers.BigNumber.from(receivedProof.merkle_root)
        var nullifier = ethers.BigNumber.from(receivedProof.nullifier_hash)
        var proof = receivedProof.proof
        const unpackedProof = ethers.utils.defaultAbiCoder.decode(["uint256[8]"], proof)[0]
    
        try{
          // metamask throws can't estimate gas if txn will revert due to nullifier previously used
          //const retVal = await connectedContract.verifyAndExecute(signal, root, nullifier, unpackedProof) 
          const retVal = await connectedContract.verifyAndExecute(signal, root, nullifier, unpackedProof,{ gasLimit: 600000 })
          console.log("result: ", retVal)
          console.log(await connectedContract.isVerified(signal))
        }
        catch (error) {
          console.log(error)
          
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }