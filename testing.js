const STORAGE_STUB = "testing_bbf => "
var unsavedChanges

console.log("page title:", document.title)
console.log("test space:", "test")

window.onload = load()

function load() {
	eventListeners()
	loadData()
	setMode()
}

// prompt if leaving page with unsaved changes
window.onbeforeunload = function () {
	if (unsavedChanges) return "leaving page with unsaved changes?"
}

const accounts = await ethereum.request({ method: "eth_accounts" })
if (accounts.length !== 0) {
	const account = accounts[0]
	console.log("Found an authorized account:", account)
	document.getElementById('wallet').innerHTML = account.slice(0,6) + "..." + account.slice(-5)
} else {
	console.log("No authorized account found")
	document.getElementById('wallet').innerHTML = "connect wallet"
}

// save input and text area values
function saveData() {
	var allSaveableElements = document.getElementsByClassName("saveable")
	Object.values(allSaveableElements).forEach((element) => {
		console.log(element.id)

		localStorage.setItem(
			STORAGE_STUB + element.id,
			JSON.stringify(element.value)
		)
		console.log("saved %s:", element.id, element.value)
	})
	unsavedChanges = false
}

// load saved text back into inputs and text area
function loadData() {
	var allSaveableElements = document.getElementsByClassName("saveable")
	Object.values(allSaveableElements).forEach((element) => {
		console.log(element.id)

		element.value = JSON.parse(localStorage.getItem(STORAGE_STUB + element.id))
		console.log("loaded %s:", element.id, element.value)
	})
}

// set dark/light mode
function setMode(checked) {
	console.log("setMode() - darkMode:", checked)
	const root = document.querySelector(":root")
	var rootStyles = getComputedStyle(root)

	let pri_bg_color, sec_bg_color, pri_text_color, sec_text_color

	if (checked) {
		pri_bg_color = rootStyles.getPropertyValue("--darkMode-primary-bg-color")
		sec_bg_color = rootStyles.getPropertyValue("--darkMode-secondary-bg-color")
		pri_text_color = rootStyles.getPropertyValue(
			"--darkMode-primary-text-color"
		)
		sec_text_color = rootStyles.getPropertyValue(
			"--darkMode-secondary-text-color"
		)
	} else {
		pri_bg_color = rootStyles.getPropertyValue("--lightMode-primary-bg-color")
		sec_bg_color = rootStyles.getPropertyValue(
			"--lightMode-secondary-bg-color"
		)
		pri_text_color = rootStyles.getPropertyValue(
			"--lightMode-primary-text-color"
		)
		sec_text_color = rootStyles.getPropertyValue(
			"--lightMode-secondary-text-color"
		)
	}

	root.style.setProperty("--primary-bg-color", pri_bg_color)
	root.style.setProperty("--secondary-bg-color", sec_bg_color)
	root.style.setProperty("--primary-text-color", pri_text_color)
	root.style.setProperty("--secondary-text-color", sec_text_color)
}

function doThing() {
	console.log("do called")

	var allSaveableElements = document.getElementsByClassName("saveable")

	Object.values(allSaveableElements).forEach((element) => {
		console.log("element id:", element.id)

		element.value = JSON.parse(localStorage.getItem(STORAGE_STUB + element.id))
		console.log("loaded %s:", element.id, element.value)
	})
}

// a quick way to sanity check that the frontend is talking to the sc
// sc call: isAdmin(<address>)
async function check_isAdmin() {
	try {
		const { ethereum } = window
		if (ethereum) {
			const abi = [document.getElementById("meh").value]
			console.log(abi)

			const contractAddress = document.getElementById("contractAddress").value

			const provider = new ethers.providers.Web3Provider(ethereum)
			const signer = provider.getSigner()
			const connectedContract = new ethers.Contract(
				contractAddress,
				abi,
				signer
			)
			console.log("here")
			var inputBox = document.getElementById("inputAdmin")
			var outputBox = document.getElementById("outputAdmin")
			outputBox.value = ""

			outputBox.value = await connectedContract.isAdmin(inputBox.value)
			console.log("isAdmin: ", outputBox.value)
		} else {
			console.log("Ethereum object doesn't exist!")
		}
	} catch (error) {
		console.log(error)
	}
}

function eventListeners() {
	// event listeners
	var save_Btn = document.getElementById("save_Btn")
	save_Btn.addEventListener(
		"click",
		function () {
			saveData()
		},
		false
	)

	var do_Btn = document.getElementById("do_Btn")
	do_Btn.addEventListener(
		"click",
		function () {
			// doThing()
			check_isAdmin()
		},
		false
	)

	var darkModeChk = document.getElementById("darkmode-chk")
	darkModeChk.addEventListener(
		"change",
		function () {
			setMode(darkModeChk.checked)
		},
		false
	)

	// listen for saveable changes
	addEventListener("input", (event) => {
		if (!unsavedChanges && event.target.classList.contains("saveable")) {
			console.log("flagging unsavedChanges")
			unsavedChanges = true
		}
	})

	// ctrl + s shortcut calls page saveData()
	document.addEventListener("keydown", (event) => {
		if (event.ctrlKey && (event.key === "s" || event.key === "S")) {
			event.preventDefault() //prevent browser save dialogue
			console.log("ctrl + s: save")
			saveData()
		}
	})
}
