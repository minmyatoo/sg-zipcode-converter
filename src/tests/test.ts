import { convertZipCodeToAddress, convertAddressToZipCode } from '../index';
import assert from 'assert';
import { test } from 'node:test';
import fs from 'fs';

test('convertZipCodeToAddress saves file when saveToFile is true', async () => {
    const zipCode = '547528';
    const fileName = `addresses_${zipCode}.json`;

    // Clean up file if it exists
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    const addresses = await convertZipCodeToAddress(zipCode, true);
    assert(Array.isArray(addresses), 'Should return an array of addresses');
    assert.ok(addresses.length > 0, 'Should find at least one address');

    // Verify file was created
    assert.ok(fs.existsSync(fileName), 'File should have been created');

    // Verify file content
    const fileContent = fs.readFileSync(fileName, 'utf-8');
    const savedAddresses = JSON.parse(fileContent);
    assert.deepStrictEqual(savedAddresses, addresses, 'File content should match returned addresses');

    // Clean up the file
    fs.unlinkSync(fileName);
});

test('convertZipCodeToAddress returns data for valid zipcode', async () => {
    // 547528 is a valid SG zipcode (Gracehaven)
    const results = await convertZipCodeToAddress('547528', false);
    assert.ok(results.length > 0, 'Should find at least one address');
    assert.match(results[0].address, /GRACEHAVEN/, 'Address should contain "GRACEHAVEN"');
});

test('convertAddressToZipCode returns data for valid address', async () => {
    // "Plaza Singapura" should exist
    const results = await convertAddressToZipCode('Plaza Singapura');
    assert.ok(results.length > 0, 'Should find at least one result');
    assert.match(results[0].address, /PLAZA SINGAPURA/, 'Address should contain "PLAZA SINGAPURA"');
});

test('convertZipCodeToAddress returns empty for invalid zipcode', async () => {
    const results = await convertZipCodeToAddress('000000', false);
    assert.strictEqual(results.length, 0, 'Should return empty array');
});
