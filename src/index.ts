// Import dependencies
import axios from "axios";
import { Command } from "commander";
import fs from "fs";
import { promises as fsPromises } from "fs";

// Set up OneMap API endpoint
const ONEMAP_API_URL = "https://www.onemap.gov.sg/api/common/elastic/search";

// Define interface for address object
interface Address {
    address: string;
    latitude: number;
    longitude: number;
    zipCode?: string;
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
async function saveAddressesToFile(zipCode: string, addresses: Address[]): Promise<void> {
    const fileName = `addresses_${zipCode}.json`;
    try {
        await fs.promises.writeFile(fileName, JSON.stringify(addresses, null, 2));
        console.log(`Addresses saved to ${fileName}.`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error saving addresses to file:", error.message);
        } else {
            console.error("An unknown error occurred while saving the file.");
        }
    }
}

/**
 * Convert zip code to address.
 * @param {string} zipCode - The zip code to convert.
 * @param {boolean} saveToFile - Whether to save the addresses to a file.
 * @returns {Promise<void>} - A promise that resolves with the converted addresses.
 */
export async function convertZipCodeToAddress(zipCode: string, saveToFile: boolean = false): Promise<Address[]> {
    try {
        const response = await axios.get(ONEMAP_API_URL, {
            params: {
                searchVal: zipCode,
                returnGeom: "Y",
                getAddrDetails: "Y",
                pageNum: 1,
            },
        });

        const { data } = response;

        if (data.found > 0) {
            const addresses: Address[] = data.results.map((result: any) => ({
                address: result.ADDRESS,
                latitude: parseFloat(result.LATITUDE),
                longitude: parseFloat(result.LONGITUDE),
                zipCode: result.POSTAL,
            }));

            console.log(`Addresses found for ${zipCode}:`);
            console.log(addresses);

            if (saveToFile) {
                await saveAddressesToFile(zipCode, addresses);
            }
            return addresses;
        } else {
            console.log(`No addresses found for ${zipCode}.`);
            return [];
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data from OneMap API:", error.message);
        } else {
            console.error("An unknown error occurred while fetching data from OneMap API.");
        }
        return [];
    }
}

/**
 * Convert address to zip code.
 * @param {string} address - The address to convert.
 * @returns {Promise<Address[]>} - A promise that resolves with the converted addresses (containing zip codes).
 */
export async function convertAddressToZipCode(address: string): Promise<Address[]> {
    try {
        const response = await axios.get(ONEMAP_API_URL, {
            params: {
                searchVal: address,
                returnGeom: "Y",
                getAddrDetails: "Y",
                pageNum: 1,
            },
        });

        const { data } = response;

        if (data.found > 0) {
            const addresses: Address[] = data.results.map((result: any) => ({
                address: result.ADDRESS,
                latitude: parseFloat(result.LATITUDE),
                longitude: parseFloat(result.LONGITUDE),
                zipCode: result.POSTAL,
            }));

            console.log(`Zip codes found for ${address}:`);
            console.log(addresses.map(a => ({ address: a.address, zipCode: a.zipCode })));

            return addresses;
        } else {
            console.log(`No zip code found for ${address}.`);
            return [];
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching data from OneMap API:", error.message);
        } else {
            console.error("An unknown error occurred while fetching data from OneMap API.");
        }
        return [];
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
    .action(async (options: { zipcode: string; address: string; file: boolean }) => {
        if (options.zipcode) {
            // Convert zip code to address
            await convertZipCodeToAddress(options.zipcode, options.file);
        } else if (options.address) {
            // Convert address to zip code
            await convertAddressToZipCode(options.address);
        } else {
            console.log("Please provide either a zip code or an address.");
        }
    });

// Only parse arguments if this file is being run directly
if (require.main === module) {
    program.parse(process.argv);
}
