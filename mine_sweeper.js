'use strict';

class Cell {
    constructor() {
        this.inside = '';
        this.flagged = false;
        this.openned = false;
        this.exploded = false;
    }
}

function newGame() {
    end = false;
    const body = document.getElementsByTagName('body')[0];
    document.getElementById('mine field').remove();
    document.getElementById('new game').remove();
    document.getElementById('hr').remove();
    try {
        document.getElementsByTagName('hr')[0].remove();
        document.getElementsByTagName('h1')[0].remove();
    } catch (e) {}
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
    field = [];
    const canvas = document.getElementById('mine field');
    for (let i = 0; i < canvas.height / 24; i++) {
        field.push([]);
        for (let j = 0; j < canvas.width / 24; j++) {
            field[i].push(new Cell());
        }
    }
    const mines = canvas.width === 240 ? 10 :
        canvas.width === 432 ? 40 : 99;
    for (let k = 0; k < mines; k++) {
        let i = Math.floor(Math.random() * (canvas.height / 24));
        let j = Math.floor(Math.random() * (canvas.width / 24));
        console.log();
        while (field[i][j].inside === 'mine') {
            i = Math.floor(Math.random() * (canvas.height / 24));
            j = Math.floor(Math.random() * (canvas.width / 24));
        }
        field[i][j].inside = 'mine';
    }
    field = calc_nums(field);
    draw(field);
    canvas.addEventListener('mousemove', hover(field));
    canvas.addEventListener('click', click(field));
    canvas.addEventListener('contextmenu', rightClick(field));
}

function click(field) {
    return (clickEvent) => {
        if (!end) {
            if (!(field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].flagged ||
                field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].openned)) {
                if (field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].inside !== 'mine') {
                    field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].openned = true;
                    if (field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].inside === '0') {
                        revealAround(field, Math.floor(clickEvent.offsetY / 24), Math.floor(clickEvent.offsetX / 24));
                    }
                    end = checkEnd(field);
                    if (end) {
                        document.body.appendChild(document.createElement('hr'));
                        const win = document.createElement('h1');
                        win.style.color = 'green';
                        win.innerText = 'You Win!';
                        document.body.appendChild(win);
                    }
                    draw(field);
                }
                else {
                    field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].exploded = true;
                    end = true;
                    draw(field);
                    draw_mines(field);
                }
            }
        }
    }
}

function draw_mines(field) {
    const canvas = document.getElementById('mine field');
    const ctx = canvas.getContext('2d');
    const mine = new Image();
    mine.src = 'assets/RevealedMineCell.png';
    mine.onload = () => {
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (field[i][j].inside === 'mine' && !field[i][j].exploded) {
                    ctx.drawImage(mine, j * 24, i * 24);
                }
            }
        }
    };
}

function rightClick(field) {
    return (clickEvent) => {
        clickEvent.preventDefault();
        if (!end) {
            if (!(field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].openned)) {
                field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].flagged =
                    !field[Math.floor(clickEvent.offsetY / 24)][Math.floor(clickEvent.offsetX / 24)].flagged;
                draw(field);
            }
        }
    }
}

