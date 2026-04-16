var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];

modelfungo = function() {
    modal.style.display = "block";
    x = document.querySelector(".gamehead");
    x.textContent = "Game Over"
}

modelfunwin = function() {
    modal.style.display = "block";
    x = document.querySelector(".gamehead");
    x.textContent = "Congratulations! You Win"
}

document.getElementById("demo").addEventListener("click", myFunction);

function myFunction() {
    document.location.reload();
}

var playing = false; // Start as false

// Elements
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');

// Start Button Event
startBtn.addEventListener('click', function() {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    initGame();
});

function initGame() {
    playing = true;
    m = new maze(10, 10);
    m.init();
    m.add_edges();
    m.gen_maze();
    m.draw_canvas("canvas");

    // Start the timer
    var countdownTime = 30; // 30 seconds
    var timerDisplay = document.querySelector("#timerel");
    startTimer(countdownTime, timerDisplay);

    // Start drawing moves
    setInterval(drawMoves, 100);
}

// Update your startTimer function to ensure it stops correctly
function startTimer(duration, display) {
    var start = Date.now(), diff, minutes, seconds;

    function timer() {
        if (playing) {
            diff = duration - (((Date.now() - start) / 1000) | 0);
            if (diff < 0) diff = 0; // Prevent negative time

            minutes = (diff / 60) | 0;
            seconds = (diff % 60) | 0;
            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = "Time Left " + minutes + ":" + seconds;

            if (diff <= 0) {
                playing = false;
                modelfungo();
                clearInterval(timerInterval);
            }
        }
    };
    timer();
    var timerInterval = setInterval(timer, 1000);
}

// Remove the old window.onload and m = new maze() from the bottom of your script 
// so they don't run automatically.

// --- KEYBOARD CONTROLS (Desktop) ---
window.addEventListener('keydown', doKeyDown, true);

function doKeyDown(evt) {
    var handled = false;
    if (playing) {
        switch (evt.keyCode) {
            case 38: case 87: m.moveup("canvas"); handled = true; break;
            case 40: case 83: m.movedown("canvas"); handled = true; break;
            case 37: case 65: m.moveleft("canvas"); handled = true; break;
            case 39: case 68: m.moveright("canvas"); handled = true; break;
        }
        if (m.checker("canvas")) playing = false;
    }
    if (handled) evt.preventDefault();
}

// --- VIRTUAL JOYSTICK LOGIC (Mobile) ---
const joystickContainer = document.getElementById('joystick-container');
const joystickKnob = document.getElementById('joystick-knob');

let joystickInterval = null;
let currentDirection = null;
const maxRadius = 35; // Maximum pixel distance the knob can move from center

function handleJoystick(e) {
    e.preventDefault();
    if (!playing) return;

    let touch = e.targetTouches[0];
    let rect = joystickContainer.getBoundingClientRect();

    // Calculate distance from center of the joystick container
    let centerX = rect.width / 2;
    let centerY = rect.height / 2;
    let dx = touch.clientX - rect.left - centerX;
    let dy = touch.clientY - rect.top - centerY;

    let distance = Math.sqrt(dx * dx + dy * dy);

    // Constrain knob inside the circle
    if (distance > maxRadius) {
        dx = (dx / distance) * maxRadius;
        dy = (dy / distance) * maxRadius;
    }

    // Move the knob visually
    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;

    // Calculate angle to determine direction (deadzone of 10px)
    if (distance > 10) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (angle > -45 && angle <= 45) currentDirection = 'RIGHT';
        else if (angle > 45 && angle <= 135) currentDirection = 'DOWN';
        else if (angle > 135 || angle <= -135) currentDirection = 'LEFT';
        else if (angle > -135 && angle <= -45) currentDirection = 'UP';

        // Start moving if not already looping
        if (!joystickInterval) {
            executeJoystickMove(); // Move immediately
            joystickInterval = setInterval(executeJoystickMove, 150); // Keep moving every 150ms
        }
    } else {
        resetJoystick();
    }
}

