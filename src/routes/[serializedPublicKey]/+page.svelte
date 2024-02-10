<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { UrlCopy } from '$lib/components/ui/url-copy';
  import { encryptText, loadKey } from '$lib/crypto';
  import { toast } from 'svelte-sonner';
  import type { PageData } from './$types';

  export let data: PageData;

  let textAreaValue = '';
  let textAreaMaxLength = 500;
  let url = '';

  async function encrypt() {
    if (textAreaValue.length > textAreaMaxLength) {
      toast(`The text is too long. Maximum length is ${textAreaMaxLength}.`);
      return;
    }
    try {
      const publicKey = await loadKey(data.serializedPublicKey, 'encrypt');
      const { encryptedDataBase64, encryptedSymmetricKeyBase64 } = await encryptText(
        publicKey,
        textAreaValue
      );
      url = `${window.location.href}/${encryptedSymmetricKeyBase64}/${encryptedDataBase64}`;
    } catch (error) {
      toast('Unable to encrypt text.');
    }
  }
</script>

<div class="grid items-center gap-8">
  <div class="w-full text-center">
    <p class="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
      Somebody is requesting a secret.
    </p>
    <p class="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
      No one except for the requester will see this information.
    </p>
  </div>
  <div class="grid w-full gap-2">
    <div class="grid w-full gap-1">
      <p class="lg:text-md/relaxed text-right text-gray-500 md:text-sm/relaxed">
        {textAreaValue.length} / 500
      </p>
      <Textarea bind:value={textAreaValue} maxlength={textAreaMaxLength} rows={6}></Textarea>
    </div>
    <Button class="w-full" disabled={textAreaValue.length === 0} on:click={encrypt}>Encrypt</Button>
  </div>

  {#if url}
    <div class="grid w-full gap-2 text-center">
      <p class="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
        Send this url back to the requester to share the secret.
      </p>
      <UrlCopy {url} />
    </div>
  {/if}
</div>
