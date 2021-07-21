const fs = require('fs')
const https = require('https');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const baseUrl = 'https://dev.openbayes.com';
const buffer = new Set();

function requestPage(url) {
  https.get(url, res => {
    let data = '';

    res.on('data', chunk => {
      data += chunk;
    });

    res.on('end', () => {
      const dom = new JSDOM(data);
      const nextLinkEl = dom.window.document.querySelector('.pagination-nav__item--next > a');

      if (nextLinkEl) {
        let nextLink = `${baseUrl}${nextLinkEl.href}/`;

        console.log(`Get link: ${nextLink}`);

        buffer.add(nextLink);
        requestPage(nextLink);
      } else {
        console.log('No next link found!');

        fs.writeFile('list.txt', [...buffer].join('\n'), err => {
          console.log(`Writing buffer (${buffer.size} links) to list.txt`);

          if (err) {
            console.error(err);
            return;
          }
        })
      }
    });
  }).on('error', err => {
    console.log('Error: ', err.message);
  });
}

requestPage(`${baseUrl}/docs/`);
