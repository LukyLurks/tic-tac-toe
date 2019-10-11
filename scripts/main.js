// Module that lets us see and update cells' data, and see if the game is over.
const gameBoard = (() => {
  const size = 3;
  const cells = [];

  // The cells are only useful in the board, so we're building them there.
  const Cell = (symbol) => {
    const isEmpty = () => symbol === undefined;
    return {
      isEmpty,
      get symbol() {
        return symbol;
      },
      set symbol(s) {
        symbol = s;
      }
    };
  };

  const resetCells = () => {
    for (let i = 0; i < size * size; i++) {
      cells[i] = Cell();
    }
  };

  const isFull = () => !cells.some(cell => cell.isEmpty());

  const hasWinner = () => {
    const breakdown = _cellsToLinesColsDiags();
    const winningLine = breakdown.lines.some(_allSameSymbol);
    const winningCol = breakdown.columns.some(_allSameSymbol);
    const winningDiag = breakdown.diagonals.some(_allSameSymbol);
    return winningLine || winningCol || winningDiag;
  };

  const _allSameSymbol = (array) => array.every(s => s && (s === array[0]));

  /** Goes through the array of cell objects and returns the contents in the 
   * shape of {lines, columns, diagonals} where:
   * - lines: [[line1], [line2], [line3]]
   * - columns: [[col1], [col2], [col3]]
   * - diagonals: [[diag1], [diag2]]
   * containing symbols only (strings). It's easier to scan for a game over.
   */
  const _cellsToLinesColsDiags = () => {
    const lines = [];
    const columns = [];
    const diagonals = [[], []];
    for(let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!lines[i]) lines[i] = [];
        lines[i].push(cells[i*size + j].symbol);

        if (!columns[j]) columns[j] = [];
        columns[j].push(cells[i*size + j].symbol);

        if (i - j === 0) {
          diagonals[0].push(cells[i*size + j].symbol);
        }
        if (i + j === size-1) {
          diagonals[1].push(cells[i*size + j].symbol);
        }
      }
    }
    return {lines, columns, diagonals};
  };

  return {
    resetCells,
    Cell,
    isFull,
    hasWinner,
    get cells() {
      return cells;
    },
    get size() {
      return size;
    },
  };
})();

// Factory function to create players or CPUs.
const Player = ({name, symbol, cpuFlag}) => {
  const isCpu = () => cpuFlag;

  // Fired when the board is clicked
  const playTurn = e => {
    if (gameBoard.hasWinner() || game.isCpuTurn()) return;
    if (e.target.classList.contains('cell')) {
      const cellIndex = e.target.getAttribute('data-index');
      if (gameBoard.cells[cellIndex].isEmpty()) {
        ui.mark(cellIndex);
        game.updateStatus(true);
      }
      game.updateStatus(false);
    }
  };

  const playCpuTurn = () => {
    const thinkingTime = 1000 + _randomInt(2000);
    const cellIndex = _chooseEmptyCell();
    setTimeout(() => {
      ui.mark(cellIndex);
      game.updateStatus(true);
    }, thinkingTime);
  };

  const _chooseEmptyCell = () => {
    let chosenIndex = _randomInt(gameBoard.size ** 2);
    while (!gameBoard.cells[chosenIndex].isEmpty()) {
      chosenIndex = _randomInt(gameBoard.size ** 2);
    }
    return chosenIndex;
  };

  const _randomInt = (max) => Math.floor(Math.random() * max);

  return {
    isCpu,
    playTurn,
    playCpuTurn,
    get name() {
      return name;
    },
    set name(newName) {
      name = newName;
    },
    get symbol() {
      return symbol;
    },
  };
};

// Module controlling the flow of the game.
const game = (() => {
  const win = 'win';
  const draw = 'draw';
  const symbols = ['x', 'o'];
  const players = []
  let turn = 0;
  
  const startNewGame = () => {
    const cpu1 = document.querySelector('#two-cpus').checked;
    const cpu2 = document.querySelector('#vs-cpu').checked || cpu1;
    const player1Params = {
      name: document.querySelector('#player-1-name').value,
      symbol: symbols[0],
      cpuFlag: cpu1,
    };
    const player2Params = {
      name: document.querySelector('#player-2-name').value,
      symbol: symbols[1],
      cpuFlag: cpu2,
    };
    gameBoard.resetCells();
    ui.reset();
    ui.renderBoard();
    _removePlayers();
    _addPlayers(player1Params, player2Params);
    if (players.every(p => p.isCpu())) {
      players[turn].playCpuTurn();
    } else {
      ui.allowPlayerMoves();
    }
  };

  const _removePlayers = () => players.splice(0, players.length);

  const _addPlayers = (player1Params, player2Params) => {
    players.push(Player(player1Params));
    players.push(Player(player2Params));
  };

  // Fired after each move from a player or CPU
  const updateStatus = (turnComplete) => {
    if (gameBoard.hasWinner()) {
      _endGame(win);
    } else if (gameBoard.isFull()) {
      _endGame(draw)
      // Only for legal moves: player clicking an empty cell during their turn
    } else if (turnComplete) {
      _changeTurns();
      if (players[turn].isCpu()) {
        players[turn].playCpuTurn();
      }
    }
  };

  // Will prevent a player to play during CPU's turn.
  const isCpuTurn = () => players[1].symbol === symbols[turn];

  const _changeTurns = () => turn = (turn + 1) % 2;

  const _endGame = (outcome) => ui.showGameOver(outcome, players[turn]);
  
  return {
    startNewGame,
    updateStatus,
    isCpuTurn,
    get players() {
      return players;
    },
    get turn() {
      return turn;
    },
  }
})();

// User interface; gives user actions effects on the system.
const ui = (() => {
  const board = document.querySelector('#board');
  const gameOverMessage = document.querySelector('#game-over-message');
  const newGameButton = document.querySelector('#new-game-button');
  
  newGameButton.addEventListener('click', game.startNewGame);
  
  const reset = () => {
    _resetBoard();
    _resetGameOver();
  };

  const _resetBoard = () => board.innerHTML = '';

  const _resetGameOver = () => gameOverMessage.innerHTML = '';

  const renderBoard = () => {
    const size = gameBoard.size
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board.appendChild(_newCell(size*i + j));
      }
      board.appendChild(document.createElement('br'));
    }
  };

  const _newCell = (index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    // To know which cell should be updated in the gameBoard data:
    cell.setAttribute('data-index', index);
    return cell;
  };
  
  const allowPlayerMoves = () => {
    board.addEventListener('click', game.players[game.turn].playTurn);
  };

  // Marks the board with a symbol and updates data accordingly.
  const mark = (cellIndex) => {
    const uiCell = document.querySelector(`div[data-index="${cellIndex}"]`);
    const symbol = game.players[game.turn].symbol;
    uiCell.textContent = symbol;
    gameBoard.cells[cellIndex].symbol = symbol;
    game.updateStatus();
  };

  const showGameOver = (outcome, player) => {
    if (outcome === 'win') {
      gameOverMessage.textContent = `${player.name} wins! Congratulations!`;
    } else if (outcome === 'draw') {
      gameOverMessage.textContent = 'It\'s a draw.';
    }
    return gameOverMessage.textContent;
  };

  return {
    reset,
    renderBoard,
    allowPlayerMoves,
    mark,
    showGameOver,
  };
})();