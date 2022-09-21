//import { contractAddress }  from './exports.js';
import { abi }  from './exports.js';

const { ethereum } = window;
const STORAGE_STUB = "bare_bones_frontend => "

let proofAutoloader;

window.onload = loadData();

// worldID verify event listener
console.log("loading World ID");
worldID.init("world-id-container", {
  enable_telemetry: false,
  action_id: "wid_a4c0eed4ad6a1f24aadbcdd4fcb0ccf7", //d3vent frontend NOT staging
  //action_id: "wid_staging_034a32eef8f9c2d4ac2cca30890c2e76", // on-chain engine
  //action_id: "wid_staging_7a9456d25763ab09db907a6e9fdd289a", // cloud engine
  on_success: onWorldIDVerified,
});


function onWorldIDVerified (proof) {
  console.log('world id verified!!')
  console.log(proof);
  proofAutoloader = proof;
}



const accounts = await ethereum.request({ method: 'eth_accounts' });
if (accounts.length !== 0) {
  const account = accounts[0];
  
  document.getElementById("verificationSignal").value = account;
  document.getElementById("input2").value = account;  //maybe overkill. seems 
  worldID.update({
    signal: account,
  });
  console.log('Found an authorized account:', account);

} else {
  console.log('No authorized account found');
}


const chainId = await ethereum.request({ method: 'eth_chainId' });
console.log('chainId: ', chainId)


// to set/update the signal param manually if needs be
function setSignal() {
  const newSignal = document.getElementById("verificationSignal").value
  worldID.update({
    signal: newSignal,
  });
  document.getElementById("input2").value = newSignal
  console.log("updated signal: ", newSignal)
  console.log("test:", worldID.getProps())  // log proof that the signal is what it should be
}

