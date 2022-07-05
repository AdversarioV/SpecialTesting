
// SC Investment Calculator

let scLaunchDate = 1654261082586;

function scCalculator()
{
	let currentDate = (new Date()).getTime();
	
	let Diff = (currentDate - scLaunchDate) / 1000;
	let Mult = 2.1 - (Diff * (1.1 / (14*24*60*60))); // Two weeks
	
	let Payment = document.querySelector('input[name="CalcPayment"]');
	let Multiplier = document.querySelector('input[name="CalcMultiplier"]');
	let Value = document.querySelector('input[name="CalcValue"]');
	
	let TotalPayment = parseInt(Payment.value.replace(/\D/g, ''));
	
	Multiplier.value = Mult.toFixed(8);
	Multiplier.disabled = true;
	
	// We have an investment amount!
	
	if(Payment.value != '' && isNaN(TotalPayment) == false)
	{
		Value.value = (TotalPayment * Mult).toLocaleString('en-US', { currency: 'USD', currencyDisplay: 'symbol', style: 'currency' });
		Payment.value = TotalPayment.toLocaleString('en-US', { currency: 'USD', currencyDisplay: 'symbol', style: 'currency', maximumFractionDigits: 0 });
	}
	else
	{
		Value.value = '';
		Payment.value = '';
	}
}

async function scCustomCheckout()
{
	let Payment = document.querySelector('input[name="CalcPayment"]').value.replace(/\D/g, '');
	
	if(Payment && isNaN(Payment) == false && Payment > 0)
	{
		console.log(`Trying to purchase: SC0001 for ${Payment}`);

		sc.currentUser.Client = 'SpecialCharacter';
		sc.currentUser.Product = 'SC0001';
		sc.currentUser.Address = 'N/A';
		sc.currentUser.Price = Payment;
		
		if(sc.currentUser.Email == null) await sc.collectEmail(``);
		
		let Options = ['Bank', 'Coinbase'];
		
		// if(Payment < 50000) Options.push('Stripe');
		
		sc.PaymentOptions(Options);
	}
}
