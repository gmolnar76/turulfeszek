<script lang="ts">
  import Dashboard from './components/Dashboard.svelte';
  
  const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE;
  let enteredCode = '';
  let isAuthorized = !ACCESS_CODE; // Ha nincs beállítva, automatikusan enged
  
  function checkCode() {
    if (enteredCode === ACCESS_CODE) {
      isAuthorized = true;
    } else {
      alert('Hibás belépési kód!');
    }
  }
</script>

{#if isAuthorized}
  <main>
    <Dashboard />
  </main>
{:else}
  <div class="login-gate">
    <div class="login-box">
      <h1>🦅 Turul Fészek</h1>
      <p>Zárt tesztelési fázis</p>
      <input 
        type="password" 
        bind:value={enteredCode} 
        placeholder="Belépési kód"
        on:keypress={(e) => e.key === 'Enter' && checkCode()}
      />
      <button on:click={checkCode}>Belépés</button>
    </div>
  </div>
{/if}

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

  .login-gate {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .login-box {
    background: #0f0f1a;
    padding: 3rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .login-box h1 {
    color: #10b981;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .login-box p {
    color: #9ca3af;
    margin-bottom: 2rem;
  }

  .login-box input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #374151;
    border-radius: 8px;
    background: #1f2937;
    color: white;
    font-size: 1rem;
    margin-bottom: 1rem;
    outline: none;
  }

  .login-box input:focus {
    border-color: #10b981;
  }

  .login-box button {
    width: 100%;
    padding: 12px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .login-box button:hover {
    background: #059669;
  }
</style>
