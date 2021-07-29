import fs from 'fs';
import got from 'got';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;
const baseUrl = 'https://dev.openbayes.com';
const buffer = new Set();

async function requestPage(url) {
  await got(url).then(resp => {
    const dom = new JSDOM(resp.body);
    const nextLinkEl = dom.window.document.querySelector('.pagination-nav__item--next > a');

    if (nextLinkEl) {
      let nextLink = `${baseUrl}${nextLinkEl.href}/`;

      console.log(`Got link: ${nextLink}`);

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
  }).catch(err => {
    console.log(`Error:`, err);
  });
}

requestPage(`${baseUrl}/docs/`);
