// Import dependencies
import axios from "axios";
import { Command } from "commander";
import fs from "fs";

// Set up OneMap API endpoint
const ONEMAP_API_URL = "https://www.onemap.gov.sg/api/common/elastic/search";

// Define interface for address object
export interface Address {
    address: string;
    latitude: number;
    longitude: number;
    zipCode?: string;
    blockNo?: string;
    roadName?: string;
    building?: string;
}

// Define interface for zip code object
interface ZipCode {
    zipCode: string;
}

/**
 * Save addresses to a JSON file.
 * @param {string} identifier - The zip code or address searched.
 * @param {Address[]} addresses - The addresses to save.
 */
function saveAddressesToFile(identifier: string, addresses: Address[]): void {
    const safeIdentifier = identifier.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `addresses_${safeIdentifier}.json`;
    fs.writeFile(fileName, JSON.stringify(addresses, null, 2), (error) => {
        if (error) {
            console.error("Error saving addresses to file:", error.message);
        } else {
            console.log(`Addresses saved to ${fileName}.`);
        }
    });
}

/**
 * Perform a search on OneMap API.
 * @param {string} searchValue - The value to search for (zip code or address).
 * @param {number} pageNum - The page number to retrieve.
 * @returns {Promise<Address[]>} - A promise that resolves with the converted addresses.
 */
export async function searchOneMap(searchValue: string, pageNum: number = 1): Promise<Address[]> {
    try {
        const response = await axios.get(ONEMAP_API_URL, {
            params: {
                searchVal: searchValue,
                returnGeom: "Y",
                getAddrDetails: "Y",
                pageNum: pageNum,
            },
        });

        const { data } = response;

        if (data.found > 0) {
            return data.results.map((result: any) => ({
                address: result.ADDRESS,
                latitude: parseFloat(result.LATITUDE),
                longitude: parseFloat(result.LONGITUDE),
                zipCode: result.POSTAL,
                blockNo: result.BLK_NO,
                roadName: result.ROAD_NAME,
                building: result.BUILDING,
            }));
        } else {
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
 * Convert zip code to address.
 * @param {string} zipCode - The zip code to convert.
 * @param {boolean} saveToFile - Whether to save the addresses to a file.
 * @param {number} page - Page number.
 * @param {boolean} showDetails - Whether to show detailed output.
 * @returns {Promise<Address[]>} - A promise that resolves with the converted addresses.
 */
export async function convertZipCodeToAddress(zipCode: string, saveToFile: boolean = false, page: number = 1, showDetails: boolean = false): Promise<Address[]> {
    const addresses = await searchOneMap(zipCode, page);

    if (addresses.length > 0) {
        console.log(`Addresses found for ${zipCode} (Page ${page}):`);
        if (showDetails) {
            console.log(addresses);
        } else {
            console.log(addresses.map(a => ({
                address: a.address,
                latitude: a.latitude,
                longitude: a.longitude,
                zipCode: a.zipCode
            })));
        }

        if (saveToFile) {
            saveAddressesToFile(zipCode, addresses);
        }
    } else {
        console.log(`No addresses found for ${zipCode} on page ${page}.`);
    }
    return addresses;
}

/**
 * Convert address to zip code.
 * @param {string} address - The address to convert.
 * @param {number} page - Page number.
 * @param {boolean} showDetails - Whether to show detailed output.
 * @returns {Promise<Address[]>} - A promise that resolves with the converted addresses (containing zip codes).
 */
export async function convertAddressToZipCode(address: string, page: number = 1, showDetails: boolean = false): Promise<Address[]> {
    const addresses = await searchOneMap(address, page);

    if (addresses.length > 0) {
        console.log(`Results found for ${address} (Page ${page}):`);
        if (showDetails) {
            console.log(addresses);
        } else {
             // For CLI display, we can just show address and zipcode unless details are requested
            console.log(addresses.map(a => ({ address: a.address, zipCode: a.zipCode })));
        }
        return addresses;
    } else {
        console.log(`No zip code found for ${address} on page ${page}.`);
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
    .option("-p, --page <number>", "Page number of results", "1")
    .option("-d, --details", "Show detailed output (Block, Road, Building)", false)
    .action(async (options: { zipcode: string; address: string; file: boolean; page: string; details: boolean }) => {
        const pageNum = parseInt(options.page, 10) || 1;

        if (options.zipcode) {
            // Convert zip code to address
            await convertZipCodeToAddress(options.zipcode, options.file, pageNum, options.details);
        } else if (options.address) {
            // Convert address to zip code
            await convertAddressToZipCode(options.address, pageNum, options.details);
        } else {
            console.log("Please provide either a zip code or an address.");
        }
    });

// Only parse arguments if this file is being run directly
if (require.main === module) {
    program.parse(process.argv);
}
