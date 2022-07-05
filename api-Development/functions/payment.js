
// Listens to payment intent requests and forwards merchant payment gateway URLs

// ToDo: Smartsheet Bearer Token as CF ENV variable

// Example POST data submission
/*
{
	"Client" : "SpecialCharacter",
	"Product" : "SC0001",
	"Email" : "stefan@outlandhq.com",
	"Address" : "N/A",
	"Merchant" : "Stripe",
  	"Price" : 150
}
*/

// CORS

const Headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
	'Content-Type': 'text/plain'
};

// Smartsheet product sheet IDs

let Clients =
{
	SpecialCharacter: 1466083371706244,
}

// Allowed merchants


const Merchants = 
{
	Stripe: async (Data) => 
	{
		let Total = Data.Product.Price;
		
		// Currency conversion
		
		/*if(Data.Product.Currency != 'USD')
		{
			let Pricing = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${Data.Product.Currency}&tsyms=USD&api_key=${Settings.API.CryptoCompare}`);
				Pricing = await Pricing.json();
			
			Total = +(Math.round((Pricing.USD * Data.Product.Price) + 'e+2') + 'e-2');
		}*/
		
		// Create Price
		
		let Price = await fetch('https://api.stripe.com/v1/prices', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer sk_test_51KopmUH0qXIeDdX9sjBpRHDNPsnG7gPZHL6iHhX5SeqX4wc3ry4dxymkmw7LYVO0si0nC3lkCYJ5v2L0jTL2igw600L8t5rEUM'
			},
			body: new URLSearchParams({
				'unit_amount': (Total * 100),
				'currency': 'USD',
				'product_data[name]': Data.Product.Name
			})
		});
		
		Price = await Price.json();
		
		// Create Session
		
		let SessionData = 
		{
			'success_url'			  : Data.Product['Redirect-Success'],
			'cancel_url'			  : Data.Product['Redirect-Cancel'],
			'line_items[0][price]'	  : Price.id,
			'line_items[0][quantity]' : 1,
			'metadata[client]'		  : Data.Client,
			'metadata[product]'		  : Data.Product.ID,
			'metadata[email]'		  : Data.Email, // How does this work for phone # ?!
			'metadata[address]'		  : Data.Address,
			'mode'					  : 'payment'
		};
		
		// Prefill customer email
		
		if('Email' in Data && Data.Email != null && typeof Data.Email === 'string' && Data.Email.includes('@')) {
			SessionData.customer_email = Data.Email;
		}
		
		let Session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Bearer sk_test_51KopmUH0qXIeDdX9sjBpRHDNPsnG7gPZHL6iHhX5SeqX4wc3ry4dxymkmw7LYVO0si0nC3lkCYJ5v2L0jTL2igw600L8t5rEUM'
			},
			body: new URLSearchParams(SessionData)
		});
		
		Session = await Session.json();
		
		return {
			Message: Session.url,
			Payment: Total,
			Currency: 'USD'
		};
	},
	
	Coinbase: async (Data) => 
	{
		let Description = Data.Product.Description; // 200 characters max
			Description = (Description.length >= 200 ? Description.slice(0,190) + '...' : Description);
		
		let Charge = await fetch('https://api.commerce.coinbase.com/charges', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CC-Api-Key': '2c9a7565-1116-4e7c-89a8-e7b6e98b9d4c',
				'X-CC-Version': '2018-03-22'
			},
			body: JSON.stringify(
			{
				name	     : Data.Product.Name,
				description  : Description, // 200 characters max
				local_price  : 
				{
					amount   : Data.Product.Price,
					currency : Data.Product.Currency
				},
				pricing_type : 'fixed_price',
				redirect_url : Data.Product['Redirect-Success'],
				cancel_url	 : Data.Product['Redirect-Cancel'],
				metadata	 :
				{
					client   : Data.Client,
					product	 : Data.Product.ID,
					email	 : Data.Email,
					address	 : Data.Address,
					secret	 : 'qE2k#FA^U@ZG9+ky'
				}
			})
		});
		
		Charge = await Charge.json();
		
		return {
			Message: Charge.data.hosted_url,
			Payment: Data.Product.Price,
			Currency: Data.Product.Currency
		};
	},
	
	Bank: async (Data) => 
	{
		let Message = `
		<p>Send both domestic wires and ACH transfers via:</p>
		<p>
			<strong>Special Character LLC</strong><br>
			1000 Brickell Avenue, 715 5228<br>
			Miami, FL 33131
		</p>
		<p>
			Account #: 9801910628<br>
			Account Type: Checking
		</p>
		<p>Receiving Bank:</p>
		<p>
			<strong>Evolve Bank &amp; Trust</strong><br>
			6070 Poplar Ave, Suite 200<br>
			Memphis, TN 38119
		</p>
		<p>ABA Routing Number: 084106768</p>
		<a href="${Data.Product['Redirect-Success']}">
			<button>I have sent the funds.</button>
		</a>
		<p>Or see <a href="https://uploads-ssl.webflow.com/6272cdc30eb2312bcdd95ab6/62a0a76a11a4de18aa665492_Special%20Character%20LLC%20-%20Wire%20Details.pdf" target="_blank" style="color:blue;text-decoration:underline;margin-top:6px;">detailed wire instructions</a>.</p>`;
		
		return {
			Message: Message,
			Payment: Data.Product.Price,
			Currency: 'USD'
		};
	}
};

