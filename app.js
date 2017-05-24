/** Start the app by npm start */

const Scraper = require('./Scraper');
const Outputs = require('./Outputs');

/** Create data directory */
const output = new Outputs();
output.createDirectory("./data");

/** Get shirts data */
const scraper = new Scraper(output);
scraper.getShirtsLinks('http://www.shirts4mike.com/shirts.php');
