<script lang="ts">
  import { UrlCopy } from '$lib/components/ui/url-copy';
  import { generateKeyPair } from '$lib/crypto';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  let url: string;

  onMount(async () => {
    try {
      const serializedPublicKey = await generateKeyPair();
      url = `${location.href}${serializedPublicKey}`;
    } catch (error) {
      toast("Couldn't generate key pair");
    }
  });
</script>

<div class="grid items-center gap-8">
  <div class="w-full text-center">
    <p class="mt-8 text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
      Exchange secrets with anyone without data passing through a server.<br
        class="hidden lg:block"
      /> Everything is securely encrypted and decrypted in your browser.
    </p>
  </div>
  <div class="w-full">
    <UrlCopy {url} />
  </div>
  <div class="flex w-full justify-center">
    <ol class="ml-8 list-decimal text-sm text-gray-500">
      <li>Share this link with someone you want a secret from.</li>
      <li>They can type in their secret and then send you the link Whispr gives them.</li>
      <li>Only you can open that link and see what secret they shared.</li>
    </ol>
  </div>
</div>
