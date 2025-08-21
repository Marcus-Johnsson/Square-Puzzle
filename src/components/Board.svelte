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

  function onDragStart(event, piece) {
    draggedPiece = piece;
    }

    function onDragEnd(event) {
    event.target.classList.remove("dragging");
  }



  function onDragOver(event) {
    event.preventDefault();}

  function findPivot(shape) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] === 2) {
        return { pivotX: x, pivotY: y };
      }
    }
  }
  return { pivotX: 0, pivotY: 0 }; // fallback
}

function rotatePiece(piece) {
  const newShape = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );

  // find new pivot position
  let newPivot = findPivot(newShape);

  return { ...piece, shape: newShape, pivot: newPivot };
}

  function flipPiece(piece) {
    const newShape = piece.shape.map(row => row.slice().reverse());
    return { ...piece, shape: newShape };
  }
function onDrop(targetCell) {
  if (!draggedPiece) return;

  const { pivotX, pivotY } = findPivot(draggedPiece.shape);
  const { x: baseX, y: baseY } = targetCell;

  draggedPiece.shape.forEach((row, rowIndex) => {
    row.forEach((val, colIndex) => {
      if (val) {
        const targetX = baseX + (colIndex - pivotX);
        const targetY = baseY + (rowIndex - pivotY);

        const boardCell = cells.find(c => c.x === targetX && c.y === targetY);
        if (boardCell) {
          boardCell.occupied = true;
          boardCell.color = draggedPiece.color;
          boardCell.pieceId = draggedPiece.name;
        }
      }
    });
  });

  draggedPiece = null;
  cells = [...cells];
}

function reDrag(cell){
  if (!cell.pieceId) return;

  const pieceCells = cells.filter(c => c.pieceId === cell.pieceId);

  pieceCells.forEach(c => { c.occupied = false; c.color = null; c.pieceId = null; });
  cells = [...cells];

    const ghost = document.createElement("div");
  ghost.style.display = "inline-block";
  ghost.style.padding = "4px";
  ghost.style.background = "transparent";

  const minX = Math.min(...pieceCells.map(c => c.x));
  const minY = Math.min(...pieceCells.map(c => c.y));

  const shapeWidth = Math.max(...pieceCells.map(c => c.x)) - minX + 1;
  const shapeHeight = Math.max(...pieceCells.map(c => c.y)) - minY + 1;

  const shape = Array.from({ length: shapeHeight }, () =>
    Array(shapeWidth).fill(0)
  );

  pieceCells.forEach(c => {
    shape[c.y - minY][c.x - minX] = 1;
  });

  draggedPiece = {
    name: cell.pieceId,
    color: pieceCells[0].color,
    shape
  };

  // clear piece from board
  pieceCells.forEach(c => {
    c.occupied = false;
    c.color = null;
    c.pieceId = null;
  });

  // refresh board
  cells = [...cells];
}
</script>


<!-- Puzzle board -->
<div class="board" style="grid-template-columns: repeat({width}, 30px);">
  {#each cells as cell}
    <div 
      class="socket" 
      role="gridcell"
      tabindex="0"
      draggable={cell.occupied}
      on:dragstart={() => reDrag(cell)}
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
  {#each allPieces as piece}
    <div class="piece"
        draggable="true"
        role="button"
        tabindex="0"
        on:dragstart={(event) => onDragStart(event,piece)}
        on:dragend={onDragEnd}
      >
      {#each piece.shape as row}
        <div class="row">
          {#each row as cell}
            <div class="cell {cell ? 'filled' : ''}" style="background:{cell ? piece.color : 'transparent'}"></div>
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
    width: 26px;
    height: 26px;
    border-radius: 4px;
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