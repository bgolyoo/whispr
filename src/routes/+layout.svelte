<script>
  import '../app.pcss';
  import { Toaster } from '$lib/components/ui/sonner';
  import { ModeWatcher } from 'mode-watcher';
</script>

<ModeWatcher track={false} />
<Toaster />

<div class="container px-4 py-12 md:px-6 md:py-24 lg:py-32">
  <div class="mx-auto grid max-w-screen-sm gap-8">
    <div class="w-full text-center">
      <h1 class="text-3xl font-bold tracking-tighter md:text-5xl/tight">Whispr</h1>
    </div>
    <slot />
  </div>
</div>