function draw(field) {
    const canvas = document.getElementById('mine field');
    const ctx = canvas.getContext('2d');
    const cell = new Image();
    cell.src = 'assets/Cell.png';
    cell.onload = () => {
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (!(field[i][j].openned || field[i][j].flagged)) {
                    ctx.drawImage(cell, j * 24, i * 24);
                }
            }
        }
    };
    const flagged = new Image();
    flagged.src = 'assets/FlaggedCell.png';
    flagged.onload = () => {
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (field[i][j].flagged) {
                    ctx.drawImage(flagged, j * 24, i * 24);
                }
            }
        }
    };
    const open = new Image();
    open.src = 'assets/EmptyCell.png';
    open.onload = () => {
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (field[i][j].openned) {
                    ctx.drawImage(open, j * 24, i * 24);
                    if (field[i][j].inside !== 'mine' && field[i][j].inside !== '0') {
                        switch (field[i][j].inside) {
                            case '1':
                                ctx.fillStyle = 'blue';
                                break;
                            case '2':
                                ctx.fillStyle = 'green';
                                break;
                            case '3':
                                ctx.fillStyle = 'red';
                                break;
                            case '4':
                                ctx.fillStyle = 'purple';
                                break;
                            case '5':
                                ctx.fillStyle = 'maroon';
                                break;
                            case '6':
                                ctx.fillStyle = 'turquoise';
                                break;
                            case '7':
                                ctx.fillStyle = 'black';
                                break;
                            case '8':
                                ctx.fillStyle = 'gray';
                                break;
                        }
                        ctx.font = '24px Georgia';
                        ctx.fillText(field[i][j].inside, j * 24 + 6, i * 24 + 18);
                    }
                }
            }
        }
    };
    const exploded = new Image();
    exploded.src = 'assets/ExplodedMineCell.png';
    exploded.onload = () => {
        let flag = false;
        for (let i = 0; i < field.length; i++) {
            for (let j = 0; j < field[i].length; j++) {
                if (field[i][j].exploded) {
                    ctx.drawImage(exploded, j * 24, i * 24);
                    break;
                }
            }
            if (flag) break;
        }
    };
}

function hover(field) {
    return (event) => {
        if (!end) {
            const ctx = document.getElementById('mine field').getContext('2d');
            draw(field);
            const cellOver = new Image();
            cellOver.src = 'assets/CellOver.png';
            cellOver.onload = () => {
                if (!(field[Math.floor(event.offsetY / 24)][Math.floor(event.offsetX / 24)].flagged ||
                    field[Math.floor(event.offsetY / 24)][Math.floor(event.offsetX / 24)].openned)) {
                    ctx.drawImage(cellOver, Math.floor(event.offsetX / 24) * 24, Math.floor(event.offsetY / 24) * 24)
                }
            };
        }
    }
}

function calc_nums(field) {
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].inside === 'mine') continue;

            let counter = 0;
            if (is_mine(field, i, j - 1))
                counter++;
            if (is_mine(field, i - 1, j - 1))
                counter++;
            if (is_mine(field, i + 1, j - 1))
                counter++;
            if (is_mine(field, i - 1, j))
                counter++;
            if (is_mine(field, i + 1, j))
                counter++;
            if (is_mine(field, i - 1, j + 1))
                counter++;
            if (is_mine(field, i, j + 1))
                counter++;
            if (is_mine(field, i + 1, j + 1))
                counter++;
            field[i][j].inside = counter.toString();
        }
    }
    return field;
}

function checkEnd(field) {
    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field[i].length; j++) {
            if (field[i][j].inside !== 'mine' && !field[i][j].openned) {
                return false;
            }
        }
    }
    return true;
}

function is_mine(field, i, j) {
    if (0 <= i && i < field.length && 0 <= j && j < field[i].length) {
        if (field[i][j].inside === 'mine') return true;
    }
    return false;
}

function reveal(field, i, j) {
    if (0 <= i && i < field.length && 0 <= j && j < field[i].length) {
        field[i][j].openned = true;
        if (field[i][j].inside === '0') return true;
    }
    return false;
}

function revealAround(field, i, j) {
    if (!(0 <= i < field.length && 0 <= j < field[i].length))
        return;
    field[i][j].inside = '';
    if (reveal(field, i, j - 1))
        revealAround(field, i, j - 1);
    if (reveal(field, i - 1, j - 1))
        revealAround(field, i - 1, j - 1);
    if (reveal(field, i + 1, j - 1))
        revealAround(field, i + 1, j - 1);
    if (reveal(field, i - 1, j))
        revealAround(field, i - 1, j);
    if (reveal(field, i + 1, j))
        revealAround(field, i + 1, j);
    if (reveal(field, i - 1, j + 1))
        revealAround(field, i - 1, j + 1);
    if (reveal(field, i, j + 1))
        revealAround(field, i, j + 1);
    if (reveal(field, i + 1, j + 1))
        revealAround(field, i + 1, j + 1);
}

let field = [];
let end = false;
document.getElementById('new game').addEventListener('click', newGame);
init();
console.log(field);
