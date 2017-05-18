const osmosis = require('osmosis');

osmosis.get('http://www.shirts4mike.com/shirts.php')
  .find('.products a')
  //.set('shirtLink')
  .follow('@href')  // &lt;-- follow link to scrape the next site
  .find('.shirt-details h1')
  .set('shirtName')
  .data(function(results) { //output
    const dataString = results.shirtName;
    let price = /\$\d+/.exec(dataString)[0];
    let color = /[A-z]+\b$/.exec(dataString)[0];
    let title = /(M|L)(.*)Shirt/.exec(dataString)[0];
    console.log(title);
  });