// a quick sanity check that the frontend is talking to the sc
// sc call: isAdmin(<address>)
async function check_isAdmin() {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const contractAddress = document.getElementById("contractAddress").value 

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(contractAddress, abi, signer);

      var inputBox = document.getElementById("input1")
      var outputBox = document.getElementById("output1")
      outputBox.value = ""

      outputBox.value = await connectedContract.isAdmin(inputBox.value);
      console.log("result: ", outputBox.value);

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

// call verifyAndExecute on the smart contract : sc address input is top left input box
async function verifyProof() {
  try {
    const { ethereum } = window;
    if (ethereum) {
      const contractAddress = document.getElementById("contractAddress").value

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(contractAddress, abi, signer);

      var signal = document.getElementById("input2").value
      var root = ethers.BigNumber.from(document.getElementById("input3").value)
      var nullifier = ethers.BigNumber.from(document.getElementById("input4").value)
      var proof = document.getElementById("input5").value

      var outputBox2 = document.getElementById("output2")
      var outputBox3 = document.getElementById("output3")

      const unpackedProof = ethers.utils.defaultAbiCoder.decode(["uint256[8]"], proof)[0]
      console.log(unpackedProof)
      console.log("/proof")

      outputBox2.value, outputBox3.value = ""

      try{
        // metamask throws can't estimate gas if txn will revert due to nullifier previously used
        //const retVal = await connectedContract.verifyAndExecute(signal, root, nullifier, unpackedProof) 
        const retVal = await connectedContract.verifyAndExecute(signal, root, nullifier, unpackedProof,{ gasLimit: 600000 })
        outputBox2.value = retVal
        console.log("result: ", retVal)
        outputBox3.value = await connectedContract.isVerified(signal)
      }
      catch (error) {
        console.log(error)
        outputBox2.value = "error"
      }
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error)
  }
}

// populate the verifyAndExecute inputs and clear outputs
// signal from signal input at the top
// merkle, null & proof from the most recent proof
async function autoloader() {
  document.getElementById("input2").value = document.getElementById("verificationSignal").value  // signal
  document.getElementById("input3").value = proofAutoloader.merkle_root  // merkle root
  document.getElementById("input4").value = proofAutoloader.nullifier_hash
  document.getElementById("input5").value = proofAutoloader.proof
  document.getElementById("output2").value = ""
  document.getElementById("output3").value = ""
  console.log("autoloaded proof")
}

// save text in inputs and textarea
function saveData() {
  const contractAddress = document.getElementById("contractAddress")
  localStorage.setItem(STORAGE_STUB + "contractAddr", JSON.stringify(contractAddress.value))
  console.log("saved contract address: ", contractAddress.value)

  const input1 = document.getElementById("input1")
  localStorage.setItem(STORAGE_STUB + "input1", JSON.stringify(input1.value))
  console.log("saved isAdmin address: ", input1.value)
  
  const input2 = document.getElementById("input2")
  localStorage.setItem(STORAGE_STUB + "input2", JSON.stringify(input1.value))
  console.log("saved isAdmin address: ", input2.value)
  
  const input3 = document.getElementById("input3")
  localStorage.setItem(STORAGE_STUB + "input3", JSON.stringify(input3.value))
  console.log("saved isAdmin address: ", input3.value)
  
  const input4 = document.getElementById("input4")
  localStorage.setItem(STORAGE_STUB + "input4", JSON.stringify(input4.value))
  console.log("saved isAdmin address: ", input4.value)
    
  const input5 = document.getElementById("input5")
  localStorage.setItem(STORAGE_STUB + "input5", JSON.stringify(input5.value))
  console.log("saved isAdmin address: ", input5.value)
  
  const scratchpad = document.getElementById("scratchpad")
  localStorage.setItem(STORAGE_STUB + "scratchpad", JSON.stringify(scratchpad.value))
  console.log("saved scratchpad: ", scratchpad.value)
}

// load saved text back into inputs and text area
function loadData() {
  console.log("loadData called")

  const contractAddress = document.getElementById("contractAddress")
  contractAddress.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "contractAddr"))
  console.log("loaded contract address: ", contractAddress.value)

  const input1 = document.getElementById("input1")
  input1.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "input1"))
  console.log("loaded isAdmin address: ", input1.value)

  const input2 = document.getElementById("input2")
  input2.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "input2"))
  console.log("loaded signal: ", input2.value)
  
  const input3 = document.getElementById("input3")
  input3.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "input3"))
  console.log("loaded signal: ", input3.value)

  const input4 = document.getElementById("input4")
  input4.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "input4"))
  console.log("loaded signal: ", input4.value)

  const input5 = document.getElementById("input5")
  input5.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "input5"))
  console.log("loaded signal: ", input5.value)

  const scratchpad = document.getElementById("scratchpad")
  scratchpad.value = JSON.parse(localStorage.getItem(STORAGE_STUB + "scratchpad"))
  console.log("loaded scratchpad: ", scratchpad.value)


  // // worldID verify event listener
  //  document.addEventListener("DOMContentLoaded", async function () {
  //   console.log("DOMContentLoaded listener fired")  // debugging: confimation event has fired
  //   try {
  //     const result = await worldID.enable();
  //     console.log("World ID verified successfully:", result);
  //   } catch (failure) {
  //     console.warn("World ID verification failed:", failure);
  //     // Re-activate here so your end user can try again
  //     worldID.enable()
  //   }
  // });

  // event listeners
  var signal_Btn = document.getElementById("signal_Btn");
  signal_Btn.addEventListener("click", function() {
    setSignal()
  }, false);

  var save_Btn = document.getElementById("save_Btn");
  save_Btn.addEventListener("click", function() {
    saveData()
  }, false);

  var check_isAdmin_Btn = document.getElementById("check_isAdmin_Btn");
  check_isAdmin_Btn.addEventListener("click", function() {
    check_isAdmin()
  }, false);

  var verify_Btn = document.getElementById("verify_Btn");
  verify_Btn.addEventListener("click", function() {
    verifyProof()
  }, false);

  var autoloader_Btn = document.getElementById("autoloader_Btn");
  autoloader_Btn.addEventListener("click", function() {
    autoloader()
  }, false);
}

