# 🏙️ Zip Code and Address Converter

Convert zip codes to addresses and back with ease using this command-line tool, fueled by the OneMap API. 🚀

## Prerequisites 🛠️

- [Node.js](https://nodejs.org/)

## Installation 📦

1. Clone this repository or download the code.
2. Navigate to the project directory in your terminal.
3. Install the necessary dependencies:

```sh
npm install axios dotenv commander fs
```

4. Install TypeScript and ts-node globally:

```shell
npm install -g typescript ts-node
```

5. Create a .env file in the project directory and add your OneMap API key:

```shell
ONEMAP_API_KEY=your_api_key_here
```

## Usage 📝

To convert a zip code to an address, use this command:

```shell
ts-node index.ts --zipcode <zipcode>
```

To convert an address to a zip code, run this command:

```shell
ts-node index.ts --address "<address>"
```

To save addresses for a zip code to a file, add the --file flag:

```shell
ts-node index.ts --zipcode <zipcode> --file
```

## Example 🌟

```shell
ts-node index.ts --zipcode 123456
```

```shell
ts-node index.ts --address "10 Downing St, Westminster, London"
```