export async function onRequestPost(Request)
{
	let Data = await Request.request.text();
		Data = JSON.parse(Data);
	
	if
	(
		// Client
		
		'Client' in Data &&
		Data.Client in Clients &&
		
		// Product
		
		'Product' in Data && 
		typeof Data.Product === 'string' && 
		Data.Product.length == 6 && 
		Data.Product == Data.Product.replace(/[^a-zA-Z0-9]/g,'') &&
		
		// Other
		
		'Email'    in Data &&
		'Address'  in Data &&
		'Merchant' in Data &&
		Data.Merchant in Merchants
	)
	{
		let Sheet = await fetch(`https://api.smartsheet.com/2.0/sheets/${Clients[Data.Client]}`, {
			headers: { Authorization: 'Bearer pr49ABTUQYT7izsiL6EbknXcD07EuHT18I4B5' }
		});
			
		let Rows = await Sheet.json();
		let Cols = Rows.columns;
			Rows = Rows.rows;
			Rows = Rows.filter(Row => Row.cells[0].value == Data.Product);
		
		// Product exists
		
		if(Rows.length == 1)
		{
			let Product = {};
			let RowData = Rows[0].cells;
			
			// Asseble product data
			
			RowData.forEach(Col =>
			{
				Product[Cols.filter(C => C.id == Col.columnId)[0].title] = Col.value;
			});
			
			// if ( ) ... other checks here
			// e.g. max Supply?
			
			// Flexible pricing
			
			if(Product.Price == 'FLEX')
			{
				if('Price' in Data && isNaN(Data.Price) == false && Data.Price > 0) Product.Price = Data.Price;
				else return new Response(`Invalid price. (${Data.Price})`, { headers : Headers });
			}
			
			let Charge = {};
				Charge = Object.assign(Charge, Data);
				Charge.Product = Product;
			
			// Create charge with merchant
			
			let Intent = await Merchants[Data.Merchant](Charge);
			
			// Fetch column IDs from payment intents sheet
			
			let Columns = await fetch(`https://api.smartsheet.com/2.0/sheets/${Product.Intents}/columns`, {
				method: 'GET',
				headers: { 
					'Authorization': 'Bearer pr49ABTUQYT7izsiL6EbknXcD07EuHT18I4B5'
				}
			});
			
			Columns = await Columns.json();
			Columns = Columns.data;
			
			// Record payment intent
			
			let Record = [ { cells: [ ] } ];
			
			function hasColumn(Columns, Name, Record, Value)
			{
				let has = Columns.filter(C => C.title == Name);
				
				if(has.length > 0) Record[0].cells.push( { columnId: has[0].id , value: Value } );
			}
			
			hasColumn(Columns, 'Email', Record, Data.Email);
			hasColumn(Columns, 'Timestamp', Record, (new Date()).getTime());
			hasColumn(Columns, 'Datetime', Record, new Date());
			hasColumn(Columns, 'Product', Record, Data.Product);
			hasColumn(Columns, 'Payment', Record, Intent.Payment);
			hasColumn(Columns, 'Currency', Record, Intent.Currency);
			hasColumn(Columns, 'Gateway', Record, Data.Merchant);
			
			if('Name' in Data) hasColumn(Columns, 'Name', Record, Data.Name);
			
			await fetch(`https://api.smartsheet.com/2.0/sheets/${Product.Intents}/rows`, {
				method: 'POST',
				headers: { 
					'Authorization': 'Bearer pr49ABTUQYT7izsiL6EbknXcD07EuHT18I4B5', 
					'Content-Type': 'application/json' 
				},
				body: JSON.stringify(Record)
			});
			
			// Return redirect
			
			return new Response(Intent.Message, { headers : Headers });
		}
	}
	else
	{
		return new Response(`Incomplete request.`, { headers : Headers });
	}
}
