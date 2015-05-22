/* -2 means empty tile.
    1 means player 1.
    -1 means player 2. */
var board = [[-2,-2,-2], 
             [-2,-2,-2], 
             [-2,-2,-2]];
var ids = [["leftTopTile", "topMidTile", "rightTopTile"],
           ["leftMidTile", "centerTile", "rightMidTile"],
           ["leftBotTile", "midBotTile", "rightBotTile"]];
var playerOne = true;

var count = 0;

function checkWin(board, x, y) {
    var prev;
    
    /*Check row*/
    for(var i = 0; i < board.length; i++) {
        if(i == 0) prev = board[x][i];
        /*No need to keep checking if previous does not
          equal current*/    
        if(prev != board[x][i]) break;
        if(i == board.length - 1) {
            return board[x][i];
        }
    }
    
    /*Check column*/
    for(i = 0; i < board.length; i++) {
        if(i == 0) prev = board[i][y];
        /*No need to keep checking if previous does not
          equal current*/    
        if(prev != board[i][y]) break;
        if(i == board.length - 1) {
            return board[i][y];
        }
    }
    
    /*We are in a diagonal*/
    if(x == y) {
        for(i = 0; i < board.length; i++) {
            if(i == 0) prev = board[i][i];
            /*No need to keep checking if previous does not
              equal current*/    
            if(prev != board[i][i]) break;
            if(i == board.length - 1) {
                return board[i][i];
            }
        }
        
        if(x == 1) {
            /*Check the other diagonal*/
            if(board[0][2] == board[1][1]) {
                if(board[1][1] == board[2][0]) {
                    return board[2][0];
                }
            }
        }
    }
    
    if((x == 2 && y == 0) || (y == 2 && x == 0)) {
        if(board[0][2] == board[1][1]) {
                if(board[1][1] == board[2][0]) {
                    return board[2][0];
                }
        }
    }
    
    for(var g = 0; g < board.length; g++) {
        for(var j = 0; j < board.length; j++) {
            /*There are still free slots*/
            if(board[g][j] == -2) return -2;
        }
    }
    /*This means draw*/
    return 0;
}

function Node(x, y, pBoard ,turn, parent) {
    this.child = [];
    this.id = count;
    this.par = parent;
    this.retVal = [];
    this.pos = [x, y];
    this.refs = [];
    this.nextNode = null;
    this.childCount = 0;
    this.turn = turn;
    this.pBoard = [];
    for(var i = 0; i < pBoard.length; i++) {
        this.pBoard.push([pBoard[i][0], pBoard[i][1], pBoard[i][2]]);
    }
    this.pBoard[x][y] = this.turn;
    
    this.pushChild = function(x, y, turn, par) {
        this.child.push(new Node(x,y, this.pBoard, turn, par));
        this.childCount++;
    };
    
    this.setParVal = function(num, ref) {
        this.par.retVal.push(num);  
        this.par.refs.push(ref);
    };
}

function Tree(x, y, pBoard, turn) {
    this.root = new Node(x, y, pBoard, turn, null);
    this.sugar = this.root;

    this.minimax = function(player) {
        /*Check if we have reached the end of a simulation*/
        var win = checkWin(this.sugar.pBoard, this.sugar.pos[0], this.sugar.pos[1]);
        if(win != -2) {
            this.sugar.setParVal(win, this.sugar);
            return win;
        }
        /* Compute number of legal moves left*/
        var legalMoves = [];
        for(var i = 0; i < this.sugar.pBoard.length; i++) {
            for(var j = 0; j < this.sugar.pBoard.length; j++) {
               if(this.sugar.pBoard[i][j] == -2) legalMoves.push([i,j]);
            }
        }
        
        /*If there were no legal moves we return a reference to the current node
          and return 0 as this is a draw */
        if(legalMoves.length == 0) {
            this.sugar.setParVal(0, this.sugar);
            return 0;
        }
    
        /*Push a child for each one of the legal moves*/
        
        for(var z = 0; z < legalMoves.length; z++) {
             count++;
             this.sugar.pushChild(legalMoves[z][0], legalMoves[z][1], player, this.sugar);
        }
        
        /*Here we traverse the Tree calling minimax for each child*/
        if(player == 1) {
            var prev = this.sugar;
            for(z = 0; z < legalMoves.length; z++) {
                this.sugar = this.sugar.child[z];
                this.minimax(-1);
                this.sugar = prev;
            }
            var val = -3;
            var index;
            for(z = 0; z < this.sugar.retVal.length; z++) {
                if(this.sugar.retVal[z] > val) {
                    val = this.sugar.retVal[z];
                    index = z;
                }
            }
            if(this.sugar.par != null) {
                /*This is the node with the end game move*/
                this.sugar.nextNode = this.sugar.refs[index];
                this.sugar.setParVal(val, this.sugar.refs[index]);
            } 
            else {
                this.sugar.nextNode = this.sugar.refs[index];
            }
        }
        else if(player == -1) {
            var previ = this.sugar;
            for(z = 0; z < legalMoves.length; z++) {
                this.sugar = this.sugar.child[z];
                this.minimax(1);
                this.sugar = previ;
            }
            var val2 = 3;
            var index2;
            for(z = 0; z < this.sugar.retVal.length; z++) {
                if(this.sugar.retVal[z] < val2) {
                    val2 = this.sugar.retVal[z];
                    index2 = z;
                }
            }
            if(this.sugar.par != null) {
                /*This is the node with the best move*/
                this.sugar.nextNode = this.sugar.refs[index2];
                this.sugar.setParVal(val2, this.sugar.refs[index2]);
            } 
            else {
                this.sugar.nextNode = this.sugar.refs[index2];
            }
        }
    };
    
}

