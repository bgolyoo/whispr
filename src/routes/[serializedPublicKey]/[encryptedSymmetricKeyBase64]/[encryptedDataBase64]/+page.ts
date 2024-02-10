import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const serializedPublicKey = params.serializedPublicKey;
  const encryptedSymmetricKeyBase64 = params.encryptedSymmetricKeyBase64;
  const encryptedDataBase64 = params.encryptedDataBase64;

  return { serializedPublicKey, encryptedSymmetricKeyBase64, encryptedDataBase64 };
};
