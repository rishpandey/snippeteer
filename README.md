<p align="center">
  <img src="assets/img/logo.png" height="180" width="180" />
</p>

# SNIPPETEER

**SNIPPETEER** makes you more productive by eliminating the need of typing the texts frequently. It registers system shortcuts for storing and searching snippets and let's you quickly paste stored text snippet in all applications.

## Table of Contents

- [Download](#download)
- [Installation](#installation)
- [Usage](#usage)
- [Support](#support)
- [Contributing](#contributing)

## Download

The latest version of **SNIPPETEER** for macOS, Linux and Windows is available [here](https://github.com/imrish/snippeteer/releases).

**macOS 10.9+, Windows 7+ & Linux are supported.**

## Installation

To clone and run this repository you'll need Git and Node.js (which comes with npm) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/therishabhpandey/snippeteer.git

# Go into the repository
cd snippeteer

# Install dependencies
npm install

# Rebuild dependencies for Electron
npm rebuild --runtime=electron --target=1.8.4 --disturl=https://atom.io/download/atom-shell --abi=57

# Run app
npm start

# Build dist 
npm run dist 
```

## Usage

Download or build a release of SNIPPETEER.
Set up these shortcuts, which will be globally registered.     
- Add a snippet 
- Search for snippet

These shortcuts **should be accesible from everywhere** in your system, so make sure to not use shortcuts that may conflict with your focussed applications. 

_For more examples and usage, please refer to the [Wiki](https://github.com/imRish/snippeteer/wiki)._

## Support

Please [open an issue](https://github.com//imrish/snippeteer/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and [open a pull request](https://github.com/imrish/snippeteer/compare/).
