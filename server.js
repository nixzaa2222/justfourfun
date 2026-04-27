const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000 // ให้เวลาเน็ตหลุด 60 วินาทีก่อนตัดขาด
});

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
        'โรงแรม', 'ร้านอาหาร', 'เก้าอี้', 'โต๊ะ', 'เตียง', 'หน้าต่าง', 'ประตู', 'แม่น้ำ', 'สะพาน', 'ถนน',
        'ตู้เย็น', 'พัดลม', 'กระทะ', 'หม้อ', 'กรรไกร', 'ยางลบ', 'นาฬิกา', 'แว่นตา', 'สบู่', 'แชมพู',
        'ผ้าเช็ดตัว', 'หมอน', 'ผ้าห่ม', 'กระเป๋า', 'รองเท้า', 'ถุงเท้า', 'เสื้อยืด', 'กางเกง', 'กระโปรง', 'หมวก',
        'กุญแจ', 'ร่ม', 'เงิน', 'ทอง', 'เพชร', 'แหวน', 'สร้อย', 'กำไล', 'นาฬิกาข้อมือ', 'กระเป๋าตังค์',
        'เมาส์', 'คีย์บอร์ด', 'ลำโพง', 'หูฟัง', 'กระจก', 'แปรงสีฟัน', 'ยาสีฟัน', 'ไม้กวาด', 'ถังขยะ', 'กระถางต้นไม้'
    ]
};
const numberSortData = {
    themes: [
        "ความนิยมของสัตว์เลี้ยง", "ของที่คิดว่าแพงที่สุด", "ความสามารถพิเศษที่อยากมี",
        "ตัวละครที่แข็งแกร่งที่สุด", "อาหารที่เผ็ดที่สุด", "สถานที่ที่อยากไปมากที่สุด",
        "ระดับความน่ากลัวของผี", "ความอร่อยของเมนูไข่", "ความลำบากในการตื่นตอนเช้า",
        "ระดับความขี้เกียจของตัวเอง", "ความเจ็บปวดตอนอกหัก", "ระดับความร้อนของประเทศไทย",
        "ความน่ารักของแมว", "ความหัวร้อนเวลาเล่นเกมแพ้", "ระดับความหิวตอนดึก",
        "ความอยากรวย", "ความกลัวแมลงสาบ", "ความอยากไปเที่ยวทะเล", "ระดับความติ่งดารา"
    ]
};
const friendQuizData = {
    questions: [
        "คุณมีรองเท้ากี่คู่?", "คุณใช้เวลาอาบน้ำโดยเฉลี่ยกี่นาที?", "คุณดื่มกาแฟ/ชา วันละกี่แก้ว?",
        "คุณนอนวันละกี่ชั่วโมง?", "คุณคิดว่าคุณจะอายุยืนกี่ปี?",
        "เดือนนึงคุณกินชาบู/หมูกระทะกี่ครั้ง?", "คุณให้คะแนนหน้าตาตัวเองเท่าไหร่ (1-100)?",
        "คุณมีเงินสดติดกระเป๋าตอนนี้กี่บาท?", "สัปดาห์นึงคุณออกกำลังกายกี่ชั่วโมง?",
        "คุณตื่นนอนกี่โมง (ใส่เป็นตัวเลขเช่น 730 คือ 7:30 น.)?", "คุณเคยร้องไห้ดูหนังเศร้ามากี่เรื่อง?",
        "คุณไปเที่ยวต่างจังหวัดปีละกี่ครั้ง?", "คุณมีเสื้อยืดในตู้กี่ตัว?", "คุณให้คะแนนความโสดของตัวเองเท่าไหร่ (1-100)?"
    ]
};
const secretPainterData = {
    categories: [
        { name: "สัตว์ป่า", words: ["ช้าง", "สิงโต", "ยีราฟ", "ลิง", "เสือ", "งู", "หมี", "จระเข้", "นกฮูก"] },
        { name: "อาหาร", words: ["พิซซ่า", "แฮมเบอร์เกอร์", "ซูชิ", "ส้มตำ", "ชาบู", "ไข่ดาว", "ต้มยำกุ้ง", "ผัดไทย"] },
        { name: "สถานที่", words: ["โรงพยาบาล", "โรงเรียน", "ชายหาด", "สวนสนุก", "ภูเขา", "สนามบิน", "ตลาดนัด", "วัด"] },
        { name: "อาชีพ", words: ["หมอ", "ตำรวจ", "ครู", "นักดับเพลิง", "ทหาร", "นักร้อง", "โปรแกรมเมอร์", "ช่างภาพ"] },
        { name: "ยานพาหนะ", words: ["รถไฟ", "เครื่องบิน", "เรือ", "จักรยาน", "รถมอเตอร์ไซค์", "รถถัง", "เฮลิคอปเตอร์"] },
        { name: "ของหวาน", words: ["เค้ก", "โดนัท", "ไอศกรีม", "ช็อกโกแลต", "เยลลี่", "บิงซู", "แพนเค้ก", "คุกกี้"] }
    ],
    colors: [
        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
        '#6366f1', '#84cc16', '#eab308', '#d946ef', '#06b6d4', '#64748b', '#78350f', '#0f766e'
    ]
};
const matchTheBlankData = {
    prompts: [
        "___ ย่าง", "น้ำ ___", "รัก ___", "___ สีทอง", "ผัด ___", "ไข่ ___", "เสื้อ ___", "___ กระโดด",
        "ข้าว ___", "ทะเล ___", "___ ใจ", "ใจ ___", "___ รถ", "ไฟ ___", "___ บิน", "หมู ___",
        "___ หมา", "แมว ___", "เพื่อน ___", "___ ทิพย์", "คน ___", "รถ ___", "___ บ้าน", "___ แดง"
    ]
};
const uniqueClueData = {
    words: [
        'ไดโนเสาร์', 'แวมไพร์', 'ซอมบี้', 'แม่มด', 'นางเงือก', 'มนุษย์ต่างดาว', 'ผีดิบ', 'หุ่นยนต์',
        'พีระมิด', 'กำแพงเมืองจีน', 'หอไอเฟล', 'เทพเจ้า', 'มังกร', 'ยูนิคอร์น', 'กุหลาบ', 'ดอกทานตะวัน',
        'ช็อกโกแลต', 'ไอศกรีม', 'เค้ก', 'คุกกี้', 'โทรทัศน์', 'ตู้เย็น', 'ไมโครเวฟ', 'แว่นขยาย',
        'แผนที่', 'เข็มทิศ', 'สมอเรือ', 'โจรสลัด', 'สมบัติ', 'นินจา', 'เอเลี่ยน', 'อวกาศ', 'ดาวเคราะห์'
    ]
};
const truthOrLieData = {
    prompts: [
        "วีรกรรมสุดแสบสมัยเด็ก",
        "อาหารที่แปลกที่สุดที่เคยกิน",
        "เรื่องน่าอายที่สุดในชีวิต",
        "ความลับที่เพื่อนในกลุ่ม(อาจจะ)ยังไม่รู้",
        "อุบัติเหตุหรือเหตุการณ์เฉียดตาย",
        "สถานที่ที่เคยไปสร้างวีรกรรมโป๊ะแตก",
        "ของที่เคยแอบขโมย (หรือเกือบขโมย)",
        "เรื่องโกหกที่เคยแต่งขึ้นแล้วเนียนที่สุด",
        "ความสามารถพิเศษแปลกๆ ที่ไม่มีใครรู้",
        "เรื่องเข้าใจผิดที่ฝังใจมานาน"
    ]
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

// ฟังก์ชันสำหรับส่งข้อมูลเกมให้ผู้เล่นที่เพิ่งกด Refresh (Reconnect)
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
    }
}


