const fs = require('fs');
const json2csv = require('json2csv');
const winston = require('winston');

function Outputs() {
  this.timeStamp = (new Date()).toLocaleTimeString();
  this.csvFields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
  this.currentDate = new Date();
  this.currentMonth = this.currentDate.getMonth()+1;
  if (this.currentMonth < 10) {
    this.currentMonth = `0${this.currentMonth}`
  }
  this.scrapeDate = `${this.currentDate.getFullYear()}-${this.currentMonth}-${this.currentDate.getDate()}`;
}

Outputs.prototype.printError = function (msg, url) {
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

Outputs.prototype.createDirectory = function (directoryNamePath) {
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

Outputs.prototype.createLogFile = function (errorMessage) {
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

Outputs.prototype.createCSVFile = function (data, fields) {
  let csv = json2csv({ data: data, fields: fields });

  fs.writeFile(`./data/${this.scrapeDate}.csv`, csv, (err) => {
    if (err) throw err;
    console.log(`'./data/${this.scrapeDate}.csv' file saved.`);
  });
};

module.exports = Outputs;
