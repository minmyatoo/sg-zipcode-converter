import { convertZipCodeToAddress, convertAddressToZipCode } from '../index';
import assert from 'assert';
import { test } from 'node:test';

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