// --- Main Socket Logic ---
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // --- RECONNECT LOGIC ---
    socket.on('rejoinRoom', ({ roomCode, playerId, playerName, avatar }) => {
        const room = rooms[roomCode];
        if (room) {
            let player = room.players.find(p => p.playerId === playerId);
            if (player) {
                player.id = socket.id; // อัปเดต socket id เป็นอันใหม่
                player.isOnline = true;
                player.name = playerName; // อัปเดตชื่อเผื่อแก้
                player.avatar = avatar;
            } else {
                // ถ้าโดนเตะไปแล้ว ให้เข้าใหม่
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
                socket.emit('gameStarted', room.gameType);
                syncGameStateToPlayer(socket, room); // ซิงค์ข้อมูลเกมที่ค้างอยู่
            }
            
            io.to(roomCode).emit('updateLobby', room.players);
            broadcastScores(roomCode);
        } else {
            socket.emit('clearSession'); // บอก Client ว่าห้องโดนยุบไปแล้ว
        }
    });

    socket.on('disconnect', () => {
        let foundRoomCode = null;
        let foundPlayer = null;
        
        for (const code in rooms) {
            const player = rooms[code].players.find(p => p.id === socket.id);
            if (player) {
                foundRoomCode = code;
                foundPlayer = player;
                break;
            }
        }

        if (foundRoomCode && foundPlayer) {
            foundPlayer.isOnline = false;
            io.to(foundRoomCode).emit('updateLobby', rooms[foundRoomCode].players);
            
            // รอ 10 วิเผื่อรีเฟรชกลับมา ถ้าไม่กลับมาค่อยลบออกเฉพาะตอนอยู่ Lobby
            setTimeout(() => {
                const room = rooms[foundRoomCode];
                if (room) {
                    const p = room.players.find(p => p.playerId === foundPlayer.playerId);
                    if (p && !p.isOnline) {
                        if (room.gameState === 'waiting') {
                            room.players = room.players.filter(pl => pl.playerId !== foundPlayer.playerId);
                            if (room.players.length === 0) {
                                delete rooms[foundRoomCode];
                            } else {
                                io.to(foundRoomCode).emit('updateLobby', room.players);
                                broadcastScores(foundRoomCode);
                            }
                        }
                    }
                }
            }, 10000); 
        }
    });

    // --- Room Chat & Reactions ---
    socket.on('sendChat', (message) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                io.to(roomCode).emit('receiveChat', { sender: player.name, avatar: player.avatar, message: message.trim(), senderId: player.id });
            }
        }
    });

    socket.on('sendReaction', ({ emoji }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room) {
            const player = room.players.find(p => p.id === socket.id);
            if (player) {
                io.to(roomCode).emit('receiveReaction', { emoji, senderName: player.name, avatar: player.avatar });
            }
        }
    });

    socket.on('createRoom', ({ playerName, avatar, playerId }) => {
        let roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        while (rooms[roomCode]) { roomCode = Math.random().toString(36).substring(2, 6).toUpperCase(); }
        
        rooms[roomCode] = {
            gameType: null, 
            players: [{ id: socket.id, playerId: playerId, name: playerName, avatar: avatar || '👤', score: 0, isOnline: true }],
            gameState: 'waiting',
            game: {}, 
        };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ playerName, avatar, roomCode, playerId }) => {
        const room = rooms[roomCode];
        if (room && room.players.length < 16 && room.gameState === 'waiting') {
            // เช็คว่าเคยมีชื่อนี้ไหม
            const existingPlayer = room.players.find(p => p.playerId === playerId);
            if(existingPlayer) {
                existingPlayer.id = socket.id;
                existingPlayer.isOnline = true;
                existingPlayer.name = playerName;
                existingPlayer.avatar = avatar;
            } else {
                room.players.push({ id: socket.id, playerId: playerId, name: playerName, avatar: avatar || '👤', score: 0, isOnline: true });
            }
            
            socket.join(roomCode);
            socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
            io.to(roomCode).emit('updateLobby', room.players);
            broadcastScores(roomCode);
        } else {
            socket.emit('error', 'ไม่สามารถเข้าร่วมห้องได้ (ห้องอาจเต็ม, รหัสผิด, หรือเกมเริ่มไปแล้ว)');
        }
    });

    // หัวหน้าห้องเลือกเกมจาก Lobby
    socket.on('host_selectGame', (gameType) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            room.gameType = gameType;
            io.to(roomCode).emit('gameSelected', gameType);
        }
    });
    
    socket.on('startGame', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id && room.gameType) {
            room.gameState = 'playing';
            io.to(roomCode).emit('gameStarted', room.gameType);
        }
    });

    // ระบบกลับสู่ Lobby
    socket.on('returnToLobby', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            room.gameState = 'waiting';
            room.gameType = null;
            room.game = {};
            io.to(roomCode).emit('backToLobby', room.players);
        }
    });

    socket.on('host_gameLogicStart', (roomCode) => {
        const room = rooms[roomCode];
        if (room && room.players.length > 0 && room.players[0].id === socket.id) {
            try {
                if (room.gameType === 'word-guess') {
                    if (room.players.length >= 2 && room.players.length <= 2) {
                        startWordGuessCoopGame(roomCode);
                    } else {
                        startWordGuessTeamGame(roomCode);
                    }
                } else if (room.gameType === 'number-sort') {
                    startNumberSortRound(roomCode);
                } else if (room.gameType === 'friend-quiz') {
                    startFriendQuizRound(roomCode);
                } else if (room.gameType === 'secret-painter') {
                    startSecretPainterRound(roomCode);
                } else if (room.gameType === 'match-the-blank') {
                    startMatchTheBlankRound(roomCode);
                } else if (room.gameType === 'unique-clue') {
                    startUniqueClueRound(roomCode);
                } else if (room.gameType === 'truth-or-lie') {
                    startTruthOrLieRound(roomCode);
                }
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });

    // ==========================================
    // ALL GAME LISTENERS
    // ==========================================

    // --- Truth or Lie Listeners ---
    socket.on('truthOrLie_submitAnswer', ({ truth, lie }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'truth-or-lie' || room.game.phase !== 'answering') return;

        const isTruthA = Math.random() > 0.5;
        const optionA = isTruthA ? truth : lie;
        const optionB = isTruthA ? lie : truth;
        const lieOption = isTruthA ? 'B' : 'A';

        room.game.answers[socket.id] = { truth: truth.trim(), lie: lie.trim(), optionA: optionA.trim(), optionB: optionB.trim(), lieOption: lieOption };

        const submittedCount = Object.keys(room.game.answers).length;
        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: room.players.length, text: 'รอเพื่อนแต่งเรื่อง...' });

        if (submittedCount === room.players.length) startTruthOrLieVoting(roomCode);
    });

    socket.on('truthOrLie_submitVote', ({ vote }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'truth-or-lie' || room.game.phase !== 'voting') return;

        const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
        if (socket.id === activePlayerId) return;

        room.game.votes[socket.id] = vote;

        const votersCount = room.players.length - 1;
        const submittedCount = Object.keys(room.game.votes).length;
        
        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: votersCount, text: 'รอเพื่อนจับผิด...' });

        if (submittedCount === votersCount) truthOrLie_revealVote(roomCode);
    });

    socket.on('truthOrLie_nextPlayer', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id && room.gameType === 'truth-or-lie') {
            room.game.activePlayerIndex++;
            if (room.game.activePlayerIndex < room.players.length) {
                startTruthOrLieVoting(roomCode);
            } else {
                room.game.phase = 'summary';
                io.to(roomCode).emit('truthOrLie_endRound', { players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score })) });
            }
        }
    });

    socket.on('truthOrLie_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startTruthOrLieRound(roomCode);
    });

    // --- Unique Clue Listeners ---
    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'unique-clue' || room.game.phase !== 'clue_giving') return;
        if (socket.id === room.game.guesserId) return;

        room.game.clues[socket.id] = clue.trim();
        const clueGiversCount = room.players.length - 1;
        const submittedCount = Object.keys(room.game.clues).length;

        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: clueGiversCount, text: 'รอเพื่อนเขียนคำใบ้...' });

        if (submittedCount === clueGiversCount) {
            const clueCounts = {};
            Object.values(room.game.clues).forEach(c => {
                const normalized = c.toLowerCase();
                clueCounts[normalized] = (clueCounts[normalized] || 0) + 1;
            });

            const validClues = [];
            const playerClues = [];

            for (const [pId, c] of Object.entries(room.game.clues)) {
                const normalized = c.toLowerCase();
                const player = room.players.find(p => p.id === pId);
                const isDuplicate = clueCounts[normalized] > 1;

                playerClues.push({ playerId: pId, playerName: player.name, playerAvatar: player.avatar, clue: c, isValid: !isDuplicate });
                if (!isDuplicate) validClues.push(c);
            }

            room.game.phase = 'guessing';
            room.game.validClues = validClues;
            room.game.playerClues = playerClues;
            
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('uniqueClue_startGuessing', { validClues, playerClues });
        }
    });

    socket.on('uniqueClue_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'unique-clue' || room.game.phase !== 'guessing') return;
        if (socket.id !== room.game.guesserId) return;

        const isCorrect = guess.trim().toLowerCase() === room.game.word.toLowerCase();
        
        if (isCorrect) {
            const guesser = room.players.find(p => p.id === socket.id);
            if (guesser) guesser.score += 2;
            room.game.playerClues.forEach(pc => {
                if (pc.isValid) {
                    const giver = room.players.find(p => p.id === pc.playerId);
                    if (giver) giver.score += 1;
                }
            });
            broadcastScores(roomCode);
        }
        
        room.game.phase = 'result';
        io.to(roomCode).emit('uniqueClue_showResult', {
            isCorrect, word: room.game.word, guess: guess.trim(),
            playerClues: room.game.playerClues,
            players: room.players.map(p => ({id: p.id, name: p.name, avatar: p.avatar, score: p.score}))
        });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startUniqueClueRound(roomCode);
    });

    // --- Match The Blank Listeners ---
    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'match-the-blank') return;

        room.game.answers[socket.id] = answer.trim();
        const submittedCount = Object.keys(room.game.answers).length;
        
        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });

        if (submittedCount === room.players.length) {
            const wordCounts = {};
            const playerWords = {};
            room.players.forEach(p => {
                const w = room.game.answers[p.id];
                playerWords[p.id] = w;
                wordCounts[w] = (wordCounts[w] || 0) + 1;
            });

            const results = [];
            room.players.forEach(p => {
                const w = playerWords[p.id];
                let pointsEarned = 0;
                if (wordCounts[w] === 2) pointsEarned = 3;
                else if (wordCounts[w] > 2) pointsEarned = 1;
                
                p.score += pointsEarned;
                results.push({ id: p.id, name: p.name, avatar: p.avatar, word: w, points: pointsEarned, totalScore: p.score });
            });

            broadcastScores(roomCode);
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('matchTheBlank_showResult', { results });
        }
    });

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startMatchTheBlankRound(roomCode);
    });

    // --- Secret Painter Listeners ---
    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) socket.to(roomCode).emit('secretPainter_onDraw', data);
    });

    socket.on('secretPainter_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'secret-painter') return;

        const game = room.game;
        if (game.turnOrder[game.currentTurnIndex] !== socket.id) return;

        game.currentTurnIndex++;

        if (game.currentTurnIndex >= game.turnOrder.length) {
            game.currentTurnIndex = 0;
            game.round++;
            
            if (game.round > 2) {
                game.phase = 'voting';
                io.to(roomCode).emit('secretPainter_startVoting', { 
                    players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, color: game.playerInfo[p.id].color }))
                });
                return;
            }
        }

        const nextPlayerId = game.turnOrder[game.currentTurnIndex];
        const nextPlayer = room.players.find(p => p.id === nextPlayerId);
        
        io.to(roomCode).emit('secretPainter_updateTurn', {
            currentTurnId: nextPlayerId, currentTurnName: nextPlayer.name,
            currentTurnAvatar: nextPlayer.avatar, round: game.round
        });
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.phase !== 'voting') return;

        room.game.votes[socket.id] = votedId;
        const submittedCount = Object.keys(room.game.votes).length;

        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: room.players.length, text: 'รอเพื่อนโหวตจับผิด...' });

        if (submittedCount === room.players.length) {
            room.game.phase = 'reveal';
            const voteCounts = {};
            Object.values(room.game.votes).forEach(id => { voteCounts[id] = (voteCounts[id] || 0) + 1; });

            let maxVotes = 0, mostVotedId = null, isTie = false;
            for (const [id, count] of Object.entries(voteCounts)) {
                if (count > maxVotes) { maxVotes = count; mostVotedId = id; isTie = false; }
                else if (count === maxVotes) isTie = true;
            }

            const secretPainter = room.players.find(p => p.id === room.game.secretPainterId);
            const isPainterCaught = (!isTie && mostVotedId === room.game.secretPainterId);

            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('secretPainter_reveal', {
                votes: voteCounts, secretPainterId: room.game.secretPainterId,
                secretPainterName: secretPainter.name, secretPainterAvatar: secretPainter.avatar,
                isPainterCaught: isPainterCaught
            });
        }
    });

    socket.on('secretPainter_submitGuess', ({ guessWord }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.phase !== 'reveal') return;
        if (socket.id !== room.game.secretPainterId) return;

        const isCorrect = guessWord.trim() === room.game.word;
        if (isCorrect) {
            const painter = room.players.find(p => p.id === room.game.secretPainterId);
            if (painter) painter.score += 5;
        } else {
            room.players.forEach(p => { if (p.id !== room.game.secretPainterId) p.score += 2; });
        }
        broadcastScores(roomCode);

        io.to(roomCode).emit('secretPainter_gameOver', {
            isCorrect: isCorrect, actualWord: room.game.word, category: room.game.category
        });
    });
    
    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startSecretPainterRound(roomCode);
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
                success = false; break;
            }
        }

        if (success) {
            room.players.forEach(p => p.score += 2);
            broadcastScores(roomCode);
        }

        const results = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, number: p.number }));
        io.to(roomCode).emit('numberSort_showResults', { results, success });
    });
    
    socket.on('numberSort_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startNumberSortRound(roomCode);
    });

    // --- Friend Quiz Listeners ---
    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) player.answer = answer;

        const submittedCount = room.players.filter(p => p.hasOwnProperty('answer')).length;
        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: room.players.length, text: 'รอเพื่อนตอบคำถาม...' });

        if (submittedCount === room.players.length) {
            const secretPlayerIndex = Math.floor(Math.random() * room.players.length);
            room.game.secretPlayerId = room.players[secretPlayerIndex].id;

            const revealedPlayers = room.players
                .filter(p => p.id !== room.game.secretPlayerId)
                .sort((a, b) => a.answer - b.answer);
            
            room.game.ranges = generateQuizBettingRanges(revealedPlayers);

            io.to(roomCode).emit('updateProgress', { hide: true }); 
            io.to(roomCode).emit('friendQuiz_startBetting', {
                secretPlayer: { id: room.game.secretPlayerId, name: room.players[secretPlayerIndex].name, avatar: room.players[secretPlayerIndex].avatar },
                ranges: room.game.ranges
            });
        }
    });

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        const player = room.players.find(p => p.id === socket.id);
        if (player && player.id !== room.game.secretPlayerId) player.bet = betOnRangeIndex;

        const bettingPlayers = room.players.filter(p => p.id !== room.game.secretPlayerId);
        const submittedCount = bettingPlayers.filter(p => p.hasOwnProperty('bet')).length;
        
        io.to(roomCode).emit('updateProgress', { current: submittedCount, total: bettingPlayers.length, text: 'รอเพื่อนโหวตทายใจ...' });

        if (submittedCount === bettingPlayers.length) {
            const secretPlayer = room.players.find(p => p.id === room.game.secretPlayerId);
            const secretAnswer = secretPlayer.answer;
            const correctRangeIndex = findQuizCorrectRangeIndex(secretAnswer, room.game.ranges);
            
            const winners = [];
            room.players.forEach(p => {
                if (p.bet === correctRangeIndex) {
                    p.score += 10; winners.push(p.id);
                }
            });

            broadcastScores(roomCode);
            io.to(roomCode).emit('updateProgress', { hide: true });
            io.to(roomCode).emit('friendQuiz_showResult', {
                allPlayers: room.players.map(p => ({
                    id: p.id, name: p.name, avatar: p.avatar, answer: p.answer, score: p.score, isSecret: p.id === secretPlayer.id
                })),
                correctRangeIndex, winners
            });
        }
    });

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startFriendQuizRound(roomCode);
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
                if (room.game.guessesLeft === 0) switchWordGuessTurn(roomCode);
            } else {
                switchWordGuessTurn(roomCode);
            }
        } else {
            if (player.team !== room.game.turn) return;
            if (card.type === 'assassin') {
                const winner = room.game.turn === 'red' ? 'blue' : 'red';
                io.to(roomCode).emit('wordGuess_gameOver', { winner, reason: 'ทีมของคุณเจอสายลับ!', isCoop: false });
                return;
            }
            if (card.type === room.game.turn) {
                room.game.guessesLeft--;
                room.game.teams[room.game.turn].score++;
                if (checkWordGuessWin(roomCode)) return;
                if (room.game.guessesLeft === 0) switchWordGuessTurn(roomCode);
            } else {
                if (card.type === 'red' || card.type === 'blue') room.game.teams[card.type].score++;
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

});

