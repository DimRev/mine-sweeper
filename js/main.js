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
  generateMines(board)
  setMinesNegsCount(board)
  console.log(board)
  return board
}

//Generates mines onto the board
function generateMines(board) {
  //TODO : Make the mines rng, and have diff mine counts
  board[0][0].isMine = true
  board[2][2].isMine = true
}

/* Render the board as a <table> 
to the page */
function renderBoard(board) {
  var HTMLstr = ''
  for (let i = 0; i < board.length; i++) {
    HTMLstr += '<tr>\n'

    for (let j = 0; j < board.length; j++) {
      HTMLstr += board[i][j].isMine
        ? `<td>💣</td>`
        : `<td>${board[i][j].minesAroundCount}</td>`
    }
    HTMLstr += '</tr>\n'
  }
  const elTable = document.querySelector('table')
  elTable.innerHTML = HTMLstr
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
      board[idxI][idxJ].minesAroundCount = (minesCount === 0) ? ' ' : minesCount
    }
  }
}

/* Called when a cell is clicked */
function onCellClicked(elCell, i, j) {}

/* Called when a cell is right clicked
See how you can hide the context 
menu on right click */
function onCellMarked(elCell) {}

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
