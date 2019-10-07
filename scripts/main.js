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
  const isFull = () => !cells.some(Cell.isEmpty);
  const allSameSymbol = (array) => array.every(symbol === array[0]);
  const hasWinner = () => {
    const breakdown = cellsToLinesColsDiags();
    const winningLine = breakdown.lines.some(allSameSymbol);
    const winningCol = breakdown.columns.some(allSameSymbol);
    const winningDiag = breakdown.diagonals.some(allSameSymbol);
    return winningLine || winningCol || winningDiag;
  };

  const cellsToLinesColsDiags = () => {
    const result = {
      lines: [],
      columns: [],
      diagonals: [[], []],
    };
    for(let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!lines[i]) lines[i] = [];
        result.lines[i].push(cells[i*size + j]);

        if (!columns[j]) columns[j] = [];
        result.columns[j].push(cells[i + size*j]);

        if (i - j === 0) {
          diagonals[0].push(cells[i*size + j]);
        }
        if (i + j === size) {
          diagonals[1].push(cells[i*size + j]);
        }
      }
    }
    return result;
  };

  return {
    Cell,
    resetCells,
    getCells,
    getSize,
    isFull,
    hasWinner,
  };
})();

const Player = (symbol, cpuFlag) => {
  const getSymbol = () => symbol;
  const isCpu = () => !!cpuFlag;
  const playTurn = (cell) => {
    if(!cell || cell.isEmpty()) {
      Object.assign(cell, gameBoard.Cell(symbol));
      game.updateStatus(true);
    }
    game.updateStatus(false);
  };
  const playCpuTurn = (board) => {
    const thinkingTime = 1500;
    setTimeout(playTurn.bind(chooseEmptyCell(board)), thinkingTime);
    game.updateStatus(true);
  };
  const chooseEmptyCell = (board) => {
    const size = board.getSize();
    const cells = board.getCells();
    let chosenCell = cells[randomInt(size * size)];
    while (!chosenCell.isEmpty()) {
      chosenCell = cells[randomInt(size * size)];
    }
    return chosenCell;
  }
  const randomInt = (max) => Math.floor(Math.random() * max);

  return {
    getSymbol,
    isCpu,
    playTurn,
    playCpuTurn,
  };
};

const game = (() => {
  const win = 'win';
  const draw = 'draw';
  const symbols = ['x', 'o'];
  const players = []
  let playerTurn = 0;

  const startNewGame = () => {
    toggleNewGameButton();
    gameBoard.resetCells();
    removePlayers();
    addPlayers();
  };
  const removePlayers = () => players.splice(0, players.length);
  const addPlayers = (vsCpu) => {
    players.push(Player(symbols[0]));
    if (vsCpu) {
      players.push(Player(symbol[1], true))
    } else {
      players.push(Player(symbols[1]));
    }
  };
  const updateStatus = (canChangeTurns) => {
    if (gameBoard.hasWinner()) {
      endGame(win);
    } else if (gameBoard.isFull()) {
      endGame(draw)
    } else if (canChangeTurns) {
      changeTurns();
      if (players[playerTurn].isCpu()) {
        players[playerTurn].playCpuTurn();
      }
    }
  }
  const changeTurns = () => playerTurn = (playerTurn + 1) % 2;
  const endGame = (outcome) => {
    if (outcome === win) {
      displayWin();
    } else if (outcome === draw) {
      displayDraw();
    }
    toggleNewGameButton();
  }
  const displayWin = () => {}
  const displayDraw = () => {}
  const toggleNewGameButton = () => {}

  const newGameButton = document.querySelector('#new-game-button');
  newGameButton.addEventListener('click', startNewGame);

  const board = document.querySelector('#board');
  board.addEventListener('click', e => {
    players[playerTurn].playTurn(e.target);
  });

  return {
    startNewGame,
    updateStatus,
    endGame,
  }
})();