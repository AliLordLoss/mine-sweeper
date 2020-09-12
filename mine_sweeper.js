'use strict';

function newGame() {
    const body = document.getElementsByTagName('body')[0];
    document.getElementById('mine field').remove();
    document.getElementById('new game').remove();
    document.getElementById('hr').remove();
    const easy = document.createElement('input');
    easy.type = 'submit';
    easy.value = 'Easy';
    easy.id = 'easy';
    easy.className = 'button';
    easy.addEventListener('click', difficulty('easy'));
    body.appendChild(easy);
    const medium = document.createElement('input');
    medium.type = 'submit';
    medium.value = 'Medium';
    medium.id = 'medium';
    medium.className = 'button';
    medium.addEventListener('click', difficulty('medium'));
    body.appendChild(medium);
    const hard = document.createElement('input');
    hard.type = 'submit';
    hard.value = 'Hard';
    hard.id = 'hard';
    hard.className = 'button';
    hard.addEventListener('click', difficulty('hard'));
    body.appendChild(hard);
}

function difficulty(diff) {
    let width = 0;
    let height = 0;
    if (diff === 'easy') {
        width = 10;
        height = 8;
    } else if (diff === 'medium') {
        width = 18;
        height = 14;
    } else if (diff === 'hard') {
        width = 24;
        height = 20;
    }
    return () => {
        const body = document.getElementsByTagName('body')[0];
        document.getElementById('easy').remove();
        document.getElementById('medium').remove();
        document.getElementById('hard').remove();
        const newGameButton = document.createElement('input');
        newGameButton.type = 'submit';
        newGameButton.value = 'New Game';
        newGameButton.id = 'new game';
        newGameButton.className = 'button';
        newGameButton.addEventListener('click', newGame);
        body.appendChild(newGameButton);
        const hr = document.createElement('hr');
        hr.id = 'hr';
        body.appendChild(hr);
        const canvas = document.createElement('canvas');
        canvas.width = 24 * width;
        canvas.height = 24 * height;
        canvas.id = 'mine field';
        body.appendChild(canvas);
        init();
    }
}

function init() {
    const flagged = [];
    const field = [];
    const canvas = document.getElementById('mine field');
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < canvas.height / 24; i++) {
        flagged.push([]);
        field.push([]);
        for (let j = 0; j < canvas.width / 24; j++) {
            flagged[i].push('');
            field[i].push('');
        }
    }
    const mines = canvas.width === 240 ? 10 :
        canvas.width === 432 ? 40 : 99;
    for (let k = 0; k < mines; k++) {
        let i = Math.floor(Math.random() * (canvas.height / 24));
        let j = Math.floor(Math.random() * (canvas.width / 24));
        console.log();
        while (field[i][j] === 'mine') {
            i = Math.floor(Math.random() * (canvas.height / 24));
            j = Math.floor(Math.random() * (canvas.width / 24));
        }
        field[i][j] = 'mine';
    }
    draw();
    canvas.addEventListener('mousemove', hover);
}

function draw() {
    const canvas = document.getElementById('mine field');
    const ctx = canvas.getContext('2d');
    const cell = new Image();
    cell.src = 'assets/Cell.png';
    cell.onload = () => {
        for (let i = 0; i < canvas.width; i += 24) {
            for (let j = 0; j < canvas.height; j += 24) {
                ctx.drawImage(cell, i, j);
            }
        }
    };
}

function hover(event) {
    const ctx = document.getElementById('mine field').getContext('2d');
    draw();
    const cellOver = new Image();
    cellOver.src = 'assets/CellOver.png';
    cellOver.onload = () => {
        ctx.drawImage(cellOver, Math.floor(event.offsetX / 24) * 24, Math.floor(event.offsetY / 24) * 24)
    };
}

document.getElementById('new game').addEventListener('click', newGame);
init();
