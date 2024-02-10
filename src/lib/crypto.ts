const ASYMMETRIC_ALGO_NAME = 'RSA-OAEP';
const ASYMMETRIC_ALGO_HASH = 'SHA-256';
const ASYMMETRIC_ALGO_KEY_MODULUS_LENGTH = 2048;

const SYMMETRIC_ALGO_NAME = 'AES-GCM';
const SYMMETRIC_ALGO_KEY_LENGTH = 256;

/**
 * Generate a symmetric key for encrypting and decrypting data
 */
export async function generateSymmetricKey() {
  return await crypto.subtle.generateKey(
    {
      name: SYMMETRIC_ALGO_NAME,
      length: SYMMETRIC_ALGO_KEY_LENGTH
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a public/private key pair for encrypting and decrypting data
 */
export async function generateKeyPair() {
  let serializedPublicKey = localStorage.getItem('publicKey');

  if (serializedPublicKey) {
    return serializedPublicKey;
  }

  const keyPair = await crypto.subtle.generateKey(
    {
      name: ASYMMETRIC_ALGO_NAME,
      modulusLength: ASYMMETRIC_ALGO_KEY_MODULUS_LENGTH,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: ASYMMETRIC_ALGO_HASH
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  serializedPublicKey = serializeKey(publicKeyJwk);
  const serializedPrivateKey = serializeKey(privateKeyJwk);

  localStorage.setItem('publicKey', serializedPublicKey);
  localStorage.setItem(serializedPublicKey, serializedPrivateKey);

  return serializedPublicKey;
}

/**
 * Serialize a JsonWebKey object to a base64 string
 */
function serializeKey(key: JsonWebKey): string {
  return btoa(JSON.stringify(key));
}

/**
 * Deserialize a base64 string to a JsonWebKey object
 */
function deserializeKey(serializedKey: string): JsonWebKey {
  return JSON.parse(atob(serializedKey));
}

/**
 * Import a JsonWebKey object as a CryptoKey object
 */
export async function importJWKey(key: JsonWebKey, usage: KeyUsage): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: ASYMMETRIC_ALGO_NAME,
      hash: ASYMMETRIC_ALGO_HASH
    },
    true,
    [usage]
  );
}

/**
 * Load a serialized key load a CryptoKey object
 */
export async function loadKey(serializeKey: string, usage: KeyUsage): Promise<CryptoKey> {
  return await importJWKey(deserializeKey(serializeKey), usage);
}

/**
 * Encrypt text using a public key
 */
export async function encryptText(
  publicKey: CryptoKey,
  text: string
): Promise<{ encryptedDataBase64: string; encryptedSymmetricKeyBase64: string }> {
  // Generate a symmetric key for encrypting the text
  const symmetricKey = await generateSymmetricKey();

  // Convert the text to a buffer
  const textBuffer = new TextEncoder().encode(text);

  // Encrypt the text using the symmetric key
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: SYMMETRIC_ALGO_NAME, iv: new Uint8Array(12) },
    symmetricKey,
    textBuffer
  );

  // Convert the encrypted buffer to a base64 string
  let encryptedDataBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
  // Escape characters that are not allowed in a URL
  encryptedDataBase64 = encodeURIComponent(encryptedDataBase64);

  // Export the symmetric key to a JsonWebKey object
  const symmetricKeyData = await crypto.subtle.exportKey('jwk', symmetricKey);

  // Convert the symmetric key data to a buffer
  const symmetricKeyBuffer = new TextEncoder().encode(JSON.stringify(symmetricKeyData));

  // Encrypt the symmetric key using the public key
  const encryptedSymmetricKeyBuffer = await crypto.subtle.encrypt(
    { name: ASYMMETRIC_ALGO_NAME },
    publicKey,
    symmetricKeyBuffer
  );

  // Convert the encrypted symmetric key buffer to a base64 string
  let encryptedSymmetricKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedSymmetricKeyBuffer))
  );
  // Escape characters that are not allowed in a URL
  encryptedSymmetricKeyBase64 = encodeURIComponent(encryptedSymmetricKeyBase64);

  return { encryptedDataBase64, encryptedSymmetricKeyBase64 };
}

/**
 * Decrypt text using a private key and an encrypted symmetric key
 */
export async function decryptText(
  privateKey: CryptoKey,
  encryptedKeyBase64: string,
  encryptedDataBase64: string
): Promise<string> {
  // Convert the encrypted symmetric key from base64 to a buffer
  const encryptedKeyBuffer = Uint8Array.from(atob(decodeURIComponent(encryptedKeyBase64)), (c) =>
    c.charCodeAt(0)
  );

  // Decrypt the symmetric key using the private key
  const symmetricKeyBuffer = await crypto.subtle.decrypt(
    { name: ASYMMETRIC_ALGO_NAME },
    privateKey,
    encryptedKeyBuffer
  );

  // Convert the symmetric key buffer to a JsonWebKey object
  const symmetricKeyData = JSON.parse(new TextDecoder().decode(symmetricKeyBuffer));

  // Import the symmetric key from the JsonWebKey object
  const symmetricKey = await crypto.subtle.importKey(
    'jwk',
    symmetricKeyData,
    { name: SYMMETRIC_ALGO_NAME },
    true,
    ['encrypt', 'decrypt']
  );

  // Convert the encrypted data from base64 to a buffer
  const encryptedBuffer = Uint8Array.from(atob(decodeURIComponent(encryptedDataBase64)), (c) =>
    c.charCodeAt(0)
  );

  // Decrypt the data using the symmetric key
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: SYMMETRIC_ALGO_NAME, iv: new Uint8Array(12) },
    symmetricKey,
    encryptedBuffer
  );

  // Convert the decrypted buffer to a string and return it
  return new TextDecoder().decode(decryptedBuffer);
}