function executeJoystickMove() {
    if (!playing) return resetJoystick();

    if (currentDirection === 'UP') m.moveup("canvas");
    else if (currentDirection === 'DOWN') m.movedown("canvas");
    else if (currentDirection === 'LEFT') m.moveleft("canvas");
    else if (currentDirection === 'RIGHT') m.moveright("canvas");

    if (m.checker("canvas")) {
        playing = false;
        resetJoystick();
    }
}

function resetJoystick() {
    joystickKnob.style.transform = `translate(0px, 0px)`;
    currentDirection = null;
    if (joystickInterval) {
        clearInterval(joystickInterval);
        joystickInterval = null;
    }
}

// Bind touch events to the joystick container
joystickContainer.addEventListener('touchstart', handleJoystick, { passive: false });
joystickContainer.addEventListener('touchmove', handleJoystick, { passive: false });
joystickContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    resetJoystick();
}, { passive: false });


// --- MAZE GENERATOR LOGIC ---
var dsd = function(size) {
    this.N = size;
    this.P = new Array(this.N);
    this.R = new Array(this.N);
    this.init = function() {
        for (var i = 0; i < this.N; i++) {
            this.P[i] = i;
            this.R[i] = 0;
        }
    }
    this.union = function(x, y) {
        var u = this.find(x);
        var v = this.find(y);
        if (this.R[u] > this.R[v]) {
            this.R[u] = this.R[v] + 1;
            this.P[u] = v;
        } else {
            this.R[v] = this.R[u] + 1;
            this.P[v] = u;
        }
    }
    this.find = function(x) {
        if (x == this.P[x]) return x;
        this.P[x] = this.find(this.P[x]);
        return this.P[x];
    }
};

function random(min, max) { return (min + (Math.random() * (max - min))); };
function randomChoice(choices) { return choices[Math.round(random(0, choices.length - 1))]; };

