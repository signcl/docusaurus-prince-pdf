#!/usr/bin/env node
import fs from 'fs';
import { exec } from 'child_process';

import got from 'got';
import jsdom from 'jsdom';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { JSDOM } = jsdom;
const buffer = new Set();

const __dirname = new URL('.', import.meta.url).pathname;

const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    description: 'Base URL, should be the baseUrl of the Docusaurus instance (e.g. https://docusaurus.io/docs/)',
    type: 'string',
  })
  .option('selector', {
    alias: 's',
    description: 'CSS selector to find the link of the next page',
    type: 'string',
  })
  .option('dest', {
    alias: 'd',
    description: 'Working directory. Default to ./pdf',
    type: 'string',
  })
  .option('file', {
    alias: 'f',
    description: 'Change default list output filename',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    description: 'Change PDF output filename',
    type: 'string',
  })
  .option('include-index', {
    description: 'Include / (passed URL) in generated PDF',
    type: 'bolean',
  })
  .option('prepend', {
    description: 'Prepend additional pages, split with comma',
    type: 'string',
  })
  .option('append', {
    description: 'Append additional pages, split with comma',
    type: 'string',
  })
  .option('prince-args', {
    description: 'Additional options for Prince',
    type: 'string',
  })
  .option('list-only', {
    description: 'Fetch list without generating PDF',
    type: 'bolean',
  })
  .option('pdf-only', {
    description: 'Generate PDF without fetching list. Ensure list exists',
    type: 'bolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

const url = argv.url?.replace(/\/$/, '') || 'https://dev.openbayes.com';

const parsedUrl = new URL(url);
const baseUrl = parsedUrl.origin;
const scope = parsedUrl.pathname;
const scopeName = scope !== '/' ? `-${scope.replace(/\/$/g, '').replace(/^\//g, '').replace(/\//g, '-')}` : '';

const dest = argv.dest || './pdf';
const listFile = argv.file || `${dest}/${parsedUrl.hostname}${scopeName}.txt`;
const pdfFile = argv.output || `${dest}/${parsedUrl.hostname}${scopeName}.pdf`;

function execute(cmd) {
  const s = (b) => String(b).trim();

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve({ stdout: s(stdout), stderr: s(stderr) });
    });
  });
}

async function generatePdf(list, filename) {
  console.log(`Generating PDF ${filename}`);

  const args = argv.princeArgs || '';

  await execute(`prince --no-warn-css --style=${__dirname}print.css --input-list=${list} -o ${filename} ${args}`).then(resp => {
    console.log(resp.stdout);
    console.log(`Done`);
  }).catch(err => {
    console.log(err);
  });
}

async function requestPage(url) {
  await got(url).then(resp => {
    const dom = new JSDOM(resp.body);
    const nextLinkEl = dom.window.document.querySelector(argv.selector || '.pagination-nav__link--next');

    if (nextLinkEl) {
      const nextLink = `${baseUrl}${nextLinkEl.href}`;
      console.log(`Got link: ${nextLink}`);

      buffer.add(nextLink);
      requestPage(nextLink);
    } else {
      console.log('No next link found!');

      if (argv.append) {
        argv.append.split(',').map(item => {
          const url = item.match(/^https?:\/\//) ? item : `${baseUrl}${scope}${item}`;
          buffer.add(url);
          console.log(`Got link: ${url} [append]`);
        });
      }

      if (buffer.size > 0) {
        fs.writeFile(listFile, [...buffer].join('\n'), async err => {
          console.log(`Writing buffer (${buffer.size} links) to ${listFile}`);

          if (err) {
            console.error(err);
            return;
          }

          if (!argv.listOnly) {
            generatePdf(listFile, pdfFile);
          }
        });
      } else {
        console.log('No buffer to write!');
      }
    }
  }).catch(err => {
    console.log(`Error:`, err);
  });
}

!fs.existsSync(dest) && fs.mkdirSync(dest);

if (argv.pdfOnly) {
  generatePdf(listFile, pdfFile);
} else {

  if (argv.prepend) {
    argv.prepend.split(',').map(item => {
      const url = item.match(/^https?:\/\//) ? item : `${baseUrl}${scope}${item}`;
      buffer.add(url);
      console.log(`Got link: ${url} [prepend]`);
    });
  }

  if (argv.includeIndex) {
    console.log(`Got link: ${baseUrl}${scope} [index]`);
    buffer.add(`${baseUrl}${scope}`);
  }

  requestPage(`${baseUrl}${scope}`);
}
