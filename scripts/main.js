const gameBoard = (() => {
  const size = 3;
  const cells = [];

  const Cell = (symbol) => {
    const isEmpty = () => symbol === undefined;
    const readSymbol = () => symbol;
    return {
      isEmpty,
      readSymbol,
    };
  };
  const resetCells = () => {
    for (let i = 0; i < size * size; i++) {
      cells[i] = Cell();
    }
  };
  const getCells = () => cells;
  const getSize = () => size;
  const isFull = () => !cells.some(cell => cell.isEmpty());
  const allSameSymbol = (array) => array.every(s => s && (s === array[0]));
  const hasWinner = () => {
    const breakdown = cellsToLinesColsDiags();
    const winningLine = breakdown.lines.some(allSameSymbol);
    const winningCol = breakdown.columns.some(allSameSymbol);
    const winningDiag = breakdown.diagonals.some(allSameSymbol);
    return winningLine || winningCol || winningDiag;
  };

  const cellsToLinesColsDiags = () => {
    const lines = [];
    const columns = [];
    const diagonals = [[], []];
    for(let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!lines[i]) lines[i] = [];
        lines[i].push(cells[i*size + j].readSymbol());

        if (!columns[j]) columns[j] = [];
        columns[j].push(cells[i*size + j].readSymbol());

        if (i - j === 0) {
          diagonals[0].push(cells[i*size + j].readSymbol());
        }
        if (i + j === size-1) {
          diagonals[1].push(cells[i*size + j].readSymbol());
        }
      }
    }
    return {lines, columns, diagonals};
  };

  const setCell = (index, symbol) => cells[index] = Cell(symbol);

  return {
    Cell,
    resetCells,
    getCells,
    setCell,
    getSize,
    isFull,
    hasWinner,
  };
})();

const Player = (symbol, cpuFlag) => {
  const getSymbol = () => symbol;
  const isCpu = () => !!cpuFlag;
  const playTurn = e => {
    if (gameBoard.hasWinner()) return;
    if (e.target.classList.contains('cell')) {
      const cellIndex = e.target.getAttribute('data-index');
      if (gameBoard.getCells()[cellIndex].isEmpty()) {
        ui.mark(cellIndex);
        game.updateStatus(true);
      }
      game.updateStatus(false);
    }
  };
  const playCpuTurn = () => {
    const thinkingTime = 1000 + randomInt(2000);
    const cellIndex = chooseEmptyCell();
    setTimeout(() => {
      ui.mark(cellIndex);
      game.updateStatus(true);
    }, thinkingTime);
  };
  const chooseEmptyCell = () => {
    const size = gameBoard.getSize();
    const cells = gameBoard.getCells();
    let chosenIndex = randomInt(size * size);
    while (!cells[chosenIndex].isEmpty()) {
      chosenIndex = randomInt(size * size);
    }
    return chosenIndex;
  }
  const randomInt = (max) => Math.floor(Math.random() * max);

  return {
    getSymbol,
    isCpu,
    playTurn,
    playCpuTurn,
    randomInt,
  };
};

const game = (() => {
  const win = 'win';
  const draw = 'draw';
  const symbols = ['x', 'o'];
  const players = []
  let playerTurn = 0;
  
  const startNewGame = () => {
    const cpu1 = document.querySelector('#two-cpus').checked;
    const cpu2 = document.querySelector('#vs-cpu').checked || cpu1;
    gameBoard.resetCells();
    ui.reset();
    ui.renderBoard();
    removePlayers();
    addPlayers(cpu1, cpu2);
    if (cpu1 && cpu2) {
      players[playerTurn].playCpuTurn();
    } else {
      board.addEventListener('click', players[playerTurn].playTurn);
    }
  };
  const removePlayers = () => players.splice(0, players.length);
  const addPlayers = (cpu1, cpu2) => {
    players.push(Player(symbols[0], cpu1));
    players.push(Player(symbols[1], cpu2));
  };
  const updateStatus = (playerTurnComplete) => {
    if (gameBoard.hasWinner()) {
      endGame(win);
    } else if (gameBoard.isFull()) {
      endGame(draw)
    } else if (playerTurnComplete) {
      changeTurns();
      if (players[playerTurn].isCpu()) {
        players[playerTurn].playCpuTurn();
      }
    }
  }
  const changeTurns = () => playerTurn = (playerTurn + 1) % 2;
  const endGame = (outcome) => ui.showGameOver(outcome, players[playerTurn]);
  const getPlayers = () => players;
  const getTurn = () => playerTurn;
  
  const newGameButton = document.querySelector('#new-game-button');
  newGameButton.addEventListener('click', startNewGame);
  
  
  return {
    updateStatus,
    getPlayers,
    getTurn,
  }
})();

const ui = (() => {
  const board = document.querySelector('#board');
  const gameOverMessage = document.querySelector('#game-over-message');

  const reset = () => {
    resetBoard();
    resetGameOver();
  };
  const resetBoard = () => board.innerHTML = '';
  const resetGameOver = () => gameOverMessage.innerHTML = '';
  const renderBoard = () => {
    const size = gameBoard.getSize()
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        board.appendChild(newCell(size*i + j));
      }
      board.appendChild(document.createElement('br'));
    }
  };
  const newCell = (index) => {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', index);
    return cell;
  };
  const mark = (cellIndex) => {
    const uiCell = document.querySelector(`div[data-index="${cellIndex}"]`);
    const symbol = game.getPlayers()[game.getTurn()].getSymbol()
    uiCell.textContent = symbol;
    gameBoard.setCell(cellIndex, symbol);
    game.updateStatus();
  };
  const showGameOver = (outcome, player) => {
    if (outcome === 'win') {
      gameOverMessage.textContent = `${player.getSymbol()} wins!`;
    } else if (outcome === 'draw') {
      gameOverMessage.textContent = 'It\'s a draw.';
    }
    return gameOverMessage.textContent;
  };

  return {
    reset,
    renderBoard,
    mark,
    showGameOver,
  };
})();