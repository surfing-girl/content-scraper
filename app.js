const Scraper = require('./Scraper');
const Outputs = require('./Outputs');

const output = new Outputs();
output.createDirectory("./data");

const scraper = new Scraper(output);
scraper.getShirtsLinks('http://www.shirts4mike.com/shirts.php');