window.onload = function() {
    var topLeft  = document.getElementById("leftTopTile");
    var topMid   = document.getElementById("topMidTile");
    var topRight = document.getElementById("rightTopTile");
    var leftMid  = document.getElementById("leftMidTile");
    var leftBot  = document.getElementById("leftBotTile");
    var midBot   = document.getElementById("midBotTile");
    var rightBot = document.getElementById("rightBotTile");
    var rightMid = document.getElementById("rightMidTile");
    var center   = document.getElementById("centerTile");
    
    /*Handles the AI move. It basically calls the minimax algorithm and displays
      the graphical part*/
    
    function AIMove(i, j) {
        function AICommitMove(x, y) {
            board[x][y] = -1;
            document.getElementById(ids[x][y]).innerHTML += '<span id="o">O</span>';
            switch(ids[x][y]) {
                case "centerTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playCenter);
                    break;
                case "leftTopTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playTopLeft);
                    break;
                case "topMidTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playTopMid);
                    break;
                case "rightTopTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playTopRight);
                    break;
                case "leftMidTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playLeftMid);
                    break;
                case "rightMidTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playRightMid);
                    break;
                case "leftBotTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playLeftBot);
                    break;
                case "midBotTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playMidBot);
                    break;
                case "rightBotTile":
                    document.getElementById(ids[x][y]).removeEventListener('click', playRightBot);
                    break;
                default:
                    break;
            }
            
            var st = checkWin(board, x,y);
            if(st == -1) {
                alert("Player O won");
                location.reload();
            }
            else if (st == 0) {
                alert("Draw");
                location.reload();
            }
            playerOne = true;
        }
        
        var gameTree = new Tree(i, j, board, 1);
        gameTree.minimax(-1);
        var booly = true;
        var dummy = gameTree.root.nextNode.par;
        /*If we are at the root use the winning move*/
        if(dummy.par == null) {
            dummy = gameTree.root.nextNode;
            booly = false;
        }
        /*Compute the immediate next move in our simulation*/
        while(booly) {
            if(dummy.par.id == gameTree.root.id) {
                break;
            }
            dummy = dummy.par;
        }
        AICommitMove(dummy.pos[0], dummy.pos[1]);
    }
    
    /* Function that handles the actual move for each tile. It checks if
       the game has reached an end state after each move */
    
    function makeMove(id, i, j) {
        if(playerOne) {
            document.getElementById(id).innerHTML += '<span id="x">X</span>';
            board[i][j] = 1;
            var et = checkWin(board, i ,j);
            if(et == 1) {
                alert("Player X won");
                location.reload();
            }
            else if(et == 0) {
                alert("Draw");
                location.reload();
            }
            playerOne = false;
            AIMove(i, j);
        }
    }
    
    /* These functions handle the player click for each tile */
    
    var playTopLeft = function() {
        makeMove("leftTopTile", 0, 0);
        topLeft.removeEventListener('click', playTopLeft);
    };
    var playTopRight = function() {
        makeMove("rightTopTile", 0, 2);
        topRight.removeEventListener('click', playTopRight);
    };
    var playTopMid = function () {
        makeMove("topMidTile", 0, 1);
        topMid.removeEventListener('click', playTopMid);
    };
    
    var playLeftMid = function () {
        makeMove("leftMidTile", 1, 0);
        leftMid.removeEventListener('click', playLeftMid);
    };
    
    var playLeftBot = function () {
      makeMove("leftBotTile", 2, 0);
      leftBot.removeEventListener('click', playLeftBot);
    };
    
    var playMidBot = function () {
      makeMove("midBotTile", 2, 1);
      midBot.removeEventListener('click', playMidBot);
    };
    
    var playRightBot = function () {
      makeMove("rightBotTile", 2, 2);
      rightBot.removeEventListener('click', playRightBot);
    };
    
    var playRightMid = function() {
      makeMove("rightMidTile", 1, 2);
      rightMid.removeEventListener('click', playRightMid);    
    };
    
    var playCenter = function () {
      makeMove("centerTile", 1, 1);
      center.removeEventListener('click', playCenter);     
    };
    
    if(topLeft) {
        topLeft.addEventListener('click', playTopLeft);
    }

    if(topMid) {
        topMid.addEventListener('click', playTopMid);
    }
    
    if(topRight) {
        topRight.addEventListener('click', playTopRight);
    }
    
    if(leftMid) {
        leftMid.addEventListener('click', playLeftMid);
    }
    
    if(leftBot) {
        leftBot.addEventListener('click', playLeftBot);
    }
    
    if(midBot) {
        midBot.addEventListener('click', playMidBot);
    }
    
    if(rightBot) {
        rightBot.addEventListener('click', playRightBot);
    }
    
    if(rightMid) {
        rightMid.addEventListener('click', playRightMid);
    }
    
    if(center) {
        center.addEventListener('click', playCenter);
    }

};