// ==========================================
// GAME LOGIC FUNCTIONS
// ==========================================

function startTruthOrLieRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'เกมนี้สนุกเมื่อเล่น 3 คนขึ้นไปครับ');
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    const promptIndex = Math.floor(Math.random() * truthOrLieData.prompts.length);
    const prompt = truthOrLieData.prompts[promptIndex];
    const turnOrder = [...room.players].sort(() => 0.5 - Math.random()).map(p => p.id);

    room.game = { phase: 'answering', prompt: prompt, answers: {}, votes: {}, turnOrder: turnOrder, activePlayerIndex: 0 };

    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('truthOrLie_newRound', {
        prompt: prompt, players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score }))
    });
}

function startTruthOrLieVoting(roomCode) {
    const room = rooms[roomCode];
    room.game.phase = 'voting';
    room.game.votes = {};

    const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
    const activePlayer = room.players.find(p => p.id === activePlayerId);
    const activeAnswers = room.game.answers[activePlayerId];

    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('truthOrLie_startVoting', {
        activePlayer: { id: activePlayer.id, name: activePlayer.name, avatar: activePlayer.avatar },
        optionA: activeAnswers.optionA, optionB: activeAnswers.optionB, playerCount: room.players.length
    });
}

function truthOrLie_revealVote(roomCode) {
    const room = rooms[roomCode];
    room.game.phase = 'reveal_vote';

    const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
    const activePlayer = room.players.find(p => p.id === activePlayerId);
    const activeAnswers = room.game.answers[activePlayerId];
    
    const lieOption = activeAnswers.lieOption; 
    let fooledCount = 0;
    const voteDetails = [];

    for (const [voterId, vote] of Object.entries(room.game.votes)) {
        const voter = room.players.find(p => p.id === voterId);
        if (!voter) continue;

        voteDetails.push({ name: voter.name, avatar: voter.avatar, vote: vote });
        if (vote !== lieOption) fooledCount++;
        else voter.score += 1;
    }

    activePlayer.score += fooledCount;
    if (fooledCount > 0 && fooledCount === (room.players.length - 1)) activePlayer.score += 2; 

    broadcastScores(roomCode);
    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('truthOrLie_showVoteResult', {
        activePlayer: { name: activePlayer.name, avatar: activePlayer.avatar },
        truth: activeAnswers.truth, lie: activeAnswers.lie, lieOption: lieOption,
        fooledCount: fooledCount, voteDetails: voteDetails, totalVoters: room.players.length - 1
    });
}

function startUniqueClueRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'เกมนี้สนุกเมื่อเล่น 3 คนขึ้นไปครับ');
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    const word = uniqueClueData.words[Math.floor(Math.random() * uniqueClueData.words.length)];
    const guesserIndex = Math.floor(Math.random() * room.players.length);
    const guesserId = room.players[guesserIndex].id;

    room.game = { phase: 'clue_giving', word: word, guesserId: guesserId, clues: {} };

    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('uniqueClue_newRound', {
        guesser: { id: guesserId, name: room.players[guesserIndex].name, avatar: room.players[guesserIndex].avatar },
        word: word, players: room.players.map(p => ({id: p.id, name: p.name, avatar: p.avatar, score: p.score}))
    });
}

function startSecretPainterRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    const catIndex = Math.floor(Math.random() * secretPainterData.categories.length);
    const categoryObj = secretPainterData.categories[catIndex];
    const wordIndex = Math.floor(Math.random() * categoryObj.words.length);
    const word = categoryObj.words[wordIndex];

    const secretPainterIndex = Math.floor(Math.random() * room.players.length);
    const secretPainterId = room.players[secretPainterIndex].id;

    const shuffledColors = [...secretPainterData.colors].sort(() => 0.5 - Math.random());
    const playerInfo = {}; const turnOrder = [];
    const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
    
    shuffledPlayers.forEach((p, index) => {
        playerInfo[p.id] = { color: shuffledColors[index % shuffledColors.length], isSecretPainter: p.id === secretPainterId };
        turnOrder.push(p.id);
    });

    room.game = {
        category: categoryObj.name, word: word, secretPainterId: secretPainterId, playerInfo: playerInfo,
        turnOrder: turnOrder, currentTurnIndex: 0, round: 1, votes: {}, phase: 'drawing'
    };

    io.to(roomCode).emit('updateProgress', { hide: true });
    room.players.forEach(p => {
        const info = playerInfo[p.id];
        io.to(p.id).emit('secretPainter_newRound', {
            category: categoryObj.name, word: info.isSecretPainter ? null : word, 
            isSecretPainter: info.isSecretPainter, myColor: info.color,
            turnOrderNames: turnOrder.map(id => room.players.find(player => player.id === id).name),
            currentTurnId: turnOrder[0], currentTurnName: room.players.find(player => player.id === turnOrder[0]).name,
            currentTurnAvatar: room.players.find(player => player.id === turnOrder[0]).avatar
        });
    });
}

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
        isCoop: false, board: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
        teams: {
            red: { players: [], spymaster: null, score: 0, goal: firstTurn === 'red' ? 9 : 8 },
            blue: { players: [], spymaster: null, score: 0, goal: firstTurn === 'blue' ? 9 : 8 }
        },
        turn: firstTurn, clue: {}, guessesLeft: 0, players: room.players
    };
    io.to(roomCode).emit('updateProgress', { hide: true });
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
    
    room.players.forEach((p, index) => { p.isSpymaster = (index === 0); });

    room.game = {
        isCoop: true, board: words.map((word, i) => ({ word, type: shuffledTypes[i], revealed: false })),
        wordsToFind: 15, wordsFound: 0, turnsLeft: 9, clue: {}, guessesLeft: 0, players: room.players
    };
    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('wordGuess_updateState', room.game);
}

