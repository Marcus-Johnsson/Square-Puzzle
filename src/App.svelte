<script>
  import Board from "./components/Board.svelte";
  
    let intructionVisible = false;
  function toggleInstruction() {
    intructionVisible = !intructionVisible;
  }
</script>

<main class="puzzle-app">
    <div style="position: absolute; top: 10px; right: 10px;">
      <button on:click={toggleInstruction}>?</button>
    </div>
      {#if (intructionVisible)}
      <div class="instructions">
        <h3>Intruction</h3>
        <p>Drag pieces to board, fill the board to win. Rotate and flip the pieces to make them fit as nedded.</p>
        <p>Press on a piece to get option to rotate and flip. A piece can only be rotated and fliped on the trace and not on the board.</p>
        
      </div>
      {/if}
  
  <h1>Puzzle Game</h1>

  <Board width={11} height={5} />
</main>

<style>
  .puzzle-app {
    font-family: sans-serif;
    text-align: center;
    padding: 1rem;
  }
  .instructions {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 1rem;
    border-radius: 8px;
    text-align: left;
    max-width: 300px;
    top: 50px;
    right: 10px;
    min-width: 500px;
  }
</style>