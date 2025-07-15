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
const cardGameData = {
    prompts: [
        "สิ่งที่ขาดไม่ได้ในวงเหล้าคือ ______.", "ข่าวพาดหัววันพรุ่งนี้: 'พบ ______ อยู่ในทำเนียบรัฐบาล'",
        "เคล็ดลับการใช้ชีวิตในกรุงเทพฯ คือ ______.", "สิ่งที่น่ากลัวกว่าผี คือ ______.",
        "ผมเกลียดวันจันทร์ แต่ผมรัก ______.", "ในที่สุดเราก็ค้นพบว่า ______ คือสาเหตุที่รถติด",
        "______ คือเพื่อนแท้ในยามยาก", "ถ้าฉันเป็นนายก สิ่งแรกที่จะทำคือ ______.",
    ],
    answers: [
        "เงินเดือนที่เหลือตอนสิ้นเดือน", "แมวส้มตัวอ้วน", "ความเจ็บปวดจากการเหยียบเลโก้",
        "ชาไทยที่หวานน้อยไม่มีอยู่จริง", "การบ้านที่ยังทำไม่เสร็จ", "กางเกงช้าง",
        "เสียงแจ้งเตือนไลน์ตอนตีสาม", "หมูกระทะหลังสี่ทุ่ม", "หนี้ กยศ.", "คนขับรถที่ไม่เปิดไฟเลี้ยว",
        "บรีฟงานที่แก้ได้ตลอดไป", "ฝนที่ตกตอนเลิกงาน", "การตื่นมาแล้วพบว่ายังเป็นวันจันทร์",
        "Wi-Fi ที่ช้ากว่าเต่าคลาน", "แบตมือถือที่เหลือ 1%", "ซอฟต์พาวเวอร์", "การนอนกลางวัน", "เสียงบ่นของแม่",
    ],
};
const codenameData = {
    words: [
        'กล้วย', 'โรงเรียน', 'ตำรวจ', 'ดวงจันทร์', 'ทะเล', 'ภูเขา', 'คอมพิวเตอร์', 'โทรศัพท์', 'หนังสือ', 'ปากกา',
        'เครื่องบิน', 'รถไฟ', 'จักรยาน', 'หมอ', 'พยาบาล', 'โรงพยาบาล', 'ตลาด', 'วัด', 'ช้าง', 'สิงโต',
        'กาแฟ', 'ประเทศไทย', 'ญี่ปุ่น', 'อเมริกา', 'ฟุตบอล', 'นักร้อง', 'ดารา', 'ภาพยนตร์', 'ดนตรี', 'ชายหาด',
        'โรงแรม', 'ร้านอาหาร', 'เก้าอี้', 'โต๊ะ', 'เตียง', 'หน้าต่าง', 'ประตู', 'แม่น้ำ', 'สะพาน', 'ถนน'
    ]
};
const itoData = {
    themes: [
        "ความนิยมของสัตว์เลี้ยง", "ของที่คิดว่าแพงที่สุด", "ความสามารถพิเศษที่อยากมี",
        "ตัวละครที่แข็งแกร่งที่สุด", "อาหารที่เผ็ดที่สุด", "สถานที่ที่อยากไปมากที่สุด"
    ]
};
const funFactsData = {
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
    return Object.keys(rooms).find(roomCode => rooms[roomCode].players.some(p => p.id === socketId));
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
            socket.to(roomCode).emit('updateLobby', room.players);

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
                if (room.gameType === 'card-game') {
                    startCardGameRound(roomCode);
                } else if (room.gameType === 'codename') {
                    // *** FIXED: Correctly choose between co-op and team mode ***
                    if (room.players.length === 2) {
                        startCodenameCoopGame(roomCode);
                    } else {
                        startCodenameTeamGame(roomCode);
                    }
                } else if (room.gameType === 'ito') {
                    startItoRound(roomCode);
                } else if (room.gameType === 'fun-facts') {
                    startFunFactsRound(roomCode);
                }
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });
    
    // --- Card Game Listeners ---
    socket.on('cardGame_playCard', ({ card }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || !room.game.judge || room.gameState !== 'playing' || socket.id === room.game.judge.id) return;
        
        if (!room.game.playedCards) room.game.playedCards = {};
        room.game.playedCards[socket.id] = card;
        
        const playingPlayers = room.players.filter(p => p.id !== room.game.judge.id);
        if (Object.keys(room.game.playedCards).length === playingPlayers.length) {
            io.to(roomCode).emit('cardGame_revealCards', room.game.playedCards);
        }
    });

    socket.on('cardGame_pickWinner', ({ winnerSocketId }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || !room.game.judge || socket.id !== room.game.judge.id) return;

        const winnerPlayer = room.players.find(p => p.id === winnerSocketId);
        if (winnerPlayer) {
            winnerPlayer.score++;
            io.to(roomCode).emit('cardGame_announceWinner', {
                winnerName: winnerPlayer.name,
                winningCard: room.game.playedCards[winnerSocketId],
                players: room.players
            });
            setTimeout(() => startCardGameRound(roomCode), 5000);
        }
    });

    // --- Codename Listeners ---
    socket.on('codename_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.isCoop) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && !player.team) {
            player.team = team;
            room.game.teams[team].players.push(player.id);
            io.to(roomCode).emit('codename_updateState', room.game);
        }
    });

    socket.on('codename_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.isCoop || room.game.teams[team].spymaster) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.team === team) {
            player.isSpymaster = true;
            room.game.teams[team].spymaster = player.id;
            io.to(roomCode).emit('codename_updateState', room.game);
        }
    });

    socket.on('codename_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;
        const player = room.players.find(p => p.id === socket.id);
        if (player && player.isSpymaster) {
            room.game.clue = { word, number };
            room.game.guessesLeft = room.game.isCoop ? number : (number + 1);
            io.to(roomCode).emit('codename_updateState', room.game);
        }
    });

    socket.on('codename_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;
        const player = room.players.find(p => p.id === socket.id);
        const card = room.game.board[cardIndex];
        if (player.isSpymaster || card.revealed || room.game.guessesLeft <= 0) return;
        card.revealed = true;
        if (room.game.isCoop) {
            if (card.type === 'assassin') {
                io.to(roomCode).emit('codename_gameOver', { winner: 'game', reason: 'เจอสายลับ!', isCoop: true });
                return;
            }
            if (card.type === 'green') {
                room.game.wordsFound++;
                room.game.guessesLeft--;
                if (room.game.wordsFound >= room.game.wordsToFind) {
                    io.to(roomCode).emit('codename_gameOver', { winner: 'players', reason: 'หาเจอครบแล้ว!', isCoop: true });
                    return;
                }
                if (room.game.guessesLeft === 0) {
                    switchCodenameTurn(roomCode);
                }
            } else {
                switchCodenameTurn(roomCode);
            }
        } else {
            if (player.team !== room.game.turn) return;
            if (card.type === 'assassin') {
                const winner = room.game.turn === 'red' ? 'blue' : 'red';
                io.to(roomCode).emit('codename_gameOver', { winner, reason: 'ทีมของคุณเจอสายลับ!', isCoop: false });
                return;
            }
            if (card.type === room.game.turn) {
                room.game.guessesLeft--;
                room.game.teams[room.game.turn].score++;
                if (checkCodenameWin(roomCode)) return;
            } else {
                if (card.type === 'red' || card.type === 'blue') {
                    room.game.teams[card.type].score++;
                }
                if (checkCodenameWin(roomCode)) return;
                switchCodenameTurn(roomCode);
            }
        }
        io.to(roomCode).emit('codename_updateState', room.game);
    });

    socket.on('codename_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if(room && room.game) {
            switchCodenameTurn(roomCode);
            io.to(roomCode).emit('codename_updateState', room.game);
        }
    });

    // --- ito Listeners ---
    socket.on('ito_submitOrder', ({ orderedPlayerIds }) => {
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
        io.to(roomCode).emit('ito_showResults', { results, success });

        setTimeout(() => startItoRound(roomCode), 5000);
    });

    // --- Fun Facts Listeners ---
    socket.on('funFacts_submitAnswer', ({ answer }) => {
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
            
            room.game.ranges = generateBettingRanges(revealedPlayers);

            io.to(roomCode).emit('funFacts_startBetting', {
                secretPlayer: { id: room.game.secretPlayerId, name: room.players[secretPlayerIndex].name },
                ranges: room.game.ranges
            });
        }
    });

    socket.on('funFacts_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            player.bet = betOnRangeIndex;
        }

        const allBetted = room.players
            .filter(p => p.id !== room.game.secretPlayerId)
            .every(p => p.hasOwnProperty('bet'));

        if (allBetted) {
            const secretPlayer = room.players.find(p => p.id === room.game.secretPlayerId);
            const secretAnswer = secretPlayer.answer;
            const correctRangeIndex = findCorrectRangeIndex(secretAnswer, room.game.ranges);
            
            const winners = [];
            room.players.forEach(p => {
                if (p.bet === correctRangeIndex) {
                    p.score += 10;
                    winners.push(p.id);
                }
            });

            io.to(roomCode).emit('funFacts_showResult', {
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

    socket.on('funFacts_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startFunFactsRound(roomCode);
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

// --- Card Game Logic Functions ---
function startCardGameRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    const game = room.game;
    game.playedCards = {};
    if (game.judgeIndex === undefined) game.judgeIndex = -1;
    game.judgeIndex = (game.judgeIndex + 1) % room.players.length;
    game.judge = room.players[game.judgeIndex];
    
    if (!game.prompts || game.prompts.length === 0) game.prompts = [...cardGameData.prompts];
    const promptIndex = Math.floor(Math.random() * game.prompts.length);
    game.currentPrompt = game.prompts.splice(promptIndex, 1)[0];
    
    if (!game.answers || game.answers.length < (room.players.length * 5)) {
        game.answers = [...cardGameData.answers];
    }

    room.players.forEach(player => {
        if (player.id !== game.judge.id) {
            const cardsToDeal = [];
            for (let i = 0; i < 5; i++) {
                const cardIndex = Math.floor(Math.random() * game.answers.length);
                cardsToDeal.push(game.answers.splice(cardIndex, 1)[0]);
            }
            io.to(player.id).emit('cardGame_dealCards', cardsToDeal);
        }
    });
    io.to(roomCode).emit('cardGame_newRound', {
        prompt: game.currentPrompt,
        judge: game.judge,
        players: room.players
    });
}

// --- Codename Logic Functions ---
function startCodenameTeamGame(roomCode) {
    const room = rooms[roomCode];
    const words = [...codenameData.words].sort(() => 0.5 - Math.random()).slice(0, 25);
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
    io.to(roomCode).emit('codename_updateState', room.game);
}

function startCodenameCoopGame(roomCode) {
    const room = rooms[roomCode];
    const words = [...codenameData.words].sort(() => 0.5 - Math.random()).slice(0, 25);
    const types = [];
    types.push(...Array(15).fill('green'));
    types.push(...Array(3).fill('assassin'));
    types.push(...Array(7).fill('neutral'));
    const shuffledTypes = types.sort(() => 0.5 - Math.random());
    
    room.players.forEach(p => p.isSpymaster = false);
    room.players[0].isSpymaster = true;

    room.game = {
        isCoop: true,
        board: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
        wordsToFind: 15,
        wordsFound: 0,
        turnsLeft: 9,
        clue: {}, guessesLeft: 0, players: room.players
    };
    io.to(roomCode).emit('codename_updateState', room.game);
}

function switchCodenameTurn(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    
    room.game.clue = {};
    room.game.guessesLeft = 0;

    if (room.game.isCoop) {
        room.game.turnsLeft--;
        if (room.game.turnsLeft < 0) {
            io.to(roomCode).emit('codename_gameOver', { winner: 'game', reason: 'เทิร์นหมดแล้ว!', isCoop: true });
            return;
        }
        const p1 = room.players[0];
        const p2 = room.players[1];
        const p1WasSpymaster = p1.isSpymaster;
        p1.isSpymaster = !p1WasSpymaster;
        p2.isSpymaster = p1WasSpymaster;
    } else {
        room.game.turn = room.game.turn === 'red' ? 'blue' : 'red';
    }
}

function checkCodenameWin(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.game || room.game.isCoop) return false;
    const gameState = room.game;
    if (gameState.teams.red.score >= gameState.teams.red.goal) {
        io.to(roomCode).emit('codename_gameOver', { winner: 'red', reason: 'ทีมสีแดงหาคำศัพท์เจอครบแล้ว!', isCoop: false });
        return true;
    }
    if (gameState.teams.blue.score >= gameState.teams.blue.goal) {
        io.to(roomCode).emit('codename_gameOver', { winner: 'blue', reason: 'ทีมสีน้ำเงินหาคำศัพท์เจอครบแล้ว!', isCoop: false });
        return true;
    }
    return false;
}

// --- ito Logic Functions ---
function startItoRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    room.game = {};
    
    const themeIndex = Math.floor(Math.random() * itoData.themes.length);
    const theme = itoData.themes[themeIndex];

    const numbers = [];
    while (numbers.length < room.players.length) {
        const num = Math.floor(Math.random() * 100) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    
    room.players.forEach((player, index) => {
        player.number = numbers[index];
        io.to(player.id).emit('ito_newRound', {
            theme: theme,
            number: player.number,
            players: room.players.map(p => ({ id: p.id, name: p.name }))
        });
    });
}

// --- Fun Facts Logic Functions ---
function startFunFactsRound(roomCode) {
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

    const question = funFactsData.questions[Math.floor(Math.random() * funFactsData.questions.length)];
    room.game.question = question;

    io.to(roomCode).emit('funFacts_newRound', { question, players: room.players.map(p => ({id: p.id, name: p.name, score: p.score})) });
}

function generateBettingRanges(revealedPlayers) {
    const ranges = [];
    if (revealedPlayers.length === 0) {
        ranges.push({ label: 'ทายได้เลย!', min: -Infinity, max: Infinity });
        return ranges;
    }

    ranges.push({ label: `< ${revealedPlayers[0].answer}`, min: -Infinity, max: revealedPlayers[0].answer - 1 });

    for (let i = 0; i < revealedPlayers.length; i++) {
        const current = revealedPlayers[i];
        const next = revealedPlayers[i + 1];
        if (next) {
            if (current.answer === next.answer) continue; 
            ranges.push({ label: `${current.answer} - ${next.answer - 1}`, min: current.answer, max: next.answer - 1 });
        } else {
            ranges.push({ label: `≥ ${current.answer}`, min: current.answer, max: Infinity });
        }
    }
    return ranges;
}

function findCorrectRangeIndex(secretAnswer, ranges) {
    return ranges.findIndex(range => secretAnswer >= range.min && secretAnswer <= range.max);
}


// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
