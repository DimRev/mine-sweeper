//* gBoard – A Matrix containing cell objects

/*
//* cell: {
 minesAroundCount: 4,
 isShown: false,
 isMine: false,
 isMarked: true */

/*
//* gLevel = {
 SIZE: 4,
 MINES: 2
} */

/*
//* gGame = {
 isOn: false,
 shownCount: 0,
 markedCount: 0,
 secsPassed: 0
} */

//*--------------Global Variables---------------------*//
var gBoard
var gLevel
var gGame

/* This is called when page loads  */
function onInit() {
  gBoard = buildBoard(4, 4)
  renderBoard(gBoard)
}

/* Builds the board 
Set the mines
Call setMinesNegsCount()
Return the created board */
function buildBoard(rows, cols) {
  const board = []
  for (var i = 0; i < rows; i++) {
    board[i] = []
    for (var j = 0; j < cols; j++) {
      const cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  generateMines(board, 2)
  setMinesNegsCount(board)
  console.log(board)
  return board
}

//Generates mines onto the board
function generateMines(board, num) {
  //!Random mines ARE working, but disabled for now
  //// for(let i = 0; i < num ; i++){
  ////   const pos = findEmptyCell(board)
  ////   board[pos.i][pos.j].isMine = true
  //// }

  board[0][0].isMine = true
  board[2][2].isMine = true
}

function findEmptyCell(board) {
  var emptyCells = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!board[i][j].isMine) {
        emptyCells.push({
          i,
          j,
        })
      }
    }
  }
  if (emptyCells.length === 0) return null
  return emptyCells.splice(getRandomInteger(0, emptyCells.length), 1)[0]
}

/* Render the board as a <table> 
to the page */
function renderBoard(board) {
  var HTMLstr = ''
  for (let i = 0; i < board.length; i++) {
    HTMLstr += '<tr>\n'

    for (let j = 0; j < board.length; j++) {
      HTMLstr += generateTdHTMLString(board, i, j)
    }
    HTMLstr += '</tr>\n'
  }
  const elTable = document.querySelector('table')
  elTable.innerHTML = HTMLstr
}

function generateTdHTMLString(board, i, j) {
  var HTMLstr = ''
  if (board[i][j].isMine) {
    HTMLstr += `<td>
      <button class="cell" onclick="
      onCellClicked(this,${i},${j})
      " oncontextmenu="onCellMarked(this,${i},${j})"
      >
      <div class="hidden">
      💣
      </div></button></td>\n`
  } else {
    HTMLstr += `<td>
      <button class="cell" onclick="
      onCellClicked(this,${i},${j})
      " oncontextmenu="onCellMarked(this, ${i},${j})">
      <div class="hidden">
      ${board[i][j].minesAroundCount}
      </div></button></td>\n`
  }
  return HTMLstr
}

/* Count mines around each cell 
and set the cell's 
minesAroundCount. */
function setMinesNegsCount(board) {
  for (let idxI = 0; idxI < board.length; idxI++) {
    for (let idxJ = 0; idxJ < board.length; idxJ++) {
      var minesCount = 0
      for (let i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (let j = idxJ - 1; j <= idxJ + 1; j++) {
          if (j < 0 || j >= board[i].length) continue
          if (i === idxI && j === idxJ) continue
          if (board[i][j].isMine) minesCount++
        }
      }
      board[idxI][idxJ].minesAroundCount = minesCount === 0 ? ' ' : minesCount
    }
  }
}

/* Called when a cell is clicked */
function onCellClicked(elCell, i, j) {
  if (gBoard[i][j].isMarked) return
  const elCellText = elCell.querySelector('div')
  elCellText.classList.remove('hidden')
  elCell.classList.add('shown')
  elCell.disabled = 'true'
  gBoard[i][j].isShown = true
  if (gBoard[i][j].isMine) {
    checkGameOver()
    return
  }
}

/* Called when a cell is right clicked
See how you can hide the context 
menu on right click */
function onCellMarked(elCell, i, j) {
  if (gBoard[i][j].isShown) return
  elCellContainer = elCell.querySelector('div')

  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false
    elCellContainer.classList.add('hidden')
    elCell.classList.remove('marked')
    elCellContainer.innerText = gBoard[i][j].isMine
      ? '💣'
      : `${gBoard[i][j].minesAroundCount}`
    return
  }
  gBoard[i][j].isMarked = true
  elCellContainer.classList.remove('hidden')
  elCell.classList.add('marked')
  elCellContainer.innerText = '🚩'
  return
}

/* Game ends when all mines are 
marked, and all the other cells 
are shown */
function checkGameOver() {}

/* When user clicks a cell with no 
mines around, we need to open 
not only that cell, but also its 
neighbors. 
NOTE: start with a basic 
implementation that only opens 
the non-mine 1st degree 
neighbors
BONUS: if you have the time 
later, try to work more like the 
real algorithm (see description 
at the Bonuses section below)
 */
function expandShown(board, elCell, i, j) {}
