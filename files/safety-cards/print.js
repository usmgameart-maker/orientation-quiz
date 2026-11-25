(function(){
 const id=Number(new URLSearchParams(location.search).get('card'));
 const available=window.SafetyCards.cards,chosen=available.filter(c=>!id||c.id===id),cards=chosen.length?chosen:available;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 document.querySelector('#print-cards').innerHTML=cards.map(c=>'<article class="print-svg-card"><img src="print/card-'+c.id+'.png" alt="'+esc(c.title+'. '+c.items.join(' ')+(c.after?' '+c.after:'')+' '+c.callout)+'"></article>').join('');
 document.querySelector('#print-button').addEventListener('click',()=>window.print());
})();
