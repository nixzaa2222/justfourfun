// server.js
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// --- Game Data ---
const wordGuessData = {
    words: [
        'กล้วย', 'โรงเรียน', 'ตำรวจ', 'ดวงจันทร์', 'ทะเล', 'ภูเขา', 'คอมพิวเตอร์', 'โทรศัพท์', 'หนังสือ', 'ปากกา',
        'เครื่องบิน', 'รถไฟ', 'จักรยาน', 'หมอ', 'พยาบาล', 'โรงพยาบาล', 'ตลาด', 'วัด', 'ช้าง', 'สิงโต',
        'กาแฟ', 'ประเทศไทย', 'ญี่ปุ่น', 'อเมริกา', 'ฟุตบอล', 'นักร้อง', 'ดารา', 'ภาพยนตร์', 'ดนตรี', 'ชายหาด',
        'โรงแรม', 'ร้านอาหาร', 'เก้าอี้', 'โต๊ะ', 'เตียง', 'หน้าต่าง', 'ประตู', 'แม่น้ำ', 'สะพาน', 'ถนน'
    ]
};
const numberSortData = {
    themes: [
        "ความนิยมของสัตว์เลี้ยง", "ของที่คิดว่าแพงที่สุด", "ความสามารถพิเศษที่อยากมี",
        "ตัวละครที่แข็งแกร่งที่สุด", "อาหารที่เผ็ดที่สุด", "สถานที่ที่อยากไปมากที่สุด"
    ]
};
const friendQuizData = {
    questions: [
        "คุณมีรองเท้ากี่คู่?",
        "คุณใช้เวลาอาบน้ำโดยเฉลี่ยกี่นาที?",
        "คุณดื่มกาแฟวันละกี่แก้ว?",
        "คุณนอนวันละกี่ชั่วโมง?",
        "คุณมีเพื่อนใน Facebook กี่คน?",
        "คุณคิดว่าคุณจะอายุยืนกี่ปี?"
    ]
};

const rooms = {};

// --- Helper Functions ---
function findRoomBySocketId(socketId) {
    return Object.keys(rooms).find(roomCode => rooms[roomCode] && rooms[roomCode].players.some(p => p.id === socketId));
}

