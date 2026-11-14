// Public configuration only. Never place Google credentials or private keys here.
window.RBG_CONFIG = Object.freeze({
  sheetsEnabled: false,
  // Existing URL lacks doGet. Deploy the supplied public script before enabling.
  sheetsEndpoint: 'https://script.google.com/macros/s/AKfycbzbxAqmJLNf1XjbbnGIq2MPqpjntMwe4fEcV9To98pS1YsU98_LcCnpLoeV6a15TbGr/exec',
  // Separate admin deployment: execute as accessing user; authorized Google emails only.
  adminEndpoint: ''
});
