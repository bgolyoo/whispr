<script lang="ts">
  import { decryptText, encryptText, generateKeyPair, loadKey } from '$lib/crypto';
  import { onMount } from 'svelte';

  let isNewSecret = false;
  let url: string;
  let copyText = 'Copy';
  let isError = false;
  let errorTitle = '';
  let errorMessage = '';
  let isDecrypting = false;

  let publicKey: CryptoKey;

  let textAreaValue = '';

  onMount(async () => {
    if (!location.hash) {
      isNewSecret = true;
      const serializedPublicKey = await generateKeyPair();
      url = `${location.href}#${serializedPublicKey}`;
    } else if (location.hash.includes(';')) {
      isDecrypting = true;
      decrypt();
    } else {
      const serializedPublicKey = location.hash.split('#')[1];
      try {
        publicKey = await loadKey(serializedPublicKey, 'encrypt');
      } catch (error: unknown) {
        showError(
          error,
          'Unable to load public key.',
          'Unable to load public key from the url. Make sure the url is correct.'
        );
      }
    }
  });

  function showError(error: unknown, title: string, message: string) {
    console.log(error);
    isError = true;
    errorTitle = title;
    errorMessage = message;
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(url);
    copyText = 'Copied!';
  }

  async function encrypt() {
    console.log('encrypting', textAreaValue);
    try {
      const encryptedText = await encryptText(publicKey, textAreaValue);
      url = `${window.location.href};${encryptedText}`;
    } catch (error: unknown) {
      showError(error, 'Unable to encrypt text.', 'Unable to encrypt the text. Please try again.');
    }
  }

  async function decrypt() {
    const [serializedPublicKey, encryptedText] = location.hash.replace('#', '').split(';');

    const serializedPrivateKey = localStorage.getItem(serializedPublicKey);
    if (!serializedPrivateKey) {
      showError(
        null,
        'Unable to load private key.',
        'Unable to load private key from the local storage. Make sure the url is correct.'
      );
      return;
    }

    try {
      const privateKey = await loadKey(serializedPrivateKey, 'decrypt');
      textAreaValue = await decryptText(privateKey, encryptedText);
    } catch (error: unknown) {
      let title, message;

      if ((error as Error).toString() === 'OperationError') {
        title = 'Unable to decrypt';
        message = 'Unable to decrypt secret. Make sure the url is correct and was not cut off.';
      } else {
        title = 'Unable to load private key';
        message = `
                Could not find the private key associated to the public key in the url in the browser.
                Make sure this is the correct browser and the url is correct.
                Only the requester can decrypt the secret.
                `;
      }

      showError(error, title, message);
    }
  }
</script>

{#if isNewSecret}
  <input type="text" disabled bind:value={url} />
  <button on:click={copyToClipboard}>{copyText}</button>
{:else if isDecrypting}
  <p>Below is the decrypted secret shared with you.</p>
  <textarea disabled bind:value={textAreaValue}></textarea>
{:else}
  <p>Somebody is requesting a secret.</p>
  <p>No one except for the requester will see this information.</p>

  <textarea bind:value={textAreaValue}></textarea>
  <div>{textAreaValue.length}</div>
  <button on:click={encrypt}>Encrypt</button>

  {#if url}
    <p>Success!</p>
    <p>Send this url back to the requester to share the secret.</p>
    <input type="text" disabled value={url} />
    <button on:click={copyToClipboard}>{copyText}</button>
  {/if}
{/if}

{#if isError}
  <div>
    <h2>{errorTitle}</h2>
    <p>{errorMessage}</p>
  </div>
{/if}
