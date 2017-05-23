const cheerio = require('cheerio');
const http = require('http');
const json2csv = require('json2csv');
const fs = require('fs');

function ContentScraper() {
  this.shirtLinks = [];
  this.url = 'http://www.shirts4mike.com/';
  this.savedData = {};
  this.savedDataArray = [];
  this.currentDate = new Date();
  this.scrapeDate = `${this.currentDate.getFullYear()}-${this.currentDate.getMonth()+1}-${this.currentDate.getDate()}`;
  this.csvFields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
  //this.body = '';
}

// Print out error message
ContentScraper.prototype.printError = function (error) {
  console.error(error.message);
};

ContentScraper.prototype.createCSVFile = function (data, fields) {
  let csv = json2csv({ data: data, fields: fields });

  fs.writeFile(`./${this.scrapeDate}.csv`, csv, function(err) {
    if (err) throw err;
    console.log('File saved');
  });
};

ContentScraper.prototype.getShirtLinks = function () {
  try {
    const request = http.get('http://www.shirts4mike.com/shirts.php', (response) => {
      if (response.statusCode === 200) {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
          let $ = cheerio.load(body);
          $('.products a').each((i, el) => {
            let content = $(el).attr('href');
            this.shirtLinks.push(content);
          });
          //console.log(this.shirtLinks);
          this.getShirtData();
        });
      } else {
          // Status Code Error
          const statusCodeError = new Error(`We are having problem getting 'http://www.shirts4mike.com/shirts.php' (${http.STATUS_CODES[response.statusCode]})`);
          this.printError(statusCodeError);
      }
    });
    request.on('error', this.printError);
  } catch (e) {
    this.printError(e);
  }
};

// data.Title = /(M|L)(.*)Shirt/.exec(data.Title)[0];
// data.Color = /[A-z]+\b$/.exec(data.Color)[0];
// data.URL = this.allShirtsLinks.shirtLink[i];
// data.Time = this.scrapeDate;
// this.savedData.push(data);

ContentScraper.prototype.getShirtData = function () {
  for(let i=0; i<this.shirtLinks.length; i++) {
    try {
      const request = http.get('http://www.shirts4mike.com/' + this.shirtLinks[i], (response) => {
        if (response.statusCode === 200) {
          let link = this.shirtLinks[i];
          let body = '';

          response.setEncoding('utf8');

          response.on('data', (chunk) => {
            body += chunk;
            let $ = cheerio.load(body);
            let shirtTitle = $('.shirt-details h1').text();
            this.savedData.Title = /(M|L)(.*)Shirt/.exec(shirtTitle)[0];
            this.savedData.Price = $('.shirt-details h1>span').text();
            this.savedData.ImageURL = $('.shirt-picture img').attr('src');
            this.savedData.URL = link;
            this.savedData.Time = this.scrapeDate;
            this.savedDataArray.push(this.savedData);
          });

          response.on('end', () => {
            if (this.shirtLinks.length <= this.savedDataArray.length) {
              try {
                this.createCSVFile(this.savedDataArray, this.csvFields);
                console.log(this.savedDataArray);
              } catch (e) {
                console.error(e);
              }
            }
          });
        } else {
            // Status Code Error
            const statusCodeError = new Error(`There was a problem getting shirt website: 'http://www.shirts4mike.com/${this.shirtLinks[i]}'.(${http.STATUS_CODES[response.statusCode]})`);
            this.printError(statusCodeError);
        }
      });
      request.on('error', error => console.error(`Problem with request: ${error.message}`));
    } catch (e) {
      this.printError(e);
    }
  }
};

const contentScraper = new ContentScraper();

contentScraper.getShirtLinks();
//contentScraper.this.getShirtData();
