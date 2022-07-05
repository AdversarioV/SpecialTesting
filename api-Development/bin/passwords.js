
// Separate from main script to enforce non-asynchronous load order
// Password protection should be available immediately before page load

// Password protect a website

scPassword = async (Password, Redirect) =>
{
	event.preventDefault();
	
	// Encode password
	
	let Hash = await scSHA256(Password);
	
	// Save password hash in browser storage
	
	localStorage.setItem(`scPW@${Redirect}`, Hash);
	
	// Redirect to target page
	
	Redirect = `https://${window.location.hostname}${Redirect}`;
	
	window.location.replace(Redirect);
	
	document.head.innerHTML += `<meta http-equiv="Refresh" content="0; url='${Redirect}'">`;
}

// Enforce password protection

scProtected = (Hash) =>
{
	let Page = window.location.href.substring(window.location.hostname.length + 8);
	let Compare = localStorage.getItem(`scPW@${Page}`);
	
	// Page accessed without valid authentication
	
	if(Compare !== Hash)
	{
		history.back();
		window.location.replace('https://' + window.location.hostname);
		window.onload = function() { document.body.parentElement.remove(); }
	}
}

scSHA256 = async (Str) =>
{
	const strBuffer = new TextEncoder().encode(Str);
	const hashBuffer = await crypto.subtle.digest('SHA-256', strBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
