import 'babel-polyfill';  


var x = 1;
var y = 2;


$('#result').append(`
  There are <b>${x}</b> items
   in your basket, <em>${y}</em>
  are on sale!
`);