<script>
  import Board from "./components/Board.svelte";
</script>

<main class="puzzle-app">
  <h1>Puzzle Game</h1>
  <Board width={11} height={5} />
</main>

<style>
  .puzzle-app {
    font-family: sans-serif;
    text-align: center;
    padding: 1rem;
  }
</style>