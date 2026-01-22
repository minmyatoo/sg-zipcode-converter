# 🏙️ Zip Code and Address Converter

Convert zip codes to addresses and back with ease using this command-line tool, fueled by the OneMap API. 🚀

## Prerequisites 🛠️

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)

## Installation 📦

1. Clone this repository or download the code.
2. Navigate to the project directory in your terminal.
3. Install the necessary dependencies:

```sh
npm install
```

## Usage 📝

To convert a zip code to an address, use this command:

```shell
npx ts-node src/index.ts --zipcode <zipcode>
```
Or use the npm script:
```shell
npm run zipcode -- <zipcode>
```

To convert an address to a zip code, run this command:

```shell
npx ts-node src/index.ts --address "<address>"
```

To save addresses for a zip code to a file, add the --file flag:

```shell
npx ts-node src/index.ts --zipcode <zipcode> --file
```

## Example 🌟

```shell
npm run zipcode -- 123456
```

```shell
npx ts-node src/index.ts --address "Plaza Singapura"
```
