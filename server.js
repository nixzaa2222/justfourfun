const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000 
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- Game Data (แยกหมวดหมู่ ทั่วไป กับ Valo/Gaming) ---
const wordGuessData = {
    general: ['คอมพิวเตอร์', 'หูฟัง', 'เมาส์', 'คีย์บอร์ด', 'ไมค์ช็อต', 'กล้วย', 'โรงเรียน', 'ตำรวจ', 'ดวงจันทร์', 'ทะเล', 'ภูเขา', 'โทรศัพท์', 'หนังสือ', 'ปากกา', 'รถไฟ', 'ช้าง', 'สิงโต', 'พิซซ่า', 'หมอ', 'พายุ', 'ดาวเคราะห์', 'แวมไพร์', 'ซอมบี้', 'ตู้เย็น', 'พีระมิด', 'กำแพงเมืองจีน', 'แผ่นดินไหว', 'น้ำท่วม', 'ภูเขาไฟ', 'ช็อกโกแลต', 'ไอศกรีม', 'แผนที่', 'เข็มทิศ', 'โจรสลัด', 'สมบัติ', 'นินจา', 'เอเลี่ยน', 'อวกาศ', 'ไดโนเสาร์', 'แม่มด', 'หุ่นยนต์'],
    valo: ['สไปค์', 'วานดัล', 'แฟนทอม', 'โอเปอเรเตอร์', 'เจ็ตต์', 'เรน่า', 'เรซ', 'โอมเมน', 'คิลจอย', 'ไซเฟอร์', 'สโมค', 'แฟลช', 'ฮีล', 'ชุบชีวิต', 'อัลติ', 'หัวร้อน', 'แลค', 'หลุด', 'ปิงปิง', 'ยิงนก', 'แครี่', 'ตัวถ่วง', 'เรเดียนต์', 'ไอรอน', 'บรอนซ์', 'บุกหลัง', 'ดักซุ่ม', 'แคมป์', 'วิ่งยิง', 'สไนเปอร์', 'มีด', 'ดิสคอร์ด', 'ปาร์ตี้', 'แร้งค์ตก', 'แรงค์ขึ้น']
};

const numberSortData = {
    general: ["ระดับความดองแชท", "ความง่วงเวลาตื่นตอนเช้า", "ระดับความขี้เกียจตื่น", "ระดับความกลัวผี", "ความอยากกินหมูกระทะตอนนี้", "ระดับความติ่งซีรีส์", "ความขี้ลืมของตัวเอง"],
    valo: ["ระดับความหัวร้อนเวลาเล่นเกมแพ้", "ความน่ารำคาญของสเมิร์ฟ (Smurf)", "ระดับความอยากกดลบเกมทิ้ง", "ความแม่นยำของตัวเองในวันนี้", "ความเกลือเวลาเปิดกล่องสุ่ม", "ความยากของการปีนแร้งค์", "ความปวดหลังจากการแบกทีม"]
};

const friendQuizData = {
    general: ["ถ้าเกิดซอมบี้บุก ใครในแก๊งนี้จะรอดเป็นคนสุดท้าย?", "ใครคือคนที่ตอบแชทช้าที่สุด?", "คุณมีเพื่อนในโซเชียลทั้งหมดกี่คน?", "เดือนนึงคุณกินชาบู/หมูกระทะกี่ครั้ง?", "คุณให้คะแนนหน้าตาตัวเองเท่าไหร่ (1-100)?", "คุณตื่นนอนกี่โมงในวันหยุด (เช่น 1030)?"],
    valo: ["ใครในห้องนี้หัวร้อนง่ายที่สุดเวลาเล่นแร้งค์?", "ใครในห้องนี้ชอบทำทรงบอกว่า 'เน็ตปิง/เมาส์หลอน' เวลาตาย?", "ใครในห้องนี้แบกทีมบ่อยที่สุด?", "ใครในห้องนี้เป็นตัวแจก (ตายคนแรก) บ่อยที่สุด?", "คุณให้คะแนนความแม่น (Aim) ของตัวเองเท่าไหร่ (1-100)?", "วันนึงคุณเล่นเกมนานสุดกี่ชั่วโมง?"]
};

const secretPainterData = {
    general: [
        { name: "สัตว์ป่า", words: ["ช้าง", "สิงโต", "ยีราฟ", "ลิง", "เสือ", "งู", "หมี", "จระเข้"] },
        { name: "อาหาร", words: ["พิซซ่า", "แฮมเบอร์เกอร์", "ซูชิ", "ส้มตำ", "ชาบู", "ไข่ดาว", "ต้มยำกุ้ง", "หมูกระทะ"] },
        { name: "อาชีพ", words: ["หมอ", "ตำรวจ", "ครู", "สตรีมเมอร์", "นักกีฬา E-sports", "โปรแกรมเมอร์"] }
    ],
    valo: [
        { name: "ในเกม Valorant", words: ["สไปค์", "ปืน Vandal", "มีด", "สไนเปอร์ Operator", "หุ่นบอทในห้องซ้อม", "โดรนของ Sova", "ป้อมปืน Killjoy", "กำแพง Sage"] },
        { name: "อุปกรณ์เกมเมอร์", words: ["เมาส์", "คีย์บอร์ดเรืองแสง", "หูฟังแมว", "เก้าอี้เกมมิ่ง", "ไมโครโฟน", "หน้าจอคอม"] }
    ]
};

const matchTheBlankData = {
    general: ["ข้าว ___", "น้ำ ___", "รัก ___", "เพื่อน ___", "คน ___", "รถ ___", "ใจ ___", "___ บอด", "หู ___", "หน้า ___", "หัว ___"],
    valo: ["แบก ___", "ยิง ___", "___ ร้อน", "แร้งค์ ___", "___ แตก", "ไอรอน ___", "เรเดียนต์ ___", "แฟลช ___", "สโมค ___", "ดัก ___", "___ หลัง", "___ ทิพย์"]
};

const uniqueClueData = {
    general: ['ไดโนเสาร์', 'แวมไพร์', 'ซอมบี้', 'แม่มด', 'มนุษย์ต่างดาว', 'หุ่นยนต์', 'พีระมิด', 'กำแพงเมืองจีน', 'แผ่นดินไหว', 'พายุ', 'น้ำท่วม', 'ภูเขาไฟ', 'ช็อกโกแลต', 'ไอศกรีม', 'โทรทัศน์', 'ตู้เย็น', 'แผนที่', 'เข็มทิศ', 'โจรสลัด', 'สมบัติ', 'นินจา', 'เอเลี่ยน', 'อวกาศ', 'ดาวเคราะห์'],
    valo: ['สไนเปอร์', 'สไปค์', 'สโมค', 'แร้งค์', 'แฮกเกอร์', 'ดิสคอร์ด', 'สตรีมเมอร์', 'คีย์บอร์ด']
};

