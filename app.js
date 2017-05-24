const osmosis = require('osmosis');
const fs = require('fs');
const json2csv = require('json2csv');
const http = require('http');
const winston = require('winston')

function ContentScraper() {
  this.url = 'http://www.shirts4mike.com/';
  this.savedData = [];
  this.currentDate = new Date();
  this.currentMonth = this.currentDate.getMonth()+1;
  if (this.currentMonth < 10) {
    this.currentMonth = `0${this.currentMonth}`
  }
  this.scrapeDate = `${this.currentDate.getFullYear()}-${this.currentMonth}-${this.currentDate.getDate()}`;
  this.timeStamp = this.currentDate.toLocaleTimeString();
  this.csvFields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
}

ContentScraper.prototype.printError = function (msg, url) {
  const notFoundMsg = `Your page: '${url}' was not found`;
  const offLineMsg = 'You are offline!';
  if (msg.indexOf('404') > -1) {
    this.createLogFile(notFoundMsg);
  } else if (msg.indexOf('getaddrinfo') > -1) {
    this.createLogFile(offLineMsg);
  } else {
    this.createLogFile(msg);
  }
}

ContentScraper.prototype.createDirectory = function (directoryNamePath) {
  fs.stat(directoryNamePath, function (err, stats){
    if (err) {
      // Directory doesn't exist or something.
      console.log(`Folder doesn't exist, so I made the folder "${directoryNamePath}"`);
      return fs.mkdir(directoryNamePath);
    }
    if (!stats.isDirectory()) {
      // This isn't a directory!
      console.log("This isn't a directory!");
    }
  });
}

ContentScraper.prototype.createLogFile = function (errorMessage) {
  this.createDirectory('./errors');
  const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp: this.timeStamp,
        colorize: true,
        level: 'error'
      }),
      new (winston.transports.File)({
        filename: `./errors/scraper-error.log`,
        timestamp: this.timeStamp,
        level: 'error'
      })
    ]
  });
  logger.error(errorMessage);
}

ContentScraper.prototype.createCSVFile = function (data, fields) {
  let csv = json2csv({ data: data, fields: fields });

  fs.writeFile(`./data/${this.scrapeDate}.csv`, csv, (err) => {
    if (err) throw err;
    console.log(`'./data/${this.scrapeDate}.csv' file saved.`);
  });
};

ContentScraper.prototype.getShirtsLinks = function (url) {
  osmosis.get(url)
    .find('.products')
    .set({'shirtLink': ['a@href']})
    .data((data) => {
      this.allShirtsLinks = data;
    }).then(() => {this.visitLinks()})
    .error((msg) => {
        this.printError(msg, url);
      }
    );
}

ContentScraper.prototype.visitLinks = function () {
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
        data.Time = this.scrapeDate;
        this.savedData.push(data);
      })
      .then(() => {
        if(this.allShirtsLinks.shirtLink.length <= this.savedData.length) {
          this.createCSVFile(this.savedData, this.csvFields);
        }
      })
      .error((msg) => {
          if (msg.indexOf('404') > -1) {
            this.createLogFile(`Your page: '${this.url + this.allShirtsLinks.shirtLink[i]}' was not found`);
          }
        }
      );
  }
}

const contentScraper = new ContentScraper();
contentScraper.createDirectory("./data");
contentScraper.getShirtsLinks('http://www.shirts4mike.com/shirts.php');
