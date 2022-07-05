
// Utility functions

// Connect to a third party, in-app crypto wallet

sc.connectWallet = async () =>
{
	if(typeof window.ethereum !== 'undefined')
	{
		sc.Modal(`
			<h3>Please connect your wallet.</h3>
			<p>Your browser extension should open automatically.</p>
			<p>Something went wrong? <a href="javascript:sc.connectWallet()">Try again</a></p>`
		);
		
		// Connect to in-app wallet
		
		try
		{
			await Moralis.enableWeb3();
			let web3 = new Web3(Moralis.provider);
			let Accounts = await web3.eth.getAccounts();
			
			// Wallet address found
			
			if(Array.isArray(Accounts) && Accounts.length > 0)
			{
				sc.currentUser.Address = Accounts[0];
				return Accounts[0];
			}
		}
		catch(Error) { console.log(Error); } // Do nothing, errors are handled by waterfall return
	}
	else
	{
		sc.Modal(`
			<h3>Ooops!</h3>
			<p>Your browser does not have an enabled crypto wallet.</p>
			<p>Install <a href="https://metamask.io/" target="_blank">Metamask</a> on your device.</p>
			<p>If you're on mobile and already have the Metamask app <a href="https://metamask.app.link/dapp/www.distillerydao.io/secret">tap here</a>.</p>
		`);
	}
}

// Create a new wallet via Fortmatic

sc.createWallet = async () => 
{
	//const web3 = new Web3(FM.getProvider());
	
	// Fortmatic takes forever to load if not preloaded, address in the future!
	// Double check if we have already solved this with web3FM?
	sc.Modal(`<p>Loading wallet creator, please wait...</p>`);
	
	//FM.user.login().then(async () => 
	//{
		try
		{
			await FM.user.login();
			
			sc.Modal(``, 'hidden');
			
			let loggedIn = await FM.user.isLoggedIn();
			
			if(loggedIn)
			{
				// let web3 = new Web3(FM.getProvider());
				
				let User = await FM.user.getUser();
				let Accounts = await web3FM.eth.getAccounts();
				
				console.log(User);
				console.log(Accounts);
				
				if(Array.isArray(Accounts) && Accounts.length > 0)
				{
					sc.currentUser.Email = User.email;
					sc.currentUser.Address = Accounts[0];
					return Accounts[0];
				}
			}
		}
		catch(Error) { console.log(Error); } // Do nothing, errors are handled by waterfall return
	//});
}

// Collect user's email address

sc.collectEmail = async (Message = `Awesome, you're connected!`, Required = { Email: false, Name: false}) => 
{
	let Modal = sc.Modal(`
		<h3>What's your email?</h3>
		<p>${Message}</p>
		<p>Please enter your email address in case we need to contact you.</p>
		<form>
			${'Name' in Required ? '<input type="text" name="Name" placeholder="Your name" required>' : ''}
			<input type="email" name="Email" placeholder="Your best email address" required>
			<button disabled>Continue</button>
		</form>
	`);
	
	let Email = Modal.querySelector('input[name="Email"]');
	let Name = Modal.querySelector('input[name="Name"]');
	let Submit = Modal.querySelector('button');
	
	// Validation
	
	Object.keys(Required).forEach(Field => 
	{
		Modal.querySelector(`input[name="${Field}"]`).oninput = () => 
		{
			if
			(
				/^\S+@\S+\.\S+$/.test(Email.value) // Super basic email validation
				&&
				(
					'Name' in Required == false
					||
					Name.value.length > 3
				)
			)
			{
				Submit.disabled = false; 
			}
			else Submit.disabled = true;
		}
	});
	
	// Save values
	
	Modal.querySelector('form').onsubmit = () => 
	{
		event.preventDefault();
		Object.keys(Required).forEach(Field => Required[Field] = Modal.querySelector(`input[name="${Field}"]`).value);
	}
	
	// Return email address to promise
	
	return await new Promise(Resolve => 
	{
		let Interval = setInterval(() => 
		{
			if(Required.Email != false)
			{
				clearInterval(Interval);
				sc.currentUser = Object.assign(sc.currentUser, Required);
				Resolve(Required.Email);
			};
		}, 100);
	});
}

// Request web resource asynchronously

sc.XHR = (URL, Data, Callback) => 
{
	let XHR = new XMLHttpRequest();
		XHR.open('POST', URL);
		XHR.setRequestHeader('Content-Type','text/plain');
	
	XHR.onreadystatechange = () => 
	{
		if(XHR.readyState == 4 && XHR.status == 200)
		{
			Callback(XHR.responseText);
		}
	};
	
	XHR.send(JSON.stringify(Data));
};

// Check how many tokens a specific, enumerable contract has already issued

sc.checkSupply = async (Chain, Contract) => 
{
	let NFTs = await Moralis.Web3API.token.getAllTokenIds( { address: Contract, chain: Chain } );
	
	return NFTs.total;
}

console.log('sc.utilities loaded');
