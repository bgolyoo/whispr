<script>
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';

  export let url = '';

  let copyText = 'Copy';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    copyText = 'Copied!';
  };
</script>

<div class="flex">
  <Label class="sr-only" for="url">Url</Label>
  <Input
    id="url"
    type="text"
    placeholder=""
    autocapitalize="none"
    autocomplete="off"
    autocorrect="off"
    disabled
    bind:value={url}
    class="!cursor-text rounded-r-none"
  />
  <Button class="w-28 rounded-l-none" on:click={copyToClipboard}>{copyText}</Button>
</div>
