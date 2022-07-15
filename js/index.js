'use strict';

const appPuzzle = () => {
  
  // game
  const $appNode = document.getElementById('app__puzzle');
  const $appNodeLock = document.getElementById('app__puzzle--lock');
  const $appShuffle = document.getElementById('app__shuffle');
  const $appCounter = document.getElementById('app__counter');

  const $appResultCount = document.getElementById('app__result--count'); 
  const $appResultTime = document.getElementById('app__result--time'); 

  const $appItemsNodes = Array.from($appNode.querySelectorAll('.app__puzzle--btn'));
  const $appDiscription = document.querySelector('.app__discription');
  const $appBox = document.querySelector('.app__box');

  // preloader
  const $preloader = document.querySelector('.preloader');

  // time
  const $minute = document.getElementById('minute');
  const $second = document.getElementById('second');
  const $millisecond = document.getElementById('millisecond');

  const winFlatArr = new Array(16).fill(0).map((_item, index) => index + 1);

  // variables
  const blankNumber = 16;
  const countItems = 16;
  const countLine = 4;
  const maxShuffleCount = 100;

  let shuffled = false;
  let matrix = [];
  let blockedCoords = null;
  let shuffleCount = null;
  let timer = null;
  let count = 0;

  let minute = 0;
  let second = 0;
  let millisecond = 0;
  let interval = null;

  $appCounter.textContent = count;

  /** Zero */
  const addZero = n => n < 10 ? '0' + n : n;

  /** Hide */
  const hide = (elem, name) => elem.classList.add(name);

  /** Show */
  const show = (elem, name) => elem.classList.remove(name);

  const totalCount = () => {
    count++;
    $appCounter.textContent = count;
  };

  const removePreloader = () => {
    if (!$preloader.classList.contains('hide')) {
      hide($preloader, 'hide');
    }
  };

  const checkCountItems = () => {
    if ($appItemsNodes.length < countItems) {
      throw new Error(`Должно быть ровно ${countItems} items in HTML`);
    }
  };

  const hideItemsLast = () => {
    $appItemsNodes[countItems - 1].style.display = 'none';
  };

  const checkDatasetItems = () => $appItemsNodes.map(item => Number(item.dataset.matrixId));

  /** Milliseconds */
  const timerMilliseconds = () => {
    if (millisecond > 99) {
      second++;
      $second.textContent = addZero(second);
      millisecond = 0;
      $millisecond.textContent = addZero(millisecond);
    }
    timerSeconds();
  };
  /** Seconds */
  const timerSeconds = () => {
    if (second > 59) {
      minute++;
      $minute.textContent = addZero(minute);
      second = 0;
      $second.textContent = addZero(second);
    }
  };

  /** Timer */
  const startTimer = () => {
    millisecond++;
    $millisecond.textContent = addZero(millisecond);
    timerMilliseconds();
  };

  /** Matrix */
  const getMatrix = arr => {
    const matrix = [[], [], [], []];
    let y = 0,
        x = 0;

    for (let item of arr) {
      if (x >= countLine) {
        y++;
        x = 0;
      }
      matrix[y][x] = item;
      x++;
    }

    return matrix;
  };

  /** Show won */
  const isWon = matrix => {
    const flatMatrix = matrix.flat();
    for (let i = 0; i < winFlatArr.length; i++) {
      if (flatMatrix[i] !== winFlatArr[i]) {
        return false;
      }
    }
    return true;
  };

  const addWonClass = () => {
    if (isWon(matrix)) {
      clearInterval(interval);
      $appResultCount.textContent = count;
      $appResultTime.textContent = `${addZero(minute)}:${addZero(second)}:${addZero(millisecond)}`;
      
      show($appNodeLock, 'hide');
      hide($appBox, 'hide');
      show($appDiscription, 'hide');

      setTimeout(() => show($appNode, 'won'), 70);
    }
    else {
      setTimeout(() => hide($appNode, 'won'), 70);
    }
  };

  /** Position */
  const setNodeStyles = (node, x, y) => {
    const shiftPs = 100;
    node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;
  };


  const setPositionItems = matrix => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const value = matrix[y][x];
        const node = $appItemsNodes[value - 1];
        
        setNodeStyles(node, x, y);
      }
    }

    addWonClass();
  };

  const findCoordinatesByNumber = (number, matrix) => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] === number) return {y, x};
      }
    }

    return null;
  };

  const isValidForSwap = (coord01, coord02) => {
    const diffX = Math.abs(coord01.x - coord02.x);
    const diffY = Math.abs(coord01.y - coord02.y);

    return (
      (diffX === 1 || diffY === 1) && 
      (coord01.x === coord02.x || coord01.y === coord02.y)
    );
  };

  const swapItems = (coords01, coords02, matrix) => {
    const tempCoords = matrix[coords01.y][coords01.x];
    matrix[coords01.y][coords01.x] = matrix[coords02.y][coords02.x];
    matrix[coords02.y][coords02.x] = tempCoords;
  };

  const getСoordinatesNumber = (btnCoords, blankCoords) => {
    const isValid = isValidForSwap(btnCoords, blankCoords);
  
    if (isValid) {
      totalCount();
      swapItems(btnCoords, blankCoords, matrix);
      setPositionItems(matrix);
    }
  };

  /** Shuffle-1 or Shuffle-2  */ 

  /** Shuffle-2 */
  // const shuffleArray = arr => {
  //   return arr
  //     .map( value => ({ value, sort: Math.random() }))
  //     .sort((a, b) => a.sort - b.sort)
  //     .map(({ value }) => value);
  // };

  // const clickShuffleItems = () => {
  //   matrix = getMatrix(shuffleArray(matrix.flat()));
  //   setPositionItems(matrix);
  //   addWonClass();
  // };

  /** Shuffle-2 */
  const findValidCoords = ({ blankCoords, matrix, blockedCoords }) => {
    const validCoords = [];

    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (isValidForSwap({ x, y }, blankCoords)) {
          if (!blockedCoords || !(blockedCoords.x === x && blockedCoords.y === y)) {
            validCoords.push({ x, y });
          }
        }
      }
    }

    return validCoords;
  };

  const randomSwap = matrix => {
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

    const validCoords = findValidCoords({ blankCoords, matrix, blockedCoords });

    const swapCoords = validCoords[
      Math.floor(Math.random() * validCoords.length)
    ];
    
    swapItems(blankCoords, swapCoords, matrix);
    blockedCoords = blankCoords;
  };

  const clickShuffleItems = () => {
    if (shuffled) return;
    
    count = 0;
    $appCounter.textContent = count;

    shuffled = true;
    shuffleCount = 0;
    clearInterval(timer);

    if (shuffleCount === 0) {
      timer = setInterval(() => {
        randomSwap(matrix);
        setPositionItems(matrix);

        shuffleCount += 1;

        if (shuffleCount >= maxShuffleCount) {
          hide($appNodeLock, 'hide');
          hide($appDiscription, 'hide');
          show($appBox, 'hide');

          clearInterval(timer);
          clearInterval(interval);

          interval = setInterval(startTimer, 10);
          shuffled = false;

        }
      }, 20);
    }
  };

  /** Change position by click */
  const clickTargetItems = ({ target }) => {
    if (shuffled) return;
    const btnNode = target.closest('.app__puzzle--btn');
    if (!btnNode) return;

    const btnNumber = Number(btnNode.dataset.matrixId);

    const btnCoords = findCoordinatesByNumber(btnNumber, matrix);
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

    getСoordinatesNumber(btnCoords, blankCoords);
  };

  /** Change position by arrows */
  const isValidArrow = (btnCoords, blankCoords) => {
    if (
      btnCoords.y >= matrix.length || btnCoords.y < 0 || 
      btnCoords.x >= matrix.length || btnCoords.x < 0
    ) { 
      return; 
    }

    totalCount();
    swapItems(btnCoords, blankCoords, matrix);
    setPositionItems(matrix);
  };

  const shuffleItemsArrow = (direction, btnCoords, blankCoords) => {
    switch(direction) {
      case 'up':
        btnCoords.y += 1;
        break;
      case 'down':
        btnCoords.y -= 1;
        break;
      case 'left':
        btnCoords.x += 1;
        break;
      case 'right':
        btnCoords.x -= 1;
        break;
    }

    isValidArrow(btnCoords, blankCoords);
  };

  const clickArrows = event => {
    if (shuffled) return;
    if (!event.key.includes('Arrow')) return;
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const btnCoords = { x: blankCoords.x, y: blankCoords.y };
    const direction = event.key.split('Arrow')[1].toLowerCase();

    shuffleItemsArrow(direction, btnCoords, blankCoords);
  };

  /** Events */
  $appNode.addEventListener('click', clickTargetItems);
  $appShuffle.addEventListener('click', clickShuffleItems);
  document.body.addEventListener('keydown', clickArrows);

  /** Start */
  const init = () => {
    setTimeout(removePreloader, 3000);
    checkCountItems();
    hideItemsLast();
    const matrixId = checkDatasetItems();
    matrix = getMatrix(matrixId);
    setPositionItems(matrix);
    addWonClass();
  };

  init();
};

appPuzzle();

