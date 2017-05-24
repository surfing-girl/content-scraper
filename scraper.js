const osmosis = require('osmosis');
const http = require('http');

/**
* Scraper construction function for getting data
* @constructor
* @param output
*/
function Scraper(output) {
  this.url = 'http://www.shirts4mike.com/';
  this.savedData = [];
  this.output = output;
}

/**Function scrapes the page and gets all links of shirts */
Scraper.prototype.getShirtsLinks = function (url) {
  osmosis.get(url)
    .find('.products')
    .set({'shirtLink': ['a@href']})
    .data((data) => {
      this.allShirtsLinks = data;
    }).then(() => {this.visitLinks()})
    .error((msg) => {
        this.output.printError(msg, url);
      }
    );
}

/** Function follows each link and extracts data */
Scraper.prototype.visitLinks = function () {
  for(let i=0; i<this.allShirtsLinks.shirtLink.length; i++) {
    osmosis.get(this.url + this.allShirtsLinks.shirtLink[i])
      .find('#content')
      .set({
        "Title": '.shirt-details>h1',
        "Price": '.shirt-details>h1>.price',
        "ImageURL": 'img@src',
      })
      .data((data) => {
        data.Title = /(M|L)(.*)Shirt/.exec(data.Title)[0];
        data.ImageURL = `${this.url}${data.ImageURL}`;
        data.URL = `${this.url}${this.allShirtsLinks.shirtLink[i]}`;
        data.Time = this.output.scrapeDate;
        this.savedData.push(data);
      })
      .then(() => {
        if(this.allShirtsLinks.shirtLink.length <= this.savedData.length) {
          this.output.createCSVFile(this.savedData, this.output.csvFields);
        }
      })
      .error((msg) => {
          if (msg.indexOf('404') > -1) {
            this.output.createLogFile(`Your page: '${this.url + this.allShirtsLinks.shirtLink[i]}' was not found`);
          }
        }
      );
  }
}

module.exports = Scraper;
