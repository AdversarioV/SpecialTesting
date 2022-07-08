
// Updates order information and mints NFTs based on webhook triggers

// CORS

const Headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
	'Content-Type': 'text/plain'
};

async function onPayment(onSuccess)
{
	//function pending
}

export async function onRequestPost(Request, Success) // --> Function name is important
{
	// Write directly here OR !!! execute onPayment()...
	
	let Data = await Request.request.text();
		Data = JSON.parse(Data);
	
	if
	(
		Data == true // Remove this, just to make deployment work...
		// Is the webhook POST cool?
	)
	{
		// Record in Smartsheet...
		
		// Mint NFT...
		
		// What else do we need to do?
	}
	else
	{
		return new Response(`Shit is FUCKED UP!`, { headers : Headers });
	}
}
