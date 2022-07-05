
// Settings

sc = 
{
	Brand: 'Generic Brand Name',		// What is the brand called?
	
	Merchants: ['Stripe', 'Coinbase', 'Bank'],	// Which payment options do we support?
	
	// Which blockchains do we support?
			
	Chains: 							
	{
		'matic': 'Polygon',
		'eth': 'Ethereum'
	},
	
	// Which modules do we want to load?
	
	Modules: ['utilities.js', 'modal.js', 'checkout.js', /*'nftauth.js'*/, 'modal.css'],
	
	// Third party API credentials
	
	API:
	{
		// Special Character
		
		sc: 'https://api.specialcharacter.io',
		base: 'https://api.specialcharacter.io',
		
		// Moralis
		
		Moralis:
		{
			serverUrl: 'https://gorx53sg2qbi.usemoralis.com:2053/server',
			appId: 'MGs7mh5EiVeMRuxbj6IEi9y22p89lU1IUHswJye9'
		},
		
		// Fortmatic
		
		Fortmatic:
		{
			pk: 'pk_live_D669764A4BDEB4BB',
			rpcUrl: 'https://rpc-mainnet.maticvigil.com/',
			chainId: 137
		}
	}
};

sc.currentUser = {}; // Store user information

// Initialize dependencies

// Load these from within the script!

Moralis.start({ serverUrl: sc.API.Moralis.serverUrl, appId: sc.API.Moralis.appId });

/*const FM = new Fortmatic(sc.API.Fortmatic.pk, {
	rpcUrl: sc.API.Fortmatic.rpcUrl,
	chainId: sc.API.Fortmatic.chainId
});
const web3FM = new Web3(FM.getProvider()); // Preload Formatic widget */

// Load necessary scripts

let Ready = 0;

sc.Modules.forEach(Path => 
{
	// JS
	
	let File;
	
	if(Path.endsWith('js'))
	{
		File = document.createElement('script');
		
		File.onload = function() 
		{
			Ready += 1;
			
			if(Ready == sc.Modules.filter(Str => Str.endsWith('.js')).length)
			{
				// All scripts loaded
				Ready = true;
			}
		};
		
		File.src = `${sc.API.base}/bin/${Path}`;
	}
	
	// CSS
	
	else
	{
		File = document.createElement('link');
		File.href = `${sc.API.base}/assets/css/${Path}`;
		File.rel = 'stylesheet';
		File.type = 'text/css';
	}
	
	document.head.appendChild(File);
});

// Start execution

sc.Start = (Settings = {}, Callback = function() { sc.Bindings() } ) => // Create button bindings automatically
{
	// Overwrite generic settings
	
	['Brand','Modules'].forEach(Item => {
		if(Item in Settings) sc[Item] = Settings[Item];
	});
	
	// Once all script files are loaded, begin execution
	
	if(Ready === true) Callback();
	
	else
	{
		let Wait = setInterval(() => 
		{
			if(Ready === true)
			{
				clearInterval(Wait);
				Callback();
			}
		}, 100);
	}
}