const truthOrLieData = {
    general: ["ความลับที่คนในกลุ่มยังไม่รู้", "เรื่องโกหกที่เคยเนียนพูด", "ความสามารถพิเศษแปลกๆ ที่ไม่มีใครรู้", "ของสะสมที่แปลกที่สุดในบ้าน", "เรื่องเข้าใจผิดที่ฝังใจมานาน", "เรื่องตลกตอนเด็กๆ"],
    valo: ["วีรกรรมสุดบ้ง/แจกแต้ม ในเกม", "ข้ออ้างตอนตายที่ใช้บ่อยที่สุด", "เรื่องน่าอายที่สุดตอนเล่นเกมกับเพื่อน", "เหตุการณ์หัวร้อนจนเกือบพังข้าวของ", "อุบัติเหตุหรือเรื่องเจ็บตัวเพราะเล่นเกม"]
};

// --- Bluff Overthrow Data ---
const bluffData = {
    deck: ['sniper','sniper','sniper','assassin','assassin','assassin','hacker','hacker','hacker','spy','spy','spy','healer','healer','healer'],
    roleNames: { 'sniper': '🔫 สไนเปอร์', 'assassin': '🔪 นักฆ่า', 'hacker': '💻 แฮกเกอร์', 'spy': '🕶️ สายลับ', 'healer': '💉 หมอ' }
};

const rooms = {};

// --- Helper Functions ---
function findRoomBySocketId(socketId) {
    return Object.keys(rooms).find(roomCode => rooms[roomCode] && rooms[roomCode].players.some(p => p.id === socketId));
}

function broadcastScores(roomCode) {
    if(rooms[roomCode]) {
        io.to(roomCode).emit('updateScores', rooms[roomCode].players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score })));
    }
}

function systemChat(roomCode, msg) {
    io.to(roomCode).emit('receiveChat', { sender: 'ระบบเกม', avatar: '🤖', message: msg, senderId: 'system' });
}

function getGameData(dataset, packType) {
    if (packType === 'general') return [...dataset.general];
    if (packType === 'valo') return [...dataset.valo];
    return [...dataset.general, ...dataset.valo]; // mixed เป็นค่า default
}

function syncGameStateToPlayer(socket, room) {
    if (!room || !room.game || room.gameState !== 'playing') return;
    const g = room.game;
    const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }));
    
    if (room.gameType === 'word-guess') {
        socket.emit('wordGuess_updateState', g);
    } else if (room.gameType === 'number-sort') {
        const player = room.players.find(p => p.id === socket.id);
        if(player && g.theme) socket.emit('numberSort_newRound', { theme: g.theme, number: player.number, players: pList });
    } else if (room.gameType === 'friend-quiz') {
        if (g.phase === 'betting') socket.emit('friendQuiz_startBetting', { secretPlayer: g.secretPlayer, ranges: g.ranges });
        else if (g.question) socket.emit('friendQuiz_newRound', { question: g.question, players: pList });
    } else if (room.gameType === 'secret-painter') {
        if (g.category) {
             const info = g.playerInfo[socket.id];
             if(info) {
                 socket.emit('secretPainter_newRound', {
                    category: g.category, word: info.isSecretPainter ? null : g.word,
                    isSecretPainter: info.isSecretPainter, myColor: info.color,
                    turnOrderNames: g.turnOrder.map(id => { const pt = room.players.find(pl => pl.id === id); return pt ? pt.name : '?'; }),
                    currentTurnId: g.turnOrder[g.currentTurnIndex],
                    currentTurnName: room.players.find(pl => pl.id === g.turnOrder[g.currentTurnIndex])?.name || '?',
                    currentTurnAvatar: room.players.find(pl => pl.id === g.turnOrder[g.currentTurnIndex])?.avatar || '👤'
                 });
             }
        }
    } else if (room.gameType === 'match-the-blank') {
        if (g.prompt) socket.emit('matchTheBlank_newRound', { prompt: g.prompt, players: pList });
    } else if (room.gameType === 'unique-clue') {
         if (g.phase === 'clue_giving') {
              const guesser = room.players.find(p => p.id === g.guesserId);
              socket.emit('uniqueClue_newRound', { guesser: guesser, word: g.word, players: pList });
         } else if (g.phase === 'guessing') {
              socket.emit('uniqueClue_startGuessing', { validClues: g.validClues, playerClues: g.playerClues });
         }
    } else if (room.gameType === 'truth-or-lie') {
         if (g.phase === 'answering') {
             socket.emit('truthOrLie_newRound', { prompt: g.prompt, players: pList });
         } else if (g.phase === 'voting') {
             const activePlayer = room.players.find(p => p.id === g.turnOrder[g.activePlayerIndex]);
             const activeAnswers = g.answers[activePlayer.id];
             if(activePlayer && activeAnswers) socket.emit('truthOrLie_startVoting', { activePlayer, optionA: activeAnswers.optionA, optionB: activeAnswers.optionB });
         }
    } else if (room.gameType === 'bluff-overthrow') {
         syncBluffState(roomCode, socket.id);
    }
}

