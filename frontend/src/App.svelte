<script lang="ts">
  import Dashboard from './components/Dashboard.svelte';
</script>

<main>
  <Dashboard />
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(html, body) {
    width: 100%;
    height: 100%;
    background-color: #f3f4f6;
  }

  :global(#app) {
    width: 100%;
    height: 100%;
  }

  main {
    width: 100%;
    height: 100%;
  }
</style>
