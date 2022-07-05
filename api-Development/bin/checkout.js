
// Payment processing

sc.Bindings = () => 
{
	// Initialize payment intents, attach to links and buttons
	
	let Elements = document.querySelectorAll('*[data-product]');
	
	if(Elements.length > 0)
	{
		// Payment intent links & buttons
		
		Elements.forEach(El => 
		{
			let Product = El.dataset.product;
			
			if(El.tagName == 'A') El.href = `javascript:sc.Checkout('${Product}')`;
			else El.onclick = function(){ sc.Checkout(`'${Product}'`); }
		});
	}
}

// Initiate product purchase

sc.Checkout = async (ProductID) => 
{
	console.log(`Trying to purchase: ${ProductID}`);

	sc.currentUser.Product = ProductID;
	sc.currentUser.Client = 'SpecialCharacter';
	
	let Modal = sc.Modal(`
		<h3>Do you already have a crypto wallet?</h3>
		<button>Yes!</button>
		<p class="small">We will connect your existing wallet.</p>
		<button onclick="sc.createWallet()">No, please help?</button>
		<p class="small">We will help you set up a new wallet.</p>`
	);
	
	// Connect wallet and capture email address
	
	Modal.querySelectorAll('button')[0].onclick = async () => 
	{
		if(await sc.connectWallet() && await sc.collectEmail())
		{
			sc.PaymentOptions();
			
			console.log('Proceed to payment... (credit card)');
		}
	}
	
	// Create new wallet and capture email address
	
	Modal.querySelectorAll('button')[1].onclick = async () => 
	{
		if(await sc.createWallet())
		{
			// If user signed up via phone # separately ask for email address
			
			if(sc.currentUser.Email == null) await sc.collectEmail();
			
			sc.PaymentOptions();
			
			console.log('Proceed to payment... (crypto)');
		}
	}
}

sc.PaymentOptions = async (Allowed = ['Stripe', 'Coinbase']) => 
{
	//<button class="ethereum" onclick="sc.Payment('Ethereum')">Ethereum</button>
	//<p class="small">Pay through your in-browser wallet.</p>
	
	sc.Modal(`<h3>How do you want to pay?</h3>`);
	
	let Options = 
	{
		Stripe:   { Title: 'Credit Card', 	Descr: 'Cards, online wallets, any currency.' },
		Coinbase: { Title: 'Crypto', 		Descr: 'Pay with BTC, ETH, Doge or 4 others.' },
		// Ethereum: { Title: 'Ethereum', 		Descr: 'Pay through your in-browser wallet.'  },
		Bank:     { Title: 'Bank Transfer', Descr: 'Wire the funds to a bank account.'    }
	};
	
	Allowed.forEach(Option => 
	{
		document.querySelector('.sc-content').innerHTML += `
		<button class="${Option.toLowerCase()}" onclick="sc.Payment('${Option}')">${Options[Option].Title}</button>
		<p class="small">${Options[Option].Descr}</p>`;
	});
}

sc.Payment = async (Merchant) => 
{
	console.log('Payment initiated.');
	
	if
	(
		// Needs better verification
		typeof sc.currentUser === 'object' &&
		'Client' in sc.currentUser &&
		'Address' in sc.currentUser &&
		'Email' in sc.currentUser &&
		'Product' in sc.currentUser &&
		sc.Merchants.includes(Merchant)
	)
	{
		sc.Modal(`<p>Redirecting to payment page...</p>`);
		
		let Data = sc.currentUser;
			Data.Merchant = Merchant;
		
		console.log(Data);
		
		sc.XHR(sc.API.sc + '/payment', Data, (Response) => 
		{
			// Redirect
			
			if(typeof Response =='string' && Response.startsWith('https://'))
			{
				window.location.href = Response;
				
				sc.Modal(`
				<p>Redirecting to payment...</p>
				<p>Redirect not working? <a href="${Response}" target="_blank">Click here to open payment page</a> in new tab.</p>`);
			}
			
			// Errors or text instructions
			
			else
			{
				sc.Modal(`<p>${Response}</p>`);
			}
		});
	}
}

console.log('sc.checkout loaded');