// --- Main Socket Logic ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- RECONNECT LOGIC ---
    socket.on('rejoinRoom', ({ roomCode, playerId, playerName, avatar }) => {
        let room = rooms[roomCode];
        if (!room) {
            rooms[roomCode] = { gameType: null, players: [], gameState: 'waiting', game: {} };
            room = rooms[roomCode];
        }

        let player = room.players.find(p => p.playerId === playerId);
        if (player) {
            const oldId = player.id;
            player.id = socket.id;
            player.isOnline = true;
            player.name = playerName;
            player.avatar = avatar;
            
            if (room.gameType === 'bluff-overthrow' && room.game && room.game.players) {
                if (room.game.players[oldId]) {
                    room.game.players[socket.id] = room.game.players[oldId];
                    room.game.players[socket.id].id = socket.id;
                    delete room.game.players[oldId];
                }
                const turnIdx = room.game.turnOrder ? room.game.turnOrder.indexOf(oldId) : -1;
                if(turnIdx !== -1) room.game.turnOrder[turnIdx] = socket.id;

                if (room.game.pendingAction) {
                    if (room.game.pendingAction.source === oldId) room.game.pendingAction.source = socket.id;
                    if (room.game.pendingAction.target === oldId) room.game.pendingAction.target = socket.id;
                }
                if (room.game.pendingBlock && room.game.pendingBlock.source === oldId) {
                    room.game.pendingBlock.source = socket.id;
                }
                if (room.game.playerLosingCard === oldId) room.game.playerLosingCard = socket.id;

                if (room.game.responses && room.game.responses[oldId]) {
                    room.game.responses[socket.id] = room.game.responses[oldId];
                    delete room.game.responses[oldId];
                }
            }
        } else {
            if (room.players.length < 16) {
                player = { id: socket.id, playerId, name: playerName, avatar: avatar || '👤', score: 0, isOnline: true };
                room.players.push(player);
            } else {
                return socket.emit('error', 'ห้องเต็มแล้ว');
            }
        }
        
        socket.join(roomCode);
        socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
        
        if (room.gameState === 'playing') {
            socket.emit('gameStarted', { gameType: room.gameType });
            syncGameStateToPlayer(socket, room);
        }
        
        io.to(roomCode).emit('updateLobby', room.players);
        broadcastScores(roomCode);
    });

    socket.on('disconnect', () => {
        let foundRoomCode = null; let foundPlayer = null;
        for (const code in rooms) {
            const player = rooms[code].players.find(p => p.id === socket.id);
            if (player) { foundRoomCode = code; foundPlayer = player; break; }
        }

        if (foundRoomCode && foundPlayer) {
            foundPlayer.isOnline = false;
            io.to(foundRoomCode).emit('updateLobby', rooms[foundRoomCode].players);
            
            setTimeout(() => {
                const room = rooms[foundRoomCode];
                if (room) {
                    const p = room.players.find(p => p.playerId === foundPlayer.playerId);
                    if (p && !p.isOnline) {
                        if (room.gameState === 'waiting') {
                            room.players = room.players.filter(pl => pl.playerId !== foundPlayer.playerId);
                            if (room.players.length === 0) delete rooms[foundRoomCode];
                            else {
                                io.to(foundRoomCode).emit('updateLobby', room.players);
                                broadcastScores(foundRoomCode);
                            }
                        }
                    }
                    if (room && room.players.length > 0) {
                        if (room.players.every(pl => !pl.isOnline)) delete rooms[foundRoomCode];
                    }
                }
            }, 10000); 
        }
    });

    socket.on('sendChat', (message) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode]) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if (player) io.to(roomCode).emit('receiveChat', { sender: player.name, avatar: player.avatar, message: message.trim(), senderId: player.id });
        }
    });

    socket.on('sendReaction', ({ emoji }) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode]) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if (player) io.to(roomCode).emit('receiveReaction', { emoji, senderName: player.name, avatar: player.avatar });
        }
    });

    socket.on('createRoom', ({ playerName, avatar, playerId }) => {
        let roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        while (rooms[roomCode]) roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomCode] = { gameType: null, players: [{ id: socket.id, playerId, name: playerName, avatar: avatar || '👤', score: 0, isOnline: true }], gameState: 'waiting', game: {} };
        socket.join(roomCode); socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ playerName, avatar, roomCode, playerId }) => {
        const room = rooms[roomCode];
        if (room && room.players.length < 16 && room.gameState === 'waiting') {
            const existingPlayer = room.players.find(p => p.playerId === playerId);
            if(existingPlayer) {
                existingPlayer.id = socket.id; existingPlayer.isOnline = true; existingPlayer.name = playerName; existingPlayer.avatar = avatar;
            } else {
                room.players.push({ id: socket.id, playerId, name: playerName, avatar: avatar || '👤', score: 0, isOnline: true });
            }
            socket.join(roomCode);
            socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
            io.to(roomCode).emit('updateLobby', room.players);
            broadcastScores(roomCode);
        } else {
            socket.emit('error', 'ไม่สามารถเข้าร่วมห้องได้ (ห้องอาจเต็ม, รหัสผิด, หรือเกมเริ่มไปแล้ว)');
        }
    });

    socket.on('host_selectGame', (gameType) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            rooms[roomCode].gameType = gameType; io.to(roomCode).emit('gameSelected', gameType);
        }
    });
    
    socket.on('startGame', (data) => {
        const roomCode = typeof data === 'string' ? data : data.roomCode;
        const pack = data.pack || 'mixed';
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id && room.gameType) {
            room.gameState = 'playing'; io.to(roomCode).emit('gameStarted', { gameType: room.gameType, pack });
        }
    });

    socket.on('returnToLobby', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            room.gameState = 'waiting'; room.gameType = null; room.game = {};
            io.to(roomCode).emit('backToLobby', room.players);
        }
    });

    socket.on('host_gameLogicStart', (data) => {
        const roomCode = typeof data === 'string' ? data : data.roomCode;
        const pack = data.pack || 'mixed';
        const room = rooms[roomCode];
        if (room && room.players.length > 0 && room.players[0].id === socket.id) {
            try {
                if (room.gameType === 'word-guess') {
                    if (room.players.length >= 2 && room.players.length <= 2) startWordGuessCoopGame(roomCode, pack);
                    else startWordGuessTeamGame(roomCode, pack);
                } else if (room.gameType === 'number-sort') startNumberSortRound(roomCode, pack);
                else if (room.gameType === 'friend-quiz') startFriendQuizRound(roomCode, pack);
                else if (room.gameType === 'secret-painter') startSecretPainterRound(roomCode, pack);
                else if (room.gameType === 'match-the-blank') startMatchTheBlankRound(roomCode, pack);
                else if (room.gameType === 'unique-clue') startUniqueClueRound(roomCode, pack);
                else if (room.gameType === 'truth-or-lie') startTruthOrLieRound(roomCode, pack);
                else if (room.gameType === 'bluff-overthrow') startBluffRound(roomCode);
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });

    // ==========================================
    // BLUFF OVERTHROW LOGIC (COUP)
    // ==========================================
    function startBluffRound(roomCode) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 2) {
            io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 2 คน');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }

        let deck = [...bluffData.deck];
        deck.sort(() => Math.random() - 0.5);

        const playersStatus = {};
        const turnOrder = [];
        room.players.forEach(p => {
            playersStatus[p.id] = { id: p.id, coins: 2, cards: [{ role: deck.pop(), dead: false }, { role: deck.pop(), dead: false }], isEliminated: false };
            turnOrder.push(p.id);
        });

        room.game = { deck, players: playersStatus, turnOrder, currentTurnIndex: 0, phase: 'action', pendingAction: null, pendingBlock: null, responses: {}, playerLosingCard: null, afterLoseCard: null };
        io.to(roomCode).emit('bluff_newRound');
        syncBluffState(roomCode);
    }

    function syncBluffState(roomCode, targetSocketId = null) {
        const room = rooms[roomCode];
        if (!room) return;
        const g = room.game;
        
        const globalState = {
            phase: g.phase, currentTurnId: g.turnOrder[g.currentTurnIndex],
            pendingAction: g.pendingAction, pendingBlock: g.pendingBlock, playerLosingCard: g.playerLosingCard,
            playersStatus: room.players.map(p => {
                const ps = g.players[p.id];
                if(!ps) return null;
                const deadCards = ps.cards.filter(c => c.dead).map(c => c.role);
                return { id: p.id, name: p.name, avatar: p.avatar, coins: ps.coins, cardsCount: ps.cards.filter(c => !c.dead).length, deadCards, isEliminated: ps.isEliminated };
            }).filter(p=>p!==null)
        };

        if (targetSocketId) {
            const myState = g.players[targetSocketId];
            if(myState) io.to(targetSocketId).emit('coup_updateState', { myState, globalState });
        } else {
            room.players.forEach(p => {
                const myState = g.players[p.id];
                if(myState) io.to(p.id).emit('coup_updateState', { myState, globalState });
            });
        }
    }

    function advanceBluffTurn(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.phase = 'action'; g.pendingAction = null; g.pendingBlock = null; g.responses = {}; g.playerLosingCard = null; g.afterLoseCard = null;
        
        if (checkBluffGameOver(roomCode)) return;

        let safety = 0;
        do {
            g.currentTurnIndex = (g.currentTurnIndex + 1) % g.turnOrder.length;
            safety++;
        } while (g.players[g.turnOrder[g.currentTurnIndex]].isEliminated && safety < g.turnOrder.length);

        syncBluffState(roomCode);
    }

    function getClaimForAction(type) {
        if(type === 'tax') return 'sniper';
        if(type === 'assassinate') return 'assassin';
        if(type === 'steal') return 'hacker';
        if(type === 'exchange') return 'spy';
        return null;
    }

    function getActionText(type, targetId, room) {
        const targetName = targetId ? room.players.find(p=>p.id===targetId).name : '';
        if(type==='foreign_aid') return 'รับเงินสนับสนุน (+2 เครดิต)';
        if(type==='tax') return 'เก็บภาษี (สไนเปอร์ +3 เครดิต)';
        if(type==='assassinate') return `ลอบสังหาร (นักฆ่า ฆ่า ${targetName})`;
        if(type==='steal') return `ขโมยเงิน (แฮกเกอร์ ปล้น ${targetName})`;
        if(type==='exchange') return 'เปลี่ยนไพ่ (สายลับ)';
        return '';
    }

    function handleChallenge(roomCode, challengerId, claimedId, claimRole, successCb, failCb) {
        const room = rooms[roomCode]; const g = room.game;
        const challengerName = room.players.find(p=>p.id===challengerId).name;
        const claimedName = room.players.find(p=>p.id===claimedId).name;
        
        systemChat(roomCode, `🚨 ${challengerName} ขอจับโกหก ${claimedName} ว่าเป็น ${bluffData.roleNames[claimRole]} จริงหรือมั่ว!`);

        const p = g.players[claimedId];
        const hasCard = p.cards.some(c => !c.dead && c.role === claimRole);

        if (hasCard) {
            systemChat(roomCode, `✔️ ${claimedName} โชว์ไพ่ ${bluffData.roleNames[claimRole]}! (ของจริง)`);
            const cardIdx = p.cards.findIndex(c => !c.dead && c.role === claimRole);
            g.deck.push(p.cards[cardIdx].role);
            g.deck.sort(() => Math.random() - 0.5);
            p.cards[cardIdx].role = g.deck.pop();

            systemChat(roomCode, `💀 ${challengerName} จับผิดพลาด! ต้องเสีย 1 ชีวิต`);
            g.phase = 'lose_card'; g.playerLosingCard = challengerId; g.afterLoseCard = successCb;
            syncBluffState(roomCode);
        } else {
            systemChat(roomCode, `❌ ${claimedName} โดนจับโป๊ะ! (ไม่มีไพ่) แอคชันถูกยกเลิก`);
            g.phase = 'lose_card'; g.playerLosingCard = claimedId; g.afterLoseCard = failCb;
            syncBluffState(roomCode);
        }
    }

    function resolveAction(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        const p = g.players[g.pendingAction.source];
        const type = g.pendingAction.type;
        const tId = g.pendingAction.target;

        if (type === 'foreign_aid') { p.coins += 2; systemChat(roomCode, `💰 รับเงินสนับสนุนสำเร็จ (+2)`); advanceBluffTurn(roomCode); }
        else if (type === 'tax') { p.coins += 3; systemChat(roomCode, `🔫 สไนเปอร์เก็บภาษีสำเร็จ (+3)`); advanceBluffTurn(roomCode); }
        else if (type === 'steal') {
            const target = g.players[tId];
            const amount = Math.min(2, target.coins);
            target.coins -= amount; p.coins += amount;
            systemChat(roomCode, `💻 แฮกเกอร์ขโมย ${amount} เครดิต สำเร็จ!`);
            advanceBluffTurn(roomCode);
        }
        else if (type === 'assassinate') {
            systemChat(roomCode, `🔪 นักฆ่าลงมือสำเร็จ!`);
            g.phase = 'lose_card'; g.playerLosingCard = tId; g.afterLoseCard = () => advanceBluffTurn(roomCode);
            syncBluffState(roomCode);
        }
        else if (type === 'exchange') {
            const newCards = [g.deck.pop(), g.deck.pop()];
            const aliveCards = p.cards.filter(c => !c.dead).map(c => c.role);
            const totalCards = [...aliveCards, ...newCards];
            io.to(p.id).emit('bluff_exchange_start', { cards: totalCards, requiredKeep: aliveCards.length });
            g.phase = 'exchange';
            systemChat(roomCode, `🕶️ สายลับกำลังเลือกเปลี่ยนไพ่...`);
            syncBluffState(roomCode);
        }
    }

    function checkReactionsComplete(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        const alivePlayers = Object.values(g.players).filter(p => !p.isEliminated);
        
        let requiredResponses = alivePlayers.length - 1; 
        if (g.phase === 'block_reaction' || g.phase === 'block_challenge_reaction') requiredResponses = alivePlayers.length - 1;

        if (Object.keys(g.responses).length >= requiredResponses) {
            if (g.phase === 'reaction') resolveAction(roomCode);
            else if (g.phase === 'block_reaction' || g.phase === 'block_challenge_reaction') {
                systemChat(roomCode, `🛡️ บล็อกสำเร็จ! แอคชันถูกยกเลิก`);
                advanceBluffTurn(roomCode);
            }
        }
    }

    function checkBluffGameOver(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        const alive = Object.values(g.players).filter(p => !p.isEliminated);
        if (alive.length === 1) {
            const winner = room.players.find(p=>p.id===alive[0].id);
            winner.score += 5;
            systemChat(roomCode, `🏆 จบเกม! ${winner.name} เป็นผู้ชนะ! (เหลือรอดคนสุดท้าย)`);
            broadcastScores(roomCode);
            room.gameState = 'waiting';
            setTimeout(() => io.to(roomCode).emit('backToLobby', room.players), 5000);
            return true;
        }
        return false;
    }

    socket.on('bluff_action', ({ type, targetId }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'action') return;
            if (room.game.turnOrder[room.game.currentTurnIndex] !== socket.id) return;

            const player = room.game.players[socket.id];
            const g = room.game;
            const pName = room.players.find(p=>p.id===socket.id).name;

            if (type === 'coup' && player.coins < 7) return socket.emit('error', 'เครดิตไม่พอสำหรับโค่นอำนาจ');
            if (type === 'assassinate' && player.coins < 3) return socket.emit('error', 'เครดิตไม่พอสำหรับจ้างนักฆ่า');
            if (player.coins >= 10 && type !== 'coup') return socket.emit('error', 'เครดิตถึง 10 แล้ว บังคับโค่นอำนาจ!');

            g.pendingAction = { type, source: socket.id, target: targetId, claim: getClaimForAction(type) };
            g.responses = {};

            if (type === 'income') {
                player.coins += 1; systemChat(roomCode, `${pName} รับรายได้ (+1 เครดิต)`);
                advanceBluffTurn(roomCode);
            } else if (type === 'coup') {
                player.coins -= 7; systemChat(roomCode, `💥 ${pName} โค่นอำนาจ ใส่ ${room.players.find(p=>p.id===targetId).name}!`);
                g.phase = 'lose_card'; g.playerLosingCard = targetId; g.afterLoseCard = () => advanceBluffTurn(roomCode);
                syncBluffState(roomCode);
            } else {
                if (type === 'assassinate') player.coins -= 3;
                g.phase = 'reaction';
                const actionText = getActionText(type, targetId, room);
                systemChat(roomCode, `⚡ ${pName} ต้องการ: ${actionText}`);
                syncBluffState(roomCode);
            }
        } catch (e) { console.error(e); }
    });

    socket.on('bluff_react', ({ response, claimRole }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow') return;
            const g = room.game;
            if (g.players[socket.id].isEliminated) return;

            if (g.phase === 'reaction') {
                if (response === 'challenge') {
                    handleChallenge(roomCode, socket.id, g.pendingAction.source, g.pendingAction.claim, 
                        () => { 
                            if (g.pendingAction.type === 'foreign_aid') { g.players[g.pendingAction.source].coins += 2; advanceBluffTurn(roomCode); } 
                            else { g.phase = 'block_reaction'; g.responses = {}; syncBluffState(roomCode); }
                        },
                        () => advanceBluffTurn(roomCode) 
                    );
                } else if (response === 'block') {
                    g.pendingBlock = { source: socket.id, claim: claimRole };
                    g.phase = 'block_challenge_reaction'; g.responses = {};
                    systemChat(roomCode, `🛡️ ${room.players.find(p=>p.id===socket.id).name} บล็อกด้วย ${bluffData.roleNames[claimRole]}`);
                    syncBluffState(roomCode);
                } else {
                    g.responses[socket.id] = 'pass'; checkReactionsComplete(roomCode);
                }
            } else if (g.phase === 'block_reaction' || g.phase === 'block_challenge_reaction') {
                if (response === 'challenge') {
                    handleChallenge(roomCode, socket.id, g.pendingBlock.source, g.pendingBlock.claim,
                        () => advanceBluffTurn(roomCode), () => resolveAction(roomCode) 
                    );
                } else {
                    g.responses[socket.id] = 'pass'; checkReactionsComplete(roomCode);
                }
            }
        } catch (e) { console.error(e); }
    });

    socket.on('bluff_loseCard', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'lose_card') return;
        if (socket.id !== room.game.playerLosingCard) return;

        const p = room.game.players[socket.id];
        if (!p.cards[cardIndex] || p.cards[cardIndex].dead) return;

        p.cards[cardIndex].dead = true;
        const pName = room.players.find(x=>x.id===socket.id).name;
        systemChat(roomCode, `💀 ${pName} ทิ้งไพ่ ${bluffData.roleNames[p.cards[cardIndex].role]}`);

        if (p.cards.every(c => c.dead)) {
            p.isEliminated = true;
            systemChat(roomCode, `❌ ${pName} ถูกคัดออกจากเกมแล้ว!`);
        }

        if (g.afterLoseCard) { const cb = g.afterLoseCard; g.afterLoseCard = null; cb(); }
        else advanceBluffTurn(roomCode);
    });

    socket.on('bluff_exchange', ({ keepIndices }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'exchange') return;
        if (socket.id !== room.game.pendingAction.source) return;

        systemChat(roomCode, `🕶️ สายลับเปลี่ยนไพ่เสร็จสิ้น`);
        advanceBluffTurn(roomCode);
    });


    // ==========================================
    // TRUTH OR LIE LOGIC
    // ==========================================
    function startTruthOrLieRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 3) {
            io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }

        const dataPack = getGameData(truthOrLieData, pack);
        const prompt = dataPack[Math.floor(Math.random() * dataPack.length)];
        
        let turnOrder = room.players.map(p => p.id);
        turnOrder.sort(() => Math.random() - 0.5);

        room.game = { prompt, answers: {}, turnOrder, activePlayerIndex: 0, phase: 'answering', votes: {} };
        io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนแต่งเรื่อง...' });
        io.to(roomCode).emit('truthOrLie_newRound', { prompt });
    }

    socket.on('truthOrLie_submitAnswer', ({ truth, lie }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.game.phase !== 'answering') return;

        const options = Math.random() > 0.5 ? { A: truth, B: lie, lieOption: 'B' } : { A: lie, B: truth, lieOption: 'A' };
        room.game.answers[socket.id] = { truth, lie, optionA: options.A, optionB: options.B, lieOption: options.lieOption };

        const answeredCount = Object.keys(room.game.answers).length;
        io.to(roomCode).emit('updateProgress', { current: answeredCount, total: room.players.length, text: 'รอเพื่อนแต่งเรื่อง...' });

        if (answeredCount === room.players.length) {
            room.game.phase = 'voting'; room.game.activePlayerIndex = 0; room.game.votes = {};
            const activePlayer = room.players.find(p => p.id === room.game.turnOrder[0]);
            const activeAnswers = room.game.answers[activePlayer.id];
            
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('truthOrLie_startVoting', { activePlayer, optionA: activeAnswers.optionA, optionB: activeAnswers.optionB });
        }
    });

    socket.on('truthOrLie_submitVote', ({ vote }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.game.phase !== 'voting') return;
        
        const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
        if (socket.id === activePlayerId) return;

        room.game.votes[socket.id] = vote;
        const votedCount = Object.keys(room.game.votes).length;
        io.to(roomCode).emit('updateProgress', { current: votedCount, total: room.players.length - 1, text: 'รอเพื่อนโหวต...' });

        if (votedCount === room.players.length - 1) {
            const activeAnswers = room.game.answers[activePlayerId];
            const activePlayerObj = room.players.find(p => p.id === activePlayerId);
            let fooledCount = 0;
            const voteDetails = [];

            for (const [voterId, v] of Object.entries(room.game.votes)) {
                const voter = room.players.find(p => p.id === voterId);
                if (v !== activeAnswers.lieOption) {
                    fooledCount++; activePlayerObj.score += 1;
                } else {
                    voter.score += 1;
                }
                voteDetails.push({ name: voter.name, avatar: voter.avatar, vote: v });
            }

            if (fooledCount === room.players.length - 1 && fooledCount > 0) activePlayerObj.score += 2;

            broadcastScores(roomCode);
            io.to(roomCode).emit('truthOrLie_showVoteResult', {
                activePlayer: activePlayerObj, truth: activeAnswers.truth, lie: activeAnswers.lie,
                lieOption: activeAnswers.lieOption, fooledCount, totalVoters: room.players.length - 1, voteDetails
            });
        }
    });

    socket.on('truthOrLie_nextPlayer', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.players[0].id !== socket.id) return;

        room.game.activePlayerIndex++;
        if (room.game.activePlayerIndex < room.turnOrder.length) {
            room.game.votes = {};
            const activePlayer = room.players.find(p => p.id === room.game.turnOrder[room.game.activePlayerIndex]);
            const activeAnswers = room.game.answers[activePlayer.id];
            io.to(roomCode).emit('truthOrLie_startVoting', { activePlayer, optionA: activeAnswers.optionA, optionB: activeAnswers.optionB });
        } else {
            io.to(roomCode).emit('truthOrLie_endRound', { players: room.players });
        }
    });

    socket.on('truthOrLie_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startTruthOrLieRound(roomCode, 'mixed');
    });


    // ==========================================
    // UNIQUE CLUE LOGIC
    // ==========================================
    function startUniqueClueRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 3) {
            io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }
        
        const dataPack = getGameData(uniqueClueData, pack);
        const word = dataPack[Math.floor(Math.random() * dataPack.length)];
        const guesserIndex = Math.floor(Math.random() * room.players.length);
        const guesserId = room.players[guesserIndex].id;

        room.game = { word, guesserId, phase: 'clue_giving', clues: {} };
        const guesser = room.players.find(p => p.id === guesserId);
        
        io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length - 1, text: 'รอเพื่อนส่งคำใบ้...' });
        io.to(roomCode).emit('uniqueClue_newRound', { guesser, word });
    }

    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue' || room.game.phase !== 'clue_giving') return;
        if (socket.id === room.game.guesserId) return;

        room.game.clues[socket.id] = clue.trim().toLowerCase();
        const clueCount = Object.keys(room.game.clues).length;
        io.to(roomCode).emit('updateProgress', { current: clueCount, total: room.players.length - 1, text: 'รอเพื่อนส่งคำใบ้...' });

        if (clueCount === room.players.length - 1) {
            room.game.phase = 'guessing';
            
            const clueFrequency = {};
            for (const c of Object.values(room.game.clues)) {
                clueFrequency[c] = (clueFrequency[c] || 0) + 1;
            }

            const validClues = [];
            const playerClues = [];

            for (const [playerId, c] of Object.entries(room.game.clues)) {
                const player = room.players.find(p => p.id === playerId);
                const isValid = clueFrequency[c] === 1;
                if (isValid) validClues.push(c);
                playerClues.push({ playerId, playerName: player.name, playerAvatar: player.avatar, clue: c, isValid });
            }

            room.game.validClues = validClues;
            room.game.playerClues = playerClues;

            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('uniqueClue_startGuessing', { validClues, playerClues });
        }
    });

    socket.on('uniqueClue_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue' || room.game.phase !== 'guessing') return;
        if (socket.id !== room.game.guesserId) return;

        const isCorrect = guess.trim().toLowerCase() === room.game.word.toLowerCase();
        
        if (isCorrect) {
            const guesser = room.players.find(p => p.id === socket.id);
            guesser.score += 2;
            room.game.playerClues.forEach(pc => {
                if (pc.isValid) {
                    const p = room.players.find(player => player.id === pc.playerId);
                    if (p) p.score += 1;
                }
            });
            broadcastScores(roomCode);
        }

        io.to(roomCode).emit('uniqueClue_showResult', { isCorrect, word: room.game.word, guess, playerClues: room.game.playerClues });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startUniqueClueRound(roomCode, 'mixed');
    });


    // ==========================================
    // SECRET PAINTER LOGIC
    // ==========================================
    function startSecretPainterRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 3) {
            io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }

        const dataPack = getGameData(secretPainterData, pack);
        const categoryObj = dataPack[Math.floor(Math.random() * dataPack.length)];
        const word = categoryObj.words[Math.floor(Math.random() * categoryObj.words.length)];
        
        let turnOrder = room.players.map(p => p.id);
        turnOrder.sort(() => Math.random() - 0.5);
        
        const secretPainterIndex = Math.floor(Math.random() * turnOrder.length);
        const secretPainterId = turnOrder[secretPainterIndex];

        const colors = ['#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000', '#aaffc3'];
        colors.sort(() => Math.random() - 0.5);

        const playerInfo = {};
        turnOrder.forEach((id, index) => {
            playerInfo[id] = { color: colors[index % colors.length], isSecretPainter: (id === secretPainterId) };
        });

        room.game = { category: categoryObj.name, word, turnOrder, secretPainterId, playerInfo, currentTurnIndex: 0, currentRound: 1, maxRounds: 2, linesDrawn: 0, votes: {} };

        room.players.forEach(p => {
            const info = playerInfo[p.id];
            io.to(p.id).emit('secretPainter_newRound', {
                category: categoryObj.name, word: info.isSecretPainter ? null : word,
                isSecretPainter: info.isSecretPainter, myColor: info.color,
                turnOrderNames: turnOrder.map(id => room.players.find(pl => pl.id === id).name),
                currentTurnId: turnOrder[0], currentTurnName: room.players.find(pl => pl.id === turnOrder[0]).name,
                currentTurnAvatar: room.players.find(pl => pl.id === turnOrder[0]).avatar
            });
        });
    }

    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'secret-painter' && room.game.turnOrder[room.game.currentTurnIndex] === socket.id) {
            socket.to(roomCode).emit('secretPainter_onDraw', data);
        }
    });

    socket.on('secretPainter_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter' || room.game.turnOrder[room.game.currentTurnIndex] !== socket.id) return;

        room.game.currentTurnIndex++;
        if (room.game.currentTurnIndex >= room.game.turnOrder.length) {
            room.game.currentTurnIndex = 0; room.game.currentRound++;
        }

        if (room.game.currentRound > room.game.maxRounds) {
            io.to(roomCode).emit('secretPainter_startVoting', { players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, color: room.game.playerInfo[p.id].color })) });
        } else {
            const nextId = room.game.turnOrder[room.game.currentTurnIndex];
            const nextP = room.players.find(p => p.id === nextId);
            io.to(roomCode).emit('secretPainter_updateTurn', { currentTurnId: nextId, currentTurnName: nextP.name, currentTurnAvatar: nextP.avatar, round: room.game.currentRound });
        }
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;

        room.game.votes[socket.id] = votedId;
        if (Object.keys(room.game.votes).length === room.players.length) {
            const voteCounts = {};
            Object.values(room.game.votes).forEach(id => { voteCounts[id] = (voteCounts[id] || 0) + 1; });
            
            let maxVotes = 0; let votedOutIds = [];
            for (const [id, count] of Object.entries(voteCounts)) {
                if (count > maxVotes) { maxVotes = count; votedOutIds = [id]; }
                else if (count === maxVotes) { votedOutIds.push(id); }
            }

            const isPainterCaught = votedOutIds.length === 1 && votedOutIds[0] === room.game.secretPainterId;
            const sp = room.players.find(p => p.id === room.game.secretPainterId);

            const voteResultData = {};
            for(const id in voteCounts) { voteResultData[room.players.find(p=>p.id===id).name] = voteCounts[id]; }

            io.to(roomCode).emit('secretPainter_reveal', {
                votes: voteResultData, isPainterCaught,
                secretPainterId: sp.id, secretPainterName: sp.name, secretPainterAvatar: sp.avatar
            });

            if (!isPainterCaught) {
                sp.score += 3; broadcastScores(roomCode);
                setTimeout(() => secretPainter_checkGameOver(roomCode, false), 3000);
            }
        }
    });

    socket.on('secretPainter_submitGuess', ({ guessWord }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter' || socket.id !== room.game.secretPainterId) return;
        
        const isCorrect = guessWord.trim().toLowerCase() === room.game.word.toLowerCase();
        secretPainter_checkGameOver(roomCode, isCorrect);
    });

    function secretPainter_checkGameOver(roomCode, isPainterCorrect) {
        const room = rooms[roomCode]; if (!room) return;
        if (isPainterCorrect) {
            const sp = room.players.find(p => p.id === room.game.secretPainterId);
            if(sp) sp.score += 3;
        } else {
            room.players.forEach(p => { if (p.id !== room.game.secretPainterId) p.score += 1; });
        }
        broadcastScores(roomCode);
        io.to(roomCode).emit('secretPainter_gameOver', { isCorrect: isPainterCorrect, actualWord: room.game.word });
    }

    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startSecretPainterRound(roomCode, 'mixed');
    });

    // ==========================================
    // MATCH THE BLANK LOGIC
    // ==========================================
    function startMatchTheBlankRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 2) {
            io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }
        
        const dataPack = getGameData(matchTheBlankData, pack);
        const prompt = dataPack[Math.floor(Math.random() * dataPack.length)];

        room.game = { prompt: prompt, answers: {} };
        io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });
        io.to(roomCode).emit('matchTheBlank_newRound', { prompt });
    }

    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'match-the-blank') return;

        room.game.answers[socket.id] = answer.trim().toLowerCase();
        const answeredCount = Object.keys(room.game.answers).length;
        
        io.to(roomCode).emit('updateProgress', { current: answeredCount, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });

        if (answeredCount === room.players.length) {
            const wordCounts = {};
            for (const w of Object.values(room.game.answers)) { wordCounts[w] = (wordCounts[w] || 0) + 1; }

            const results = [];
            for (const [pId, word] of Object.entries(room.game.answers)) {
                const player = room.players.find(p => p.id === pId);
                let points = 0;
                if (wordCounts[word] === 2) points = 3;
                else if (wordCounts[word] > 2) points = 1;

                player.score += points;
                results.push({ id: pId, name: player.name, avatar: player.avatar, word, points });
            }
            
            broadcastScores(roomCode);
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('matchTheBlank_showResult', { results });
        }
    });

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startMatchTheBlankRound(roomCode, 'mixed');
    });

    // ==========================================
    // FRIEND QUIZ LOGIC
    // ==========================================
    function startFriendQuizRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 2) {
            io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }
        
        const dataPack = getGameData(friendQuizData, pack);
        const question = dataPack[Math.floor(Math.random() * dataPack.length)];

        room.game = { question, answers: {}, phase: 'answering', secretPlayerId: null, ranges: [], bets: {} };
        io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });
        io.to(roomCode).emit('friendQuiz_newRound', { question });
    }

    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz' || room.game.phase !== 'answering') return;

        room.game.answers[socket.id] = answer;
        const answeredCount = Object.keys(room.game.answers).length;
        io.to(roomCode).emit('updateProgress', { current: answeredCount, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });

        if (answeredCount === room.players.length) {
            room.game.phase = 'betting';
            const pIds = Object.keys(room.game.answers);
            room.game.secretPlayerId = pIds[Math.floor(Math.random() * pIds.length)];
            const secretPlayer = room.players.find(p => p.id === room.game.secretPlayerId);
            
            const revealedPlayers = room.players.filter(p => p.id !== room.game.secretPlayerId).map(p => ({ id: p.id, answer: room.game.answers[p.id] })).sort((a,b) => a.answer - b.answer);
            
            const ranges = [];
            if (revealedPlayers.length > 0) {
                ranges.push({ label: `< ${revealedPlayers[0].answer}`, min: -Infinity, max: revealedPlayers[0].answer - 1 });
                for(let i=0; i<revealedPlayers.length - 1; i++) {
                    const curr = revealedPlayers[i]; const next = revealedPlayers[i+1];
                    if (curr.answer === next.answer) continue;
                    ranges.push({ label: `${curr.answer} - ${next.answer - 1}`, min: curr.answer, max: next.answer - 1 });
                }
                ranges.push({ label: `≥ ${revealedPlayers[revealedPlayers.length - 1].answer}`, min: revealedPlayers[revealedPlayers.length - 1].answer, max: Infinity });
            } else {
                ranges.push({ label: `ทายยากเลยสิ! (มีแค่ 2 คน)`, min: -Infinity, max: Infinity });
            }

            const uniqueRanges = ranges.filter((r, i, s) => i === s.findIndex(t => t.label === r.label));
            room.game.ranges = uniqueRanges;
            
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('friendQuiz_startBetting', { secretPlayer: { id: secretPlayer.id, name: secretPlayer.name, avatar: secretPlayer.avatar }, ranges: uniqueRanges });
        }
    });

    function findQuizCorrectRangeIndex(secretAnswer, ranges) {
        return ranges.findIndex(r => secretAnswer >= r.min && secretAnswer <= r.max);
    }

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz' || room.game.phase !== 'betting') return;
        if (socket.id === room.game.secretPlayerId) return;

        room.game.bets[socket.id] = betOnRangeIndex;
        const betsCount = Object.keys(room.game.bets).length;
        io.to(roomCode).emit('updateProgress', { current: betsCount, total: room.players.length - 1, text: 'รอเพื่อนโหวต...' });

        if (betsCount === room.players.length - 1) {
            const secretAnswer = room.game.answers[room.game.secretPlayerId];
            const correctIndex = findQuizCorrectRangeIndex(secretAnswer, room.game.ranges);
            
            const winners = [];
            for (const [pId, betIdx] of Object.entries(room.game.bets)) {
                if (betIdx === correctIndex) { winners.push(pId); const p = room.players.find(x=>x.id===pId); if(p) p.score += 2; }
            }

            const allPlayersData = room.players.map(p => ({
                id: p.id, name: p.name, avatar: p.avatar, answer: room.game.answers[p.id], isSecret: p.id === room.game.secretPlayerId
            }));

            broadcastScores(roomCode);
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('friendQuiz_showResult', { allPlayers: allPlayersData, correctRangeIndex: correctIndex, winners });
        }
    });

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startFriendQuizRound(roomCode, 'mixed');
    });

    // ==========================================
    // NUMBER SORT LOGIC
    // ==========================================
    function startNumberSortRound(roomCode, pack) {
        const room = rooms[roomCode];
        if (!room || room.players.length < 2) {
            io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
            room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
        }

        const dataPack = getGameData(numberSortData, pack);
        const theme = dataPack[Math.floor(Math.random() * dataPack.length)];
        
        room.game = { theme, playerNumbers: {} };
        const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));

        room.players.forEach(p => {
            const num = Math.floor(Math.random() * 100) + 1;
            room.game.playerNumbers[p.id] = num;
            io.to(p.id).emit('numberSort_newRound', { theme, number: num, players: pList });
        });
    }

    socket.on('numberSort_submitOrder', ({ orderedPlayerIds }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'number-sort' || room.players[0].id !== socket.id) return;

        let success = true;
        let lastNum = -1;
        orderedPlayerIds.forEach(id => {
            const num = room.game.playerNumbers[id];
            if (num < lastNum) success = false;
            lastNum = num;
        });

        if (success) { room.players.forEach(p => p.score += 2); broadcastScores(roomCode); }

        const results = orderedPlayerIds.map(id => {
            const p = room.players.find(x=>x.id===id);
            return { id, name: p.name, avatar: p.avatar, number: room.game.playerNumbers[id] };
        });

        io.to(roomCode).emit('numberSort_showResults', { results, success });
    });

    socket.on('numberSort_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startNumberSortRound(roomCode, 'mixed');
    });

    // ==========================================
    // WORD GUESS LOGIC
    // ==========================================
    function generateWordGuessBoard(pack) {
        const dataPack = getGameData(wordGuessData, pack);
        const shuffledWords = [...dataPack].sort(() => 0.5 - Math.random()).slice(0, 25);
        return shuffledWords.map(word => ({ word, type: 'neutral', revealed: false }));
    }

    function startWordGuessTeamGame(roomCode, pack) {
        const room = rooms[roomCode];
        const board = generateWordGuessBoard(pack);
        let types = Array(9).fill('red').concat(Array(8).fill('blue')).concat(Array(7).fill('neutral')).concat(['assassin']);
        types.sort(() => 0.5 - Math.random());
        board.forEach((card, i) => card.type = types[i]);

        room.game = {
            isCoop: false, board, turn: 'red', clue: null, guessesLeft: 0,
            teams: { red: { players: [], spymaster: null, score: 9 }, blue: { players: [], spymaster: null, score: 8 } },
            players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, team: null, isSpymaster: false }))
        };
        syncGameStateToPlayer(null, room);
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
    }

    function startWordGuessCoopGame(roomCode, pack) {
        const room = rooms[roomCode];
        const board = generateWordGuessBoard(pack);
        let types = Array(15).fill('green').concat(Array(9).fill('neutral')).concat(['assassin']);
        types.sort(() => 0.5 - Math.random());
        board.forEach((card, i) => card.type = types[i]);

        room.game = {
            isCoop: true, board, turnsLeft: 9, wordsFound: 0, wordsToFind: 15, clue: null, guessesLeft: 0,
            players: room.players.map((p, i) => ({ id: p.id, name: p.name, avatar: p.avatar, team: 'coop', isSpymaster: i === 0 }))
        };
        syncGameStateToPlayer(null, room);
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
    }

    function checkWordGuessWinCondition(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        if (g.isCoop) {
            if (g.wordsFound === g.wordsToFind) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'players', reason: 'หาเจอครบแล้ว!', isCoop: true }); return true; }
            if (g.turnsLeft <= 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'none', reason: 'หมดเทิร์นแล้ว!', isCoop: true }); return true; }
        } else {
            if (g.teams.red.score === 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'red', reason: 'หาการ์ดเจอครบ', isCoop: false }); return true; }
            if (g.teams.blue.score === 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'blue', reason: 'หาการ์ดเจอครบ', isCoop: false }); return true; }
        }
        return false;
    }

    socket.on('wordGuess_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess' || room.game.isCoop) return;
        
        const player = room.game.players.find(p => p.id === socket.id);
        if (player.team) room.game.teams[player.team].players = room.game.teams[player.team].players.filter(id => id !== socket.id);
        player.team = team; player.isSpymaster = false;
        room.game.teams[team].players.push(socket.id);
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
    });

    socket.on('wordGuess_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess' || room.game.isCoop) return;
        
        const player = room.game.players.find(p => p.id === socket.id);
        if (player.team === team) {
            room.game.teams[team].spymaster = socket.id;
            room.game.players.forEach(p => { if (p.team === team) p.isSpymaster = (p.id === socket.id); });
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
        }
    });

    socket.on('wordGuess_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        
        const player = room.game.players.find(p => p.id === socket.id);
        if (player.isSpymaster) {
            room.game.clue = { word, number };
            room.game.guessesLeft = number + 1;
            systemChat(roomCode, `📢 Spymaster ให้คำใบ้: "${word}" จำนวน ${number} คำ`);
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
        }
    });

    socket.on('wordGuess_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        
        const g = room.game;
        const player = g.players.find(p => p.id === socket.id);
        if (player.isSpymaster || !g.clue || g.guessesLeft <= 0) return;
        if (!g.isCoop && player.team !== g.turn) return;

        const card = g.board[cardIndex];
        if (card.revealed) return;

        card.revealed = true;
        g.guessesLeft--;

        systemChat(roomCode, `👆 ${player.name} เปิดไพ่: "${card.word}"`);

        if (card.type === 'assassin') {
            const winner = g.isCoop ? 'none' : (g.turn === 'red' ? 'blue' : 'red');
            io.to(roomCode).emit('wordGuess_gameOver', { winner, reason: 'เปิดเจอไพ่มือสังหาร! 💀', isCoop: g.isCoop });
            return;
        }

        if (g.isCoop) {
            if (card.type === 'green') g.wordsFound++;
            else { g.turnsLeft--; g.guessesLeft = 0; g.clue = null; }
        } else {
            if (card.type === g.turn) { g.teams[g.turn].score--; }
            else {
                if (card.type === 'red' || card.type === 'blue') g.teams[card.type].score--;
                g.guessesLeft = 0; g.clue = null; g.turn = g.turn === 'red' ? 'blue' : 'red';
            }
        }

        if (!checkWordGuessWinCondition(roomCode)) {
            if (g.guessesLeft === 0 && g.isCoop) {
                const spymaster = g.players.find(p=>p.isSpymaster); const guesser = g.players.find(p=>!p.isSpymaster);
                spymaster.isSpymaster = false; guesser.isSpymaster = true;
            }
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
        }
    });

    socket.on('wordGuess_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        
        const g = room.game;
        if (g.isCoop) {
            g.turnsLeft--; g.guessesLeft = 0; g.clue = null;
            if (!checkWordGuessWinCondition(roomCode)) {
                const spymaster = g.players.find(p=>p.isSpymaster); const guesser = g.players.find(p=>!p.isSpymaster);
                spymaster.isSpymaster = false; guesser.isSpymaster = true;
                room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
            }
        } else {
            g.guessesLeft = 0; g.clue = null; g.turn = g.turn === 'red' ? 'blue' : 'red';
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room));
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});