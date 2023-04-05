// Import dependencies
import axios from "axios";
import dotenv from "dotenv";
import { Command } from "commander";
import fs from "fs";

// Load environment variables
dotenv.config();

// Set up OneMap API endpoint and API key
const ONEMAP_API_KEY = process.env.ONEMAP_API_KEY;
const ONEMAP_API_URL = "https://developers.onemap.sg/commonapi/search";

// Define interface for address object
interface Address {
    address: string;
    latitude: number;
    longitude: number;
}

// Define interface for zip code object
interface ZipCode {
    zipCode: string;
}

/**
 * Save addresses to a JSON file.
 * @param {string} zipCode - The zip code.
 * @param {Address[]} addresses - The addresses to save.
 */
function saveAddressesToFile(zipCode: string, addresses: Address[]): void {
    const fileName = `addresses_${zipCode}.json`;
    fs.writeFile(fileName, JSON.stringify(addresses, null, 2), (error) => {
        if (error) {
            console.error("Error saving addresses to file:", error.message);
        } else {
            console.log(`Addresses saved to ${fileName}.`);
        }
    });
}

/**
 * Convert zip code to address.
 * @param {string} zipCode - The zip code to convert.
 * @param {boolean} saveToFile - Whether to save the addresses to a file.
 * @returns {Promise<void>} - A promise that resolves with the converted addresses.
 */
async function convertZipCodeToAddress(zipCode: string, saveToFile: boolean): Promise<void> {
    try {
        const response = await axios.get(ONEMAP_API_URL, {
            params: {
                searchVal: zipCode,
                returnGeom: "Y",
                getAddrDetails: "Y",
                pageNum: 1,
                key: ONEMAP_API_KEY,
            },
        });

        const { data } = response;

        if (data.found > 0) {
            const addresses: Address[] = data.results.map((result: any) => ({
                address: result.ADDRESS,
                latitude: parseFloat(result.LATITUDE),
                longitude: parseFloat(result.LONGITUDE),
            }));

            console.log(`Addresses found for ${zipCode}:`);
            console.log(addresses);

            if (saveToFile) {
                saveAddressesToFile(zipCode, addresses);
            }
        } else {
            console.log(`No addresses found for ${zipCode}.`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data from OneMap API:", error.message);
        } else {
            console.error("An unknown error occurred while fetching data from OneMap API.");
        }
    }
}

/**
 * Convert address to zip code.
 * @param {string} address - The address to convert.
 * @returns {Promise<ZipCode>} - A promise that resolves with the converted zip code.
 */
async function convertAddressToZipCode(address: string): Promise<ZipCode> {
    try {
        const response = await axios.get(ONEMAP_API_URL, {
            params: {
                searchVal: address,
                returnGeom: "Y",
                getAddrDetails: "Y",
                pageNum: 1,
                key: ONEMAP_API_KEY,
            },
        });

        const { data } = response;

        if (data.found > 0) {
            const result = data.results[0];
            const zipCode: ZipCode = {
                zipCode: result.POSTAL,
            };

            console.log(`Zip code found for ${address}:`);
            console.log(zipCode);

            return zipCode;
        } else {
            console.log(`No zip code found for ${address}.`);
            throw new Error(`No zip code found for ${address}.`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data from OneMap API:", error.message);
            throw error;
        } else {
            console.error("An unknown error occurred while fetching data from OneMap API.");
            throw new Error("An unknown error occurred while fetching data from OneMap API.");
        }
    }
}


// Set up CLI commands and options
const program = new Command();

program
    .version("1.0.0")
    .description("Convert zip codes to addresses and vice versa.")
    .option("-z, --zipcode <zipcode>", "Convert zip code to address")
    .option("-a, --address <address>", "Convert address to zip code")
    .option("-f, --file", "Save addresses to a file", false)
    .action((options: { zipcode: string; address: string; file: boolean }) => {
        if (options.zipcode) {
            // Convert zip code to address
            convertZipCodeToAddress(options.zipcode, options.file);
        } else if (options.address) {
            // Convert address to zip code
            convertAddressToZipCode(options.address).then(zipCode => {
                console.log(`Zip code for address '${options.address}':`, zipCode);
            });
        } else {
            console.log("Please provide either a zip code or an address.");
        }
    });

// Parse CLI arguments
program.parse(process.argv);
