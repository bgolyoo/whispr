import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const serializedPublicKey = params.serializedPublicKey;

  return { serializedPublicKey };
};