// --- Main Socket Logic ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('createRoom', ({ playerName, gameType }) => {
        let roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        while (rooms[roomCode]) { roomCode = Math.random().toString(36).substring(2, 6).toUpperCase(); }
        
        rooms[roomCode] = {
            gameType: gameType,
            players: [{ id: socket.id, name: playerName, score: 0 }],
            gameState: 'waiting',
            game: {}, 
        };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ playerName, roomCode }) => {
        const room = rooms[roomCode];
        if (room && room.players.length < 4 && room.gameState === 'waiting') {
            room.players.push({ id: socket.id, name: playerName, score: 0 });
            socket.join(roomCode);
            
            socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
            io.to(roomCode).emit('updateLobby', room.players);

        } else {
            socket.emit('error', 'ไม่สามารถเข้าร่วมห้องได้ (อาจจะเต็ม, รหัสผิด, หรือเกมเริ่มไปแล้ว)');
        }
    });
    
    socket.on('startGame', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            room.gameState = 'playing';
            io.to(roomCode).emit('gameStarted', room.gameType);
        }
    });

    socket.on('host_gameLogicStart', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.players.length > 0 && room.players[0].id === socket.id) {
            try {
                if (room.gameType === 'word-guess') {
                    if (room.players.length >= 2 && room.players.length <= 2) { // Strictly 2 players for co-op
                        startWordGuessCoopGame(roomCode);
                    } else { // 3-4 players for team mode
                        startWordGuessTeamGame(roomCode);
                    }
                } else if (room.gameType === 'number-sort') {
                    startNumberSortRound(roomCode);
                } else if (room.gameType === 'friend-quiz') {
                    startFriendQuizRound(roomCode);
                }
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });
    
    // --- Word Guess Listeners ---
    socket.on('wordGuess_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.isCoop) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && !player.team) {
            player.team = team;
            room.game.teams[team].players.push(player.id);
            io.to(roomCode).emit('wordGuess_updateState', room.game);
        }
    });

    socket.on('wordGuess_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.isCoop || room.game.teams[team].spymaster) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.team === team) {
            player.isSpymaster = true;
            room.game.teams[team].spymaster = player.id;
            io.to(roomCode).emit('wordGuess_updateState', room.game);
        }
    });

    socket.on('wordGuess_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.isSpymaster) {
            room.game.clue = { word, number: parseInt(number, 10) };
            room.game.guessesLeft = room.game.isCoop ? parseInt(number, 10) : (parseInt(number, 10) + 1);
            io.to(roomCode).emit('wordGuess_updateState', room.game);
        }
    });

    socket.on('wordGuess_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;
        const player = room.players.find(p => p.id === socket.id);
        const card = room.game.board[cardIndex];
        if (!player || player.isSpymaster || card.revealed || room.game.guessesLeft <= 0) return;
        
        card.revealed = true;
        
        if (room.game.isCoop) {
            if (card.type === 'assassin') {
                io.to(roomCode).emit('wordGuess_gameOver', { winner: 'game', reason: 'เจอสายลับ!', isCoop: true });
                return;
            }
            if (card.type === 'green') {
                room.game.wordsFound++;
                room.game.guessesLeft--;
                if (room.game.wordsFound >= room.game.wordsToFind) {
                    io.to(roomCode).emit('wordGuess_gameOver', { winner: 'players', reason: 'หาเจอครบแล้ว!', isCoop: true });
                    return;
                }
                if (room.game.guessesLeft === 0) {
                    switchWordGuessTurn(roomCode);
                }
            } else { // Hit neutral card
                switchWordGuessTurn(roomCode);
            }
        } else { // Team Mode
            if (player.team !== room.game.turn) return;
            if (card.type === 'assassin') {
                const winner = room.game.turn === 'red' ? 'blue' : 'red';
                io.to(roomCode).emit('wordGuess_gameOver', { winner, reason: 'ทีมของคุณเจอสายลับ!', isCoop: false });
                return;
            }
            if (card.type === room.game.turn) { // Correct guess
                room.game.guessesLeft--;
                room.game.teams[room.game.turn].score++;
                if (checkWordGuessWin(roomCode)) return;
                if (room.game.guessesLeft === 0) {
                    switchWordGuessTurn(roomCode);
                }
            } else { // Wrong guess (neutral or other team)
                if (card.type === 'red' || card.type === 'blue') {
                    room.game.teams[card.type].score++;
                }
                if (checkWordGuessWin(roomCode)) return;
                switchWordGuessTurn(roomCode);
            }
        }
        io.to(roomCode).emit('wordGuess_updateState', room.game);
    });

    socket.on('wordGuess_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if(room && room.game) {
            switchWordGuessTurn(roomCode);
            io.to(roomCode).emit('wordGuess_updateState', room.game);
        }
    });

    // --- Number Sort Listeners ---
    socket.on('numberSort_submitOrder', ({ orderedPlayerIds }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;
        
        const correctOrder = room.players.slice().sort((a, b) => a.number - b.number);
        let success = true;
        for (let i = 0; i < orderedPlayerIds.length; i++) {
            if (orderedPlayerIds[i] !== correctOrder[i].id) {
                success = false;
                break;
            }
        }

        const results = room.players.map(p => ({ id: p.id, name: p.name, number: p.number }));
        io.to(roomCode).emit('numberSort_showResults', { results, success });
    });
    
    socket.on('numberSort_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startNumberSortRound(roomCode);
        }
    });

    // --- Friend Quiz Listeners ---
    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.answer = answer;
        }

        const allAnswered = room.players.every(p => p.hasOwnProperty('answer'));
        if (allAnswered) {
            const secretPlayerIndex = Math.floor(Math.random() * room.players.length);
            room.game.secretPlayerId = room.players[secretPlayerIndex].id;

            const revealedPlayers = room.players
                .filter(p => p.id !== room.game.secretPlayerId)
                .sort((a, b) => a.answer - b.answer);
            
            room.game.ranges = generateQuizBettingRanges(revealedPlayers);

            io.to(roomCode).emit('friendQuiz_startBetting', {
                secretPlayer: { id: room.game.secretPlayerId, name: room.players[secretPlayerIndex].name },
                ranges: room.game.ranges
            });
        }
    });

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player && player.id !== room.game.secretPlayerId) {
            player.bet = betOnRangeIndex;
        }

        const bettingPlayers = room.players.filter(p => p.id !== room.game.secretPlayerId);
        const allBetted = bettingPlayers.every(p => p.hasOwnProperty('bet'));

        if (allBetted) {
            const secretPlayer = room.players.find(p => p.id === room.game.secretPlayerId);
            const secretAnswer = secretPlayer.answer;
            const correctRangeIndex = findQuizCorrectRangeIndex(secretAnswer, room.game.ranges);
            
            const winners = [];
            room.players.forEach(p => {
                if (p.bet === correctRangeIndex) {
                    p.score += 10;
                    winners.push(p.id);
                }
            });

            io.to(roomCode).emit('friendQuiz_showResult', {
                allPlayers: room.players.map(p => ({
                    id: p.id,
                    name: p.name,
                    answer: p.answer,
                    score: p.score,
                    isSecret: p.id === secretPlayer.id
                })),
                correctRangeIndex,
                winners
            });
        }
    });

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startFriendQuizRound(roomCode);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode]) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                if (room.players.length === 0) {
                    console.log(`Room ${roomCode} is empty, deleting.`);
                    delete rooms[roomCode];
                } else {
                    io.to(roomCode).emit('updateLobby', room.players);
                }
            }
        }
    });
});

