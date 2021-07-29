# OpenBayes Documentation PDF Generator

Extract rendered data from Docusaurus and generate PDF, the hard way

This project is using the method 1 for generating PDF. You must [Prince](https://www.princexml.com/) installed on your local machine.

The following methods can be used to generate PDF from Docusaurus sites:

## Method 1: Prince

The good:

- Best font subsetting support
- Text can be selected and copy/paste correctly
- Fancy ToC

The bad:

- Doesn't work well with Docusaurus sites. Page content got cut off. [Issue reported (now fixed!)](https://www.princexml.com/forum/topic/4608)
- Watermark on generated PDF make it hard to handle in CI/CD environments
- Doesn't work with some CSS syntax (e.g. `mask-image`)

The ugly:

- Commercial license is expensive ([$3,800](https://www.princexml.com/purchase/))

Usage:

See help screen for details:

```bash
npx docusaurs-prince-pdf -h
```

Example:

```bash
npx docusaurs-prince-pdf -u https://openbayes.com/
```

To generate PDF from a local Docusaurus instance. You need to first build the site locally, then run the following command:

```bash
# Serve built site locally
yarn serve

# Generate PDF from local Docusaurus instance
node index -u http://localhost:4000 # Change port to your serving port
```

## Method 2: mr-pdf

The good:

- Free and open-source
- Works with Docusaurus sites
- CI/CD friendly
- Based on Puppeteer make it works for most modern CSS syntax (e.g. `mask-image`)

The bad:

- Doesn't work well with system Dark Mode. You will get a dark background in generated PDF. But it's not an issue in Ci/CD environments
- No ToC

The ugly:

- Based on Puppeteer make the text cannot be copied or searched correctly
- Link anchors (links start with `#`) not well handled

Usage:

```bash
npx mr-pdf --initialDocURLs="https://openbayes.com/docs/" --paginationSelector=".pagination-nav__item--next > a" --contentSelector="article"
```
