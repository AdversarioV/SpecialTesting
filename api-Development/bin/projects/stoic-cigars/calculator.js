
// Stoic Cigars Membership Calculator

async function cigarsCheckout()
{
	// Confirm how many NFTs were already sold
	
	sc.Modal(`
		<h3>Reading Blockchain...</h3>
		<div class="sc-loader"></div>`
	);
	
	let Supply = await sc.checkSupply('matic', '0x380731DcE18C2DA787cc56b279bE00458f5e7ECA');
	
	if(Supply < 500)
	{
		sc.Modal(`Remaining NFTs: ${Supply} / 500`);
	}
	else
	{
		sc.Modal(`
			<h3>Sorry!</h3>
			<p>We've already sold out.</p>`
		);
	}
	
	// amount
	
	// remaining nfts
	
	// total in coins
	
	// total usd
	
	// button
}			
			