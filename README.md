# Docusaurus Prince PDF Generator

[![npm version](https://img.shields.io/npm/v/docusaurus-prince-pdf.svg?style=flat)](https://www.npmjs.com/package/docusaurus-prince-pdf)

Extract rendered data from Docusaurus and generate PDF, the hard way

## Demo/Examples

<img width="1008" alt="Prince PDF for Docusaurus Documentation" src="https://user-images.githubusercontent.com/96356/127639981-68aae100-9b96-4abc-920a-5fd8c6507a0d.png">

You can download it in [GitHub Actions](https://github.com/signcl/docusaurus-prince-pdf/actions/workflows/test.yml) artifacts section to see the result.

This project is using the method 1 for generating PDF. You must have [Prince](https://www.princexml.com/) installed on your local machine.

The following methods can be used to generate PDF from Docusaurus sites:

## Method 1: Prince

The good:

- Best font subsetting support
- Text can be selected and copy/paste correctly
- Fancy Table of Contents

The bad:

- Watermark on first page of generated PDF make it hard to handle in CI/CD environments
- Doesn't work with some CSS syntax (e.g. `mask-image`)
- Doesn't work with some HTML features (e.g. `srcset`)
- Commercial license is expensive ([$3,800](https://www.princexml.com/purchase/))

The ugly:

- None

Usage:

See help screen for details:

```bash
npx docusaurus-prince-pdf -h
```

Example:

```bash
npx docusaurus-prince-pdf -u https://openbayes.com/
```

To generate PDF from a local Docusaurus instance. You need to first build the site locally, then run the following command:

```bash
# Serve built site locally
yarn serve

# Generate PDF from local Docusaurus instance
npx docusaurus-prince-pdf -u http://localhost:4000 # Change port to your serving port
```

## Method 2: mr-pdf (not used in this project)

The good:

- Free and open-source
- Works with Docusaurus sites
- CI/CD friendly
- Based on Puppeteer make it works for most modern CSS syntax (e.g. `mask-image`)

The bad:

- Doesn't work well with system Dark Mode. You will get a dark background in generated PDF when you have `respectPrefersColorScheme` enabled in your Docusaurus instance. But it's not an issue in Ci/CD environments
- No Table of Contents

The ugly:

- Based on Puppeteer make the text cannot be copied or searched correctly
- Link anchors (links start with `#`) not well handled

Usage:

```bash
npx mr-pdf --initialDocURLs="https://openbayes.com/docs/" --paginationSelector=".pagination-nav__item--next > a" --contentSelector="article"
```
