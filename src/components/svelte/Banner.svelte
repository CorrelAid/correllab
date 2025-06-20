<script>
  import { onMount } from "svelte";
  import { fly, slide } from "svelte/transition";
  import { bounceOut as easing } from "svelte/easing";
  let { top = 0, children } = $props();
  let is_visible = $state(false);

  onMount(() => {
    setTimeout(() => {
      is_visible = true;
    }, 1000);
  });
</script>

{#if is_visible}
  <div
    class="banner"
    class:visible={is_visible}
    in:slide={{ axis: "y", y: -100, duration: 600, easing }}
    out:slide={{ axis: "y", y: -100, duration: 200 }}
    style="--top: {top}"
  >
    <div class="banner-content">
      {@render children?.()}
    </div>
    <button
      class="btn-ghost"
      style="color: white;"
      onclick={() => (is_visible = false)}
      aria-label="Schließen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-x"
        ><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg
      >
    </button>
  </div>
{/if}

<style>
  .banner {
    position: sticky;
    top: var(--top, 0);
    left: 0;
    width: 100%;
    background: linear-gradient(to left, #6699d0, #c5e2a3);
    z-index: 1000;
    visibility: hidden;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;

    &.visible {
      visibility: visible;
    }

    & .banner-content {
      display: flex;
      justify-content: center;
      width: 100%;
      gap: 1rem;
      position: relative;
    }
  }
</style>
