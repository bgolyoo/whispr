<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { decryptText, loadKey } from '$lib/crypto';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import type { PageData } from './$types';

  export let data: PageData;

  let textAreaValue = '';

  onMount(async () => {
    const serializedPrivateKey = localStorage.getItem(data.serializedPublicKey);
    if (!serializedPrivateKey) {
      toast('Unable to load private key from the local storage. Make sure the url is correct.');
      return;
    }

    try {
      const privateKey = await loadKey(serializedPrivateKey, 'decrypt');
      textAreaValue = await decryptText(
        privateKey,
        data.encryptedSymmetricKeyBase64,
        data.encryptedDataBase64
      );
    } catch (error) {
      if ((error as Error).toString() === 'OperationError') {
        toast('Unable to decrypt secret. Make sure the url is correct and was not cut off.');
      } else {
        toast(
          `Could not find the private key associated to the public key in the url in the browser. Make sure this is the correct browser and the url is correct. Only the requester can decrypt the secret.`
        );
      }
    }
  });
</script>

<div class="grid items-center gap-8">
  <p
    class="w-full text-center text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
  >
    Below is the decrypted secret shared with you.
  </p>
  <div class="grid w-full gap-2">
    <Label class="sr-only" for="secret">Secret</Label>
    <Textarea id="secret" class="!cursor-text" disabled bind:value={textAreaValue} rows={6}
    ></Textarea>

    <Button variant="outline" href="/">Back</Button>
  </div>
</div>