// --- Word Guess Logic Functions ---
function startWordGuessTeamGame(roomCode) {
    const room = rooms[roomCode];
    const words = [...wordGuessData.words].sort(() => 0.5 - Math.random()).slice(0, 25);
    const types = [];
    const firstTurn = Math.random() < 0.5 ? 'red' : 'blue';
    types.push(...Array(firstTurn === 'red' ? 9 : 8).fill('red'));
    types.push(...Array(firstTurn === 'blue' ? 9 : 8).fill('blue'));
    types.push(...Array(7).fill('neutral'));
    types.push('assassin');
    const shuffledTypes = types.sort(() => 0.5 - Math.random());
    room.players.forEach(p => { p.team = null; p.isSpymaster = false; });

    room.game = {
        isCoop: false,
        board: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
        teams: {
            red: { players: [], spymaster: null, score: 0, goal: firstTurn === 'red' ? 9 : 8 },
            blue: { players: [], spymaster: null, score: 0, goal: firstTurn === 'blue' ? 9 : 8 }
        },
        turn: firstTurn,
        clue: {}, guessesLeft: 0, players: room.players
    };
    io.to(roomCode).emit('wordGuess_updateState', room.game);
}

function startWordGuessCoopGame(roomCode) {
    const room = rooms[roomCode];
    const words = [...wordGuessData.words].sort(() => 0.5 - Math.random()).slice(0, 25);
    const types = [];
    types.push(...Array(15).fill('green'));
    types.push(...Array(3).fill('assassin'));
    types.push(...Array(7).fill('neutral'));
    const shuffledTypes = types.sort(() => 0.5 - Math.random());
    
    room.players.forEach((p, index) => {
        p.isSpymaster = (index === 0);
    });

    room.game = {
        isCoop: true,
        board: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
        wordsToFind: 15,
        wordsFound: 0,
        turnsLeft: 9,
        clue: {}, guessesLeft: 0, players: room.players
    };
    io.to(roomCode).emit('wordGuess_updateState', room.game);
}

function switchWordGuessTurn(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    
    room.game.clue = {};
    room.game.guessesLeft = 0;

    if (room.game.isCoop) {
        room.game.turnsLeft--;
        if (room.game.turnsLeft < 0) {
            io.to(roomCode).emit('wordGuess_gameOver', { winner: 'game', reason: 'เทิร์นหมดแล้ว!', isCoop: true });
            return;
        }
    } else {
        room.game.turn = room.game.turn === 'red' ? 'blue' : 'red';
    }
}

function checkWordGuessWin(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.game || room.game.isCoop) return false;
    const gameState = room.game;
    if (gameState.teams.red.score >= gameState.teams.red.goal) {
        io.to(roomCode).emit('wordGuess_gameOver', { winner: 'red', reason: 'ทีมสีแดงหาคำศัพท์เจอครบแล้ว!', isCoop: false });
        return true;
    }
    if (gameState.teams.blue.score >= gameState.teams.blue.goal) {
        io.to(roomCode).emit('wordGuess_gameOver', { winner: 'blue', reason: 'ทีมสีน้ำเงินหาคำศัพท์เจอครบแล้ว!', isCoop: false });
        return true;
    }
    return false;
}

// --- Number Sort Logic Functions ---
function startNumberSortRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    room.game = {};
    
    const themeIndex = Math.floor(Math.random() * numberSortData.themes.length);
    const theme = numberSortData.themes[themeIndex];

    const numbers = [];
    while (numbers.length < room.players.length) {
        const num = Math.floor(Math.random() * 100) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    room.players.forEach((player, index) => {
        player.number = numbers[index];
        io.to(player.id).emit('numberSort_newRound', {
            theme: theme,
            number: player.number,
            players: room.players.map(p => ({ id: p.id, name: p.name }))
        });
    });
}

// --- Friend Quiz Logic Functions ---
function startFriendQuizRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    room.game = {
        secretPlayerId: null,
        ranges: []
    };
    room.players.forEach(p => {
        delete p.answer;
        delete p.bet;
    });

    const question = friendQuizData.questions[Math.floor(Math.random() * friendQuizData.questions.length)];
    room.game.question = question;

    io.to(roomCode).emit('friendQuiz_newRound', { question, players: room.players.map(p => ({id: p.id, name: p.name, score: p.score})) });
}

function generateQuizBettingRanges(revealedPlayers) {
    const ranges = [];
    if (revealedPlayers.length === 0) {
        ranges.push({ label: 'ทายได้เลย!', min: -Infinity, max: Infinity });
        return ranges;
    }

    revealedPlayers.sort((a,b) => a.answer - b.answer);

    ranges.push({ label: `< ${revealedPlayers[0].answer}`, min: -Infinity, max: revealedPlayers[0].answer - 1 });

    for (let i = 0; i < revealedPlayers.length; i++) {
        const current = revealedPlayers[i];
        const next = revealedPlayers[i + 1];
        if (next) {
            if (current.answer === next.answer) continue; 
            ranges.push({ label: `${current.answer} - ${next.answer - 1}`, min: current.answer, max: next.answer - 1 });
        }
    }
    ranges.push({ label: `≥ ${revealedPlayers[revealedPlayers.length - 1].answer}`, min: revealedPlayers[revealedPlayers.length - 1].answer, max: Infinity });
    
    return ranges.filter((range, index, self) => 
        index === self.findIndex((r) => (r.label === range.label))
    );
}

function findQuizCorrectRangeIndex(secretAnswer, ranges) {
    return ranges.findIndex(range => secretAnswer >= range.min && secretAnswer <= range.max);
}


// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
