# Docusaurus Prince PDF Generator

Extract rendered data from Docusaurus and generate PDF, the hard way

## Demo/Examples

<img width="1008" alt="Prince PDF for Docusaurus Documentation" src="https://user-images.githubusercontent.com/96356/127639981-68aae100-9b96-4abc-920a-5fd8c6507a0d.png">

You can download it in [GitHub Actions](https://github.com/signcl/docusaurus-prince-pdf/actions/workflows/test.yml) artifacts section to see the result.

This project is using the method 1 (see below) for generating PDF. You must have [Prince](https://www.princexml.com/) installed on your local machine.

## Usage

Install [Prince](https://www.princexml.com/download/) first.

Run the following commands to generate PDF:

```bash
# Genrate PDF from specific site under `docs` scope
npx docusaurus-prince-pdf -u https://docusaurus.io/docs

# Change generating scope to `/docs/cli/`
npx docusaurus-prince-pdf -u https://docusaurus.io/docs/cli

# Custom working (output) directory
npx docusaurus-prince-pdf -u https://openbayes.com/docs --dest ./pdf-output

# Custom output file name
npx docusaurus-prince-pdf -u https://openbayes.com/docs --output docs.pdf
```

To generate PDF from a local Docusaurus instance. You need to first build the site locally:

```bash
# Build the site
yarn build

# Serve built site locally
yarn serve

# Generate PDF from local Docusaurus instance
npx docusaurus-prince-pdf -u http://localhost:4000/docs # Change port to your serving port
```

See help screen for all options:

```bash
npx docusaurus-prince-pdf -h
```

## Docker

- [Docker Hub](https://hub.docker.com/r/openbayes/docusaurus-prince-pdf)
- [ghcr.io](https://github.com/orgs/signcl/packages/container/package/docusaurus-prince-pdf)

You can run this program with Docker image:

```bash
docker run --rm -it \
  -v $(pwd)/pdf:/app/pdf \
  openbayes/docusaurus-prince-pdf \
  -u https://docusaurus.io/docs/
```

If you need Asiatic languages support like Chinese and Japanese. You can mount your custom fonts directory to Docker image:

```bash
docker run --rm -it \
  -v $(pwd)/pdf:/app/pdf \
  -v $(pwd)/fonts:/root/.fonts \
  openbayes/docusaurus-prince-pdf \
  -u https://docusaurus.io/docs/
```

## GitHub Actions

You can also run this program inside GitHub Actions:

```yaml
jobs:
  build:
    # prerequisites...

    - name: Install Prince
      run: |
        curl https://www.princexml.com/download/prince-14.2-linux-generic-x86_64.tar.gz -O
        tar zxf prince-14.2-linux-generic-x86_64.tar.gz
        cd prince-14.2-linux-generic-x86_64
        yes "" | sudo ./install.sh

    - name: Build PDF
      run: npx docusaurus-prince-pdf -u https://docusaurus.io/docs/

    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: result
        # The output filename can be specified with --output option
        path: pdf/docusaurus.io-docs.pdf
        if-no-files-found: error

    # ...other steps
```

You can also run `prince` with prebuilt Prince Docker image:

```yaml
jobs:
  build:
    # prerequisites...

    - name: Build PDF
      run: docker run --rm -it -v $(pwd)/pdf:/app/pdf openbayes/docusaurus-prince-pdf -u https://docusaurus.io/docs/

    # ...other steps
```

## How it works

Like [mr-pdf](https://github.com/kohheepeace/mr-pdf), this package looks for the next pagination links on generated Docusaurus site. Collect them in a list and then pass the list to Prince to generate the PDF.

You can specify the CSS selector if you're using custom Docusaurus theme:

```bash
npx docusaurus-prince-pdf -u https://openbayes.com/ --selector 'nav.custom-pagination-item--next > a'
```

## Why this package?

I made a comparison list for the two methods of generating PDF from Docusaurus.

### Method 1: Prince

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

### Method 2: [mr-pdf](https://github.com/kohheepeace/mr-pdf) (not used in this project)

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

## License

MIT
