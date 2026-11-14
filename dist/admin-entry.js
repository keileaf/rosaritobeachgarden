(() => {
  const endpoint=window.RBG_CONFIG?.adminEndpoint || '';
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint))return;
  const link=document.querySelector('#admin-access');link.href=endpoint;link.hidden=false;
  document.querySelector('#admin-state').textContent='Continúa con tu cuenta de Google autorizada.';
})();
