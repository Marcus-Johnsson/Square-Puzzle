<script>
import { allPieces  } from "../lib/pieces";

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
  let draggedPiece = null;

  function onDragOver(event) {
    event.preventDefault();}

function startDragging(name, color, shape, pivotX = 0, pivotY = 0, clearCells = []) {
  draggedPiece = {
    name,
    color,
    shape,
    pivotX,
    pivotY
  };

  clearCells.forEach(c => {
    c.occupied = false;
    c.color = null;
    c.pieceId = null;
  });

  cells = [...cells]; 
}

function onDrop(targetCell) {
  if (!draggedPiece) return;

  const { pivotX, pivotY, name } = draggedPiece;
  const { x: baseX, y: baseY } = targetCell;

  cells.forEach(c => {
    if (c.pieceId === name) {
      c.occupied = false;
      c.color = null;
      c.pieceId = null;
    }
  });

  draggedPiece.shape.forEach((row, rowIndex) => {
    row.forEach((val, colIndex) => {
      if (val) {
        const targetX = baseX + (colIndex - pivotX);
        const targetY = baseY + (rowIndex - pivotY);

        const boardCell = cells.find(c => c.x === targetX && c.y === targetY);
        if (boardCell) {
          boardCell.occupied = true;
          boardCell.color = draggedPiece.color;
          boardCell.pieceId = name;
        }
      }
    });
  });

  draggedPiece = null;
  
  cells = [...cells]; // refresh board
}


function onReDrag(cell) {
  if (!cell.pieceId) return;

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

  $: piecesOnBoard = allPieces.map(piece => ({
    ...piece,
    placed: cells.some(c => c.pieceId === piece.name)
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
</script>


<!-- Puzzle board -->
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
<hr />

<!-- piece tray -->
<div class="pieces">
  {#each piecesOnBoard as piece} 
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="piece"
      style="opacity: {piece.placed ? 0.3 : 1}; cursor: {piece.placed ? 'pointer' : 'grab'}"
      role="button"
      on:click={() => piece.placed && removePiece(piece.name)}>

      
      {#each piece.shape as row, rowIndex}
        
        <div class="row">
          {#each row as cell, colIndex}
            <div 
              role="button"
              draggable={!piece.placed}
              class="cell {cell ? 'filled' : ''}" 
              style="
                background: {cell ? piece.color : 'transparent'};                cursor: {piece.placed ? 'pointer' : 'grab'};"

              on:dragstart={() => startDragging(
                piece.name,
                piece.color,
                piece.shape,
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


<style>

  .board {
    display: grid;
    gap: 2px;
    margin-bottom: 20px;
  }

  .socket {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #d3caca;
    box-shadow: inset 2px 2px 4px rgba(0,0,0,0.3);
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
</style>