var maze = function(X, Y) {
    this.N = X;
    this.M = Y;
    this.S = 25;
    this.moves = 0;
    this.Board = new Array(2 * this.N + 1);
    this.EL = new Array();
    this.vis = new Array(2 * this.N + 1);
    this.delay = 2;
    this.x = 1;
    this.init = function() {
        for (var i = 0; i < 2 * this.N + 1; i++) {
            this.Board[i] = new Array(2 * this.M + 1);
            this.vis[i] = new Array(2 * this.M + 1);
        }
        for (var i = 0; i < 2 * this.N + 1; i++) {
            for (var j = 0; j < 2 * this.M + 1; j++) {
                if (!(i % 2) && !(j % 2)) this.Board[i][j] = '+';
                else if (!(i % 2)) this.Board[i][j] = '-';
                else if (!(j % 2)) this.Board[i][j] = '|';
                else this.Board[i][j] = ' ';
                this.vis[i][j] = 0;
            }
        }
    }
    this.add_edges = function() {
        for (var i = 0; i < this.N; i++) {
            for (var j = 0; j < this.M; j++) {
                if (i != this.N - 1) this.EL.push([[i, j], [i + 1, j], 1]);
                if (j != this.M - 1) this.EL.push([[i, j], [i, j + 1], 1]);
            }
        }
    }
    this.h = function(e) { return e[1] * this.M + e[0]; }
    this.randomize = function(EL) {
        for (var i = 0; i < EL.length; i++) {
            var si = Math.floor(Math.random() * 387) % EL.length;
            var tmp = EL[si];
            EL[si] = EL[i];
            EL[i] = tmp;
        }
        return EL;
    }
    this.breakwall = function(e) {
        var x = e[0][0] + e[1][0] + 1;
        var y = e[0][1] + e[1][1] + 1;
        this.Board[x][y] = ' ';
    }
    this.gen_maze = function() {
        this.EL = this.randomize(this.EL);
        var D = new dsd(this.M * this.M);
        D.init();
        var s = this.h([0, 0]);
        var e = this.h([this.N - 1, this.M - 1]);
        this.Board[1][0] = ' ';
        this.Board[2 * this.N - 1][2 * this.M] = ' ';

        for (var i = 0; i < this.EL.length; i++) {
            var x = this.h(this.EL[i][0]);
            var y = this.h(this.EL[i][1]);
            if (D.find(s) == D.find(e)) {
                if (!(D.find(x) == D.find(s) && D.find(y) == D.find(s))) {
                    if (D.find(x) != D.find(y)) {
                        D.union(x, y);
                        this.breakwall(this.EL[i]);
                        this.EL[i][2] = 0;
                    }
                }
            } else if (D.find(x) != D.find(y)) {
                D.union(x, y);
                this.breakwall(this.EL[i]);
                this.EL[i][2] = 0;
            }
        }
    };
    this.draw_canvas = function(id) {
        this.canvas = document.getElementById(id);
        var scale = this.S;
        temp = []
        if (this.canvas.getContext) {
            this.ctx = this.canvas.getContext('2d');
            this.Board[1][0] = '$'
            for (var i = 0; i < 2 * this.N + 1; i++) {
                for (var j = 0; j < 2 * this.M + 1; j++) {
                    if (this.Board[i][j] != ' ') {
                        this.ctx.fillStyle = "black";
                        this.ctx.fillRect(scale * i, scale * j, scale, scale);
                    } else if (i < 5 && j < 5) temp.push([i, j])
                }
            }
            x = randomChoice(temp)
            this.Board[x[0]][x[1]] = '&'
            this.ctx.fillStyle = "#00aa00";
            this.ctx.fillRect(scale * x[0], scale * x[1], scale, scale);
        }
    };
    this.checkPos = function(id) {
        for (var i = 0; i < 2 * this.N + 1; i++) {
            for (var j = 0; j < 2 * this.M + 1; j++) {
                if (this.Board[i][j] == '&') return [i, j];
            }
        }
    }
    this.moveclear = function(a, b) {
        var scale = this.S;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "#00ff00";
        this.ctx.fillRect(scale * a, scale * b, scale, scale);
        this.Board[a][b] = ' '
    }
    this.move = function(a, b) {
        var scale = this.S;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.fillStyle = "#00aa00";
        this.ctx.fillRect(scale * a, scale * b, scale, scale);
        this.Board[a][b] = '&'
    }
    this.moveup = function(id) {
        cord = this.checkPos(id);
        i = cord[0]; j = cord[1] - 1;
        if (j >= 0 && j <= 2 * this.M && this.Board[i][j] == ' ') {
            this.moveclear(i, j + 1); this.move(i, j); this.moves += 1;
        }
    }
    this.movedown = function(id) {
        cord = this.checkPos(id);
        i = cord[0]; j = cord[1] + 1;
        if (j >= 0 && j <= 2 * this.M && this.Board[i][j] == ' ') {
            this.moveclear(i, j - 1); this.move(i, j); this.moves += 1;
        }
    }
    this.moveleft = function(id) {
        cord = this.checkPos(id);
        i = cord[0] - 1; j = cord[1];
        if (i >= 0 && i <= 2 * this.N && this.Board[i][j] == ' ') {
            this.moveclear(i + 1, j); this.move(i, j); this.moves += 1;
        }
    }
    this.moveright = function(id) {
        cord = this.checkPos(id);
        i = cord[0] + 1; j = cord[1];
        if (i >= 0 && i <= 2 * this.N && this.Board[i][j] == ' ') {
            this.moveclear(i - 1, j); this.move(i, j); this.moves += 1;
        }
    }
    this.checker = function(id) {
        cord = this.checkPos(id);
        i = cord[0]; j = cord[1];
        if ((i == 19 && j == 20) || (i == 1 && j == 0)) {
            modelfunwin();
            return 1;
        }
        return 0;
    }
    this.getMoves = function() { return this.moves; }
};



function drawMoves() {
    document.getElementById("c").innerHTML = "Moves: " + m.getMoves()
}

setInterval(drawMoves, 100);