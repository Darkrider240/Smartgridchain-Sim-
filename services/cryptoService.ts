import { Block, ValidationResult } from '../types';

// A simple, synchronous string hash function to simulate SHA-256 for the UI.
// In a production app, we would use window.crypto.subtle (async).
// We use synchronous here to ensure instant UI feedback during the simulation loop.
export const generateHash = (index: number, timestamp: string, dataString: string, prevHash: string): string => {
  const str = `${index}${prevHash}${timestamp}${dataString}`;
  
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  // Return a hex string that looks like a hash
  return (4294967296 * (2097151 + h2) + h1).toString(16).padStart(64, '0');
};

export const validateChain = (chain: Block[]): ValidationResult => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // 1. Check if current block's "prevHash" matches previous block's "hash"
    if (currentBlock.prevHash !== previousBlock.hash) {
      return { isValid: false, errorIndex: i, message: "Broken Link: Previous hash mismatch" };
    }

    // 2. Check if current block's hash is valid for its own data
    // Note: When we tamper, we change 'data' but keep 'hash' same. 
    // Recalculating here exposes the lie.
    const recalculatedHash = generateHash(
      currentBlock.index,
      currentBlock.timestamp,
      JSON.stringify(currentBlock.data),
      currentBlock.prevHash
    );

    if (currentBlock.hash !== recalculatedHash) {
      return { isValid: false, errorIndex: i, message: "Data Tampered: Hash mismatch" };
    }
  }
  return { isValid: true };
};