function switchWordGuessTurn(roomCode) {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    room.game.clue = {}; room.game.guessesLeft = 0;

    if (room.game.isCoop) {
        room.game.turnsLeft--;
        if (room.game.turnsLeft < 0) {
            io.to(roomCode).emit('wordGuess_gameOver', { winner: 'game', reason: 'เทิร์นหมดแล้ว!', isCoop: true }); return;
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
        io.to(roomCode).emit('wordGuess_gameOver', { winner: 'red', reason: 'ทีมสีแดงหาคำศัพท์เจอครบแล้ว!', isCoop: false }); return true;
    }
    if (gameState.teams.blue.score >= gameState.teams.blue.goal) {
        io.to(roomCode).emit('wordGuess_gameOver', { winner: 'blue', reason: 'ทีมสีน้ำเงินหาคำศัพท์เจอครบแล้ว!', isCoop: false }); return true;
    }
    return false;
}

function startNumberSortRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    room.game = {};
    const themeIndex = Math.floor(Math.random() * numberSortData.themes.length);
    const theme = numberSortData.themes[themeIndex];
    const numbers = [];
    while (numbers.length < room.players.length) {
        const num = Math.floor(Math.random() * 100) + 1;
        if (!numbers.includes(num)) numbers.push(num);
    }
    
    io.to(roomCode).emit('updateProgress', { hide: true });
    room.players.forEach((player, index) => {
        player.number = numbers[index];
        io.to(player.id).emit('numberSort_newRound', {
            theme: theme, number: player.number, players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }))
        });
    });
}

function startFriendQuizRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    room.game = { secretPlayerId: null, ranges: [] };
    room.players.forEach(p => { delete p.answer; delete p.bet; });

    const question = friendQuizData.questions[Math.floor(Math.random() * friendQuizData.questions.length)];
    room.game.question = question;

    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('friendQuiz_newRound', { question, players: room.players.map(p => ({id: p.id, name: p.name, avatar: p.avatar, score: p.score})) });
}

function generateQuizBettingRanges(revealedPlayers) {
    const ranges = [];
    if (revealedPlayers.length === 0) {
        ranges.push({ label: 'ทายได้เลย!', min: -Infinity, max: Infinity }); return ranges;
    }
    revealedPlayers.sort((a,b) => a.answer - b.answer);
    ranges.push({ label: `< ${revealedPlayers[0].answer}`, min: -Infinity, max: revealedPlayers[0].answer - 1 });
    for (let i = 0; i < revealedPlayers.length; i++) {
        const current = revealedPlayers[i]; const next = revealedPlayers[i + 1];
        if (next) {
            if (current.answer === next.answer) continue; 
            ranges.push({ label: `${current.answer} - ${next.answer - 1}`, min: current.answer, max: next.answer - 1 });
        }
    }
    ranges.push({ label: `≥ ${revealedPlayers[revealedPlayers.length - 1].answer}`, min: revealedPlayers[revealedPlayers.length - 1].answer, max: Infinity });
    return ranges.filter((range, index, self) => index === self.findIndex((r) => (r.label === range.label)));
}

function findQuizCorrectRangeIndex(secretAnswer, ranges) {
    return ranges.findIndex(range => secretAnswer >= range.min && secretAnswer <= range.max);
}

function startMatchTheBlankRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    const promptIndex = Math.floor(Math.random() * matchTheBlankData.prompts.length);
    const prompt = matchTheBlankData.prompts[promptIndex];

    room.game = { prompt: prompt, answers: {} };

    io.to(roomCode).emit('updateProgress', { hide: true });
    io.to(roomCode).emit('matchTheBlank_newRound', { 
        prompt: prompt, players: room.players.map(p => ({id: p.id, name: p.name, avatar: p.avatar, score: p.score})) 
    });
}

// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});