# OpenBayes Documentation PDF Generator

Generate PDF based on OpenBayes Documentation

## Method 1: Prince

The good:

- Best font subsetting support
- Text can be selected and copy/paste correctly
- Fancy ToC

The bad:

- Doesn't work well with Docusaurus sites. Page content got cut off. [Issue reported](https://www.princexml.com/forum/topic/4608)
- Watermark on generated PDF make it hard to handle in CI/CD environments
- Doesn't work with some CSS syntax (e.g. `mask-image`)

The ugly:

- Commercial license is expensive ([$3,800](https://www.princexml.com/purchase/))

Usage:

First generate page list requied by Prince:

```
node index.js
```

Then generate PDF using Prince:

```bash
brew cask install prince
yarn install
bash generate-pdf.sh
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
npx mr-pdf --initialDocURLs="https://dev.openbayes.com/docs/" --paginationSelector=".pagination-nav__item--next > a" --contentSelector="article"
```
