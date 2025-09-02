<script>
  import { allPieces } from "../lib/pieces";
  import {tick} from "svelte";
  export let width;
  export let height;

  // create an array of cells
  let cells = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push({
        x,
        y,
        occupied: false,
        color: null,
        pieceId: null
      });
    }
  }

  let seconds = 0;
  let interval;
  let draggedPiece = null;
  let pieceRotations = {}; // Track rotation state for each piece
  let pieceFlipped = {}; // Track flip state for each piece
  let selectedPiece = null; // Currently selected piece for manipulation

  function onDragOver(event) {
    event.preventDefault();
  }
let wasEmpty = true;

  $: {
    const occupiedCount = cells.filter(c => c.occupied).length;
    if (wasEmpty && occupiedCount > 0) {
      // Board just went from empty to having a piece
      timerInterval();
      wasEmpty = false;
    }
    if (occupiedCount === 0) {
      wasEmpty = true;
    }
  }
  function timerInterval() {
    if (interval) return; // Prevent multiple intervals
    interval = setInterval(() => {
      seconds += 1;
    }, 1000);
  }
  // Function to rotate a shape matrix 90 degrees clockwise
  function rotateShape(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    
    for (let col = 0; col < cols; col++) {
      const newRow = [];
      for (let row = rows - 1; row >= 0; row--) {
        newRow.push(shape[row][col]);
      }
      rotated.push(newRow);
    }
    return rotated;
  }

  // Function to flip a shape matrix horizontally
  function flipShape(shape) {
    return shape.map(row => [...row].reverse());
  }

  // Get transformed shape for a piece based on its current state
  function getTransformedShape(piece) {
    let shape = piece.shape;
    
    // Apply rotations
    const rotations = pieceRotations[piece.name] || 0;
    for (let i = 0; i < rotations; i++) {
      shape = rotateShape(shape);
    }
    
    // Apply flip if needed
    if (pieceFlipped[piece.name]) {
      shape = flipShape(shape);
    }
    
    return shape;
  }

  // Check if a piece can be legally placed at a specific position
  function isValidPlacement(shape, baseX, baseY, pivotX, pivotY, excludePieceId = null) {
    for (let rowIndex = 0; rowIndex < shape.length; rowIndex++) {
      for (let colIndex = 0; colIndex < shape[rowIndex].length; colIndex++) {
        if (shape[rowIndex][colIndex]) {
          const targetX = baseX + (colIndex - pivotX);
          const targetY = baseY + (rowIndex - pivotY);
          
          // Check if position is within board bounds
          if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
            return false;
          }
          
          // Check if position is already occupied by another piece
          const boardCell = cells.find(c => c.x === targetX && c.y === targetY);
          if (boardCell && boardCell.occupied && boardCell.pieceId !== excludePieceId) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Piece selection and control functions
  function selectPiece(piece) {
    selectedPiece = selectedPiece === piece.name ? null : piece.name;
  }

  function rotateSelectedLeft() {
    if (!selectedPiece) return;
    pieceRotations[selectedPiece] = (pieceRotations[selectedPiece] || 0) - 1;
    if (pieceRotations[selectedPiece] < 0) {
      pieceRotations[selectedPiece] = 3;
    }
    // Force reactivity by reassigning both objects
    pieceRotations = { ...pieceRotations };
    pieceFlipped = { ...pieceFlipped };
  }

  function rotateSelectedRight() {
    if (!selectedPiece) return;
    pieceRotations[selectedPiece] = (pieceRotations[selectedPiece] || 0) + 1;
    if (pieceRotations[selectedPiece] >= 4) {
      pieceRotations[selectedPiece] = 0;
    }
    // Force reactivity by reassigning both objects
    pieceRotations = { ...pieceRotations };
    pieceFlipped = { ...pieceFlipped };
  }

  function flipSelectedHorizontal() {
    if (!selectedPiece) return;
    pieceFlipped[selectedPiece] = !pieceFlipped[selectedPiece];
    // Force reactivity by reassigning both objects
    pieceRotations = { ...pieceRotations };
    pieceFlipped = { ...pieceFlipped };
  }

  function resetSelected() {
    if (!selectedPiece) return;
    
    // If piece is on board, remove it first
    const selectedPieceData = allPieces.find(p => p.name === selectedPiece);
    const isPlaced = cells.some(c => c.pieceId === selectedPiece);
    
    if (isPlaced) {
      removePiece(selectedPiece);
    }
    
    // Reset transformations
    pieceRotations[selectedPiece] = 0;
    pieceFlipped[selectedPiece] = false;
    
    // Force reactivity by reassigning both objects
    pieceRotations = { ...pieceRotations };
    pieceFlipped = { ...pieceFlipped };
  }

  function startDragging(name, color, shape, pivotX = 0, pivotY = 0, clearCells = []) {
    draggedPiece = {
      name,
      color,
      shape,
      pivotX,
      pivotY,
      originalCells: [...clearCells] // Store original position for restoration
    };

    // Temporarily clear the piece from the board
    clearCells.forEach(c => {
      c.occupied = false;
      c.color = null;
      c.pieceId = null;
    });

    cells = [...cells];
  }

  function onDrop(targetCell) {
    if (!draggedPiece) return;

    const { pivotX, pivotY, name, shape, color, originalCells } = draggedPiece;
    const { x: baseX, y: baseY } = targetCell;

    // Check if the move is legal
    const isLegal = isValidPlacement(shape, baseX, baseY, pivotX, pivotY, name);

    if (isLegal) {
      // Legal move: place the piece
      shape.forEach((row, rowIndex) => {
        row.forEach((val, colIndex) => {
          if (val) {
            const targetX = baseX + (colIndex - pivotX);
            const targetY = baseY + (rowIndex - pivotY);

            const boardCell = cells.find(c => c.x === targetX && c.y === targetY);
            if (boardCell) {
              boardCell.occupied = true;
              boardCell.color = color;
              boardCell.pieceId = name;
            }
          }
        });
      });
      
    } else {
      // Illegal move: restore original position if piece was previously on board
      if (originalCells.length > 0) {
        originalCells.forEach(c => {
          c.occupied = true;
          c.color = color;
          c.pieceId = name;
        });
      }
      // If it was from tray (originalCells empty), piece just returns to tray
    }

    draggedPiece = null;
    cells = [...cells]; // refresh board
    controlWin();
  }

  function controlWin(){
    const allOccupied = cells.every(c => c.occupied);
    if (allOccupied) {
      alert("Congratulations! You've completed the puzzle!");
    }
  }

  function onReDrag(cell) {

    const pieceCells = cells.filter(c => c.pieceId === cell.pieceId);

    const minX = Math.min(...pieceCells.map(c => c.x));
    const minY = Math.min(...pieceCells.map(c => c.y));
    const maxX = Math.max(...pieceCells.map(c => c.x));
    const maxY = Math.max(...pieceCells.map(c => c.y));

    const shape = [];
    for (let y = minY; y <= maxY; y++) {
      const row = [];
      for (let x = minX; x <= maxX; x++) {
        row.push(pieceCells.some(c => c.x === x && c.y === y) ? 1 : 0);
      }
      shape.push(row);
    }

    const pivotX = cell.x - minX;
    const pivotY = cell.y - minY;

    startDragging(cell.pieceId, pieceCells[0].color, shape, pivotX, pivotY, pieceCells);
  }

  // Force reactivity when piece transformations change
  $: transformationKey = JSON.stringify(pieceRotations) + JSON.stringify(pieceFlipped);

  $: piecesOnBoard = allPieces.map(piece => ({
    ...piece,
    placed: cells.some(c => c.pieceId === piece.name),
    // Add transformation key to force reactivity
    _transformKey: transformationKey
  }));

  function removePiece(name) {
    cells.forEach(c => {
      if (c.pieceId === name) {
        c.occupied = false;
        c.color = null;
        c.pieceId = null;
      }
    });
    cells = [...cells]; // refresh board
  }

  function resetPuzzle() {
    cells.forEach(c => {
      c.occupied = false;
      c.color = null;
      c.pieceId = null;
    });
    cells = [...cells]; // refresh board
    seconds = 0;
    clearInterval(interval);
    interval = null;
    pieceRotations = {};
    pieceFlipped = {};
    selectedPiece = null;
  }
</script>

<!-- Puzzle board -->
  <div class="game-container">
    <div class="board" style="grid-template-columns: repeat({width}, 30px);">
      {#each cells as cell}
        <!-- svelte-ignore a11y_interactive_supports_focus -->
      <div 
        class="socket" 
        role="gridcell"
        draggable={cell.occupied}
        on:dragstart={() => onReDrag(cell)}
        on:dragover={onDragOver} 
        on:drop={() => onDrop(cell)}>
        {#if cell.occupied}
      <div class="placed" style="background:{cell.color}"></div>
      {/if}
      </div>
    {/each}
  </div>
  <div class="control-menu">
    <div style="text-align:center;color:white">
      Time: {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
    </div>
    <button style="color:white;background:red"on:click={() => resetPuzzle()}> Reset</button>
  </div>
</div>
<hr />

<!-- Game area with pieces and controls -->
<div class="game-container">
  <!-- piece tray -->
  <div class="pieces">
    {#each piecesOnBoard as piece} 
      {@const transformedShape = getTransformedShape(piece)}
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="piece {selectedPiece === piece.name ? 'selected' : ''}"
        style="opacity: {piece.placed ? 0.3 : 1};"
        role="button"
        on:click={() => selectPiece(piece)}>
        
        {#each transformedShape as row, rowIndex}
          <div class="row">
            {#each row as cell, colIndex}
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div 
                draggable={!piece.placed}
                class="cell {cell ? 'filled' : ''}" 
                style="background: {cell ? piece.color : 'transparent'};"
                on:dragstart={() => startDragging(
                  piece.name,
                  piece.color,
                  transformedShape,
                  colIndex,   // pivotX
                  rowIndex    // pivotY
                )}>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Control menu -->
  <div class="control-menu">
    <h3>Piece Controls</h3>
    {#if selectedPiece}
      {@const selectedPieceData = allPieces.find(p => p.name === selectedPiece)}
      <div class="selected-piece-info">
        <h4>Selected: {selectedPieceData.name}</h4>
        <div class="piece-preview">
          {#each getTransformedShape(selectedPieceData) as row}
            <div class="row">
              {#each row as cell}
                <div class="preview-cell {cell ? 'filled' : ''}" 
                     style="background: {cell ? selectedPieceData.color : 'transparent'};"></div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
      
      <div class="controls">
        {#if cells.some(c => c.pieceId === selectedPiece)}
          <!-- Controls for placed pieces -->
          <button on:click={() => removePiece(selectedPiece)} class="remove-btn">🗑️ Remove from Board</button>
          <button on:click={resetSelected} class="control-btn">↺ Reset & Remove</button>
        {:else}
          <!-- Controls for pieces in tray -->
          <button on:click={rotateSelectedLeft} class="control-btn">⟲ Rotate Left</button>
          <button on:click={rotateSelectedRight} class="control-btn">⟳ Rotate Right</button>
          <button on:click={flipSelectedHorizontal} class="control-btn">↔ Flip</button>
          <button on:click={resetSelected} class="control-btn">↺ Reset Orientation</button>
        {/if}
      </div>
      
      <button on:click={() => selectedPiece = null} class="deselect-btn">Deselect</button>
    {:else}
      <p class="help-text">Click on a piece to select it and access controls</p>
    {/if}
  </div>
</div>

<style>
  .board {
    display: grid;
    gap: 2px;
    margin: 0 auto 20px auto;
    justify-content: center;
    width: fit-content;
  }

  .socket {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #d3caca;
    box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placed {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  .pieces {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .row {
    display: flex;
  }

  .cell {
    width: 30px;
    height: 30px;
    display: inline-block;
    border-radius: 50%;
  }

  .game-container {
    display: flex;
    gap: 30px;
    align-items: flex-start;
    justify-content: center;
    margin-top: 20px;
  }

  .piece {
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .piece:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .piece.selected {
    background: rgba(100, 108, 255, 0.2);
    border: 2px solid #646cff;
    transform: scale(1.05);
  }

  .control-menu {
    min-width: 250px;
    row-gap: 10px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .control-menu h3 {
    margin-top: 0;
    color: #646cff;
    text-align: center;
  }

  .selected-piece-info {
    margin-bottom: 20px;
    text-align: center;
  }

  .selected-piece-info h4 {
    margin: 0 0 10px 0;
    text-transform: capitalize;
  }

  .piece-preview {
    display: inline-block;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin: 10px 0;
  }

  .preview-cell {
    width: 20px;
    height: 20px;
    display: inline-block;
    border-radius: 50%;
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 15px;
  }

  .control-btn {
    padding: 10px 15px;
    background: #646cff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background 0.2s ease;
  }

  .control-btn:hover {
    background: #535bf2;
  }

  .control-btn:active {
    transform: translateY(1px);
  }

  .remove-btn {
    padding: 10px 15px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background 0.2s ease;
    margin-bottom: 10px;
  }

  .remove-btn:hover {
    background: #c82333;
  }

  .remove-btn:active {
    transform: translateY(1px);
  }

  .deselect-btn {
    width: 100%;
    padding: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85em;
  }

  .deselect-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .help-text {
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    text-align: center;
    margin: 20px 0;
  }
</style>
