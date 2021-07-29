#!/usr/bin/env node
import fs from 'fs';
import { exec } from 'child_process';

import got from 'got';
import jsdom from 'jsdom';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { JSDOM } = jsdom;
const buffer = new Set();

const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    description: 'Custom base URL',
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
  .option('prince-args', {
    description: 'Additional options for Prince',
    type: 'string',
  })
  .option('list-only', {
    description: 'Fetch list only without generating PDF',
    type: 'bolean',
  })
  .option('pdf-only', {
    description: 'Generate PDF only without fetching list. Ensure list exists',
    type: 'bolean',
  })
  .help()
  .alias('help', 'h')
  .argv;

const baseUrl = argv.url?.replace(/\/$/, '') || 'https://dev.openbayes.com';
const parsedUrl = new URL(baseUrl);
const dest = argv.dest || './pdf';
const listFile = argv.file || `${dest}/${parsedUrl.hostname}.txt`;
const pdfFile = argv.output || `${dest}/${parsedUrl.hostname}.pdf`;

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

  await execute(`prince --no-warn-css --style=print.css --input-list=${list} -o ${filename} ${args}`).then(resp => {
    console.log(resp.stdout);
    console.log(`Done`);
  }).catch(err => {
    console.log(err);
  });
}

async function requestPage(url) {
  await got(url).then(resp => {
    const dom = new JSDOM(resp.body);
    const nextLinkEl = dom.window.document.querySelector('.pagination-nav__item--next > a');

    if (nextLinkEl) {
      const nextLink = `${baseUrl}${nextLinkEl.href}`;
      console.log(`Got link: ${nextLink}`);

      buffer.add(nextLink);
      requestPage(nextLink);
    } else {
      console.log('No next link found!');

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
  requestPage(`${baseUrl}/docs/`);
}
