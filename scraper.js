const cheerio = require('cheerio');
const http = require('http');

function ContentScraper() {
  this.shirtLinks = [];
  //this.body = '';
}

ContentScraper.prototype.getShirtLinks = function () {
  http.get('http://www.shirts4mike.com/shirts.php', (response) => {
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
  });
};

ContentScraper.prototype.getShirtData = function () {
  for(let i=0; i<this.shirtLinks.length; i++) {
    http.get('http://www.shirts4mike.com/' + this.shirtLinks[i], (response) => {
      let link = this.shirtLinks[i];
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
        let $ = cheerio.load(body);
        let title = $('.shirt-details h1').text();
        let img = $('.shirt-picture img').attr('src');
        console.log(img, "----", link);
      });
    });
  }
};

const contentScraper = new ContentScraper();

contentScraper.getShirtLinks();
//contentScraper.this.getShirtData();
