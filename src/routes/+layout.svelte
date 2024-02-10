<script>
  import '../app.pcss';
  import { Toaster } from '$lib/components/ui/sonner';
  import { ModeWatcher } from 'mode-watcher';
  import { LightSwitch } from '$lib/components/ui/light-switch';

  const title = 'Whispr';
  const description =
    'Exchange secrets with anyone without data passing through a server. Everything is securely encrypted and decrypted in your browser.';
  const url = 'https://whispr.click';
  const image = `${url}/thumbnail.png`;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <meta property="og:title" content={title} />
  <meta property="og:type" content="article" />
  <meta property="og:image" content={image} />
  <meta property="og:url" content={url} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={title} />

  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
  <meta name="twitter:image:alt" content={title} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<ModeWatcher track={false} />
<Toaster />
<LightSwitch />

<div class="container px-4 py-12 md:px-6 md:py-24 lg:py-32">
  <div class="mx-auto grid max-w-screen-sm gap-8">
    <div class="w-full text-center">
      <h1 class="text-3xl font-bold tracking-tighter md:text-5xl/tight">Whispr</h1>
    </div>
    <slot />
  </div>
</div>
