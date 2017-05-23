const osmosis = require('osmosis');
const fs = require('fs');
var json2csv = require('json2csv');
const http = require('http');

function ContentScraper() {
  this.url = 'http://www.shirts4mike.com/';
  this.savedData = [];
  this.currentDate = new Date();
  this.scrapeDate = `${this.currentDate.getFullYear()}-${this.currentDate.getMonth()+1}-${this.currentDate.getDate()}`;
  this.csvFields = ['Title', 'Color', 'Price', 'ImageURL', 'URL', 'Time'];
}

ContentScraper.prototype.createDataDirectory = function () {
  fs.stat("./data", function (err, stats){
    if (err) {
      // Directory doesn't exist or something.
      console.log('Folder doesn\'t exist, so I made the folder data');
      return fs.mkdir("./data");
    }
    if (!stats.isDirectory()) {
      // This isn't a directory!
      console.log('helllooo');
      //callback(new Error('temp is not a directory!'));
    } else {
      console.log('Does exist');
      //callback();
    }
  });
}

ContentScraper.prototype.createCSVFile = function (data, fields) {
  let csv = json2csv({ data: data, fields: fields });

  fs.writeFile(`./data/${this.scrapeDate}.csv`, csv, function(err) {
    if (err) throw err;
    console.log('File saved');
  });
};

ContentScraper.prototype.getShirtsLinks = function () {
  osmosis.get('http://www.shirts4mike.com/shirts.php')
    .find('.products')
    .set({'shirtLink': ['a@href']})
    .data((data) => {
      this.allShirtsLinks = data;
    }).then(() => {this.visitLinks()})
    .error(console.log);
}

ContentScraper.prototype.visitLinks = function () {
  for(let i=0; i<this.allShirtsLinks.shirtLink.length; i++) {
    osmosis.get(this.url + this.allShirtsLinks.shirtLink[i])
      .find('#content')
      .set({
        "Title": '.shirt-details>h1',
        "Color": '.shirt-details>h1',
        "Price": '.shirt-details>h1>.price',
        "ImageURL": 'img@src',
      })
      .data((data) => {
        data.Title = /(M|L)(.*)Shirt/.exec(data.Title)[0];
        data.Color = /[A-z]+\b$/.exec(data.Color)[0];
        data.URL = this.allShirtsLinks.shirtLink[i];
        data.Time = this.scrapeDate;
        this.savedData.push(data);
      })
      .then(() => {
        if(this.allShirtsLinks.shirtLink.length <= this.savedData.length) {
          this.createCSVFile(this.savedData, this.csvFields);
        }
      });
  }
}

const contentScraper = new ContentScraper();
contentScraper.createDataDirectory();
contentScraper.getShirtsLinks();
