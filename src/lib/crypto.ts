const ALGO_NAME = 'RSA-OAEP';
const ALGO_HASH = 'SHA-256';
const ALGO_KEY_LENGTH = 2048;

export async function generateKeyPair() {
  let serializedPublicKey = localStorage.getItem('publicKey');

  if (serializedPublicKey) {
    return serializedPublicKey;
  }

  const keyPair = await crypto.subtle.generateKey(
    {
      name: ALGO_NAME,
      modulusLength: ALGO_KEY_LENGTH,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: ALGO_HASH
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

function serializeKey(key: JsonWebKey): string {
  return btoa(JSON.stringify(key));
}

function deserializeKey(serializedKey: string): JsonWebKey {
  return JSON.parse(atob(serializedKey));
}

export async function importJWKey(key: JsonWebKey, usage: KeyUsage): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'jwk',
    key,
    {
      name: ALGO_NAME,
      hash: ALGO_HASH
    },
    true,
    [usage]
  );
}

export async function loadKey(serializeKey: string, usage: KeyUsage): Promise<CryptoKey> {
  return await importJWKey(deserializeKey(serializeKey), usage);
}

export async function encryptText(publicKey: CryptoKey, text: string): Promise<string> {
  const textBuffer = new TextEncoder().encode(text);

  const encryptedBuffer = await crypto.subtle.encrypt({ name: ALGO_NAME }, publicKey, textBuffer);

  return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

export async function decryptText(privateKey: CryptoKey, encryptedBase64: string): Promise<string> {
  const encryptedBuffer = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: ALGO_NAME },
    privateKey,
    encryptedBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}
