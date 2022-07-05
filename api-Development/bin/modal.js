
// Modals

sc.initializeModal = () => 
{
	let Modal = document.createElement('div');
		Modal.classList.add('sc-wrapper');
		Modal.innerHTML = `<div class="sc-modal"></div>`;
		
	document.body.appendChild(Modal);
}

sc.Modal = (Content, classList = 'sc-internal') => 
{
	if(document.querySelector('.sc-wrapper') == null) sc.initializeModal();
	
	// System internal modal
	
	if(classList.includes('sc-internal'))
	{
		Content = `
		<div class="sc-bar">
			<div class="sc-icon"></div>
			<svg onclick="sc.closeModal()" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.10488 5.17206L2.00521 -0.00012207L0.405903 1.62193L5.50558 6.79411L3.05176e-05 12.3779L1.59934 14L7.10488 8.41616L12.4007 13.7873L14 12.1652L8.70419 6.79411L13.5941 1.83463L11.9948 0.212587L7.10488 5.17206Z" fill="#122e6d" fill-opacity="1"></path></svg>
		</div>
		<div class="sc-content">${Content}</div>
		<div class="sc-footer">Powered by <a href="https://www.specialcharacter.studio/" target="_blank">Special Character StudiØ</a></div>`;
	}
	
	document.body.classList.add('sc-no-scroll');
	document.querySelector('.sc-wrapper').classList = `sc-wrapper ${classList}`;
	document.querySelector('.sc-modal').innerHTML = Content;
	
	return document.querySelector('.sc-modal');
}

sc.closeModal = () =>
{
	sc.Modal('','hidden');
	document.body.classList.remove('sc-no-scroll');
}

console.log('sc.modal loaded');
