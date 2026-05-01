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

// ==========================================
// GAME DATA 
// ==========================================
const whoAmIData = {
    general: [
        "ประยุทธ์", "ลุงตู่", "ชัชชาติ", "หนุ่ม กรรชัย", "พี่ตูน บอดี้สแลม", "ลิซ่า BLACKPINK", "หม่ำ จ๊กมก", "แจ๊ส ชวนชื่น", "โน้ต อุดม", "อีลอน มัสก์ (Elon Musk)", 
        "มาร์ก ซักเคอร์เบิร์ก", "มิสเตอร์บีส (MrBeast)", "แฮร์รี่ พอตเตอร์", "เจมส์ บอนด์", "แจ็ค สแปร์โรว์", "เทย์เลอร์ สวิฟต์", "จัสติน บีเบอร์", "คริสเตียโน โรนัลโด", "ลิโอเนล เมสซี",
        "โดราเอมอน", "ชินจัง", "โคนัน", "นารูโตะ", "ลูฟี่", "โงกุน", "สไปเดอร์แมน", "ไอรอนแมน", "กัปตันอเมริกา", "แบทแมน", "ธอร์", "ทานอส", "โจ๊กเกอร์",
        "มาริโอ้", "ปิกาจู", "สปองจ์บ็อบ", "มิกกี้ เมาส์", "บาร์บี้", "เอลซ่า", "ก๊อตซิลล่า", "คิงคอง"
    ],
    valo: ["Jett", "Reyna", "Raze", "Omen", "Phoenix", "Sage", "Killjoy", "Cypher", "Sova", "Viper", "Brimstone", "Breach", "Chamber", "Yoru", "Astra", "KAY/O", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"],
    marvel: ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Spider-Man", "Doctor Strange", "Black Panther", "Captain Marvel", "Ant-Man", "Wasp", "Star-Lord", "Scarlet Witch", "Vision", "Falcon", "Winter Soldier", "Loki", "Thanos", "Groot", "Rocket Raccoon", "Gamora", "Drax"],
    anime: ["Naruto", "Sasuke", "Sakura", "Kakashi", "Luffy", "Zoro", "Nami", "Sanji", "Goku", "Vegeta", "Gohan", "Piccolo", "Ichigo", "Rukia", "Orihime", "Uryu", "Edward Elric", "Alphonse Elric", "Light Yagami", "L", "Ryuk", "Levi", "Eren", "Mikasa", "Armin", "Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Saitama", "Deku", "Gojou"]
};

const spyfallData = {
    general: [
        "โรงพยาบาล", "สถานีตำรวจ", "โรงเรียน", "มหาวิทยาลัย", "ห้างสรรพสินค้า", "ตลาดสด", "สวนสาธารณะ", "สนามบิน", "สถานีรถไฟ", "ป้ายรถเมล์", 
        "ร้านอาหาร", "ร้านกาแฟ", "คาเฟ่", "ผับ/บาร์", "ร้านหนังสือ", "ห้องสมุด", "โรงภาพยนตร์", "โรงละคร", "พิพิธภัณฑ์", "หอศิลป์", 
        "สวนสัตว์", "สวนสนุก", "อควาเรียม", "ชายหาด", "ทะเล", "ภูเขา", "น้ำตก", "ถ้ำ", "ป่า", "วัด", "โบสถ์", "ศาลเจ้า", "มัสยิด", 
        "สุสาน", "ธนาคาร", "ที่ทำการไปรษณีย์", "สถานีดับเพลิง", "คลินิก", "ร้านขายยา", "ร้านทำผม", "ร้านตัดผม", "ร้านซักรีด", 
        "อู่ซ่อมรถ", "ปั๊มน้ำมัน", "สถานีบริการน้ำมัน", "โรงงาน", "บริษัท", "ออฟฟิศ", "สำนักงาน", "คอนโด", "อพาร์ทเม้นท์", "หมู่บ้าน", "ค่ายทหาร", "ยานอวกาศ", "เรือดำน้ำ", "เรือสำราญ", "คาสิโน", "สตูดิโอถ่ายทำ"
    ],
    valo: ["Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Lotus", "Pearl", "Fracture", "Sunset", "Abyss"],
    marvel: ["Stark Tower", "Asgard", "Wakanda", "Sanctum Sanctorum", "Avengers Compound", "S.H.I.E.L.D. Helicarrier", "X-Mansion", "Daily Bugle", "Baxter Building", "Oscorp", "Hell's Kitchen", "Knowhere", "Kyln", "Xandar", "Sakaar", "Ego", "Hala", "Titan", "Vormir", "Nidavellir", "Quantum Realm", "TVA"],
    anime: ["Konoha", "U.A. High School", "Soul Society", "Wano Country", "Marineford", "Dressrosa", "Shiganshina District", "Wall Rose", "Wall Maria", "Wall Sina", "Demon Slayer Corps Headquarters", "Infinity Castle", "Jujutsu High", "Tokyo", "Kyoto", "Osaka", "Hokkaido", "Okinawa", "Fukuoka"]
};

const wordGuessData = {
    general: ["แอปเปิ้ล", "กล้วย", "ส้ม", "องุ่น", "แตงโม", "สับปะรด", "สตรอเบอร์รี่", "มะม่วง", "มะละกอ", "ฝรั่ง", "หมา", "แมว", "นก", "ปลา", "หมู", "ไก่", "เป็ด", "ช้าง", "ม้า", "วัว", "แดง", "น้ำเงิน", "เหลือง", "เขียว", "ดำ", "ขาว", "ส้ม", "ม่วง", "ชมพู", "น้ำตาล", "รถยนต์", "มอเตอร์ไซค์", "จักรยาน", "รถไฟ", "เครื่องบิน", "เรือ", "รถบัส", "รถตู้", "รถบรรทุก", "รถแท็กซี่", "โต๊ะ", "เก้าอี้", "เตียง", "ตู้", "โซฟา", "ทีวี", "ตู้เย็น", "พัดลม", "แอร์", "คอมพิวเตอร์", "เสื้อ", "กางเกง", "กระโปรง", "รองเท้า", "ถุงเท้า", "หมวก", "แว่นตา", "เข็มขัด", "นาฬิกา", "กระเป๋า", "ยิ้ม", "หัวเราะ", "ร้องไห้", "เศร้า", "โกรธ", "ดีใจ", "ตกใจ", "กลัว", "รัก", "เกลียด", "วิ่ง", "เดิน", "กระโดด", "คลาน", "บิน", "ว่ายน้ำ", "ปีน", "ดำน้ำ", "ปั่นจักรยาน", "ขับรถ"],
    valo: ["Jett", "Reyna", "Raze", "Omen", "Phoenix", "Sage", "Killjoy", "Cypher", "Sova", "Viper", "Brimstone", "Breach", "Chamber", "Yoru", "Astra", "KAY/O", "Neon", "Fade", "Harbor", "Gekko", "Deadlock", "Iso", "Clove", "Vandal", "Phantom", "Operator", "Sheriff", "Spectre", "Judge", "Ghost", "Frenzy", "Stinger", "Classic", "Shorty", "Ares", "Odin", "Bucky", "Bulldog", "Marshall", "Tactical Knife", "Spike", "Orb", "Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Lotus", "Pearl", "Fracture", "Sunset", "Abyss"],
    marvel: ["Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Spider-Man", "Doctor Strange", "Black Panther", "Captain Marvel", "Ant-Man", "Wasp", "Star-Lord", "Scarlet Witch", "Vision", "Falcon", "Winter Soldier", "Loki", "Thanos", "Groot", "Rocket Raccoon", "Gamora", "Drax", "Stark Tower", "Asgard", "Wakanda", "Sanctum Sanctorum", "Avengers Compound"],
    anime: ["Naruto", "Sasuke", "Sakura", "Kakashi", "Luffy", "Zoro", "Nami", "Sanji", "Goku", "Vegeta", "Gohan", "Piccolo", "Ichigo", "Rukia", "Orihime", "Uryu", "Edward Elric", "Alphonse Elric", "Light Yagami", "L", "Ryuk", "Levi", "Eren", "Mikasa", "Armin", "Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Saitama", "Deku", "Gojou"]
};

// [ข้อมูลเกม Wavelength]
const mindFrequencyData = {
    general: [
        ["ร้อน", "เย็น"], ["มีประโยชน์", "ไร้ประโยชน์"], ["หายาก", "หาง่าย"], ["ฮีโร่", "ตัวร้าย"],
        ["น่ารัก", "น่าเกลียด"], ["กลิ่นหอม", "กลิ่นเหม็น"], ["เผ็ด", "จืด"], ["ราคาถูก", "ราคาแพง"],
        ["อันตราย", "ปลอดภัย"], ["แข็ง", "นุ่ม"], ["เร็ว", "ช้า"], ["ฉลาด", "โง่"],
        ["เด็ก", "ผู้ใหญ่"], ["น่าเบื่อ", "น่าตื่นเต้น"], ["สุขภาพดี", "ทำลายสุขภาพ"], ["ความจริง", "นิยาย"],
        ["งานศิลปะ", "ขยะ"], ["เหม็น", "หอม"], ["สะอาด", "สกปรก"], ["น่ากลัว", "น่ารัก"]
    ],
    valo: [
        ["ปืนพก", "ปืนกล"], ["เล่นง่าย", "เล่นยาก"], ["สกิลบุก", "สกิลรับ"], ["ดักซุ่ม", "วิ่งยิง"],
        ["ปืนถูก", "ปืนแพง"], ["แผนที่เล็ก", "แผนที่ใหญ่"], ["เข้าไซต์ง่าย", "เข้าไซต์ยาก"]
    ],
    mixed: [] 
};

// [ข้อมูลเกม Herd Mentality]
const sameFlockData = {
    general: [
        "ผลไม้สีแดงที่อร่อยที่สุด", "สัตว์ที่ดุร้ายที่สุด", "แอปพลิเคชันที่คนติดมากที่สุด", "อาหารเช้ายอดฮิต", 
        "วิชาที่น่าเบื่อที่สุดในโรงเรียน", "ยี่ห้อรถยนต์ที่คนรวยชอบใช้", "สถานที่เดตแรกที่ดีที่สุด",
        "สีที่ผู้ชายชอบใส่มากที่สุด", "ของขวัญวันเกิดที่คนไม่อยากได้", "เมนูตามสั่งสิ้นคิด", "อาชีพที่เด็กยุคนี้อยากเป็น"
    ],
    mixed: []
};

const truthOrLieData = [
    "ของแปลกที่สุดที่คุณเคยกิน", "วีรกรรมสมัยเด็กที่โดนตีหนักสุด", "เรื่องที่เคยโกหกพ่อแม่แล้วไม่เคยโดนจับได้",
    "ของขวัญที่ได้รับแล้วรู้สึกผิดหวังที่สุด", "เหตุการณ์ที่ทำให้คุณอายที่สุดในที่สาธารณะ", "ความฝันแปลกๆ ที่จำได้แม่น",
    "สัตว์เลี้ยงตัวแรกของคุณชื่ออะไรและวีรกรรมของมัน", "คนที่คุณเคยแอบชอบสมัยเรียนมีลักษณะยังไง", "เรื่องสยองขวัญหรือเรื่องผีที่คุณเคยเจอมากับตัว"
];

const matchTheBlankData = [
    "น้ำ ___", "ข้าว ___", "ผัด ___", "แกง ___", "หมู ___", "ไก่ ___", "ปลา ___", "ก๋วยเตี๋ยว ___", "ต้ม ___", "ยำ ___",
    "คน ___", "รถ ___", "บ้าน ___", "โรง ___", "สวน ___", "วัด ___", "เกาะ ___", "ดอย ___", "ถ้ำ ___", "ทะเล ___",
    "___ ใจ", "___ ดี", "___ ร้าย", "___ รัก", "___ หลง", "___ โกรธ", "___ กลัว", "___ อาย", "___ สวย", "___ หล่อ"
];

const friendQuizData = [
    "ถ้า [Name] มีเงิน 1 ล้านบาท จะเอาไปทำอะไรเป็นอย่างแรก? (ตอบเป็นตัวเลขจำนวนเงินที่จะใช้)",
    "[Name] คิดว่าตัวเองหน้าตาดีระดับกี่คะแนน? (0-10)",
    "[Name] เคยแอบชอบเพื่อนในห้องเดียวกันกี่คน?",
    "ถ้าให้ [Name] นอนเฉยๆ ไม่เล่นมือถือ จะทนได้กี่ชั่วโมง?",
    "[Name] อาบน้ำนานสุดกี่นาที?",
    "[Name] มีแฟนมาแล้วกี่คน?"
];

const numberSortThemes = [
    "ความเผ็ดของอาหาร", "ความน่ากลัวของสัตว์", "ความรวย", "ความถี่ในการอาบน้ำ", "ขนาดของสิ่งของ", 
    "ความน่าเบื่อ", "ความเร็ว", "ความฉลาด", "ความแพง", "ความง่วงนอน"
];

function getPackData(dataObj, packName) {
    if (packName === 'custom' || !dataObj) return [];
    if (packName === 'mixed') {
        let mixed = [];
        if(dataObj.general) mixed = mixed.concat(dataObj.general);
        if(dataObj.valo) mixed = mixed.concat(dataObj.valo);
        if(dataObj.marvel) mixed = mixed.concat(dataObj.marvel);
        if(dataObj.anime) mixed = mixed.concat(dataObj.anime);
        if(Array.isArray(dataObj) && !dataObj.general) mixed = dataObj;
        return mixed;
    }
    return dataObj[packName] || dataObj['general'] || dataObj;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// ==========================================
// STATE MANAGEMENT
// ==========================================
const rooms = {};

function generateRoomCode() {
    let code = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 5; i++) code += characters.charAt(Math.floor(Math.random() * characters.length));
    return code;
}

function findRoomBySocketId(socketId) {
    for (const code in rooms) {
        if (rooms[code].players.some(p => p.id === socketId)) return code;
    }
    return null;
}

function syncGameStateToPlayer(playerSocket, room, roomCode) {
    if (!playerSocket || !room || !room.game) return;
    let payload = { roomCode, gameType: room.game.type };

    switch(room.game.type) {
        case 'who-am-i':
            if (room.game.phase === 'playing') {
                const others = room.players.filter(p => p.id !== playerSocket.id).map(p => ({
                    id: p.id, name: p.name, avatar: p.avatar, character: p.character
                }));
                playerSocket.emit('whoAmI_newRound', { others });
            } else if (room.game.phase === 'result') {
                const revealData = room.players.map(p => ({
                    id: p.id, name: p.name, avatar: p.avatar, character: p.character
                }));
                playerSocket.emit('whoAmI_endRound', { 
                    winnerId: room.game.lastWinnerId, winnerName: room.game.lastWinnerName, revealData
                });
            }
            break;
            
        case 'secret-agent':
            if (room.game.phase === 'playing' || room.game.phase === 'spy_guessing') {
                const pData = room.players.find(p => p.id === playerSocket.id);
                if(pData) {
                    playerSocket.emit('spyfall_newRound', {
                        isSpy: pData.isSpy, location: room.game.currentLocation, role: pData.sfRole,
                        endTime: room.game.endTime, allLocations: room.game.locations, playedLocations: room.game.playedLocations, phase: room.game.phase
                    });
                    if (room.game.phase === 'spy_guessing') {
                        playerSocket.emit('spyfall_spyGuessingPhase', { spyId: room.game.spyId, allLocations: room.game.locations, playedLocations: room.game.playedLocations });
                    }
                }
            } else if (room.game.phase === 'voting') {
                playerSocket.emit('spyfall_startVoting', { players: room.players.map(p=>({id:p.id, name:p.name, avatar:p.avatar})) });
            } else if (room.game.phase === 'bonus_guess') {
                playerSocket.emit('spyfall_bonusPhase', { spyId: room.game.spyId, allLocations: room.game.locations, playedLocations: room.game.playedLocations });
            }
            break;

        case 'bluff-overthrow':
            const g = room.game;
            const p = g.players[playerSocket.id];
            if (p) {
                const myState = { coins: p.coins, cards: p.cards, isEliminated: p.isEliminated };
                const globalState = {
                    currentTurnId: g.currentTurnId, phase: g.phase,
                    playersStatus: room.players.map(rp => ({
                        id: rp.id, name: rp.name, avatar: rp.avatar, coins: g.players[rp.id].coins,
                        cardsCount: g.players[rp.id].cards.filter(c=>!c.dead).length,
                        deadCards: g.players[rp.id].cards.filter(c=>c.dead).map(c=>c.role), isEliminated: g.players[rp.id].isEliminated
                    })),
                    pendingAction: g.pendingAction, pendingBlock: g.pendingBlock, playerLosingCard: g.playerLosingCard, exchangeOptions: g.exchangeOptions
                };
                playerSocket.emit('coup_updateState', { myState, globalState });
            }
            break;
            
        case 'word-guess':
            playerSocket.emit('wordGuess_updateState', room.game);
            break;
            
        case 'mind-frequency':
            const mf = room.game;
            const teamData = {
                redScore: mf.teams.red.score, blueScore: mf.teams.blue.score,
                redPlayers: mf.teams.red.players, bluePlayers: mf.teams.blue.players, turn: mf.turn
            };
            
            if (mf.phase === 'clue') {
                playerSocket.emit('mf_newRound', {
                    psychicId: mf.psychicId, concept: mf.concepts[mf.conceptIndex],
                    targetValue: mf.targetValue, teamData, players: room.players.map(p=>({id:p.id, name:p.name, avatar:p.avatar}))
                });
            } else if (mf.phase === 'guess') {
                playerSocket.emit('mf_startGuessing', { clue: mf.clue, psychicId: mf.psychicId, teamData });
                playerSocket.emit('mf_syncDial', mf.currentDialValue);
            } else if (mf.phase === 'result') {
                playerSocket.emit('mf_showResult', { targetValue: mf.targetValue, dialValue: mf.currentDialValue, points: mf.lastPoints, teamData });
            }
            break;

        case 'same-flock':
            const sfk = room.game;
            if (sfk.phase === 'answering') {
                playerSocket.emit('flock_newRound', { question: sfk.questions[sfk.questionIndex] });
            } else if (sfk.phase === 'result') {
                playerSocket.emit('flock_showResult', { groups: sfk.lastGroups });
            }
            break;

        case 'truth-or-lie':
        case 'unique-clue':
        case 'secret-painter':
        case 'match-the-blank':
        case 'friend-quiz':
        case 'number-sort':
            break;
    }
}

function updateRoomScores(roomCode) {
    if(rooms[roomCode]) io.to(roomCode).emit('updateScores', rooms[roomCode].players);
}

// ==========================================
// SOCKET CONNECTION & BASIC ROOM LOGIC
// ==========================================
io.on('connection', (socket) => {

    socket.on('createRoom', ({ playerName, avatar, playerId }) => {
        const roomCode = generateRoomCode();
        socket.join(roomCode);
        rooms[roomCode] = {
            players: [{ id: socket.id, realPlayerId: playerId, name: playerName, avatar, score: 0, isOnline: true }],
            gameType: null, game: null
        };
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ playerName, avatar, roomCode, playerId }) => {
        const rc = roomCode.toUpperCase();
        if (rooms[rc]) {
            if (rooms[rc].players.length >= 16) { socket.emit('error', 'ห้องเต็มแล้ว! (รับได้สูงสุด 16 คน)'); return; }
            socket.join(rc);
            
            let existingPlayer = rooms[rc].players.find(p => p.realPlayerId === playerId);
            if (existingPlayer) {
                existingPlayer.id = socket.id; existingPlayer.name = playerName; existingPlayer.avatar = avatar; existingPlayer.isOnline = true;
            } else {
                rooms[rc].players.push({ id: socket.id, realPlayerId: playerId, name: playerName, avatar, score: 0, isOnline: true });
            }

            socket.emit('joinSuccess', { roomCode: rc, players: rooms[rc].players, gameType: rooms[rc].gameType });
            io.to(rc).emit('updateLobby', { players: rooms[rc].players, gameType: rooms[rc].gameType });
            
            if (rooms[rc].gameType && rooms[rc].game) {
                socket.emit('rejoinGameStarted', rooms[rc].gameType);
                syncGameStateToPlayer(socket, rooms[rc], rc);
            }
        } else {
            socket.emit('error', 'ไม่พบห้องนี้!');
        }
    });

    socket.on('rejoinRoom', ({ roomCode, playerId, playerName, avatar }) => {
        const rc = roomCode.toUpperCase();
        if (rooms[rc]) {
            let existingPlayer = rooms[rc].players.find(p => p.realPlayerId === playerId);
            if (existingPlayer) {
                socket.join(rc);
                existingPlayer.id = socket.id; existingPlayer.name = playerName; existingPlayer.avatar = avatar; existingPlayer.isOnline = true;
                
                socket.emit('joinSuccess', { roomCode: rc, players: rooms[rc].players, gameType: rooms[rc].gameType });
                io.to(rc).emit('updateLobby', { players: rooms[rc].players, gameType: rooms[rc].gameType });
                
                if (rooms[rc].gameType && rooms[rc].game) {
                    socket.emit('rejoinGameStarted', rooms[rc].gameType);
                    syncGameStateToPlayer(socket, rooms[rc], rc);
                }
            } else { socket.emit('clearSession'); }
        } else { socket.emit('clearSession'); }
    });

    socket.on('leaveRoom', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            socket.leave(roomCode);
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== socket.id);
            if (rooms[roomCode].players.length === 0) delete rooms[roomCode];
            else io.to(roomCode).emit('updateLobby', { players: rooms[roomCode].players, gameType: rooms[roomCode].gameType });
        }
    });

    socket.on('host_kickPlayer', (targetId) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            const targetSocket = io.sockets.sockets.get(targetId);
            if (targetSocket) { targetSocket.emit('kicked'); targetSocket.leave(roomCode); }
            rooms[roomCode].players = rooms[roomCode].players.filter(p => p.id !== targetId);
            io.to(roomCode).emit('updateLobby', { players: rooms[roomCode].players, gameType: rooms[roomCode].gameType });
        }
    });

    socket.on('disconnect', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if(player) {
                player.isOnline = false;
                io.to(roomCode).emit('updateLobby', { players: rooms[roomCode].players, gameType: rooms[roomCode].gameType });
            }
            setTimeout(() => {
                if (rooms[roomCode] && rooms[roomCode].players) {
                    const checkPlayer = rooms[roomCode].players.find(p => p.realPlayerId === player.realPlayerId);
                    if (checkPlayer && !checkPlayer.isOnline) {
                        rooms[roomCode].players = rooms[roomCode].players.filter(p => p.realPlayerId !== player.realPlayerId);
                        if (rooms[roomCode].players.length === 0) delete rooms[roomCode];
                        else io.to(roomCode).emit('updateLobby', { players: rooms[roomCode].players, gameType: rooms[roomCode].gameType });
                    }
                }
            }, 120000);
        }
    });

    socket.on('host_selectGame', (gameType) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            rooms[roomCode].gameType = gameType;
            io.to(roomCode).emit('gameSelected', gameType);
        }
    });
    
    socket.on('host_selectPack', (pack) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players[0].id === socket.id) io.to(roomCode).emit('packSelected', pack);
    });

    socket.on('host_changeBGM', (trackUrl) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) io.to(roomCode).emit('bgm_changed', trackUrl);
    });

    socket.on('sendChat', (message) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if (player) io.to(roomCode).emit('receiveChat', { sender: player.name, avatar: player.avatar, message, senderId: socket.id });
        }
    });

    socket.on('sendReaction', ({ emoji }) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            const player = rooms[roomCode].players.find(p => p.id === socket.id);
            if (player) io.to(roomCode).emit('receiveReaction', { emoji, senderName: player.name, avatar: player.avatar });
        }
    });

    socket.on('returnToLobby', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode]) {
            if(rooms[roomCode].game && rooms[roomCode].game.timerTimeout) clearTimeout(rooms[roomCode].game.timerTimeout);
            rooms[roomCode].gameType = null; rooms[roomCode].game = null;
            io.to(roomCode).emit('backToLobby', rooms[roomCode].players);
        }
    });

    // ==========================================
    // START GAME ROUTER
    // ==========================================
    socket.on('startGame', (payload) => {
        const { roomCode, pack, timerMin, customWords } = payload;
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id && rooms[roomCode].gameType) {
            const gameType = rooms[roomCode].gameType;
            rooms[roomCode].pack = pack;
            if(customWords) rooms[roomCode].customWords = customWords;
            io.to(roomCode).emit('gameStarted', { gameType, timerMin, customWords });
        }
    });

    socket.on('host_gameLogicStart', (payload) => {
        const { roomCode, pack, timerMin, customWords } = payload;
        const room = rooms[roomCode];
        if (!room) return;

        let activePlayers = room.players.filter(p => p.isOnline);
        if(activePlayers.length === 0) activePlayers = room.players;
        
        switch (room.gameType) {
            case 'who-am-i':
                let words = customWords || getPackData(whoAmIData, pack);
                if (words.length < activePlayers.length) words = getPackData(whoAmIData, 'general');
                const shuffledWords = shuffle([...words]);
                activePlayers.forEach((p, idx) => { p.character = shuffledWords[idx]; });
                room.game = { type: 'who-am-i', phase: 'playing' };
                
                activePlayers.forEach(p => {
                    const pSocket = io.sockets.sockets.get(p.id);
                    if (pSocket) {
                        const others = activePlayers.filter(other => other.id !== p.id).map(other => ({
                            id: other.id, name: other.name, avatar: other.avatar, character: other.character
                        }));
                        pSocket.emit('whoAmI_newRound', { others });
                    }
                });
                break;

            case 'secret-agent':
                let locations = getPackData(spyfallData, pack);
                if(locations.length === 0) locations = getPackData(spyfallData, 'general');
                room.game = { type: 'secret-agent', playedLocations: [], locations: locations, timerMin: timerMin || 5 };
                startSpyfallRound(roomCode);
                break;

            case 'bluff-overthrow':
                room.game = initBluffOverthrowGame(activePlayers);
                activePlayers.forEach(p => {
                    const pSocket = io.sockets.sockets.get(p.id);
                    pSocket.emit('bluff_newRound');
                    syncGameStateToPlayer(pSocket, room, roomCode);
                });
                break;

            case 'mind-frequency':
                const mfConcepts = getPackData(mindFrequencyData, pack);
                // สุ่มผู้เล่นและแบ่งเป็น 2 ทีม (แดง / น้ำเงิน)
                const shuffledMfPlayers = shuffle([...activePlayers]);
                const halfMf = Math.ceil(shuffledMfPlayers.length / 2);
                
                room.game = {
                    type: 'mind-frequency',
                    concepts: shuffle([...mfConcepts]),
                    conceptIndex: 0,
                    teams: {
                        red: { players: shuffledMfPlayers.slice(0, halfMf).map(p=>p.id), psychicIdx: 0, score: 0 },
                        blue: { players: shuffledMfPlayers.slice(halfMf).map(p=>p.id), psychicIdx: 0, score: 0 }
                    },
                    turn: 'red',
                    round: 1
                };
                startMindFrequencyRound(roomCode);
                break;
                
            case 'same-flock':
                const sfkQuestions = getPackData(sameFlockData, pack);
                room.game = {
                    type: 'same-flock',
                    questions: shuffle([...sfkQuestions]),
                    questionIndex: 0,
                    round: 1
                };
                startSameFlockRound(roomCode);
                break;
                
            case 'word-guess':
                initWordGuessGame(roomCode, activePlayers, customWords || getPackData(wordGuessData, pack));
                break;
                
            case 'truth-or-lie':
                room.game = { type: 'truth-or-lie', prompts: shuffle([...truthOrLieData]), promptIdx: 0, currentAnswers: {} };
                startTruthOrLieRound(roomCode);
                break;
                
            case 'unique-clue':
                let ucWords = customWords || getPackData(wordGuessData, pack);
                room.game = { type: 'unique-clue', words: shuffle([...ucWords]), wordIdx: 0, guesserIdx: 0, clues: {} };
                startUniqueClueRound(roomCode);
                break;
                
            case 'secret-painter':
                let spWords = customWords || getPackData(wordGuessData, pack);
                room.game = { type: 'secret-painter', words: shuffle([...spWords]), wordIdx: 0, played: [] };
                startSecretPainterRound(roomCode);
                break;
                
            case 'match-the-blank':
                room.game = { type: 'match-the-blank', prompts: shuffle([...matchTheBlankData]), promptIdx: 0, answers: {} };
                startMatchTheBlankRound(roomCode);
                break;
                
            case 'friend-quiz':
                room.game = { type: 'friend-quiz', questions: shuffle([...friendQuizData]), questionIdx: 0, answers: {}, bets: {}, secretPlayerId: null };
                startFriendQuizRound(roomCode);
                break;
                
            case 'number-sort':
                room.game = { type: 'number-sort', themes: shuffle([...numberSortThemes]), themeIdx: 0 };
                startNumberSortRound(roomCode);
                break;
        }
    });

    // ==========================================
    // GAME LOGIC: WHO AM I
    // ==========================================
    socket.on('whoAmI_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'who-am-i' || room.game.phase !== 'playing') return;

        const player = room.players.find(p => p.id === socket.id);
        if (player) {
            if (guess.toLowerCase() === player.character.toLowerCase()) {
                player.score += 3;
                room.game.phase = 'result'; room.game.lastWinnerId = player.id; room.game.lastWinnerName = player.name;
                updateRoomScores(roomCode);
                const revealData = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, character: p.character }));
                io.to(roomCode).emit('whoAmI_endRound', { winnerId: player.id, winnerName: player.name, revealData });
                io.to(roomCode).emit('receiveChat', { sender: 'System', avatar: '🤖', message: `${player.name} ทายถูกเป็นคนแรก! ได้รับ 3 แต้ม`, senderId: 'system' });
            } else { socket.emit('whoAmI_wrongGuess'); }
        }
    });

    socket.on('whoAmI_skipRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            rooms[roomCode].game.phase = 'result'; rooms[roomCode].game.lastWinnerId = null;
            const revealData = rooms[roomCode].players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, character: p.character }));
            io.to(roomCode).emit('whoAmI_endRound', { winnerId: null, revealData });
        }
    });

    socket.on('whoAmI_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            let activePlayers = rooms[roomCode].players.filter(p => p.isOnline);
            let words = rooms[roomCode].customWords || getPackData(whoAmIData, rooms[roomCode].pack);
            if (words.length < activePlayers.length) words = getPackData(whoAmIData, 'general');
            const shuffledWords = shuffle([...words]);
            
            activePlayers.forEach((p, idx) => { p.character = shuffledWords[idx]; });
            rooms[roomCode].game.phase = 'playing';
            
            activePlayers.forEach(p => {
                const pSocket = io.sockets.sockets.get(p.id);
                if (pSocket) {
                    const others = activePlayers.filter(other => other.id !== p.id).map(other => ({ id: other.id, name: other.name, avatar: other.avatar, character: other.character }));
                    pSocket.emit('whoAmI_newRound', { others });
                }
            });
        }
    });

    // ==========================================
    // GAME LOGIC: SECRET AGENT (SPYFALL)
    // ==========================================
    function startSpyfallRound(roomCode) {
        const room = rooms[roomCode];
        let activePlayers = room.players.filter(p => p.isOnline);
        const roles = ["ช่างซ่อม", "ผู้จัดการ", "ยาม", "ลูกค้า", "พนักงานทำความสะอาด", "ไกด์นำเที่ยว", "ผู้ตรวจสอบ", "ช่างภาพ", "เด็กฝึกงาน", "พนักงานต้อนรับ"];
        
        let availableLocs = room.game.locations.filter(l => !room.game.playedLocations.includes(l));
        if (availableLocs.length === 0) {
            room.game.playedLocations = [];
            availableLocs = room.game.locations;
        }

        const selectedLocation = availableLocs[Math.floor(Math.random() * availableLocs.length)];
        room.game.currentLocation = selectedLocation;
        room.game.playedLocations.push(selectedLocation);
        
        const spyIndex = Math.floor(Math.random() * activePlayers.length);
        room.game.spyId = activePlayers[spyIndex].id;
        
        const shuffledRoles = shuffle([...roles]);
        
        activePlayers.forEach((p, idx) => {
            if (idx === spyIndex) {
                p.isSpy = true; p.sfRole = "Spy";
            } else {
                p.isSpy = false; p.sfRole = shuffledRoles[idx % shuffledRoles.length];
            }
        });

        const durationMs = room.game.timerMin * 60 * 1000;
        room.game.endTime = Date.now() + durationMs;
        room.game.phase = 'playing';
        room.game.votes = {};

        activePlayers.forEach(p => {
            const pSocket = io.sockets.sockets.get(p.id);
            if (pSocket) {
                pSocket.emit('spyfall_newRound', {
                    isSpy: p.isSpy, location: selectedLocation, role: p.sfRole,
                    endTime: room.game.endTime, allLocations: room.game.locations, playedLocations: room.game.playedLocations, phase: 'playing'
                });
            }
        });

        if (room.game.timerTimeout) clearTimeout(room.game.timerTimeout);
        room.game.timerTimeout = setTimeout(() => {
            if(rooms[roomCode] && rooms[roomCode].gameType === 'secret-agent' && rooms[roomCode].game.phase === 'playing') {
                startSpyfallVoting(roomCode);
            }
        }, durationMs + 2000); 
    }

    function startSpyfallVoting(roomCode) {
        const room = rooms[roomCode];
        if (!room) return;
        room.game.phase = 'voting';
        const activePlayers = room.players.filter(p => p.isOnline);
        const playersData = activePlayers.map(p => ({id: p.id, name: p.name, avatar: p.avatar}));
        io.to(roomCode).emit('spyfall_startVoting', { players: playersData });
    }

    socket.on('spyfall_timeUp', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startSpyfallVoting(roomCode);
    });

    socket.on('spyfall_spyEarlyGuess', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent' || room.game.phase !== 'playing') return;
        if (socket.id === room.game.spyId) {
            room.game.phase = 'spy_guessing';
            io.to(roomCode).emit('spyfall_spyGuessingPhase', { spyId: room.game.spyId, allLocations: room.game.locations, playedLocations: room.game.playedLocations });
        }
    });

    socket.on('spyfall_submitSpyGuess', ({ location, isBonus }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent') return;
        if (socket.id !== room.game.spyId) return;

        const isCorrect = (location === room.game.currentLocation);
        const spyPlayer = room.players.find(p => p.id === room.game.spyId);

        if (isBonus) {
            if (isCorrect) {
                spyPlayer.score += 2;
                io.to(roomCode).emit('receiveChat', { sender: 'System', avatar: '🤖', message: `สายลับทายสถานที่โบนัสถูก! ได้เพิ่ม +2 แต้ม!`, senderId: 'system' });
            } else {
                io.to(roomCode).emit('receiveChat', { sender: 'System', avatar: '🤖', message: `สายลับทายสถานที่โบนัสผิด (สถานที่จริงคือ ${room.game.currentLocation})`, senderId: 'system' });
            }
            updateRoomScores(roomCode);
            const titleMsg = "ผลสรุปหลังจากสายลับทายโบนัส!";
            io.to(roomCode).emit('spyfall_showResult', {
                location: room.game.currentLocation, spyId: spyPlayer.id, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar,
                spyWon: true, titleMsg, votes: room.game.votes, players: room.players
            });
        } else {
            let titleMsg = ""; let spyWon = false;
            room.game.phase = 'reveal';
            
            if (isCorrect) {
                spyWon = true; titleMsg = "สายลับทายสถานที่ถูก! ชนะไปเลย!! (+5 แต้ม)";
                spyPlayer.score += 5;
            } else {
                titleMsg = "สายลับทายผิด! โป๊ะแตก!! (คนอื่นได้ +2 แต้ม)";
                room.players.forEach(p => { if (p.id !== spyPlayer.id && p.isOnline) p.score += 2; });
            }
            
            updateRoomScores(roomCode);
            io.to(roomCode).emit('spyfall_showResult', {
                location: room.game.currentLocation, spyId: spyPlayer.id, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar,
                spyWon, titleMsg, players: room.players
            });
        }
    });

    socket.on('spyfall_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent' || room.game.phase !== 'voting') return;

        room.game.votes[votedId] = (room.game.votes[votedId] || 0) + 1;
        
        let activePlayersCount = room.players.filter(p => p.isOnline).length;
        let totalVotes = Object.values(room.game.votes).reduce((a, b) => a + b, 0);

        io.to(roomCode).emit('updateProgress', { current: totalVotes, total: activePlayersCount, text: "รอเพื่อนโหวต..." });

        if (totalVotes >= activePlayersCount) {
            io.to(roomCode).emit('updateProgress', { hide: true });
            
            let maxVotes = 0; let accusedIds = [];
            for (let id in room.game.votes) {
                if (room.game.votes[id] > maxVotes) { maxVotes = room.game.votes[id]; accusedIds = [id]; } 
                else if (room.game.votes[id] === maxVotes) { accusedIds.push(id); }
            }

            room.game.phase = 'reveal';
            let titleMsg = ""; let spyWon = false;
            const spyPlayer = room.players.find(p => p.id === room.game.spyId);

            if (accusedIds.length === 1 && accusedIds[0] === room.game.spyId) {
                titleMsg = "จับสายลับได้แล้ว! (ผู้โหวตถูกได้ +2 แต้ม)";
                room.players.forEach(p => { if (p.id !== spyPlayer.id && p.isOnline) p.score += 2; });
                updateRoomScores(roomCode);
                io.to(roomCode).emit('spyfall_showResult', {
                    location: room.game.currentLocation, spyId: spyPlayer.id, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar,
                    spyWon, titleMsg, votes: room.game.votes, players: room.players
                });
            } else {
                spyWon = true; titleMsg = "โหวตผิดคน หรือเสียงแตก! สายลับรอดตัวไปได้ (+3 แต้ม)";
                spyPlayer.score += 3;
                updateRoomScores(roomCode);
                
                io.to(roomCode).emit('spyfall_showResult', {
                    location: "??? (สายลับกำลังได้สิทธิ์ทาย)", spyId: spyPlayer.id, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar,
                    spyWon, titleMsg, votes: room.game.votes, players: room.players
                });

                setTimeout(() => {
                    if(rooms[roomCode]) {
                        rooms[roomCode].game.phase = 'bonus_guess';
                        io.to(roomCode).emit('spyfall_bonusPhase', { spyId: spyPlayer.id, allLocations: room.game.locations, playedLocations: room.game.playedLocations });
                    }
                }, 3000);
            }
        }
    });

    socket.on('spyfall_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) startSpyfallRound(roomCode);
    });

    // ==========================================
    // GAME LOGIC: BLUFF OVERTHROW (MAFIA)
    // ==========================================
    const BLUFF_DECK = ['sniper', 'sniper', 'sniper', 'assassin', 'assassin', 'assassin', 'hacker', 'hacker', 'hacker', 'spy', 'spy', 'spy', 'healer', 'healer', 'healer'];
    
    function initBluffOverthrowGame(players) {
        let deck = shuffle([...BLUFF_DECK, ...BLUFF_DECK]); 
        let game = {
            type: 'bluff-overthrow', phase: 'action', players: {},
            deck: deck, currentTurnIdx: 0, playerOrder: players.map(p => p.id), currentTurnId: players[0].id,
            pendingAction: null, pendingBlock: null, playerLosingCard: null, exchangeOptions: null
        };
        players.forEach(p => {
            game.players[p.id] = { coins: 2, isEliminated: false, cards: [{role: deck.pop(), dead: false}, {role: deck.pop(), dead: false}] };
        });
        return game;
    }

    function bluffNextTurn(room) {
        const g = room.game;
        g.phase = 'action'; g.pendingAction = null; g.pendingBlock = null; g.playerLosingCard = null; g.exchangeOptions = null;
        let originalIdx = g.currentTurnIdx;
        do {
            g.currentTurnIdx = (g.currentTurnIdx + 1) % g.playerOrder.length;
            g.currentTurnId = g.playerOrder[g.currentTurnIdx];
        } while (g.players[g.currentTurnId].isEliminated && g.currentTurnIdx !== originalIdx);
        
        let aliveCount = 0; let lastAliveId = null;
        for (let pid in g.players) { if (!g.players[pid].isEliminated) { aliveCount++; lastAliveId = pid; } }
        
        if (aliveCount <= 1) {
            if(lastAliveId) {
                const winner = room.players.find(p=>p.id===lastAliveId);
                if(winner) winner.score += 5; updateRoomScores(findRoomBySocketId(socket.id));
                io.to(findRoomBySocketId(socket.id)).emit('receiveChat', { sender: 'System', avatar: '🏆', message: `${winner.name} เป็นผู้ชนะในเกมเหลี่ยมมาเฟีย! รับ 5 แต้ม!`, senderId: 'system' });
            }
            g.phase = 'game_over';
        }
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, findRoomBySocketId(socket.id)));
    }

    function resolveAction(roomCode, action, success) {
        const room = rooms[roomCode]; const g = room.game;
        const source = g.players[action.source];
        const target = action.target ? g.players[action.target] : null;

        if (success) {
            switch(action.type) {
                case 'income': source.coins += 1; break;
                case 'foreign_aid': source.coins += 2; break;
                case 'tax': source.coins += 3; break;
                case 'assassinate': if(target && !target.isEliminated) { g.playerLosingCard = action.target; g.phase = 'lose_card'; } break;
                case 'steal': 
                    if(target && !target.isEliminated) {
                        let amount = Math.min(2, target.coins); target.coins -= amount; source.coins += amount;
                    }
                    break;
                case 'exchange':
                    g.exchangeOptions = [ {role: g.deck.pop(), dead: false}, {role: g.deck.pop(), dead: false} ];
                    source.cards.forEach(c => { if(!c.dead) g.exchangeOptions.push(c); });
                    g.phase = 'exchange';
                    break;
            }
        }
        
        if (g.phase !== 'lose_card' && g.phase !== 'exchange') bluffNextTurn(room);
        else room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    }

    socket.on('bluff_action', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'action') return;
        const g = room.game;
        if(g.currentTurnId !== socket.id) return;
        
        const myPlayer = g.players[socket.id];
        let cost = 0; let claim = null;
        if(data.type === 'assassinate') { cost = 3; claim = 'assassin'; }
        if(data.type === 'eliminate') cost = 7;
        if(data.type === 'tax') claim = 'sniper';
        if(data.type === 'steal') claim = 'hacker';
        if(data.type === 'exchange') claim = 'spy';

        if(myPlayer.coins < cost) return; 
        myPlayer.coins -= cost;

        if(data.type === 'income') resolveAction(roomCode, {type: 'income', source: socket.id}, true);
        else if(data.type === 'eliminate') {
            g.playerLosingCard = data.targetId; g.phase = 'lose_card';
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        } else {
            g.pendingAction = { type: data.type, source: socket.id, target: data.targetId, claim: claim, responses: 0 };
            g.phase = 'reaction';
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        }
    });

    socket.on('bluff_react', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'bluff-overthrow') return;
        const g = room.game;
        const activeCount = Object.values(g.players).filter(p=>!p.isEliminated).length;

        if(g.phase === 'reaction') {
            if(data.response === 'challenge') {
                const targetHasCard = g.players[g.pendingAction.source].cards.some(c => !c.dead && c.role === g.pendingAction.claim);
                if(targetHasCard) {
                    g.playerLosingCard = socket.id; // Challenger loses
                    g.players[g.pendingAction.source].cards = g.players[g.pendingAction.source].cards.map(c => {
                        if(!c.dead && c.role === g.pendingAction.claim) { g.deck.unshift(c.role); g.deck = shuffle(g.deck); return {role: g.deck.pop(), dead: false}; }
                        return c;
                    });
                    if(g.pendingAction.type === 'exchange') {
                        g.exchangeOptions = [ {role: g.deck.pop(), dead: false}, {role: g.deck.pop(), dead: false} ];
                        g.players[g.pendingAction.source].cards.forEach(c => { if(!c.dead) g.exchangeOptions.push(c); });
                        g.phase = 'exchange';
                    } else if (g.pendingAction.type === 'assassinate') {
                        g.phase = 'lose_card';
                    } else {
                        resolveAction(roomCode, g.pendingAction, true);
                        g.phase = 'lose_card';
                    }
                } else {
                    g.playerLosingCard = g.pendingAction.source; // Liar loses
                    g.phase = 'lose_card';
                }
            } else if (data.response === 'block') {
                g.pendingBlock = { source: socket.id, claim: data.claimRole, responses: 0 };
                g.phase = 'block_reaction';
            } else {
                g.pendingAction.responses++;
                if(g.pendingAction.responses >= activeCount - 1) resolveAction(roomCode, g.pendingAction, true);
            }
        } 
        else if (g.phase === 'block_reaction') {
            if(data.response === 'challenge') {
                const targetHasCard = g.players[g.pendingBlock.source].cards.some(c => !c.dead && c.role === g.pendingBlock.claim);
                if(targetHasCard) {
                    g.playerLosingCard = socket.id; // Challenger loses
                    g.players[g.pendingBlock.source].cards = g.players[g.pendingBlock.source].cards.map(c => {
                        if(!c.dead && c.role === g.pendingBlock.claim) { g.deck.unshift(c.role); g.deck = shuffle(g.deck); return {role: g.deck.pop(), dead: false}; }
                        return c;
                    });
                    resolveAction(roomCode, g.pendingAction, false); // Block succeeded
                    g.phase = 'lose_card';
                } else {
                    g.playerLosingCard = g.pendingBlock.source; // Liar loses
                    resolveAction(roomCode, g.pendingAction, true); // Action proceeds
                    g.phase = 'lose_card'; // Liar loses card too
                }
            } else {
                g.pendingBlock.responses++;
                if(g.pendingBlock.responses >= activeCount - 1) resolveAction(roomCode, g.pendingAction, false); // Block success
            }
        }
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    });

    socket.on('bluff_loseCard', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'lose_card') return;
        const g = room.game;
        if(g.playerLosingCard !== socket.id) return;

        let myPlayer = g.players[socket.id];
        if(myPlayer.cards[data.cardIndex] && !myPlayer.cards[data.cardIndex].dead) {
            myPlayer.cards[data.cardIndex].dead = true;
            if(myPlayer.cards.every(c => c.dead)) myPlayer.isEliminated = true;
            bluffNextTurn(room);
        }
    });

    socket.on('bluff_exchange', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'exchange') return;
        const g = room.game;
        if(g.pendingAction.source !== socket.id) return;

        let myPlayer = g.players[socket.id];
        let aliveCardsCount = myPlayer.cards.filter(c=>!c.dead).length;
        if(data.keepIndices.length === aliveCardsCount) {
            let newCards = [];
            data.keepIndices.forEach(idx => { newCards.push(g.exchangeOptions[idx]); });
            g.exchangeOptions.forEach((c, idx) => { if(!data.keepIndices.includes(idx)) g.deck.unshift(c.role); });
            g.deck = shuffle(g.deck);
            
            let cardIdx = 0;
            myPlayer.cards = myPlayer.cards.map(c => {
                if(!c.dead) { let nc = newCards[cardIdx]; cardIdx++; return nc; }
                return c;
            });
            bluffNextTurn(room);
        }
    });

    // ==========================================
    // GAME LOGIC: MIND FREQUENCY (Wavelength) [Team Mode]
    // ==========================================
    function startMindFrequencyRound(roomCode) {
        const room = rooms[roomCode]; const mf = room.game;
        
        mf.phase = 'clue';
        mf.targetValue = Math.floor(Math.random() * 81) + 10; // 10 to 90
        mf.clue = null;
        mf.currentDialValue = 50;
        
        const activeTeam = mf.teams[mf.turn];
        if (activeTeam.players.length === 0) return;
        
        mf.psychicId = activeTeam.players[activeTeam.psychicIdx % activeTeam.players.length];
        mf.lastPoints = 0;
        
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    }

    socket.on('mf_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        if (socket.id === room.game.psychicId) {
            room.game.clue = clue;
            room.game.phase = 'guess';
            
            const teamData = {
                redScore: room.game.teams.red.score, blueScore: room.game.teams.blue.score,
                redPlayers: room.game.teams.red.players, bluePlayers: room.game.teams.blue.players, turn: room.game.turn
            };
            io.to(roomCode).emit('mf_startGuessing', { clue, psychicId: room.game.psychicId, teamData });
        }
    });

    socket.on('mf_updateDial', ({ value }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        const activeTeam = room.game.teams[room.game.turn];
        
        // ให้เลื่อนได้เฉพาะลูกทีมในทีมที่ถึงคิว (ที่ไม่ใช่คนใบ้)
        if (socket.id !== room.game.psychicId && activeTeam.players.includes(socket.id)) { 
            room.game.currentDialValue = value;
            socket.to(roomCode).emit('mf_syncDial', value); // Broadcast to others
        }
    });

    socket.on('mf_lockDial', ({ value }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        
        const activeTeam = room.game.teams[room.game.turn];
        
        // ลูกทีมฝั่งที่เล่นอยู่กดยืนยันได้ หรือโฮสต์กดให้ได้
        if ((activeTeam.players.includes(socket.id) && socket.id !== room.game.psychicId) || room.players[0].id === socket.id) {
            room.game.currentDialValue = value;
            room.game.phase = 'result';
            
            const diff = Math.abs(room.game.targetValue - value);
            let points = 0;
            if (diff <= 3) points = 4;      // Bullseye!
            else if (diff <= 8) points = 3;  // Great
            else if (diff <= 15) points = 2; // Ok
            
            activeTeam.score += points;
            room.game.lastPoints = points;
            
            // แจกแต้มให้ลูกทีมเข้า Leaderboard ส่วนตัวด้วย
            activeTeam.players.forEach(pid => { 
                const p = room.players.find(x => x.id === pid);
                if(p && p.isOnline) p.score += points; 
            });
            updateRoomScores(roomCode);

            const teamData = { redScore: room.game.teams.red.score, blueScore: room.game.teams.blue.score, turn: room.game.turn };

            io.to(roomCode).emit('mf_showResult', {
                targetValue: room.game.targetValue,
                dialValue: value,
                points: points,
                teamData
            });
            
            if (points === 4) io.to(roomCode).emit('receiveChat', { sender: 'System', avatar: '🎯', message: `ทีม${room.game.turn === 'red' ? 'แดง' : 'น้ำเงิน'} ทำเป้าแตก รับไป 4 แต้มเต็มๆ`, senderId: 'system' });
        }
    });

    socket.on('mf_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        if (room.players[0].id === socket.id) {
            room.game.conceptIndex = (room.game.conceptIndex + 1) % room.game.concepts.length;
            room.game.teams[room.game.turn].psychicIdx++;
            room.game.turn = room.game.turn === 'red' ? 'blue' : 'red'; // สลับทีม
            room.game.round++;
            startMindFrequencyRound(roomCode);
        }
    });

    // ==========================================
    // GAME LOGIC: SAME FLOCK (Herd Mentality)
    // ==========================================
    function startSameFlockRound(roomCode) {
        const room = rooms[roomCode]; const sfk = room.game;
        sfk.phase = 'answering';
        sfk.answers = {};
        sfk.lastGroups = [];
        io.to(roomCode).emit('flock_newRound', { question: sfk.questions[sfk.questionIndex] });
    }

    socket.on('flock_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'same-flock') return;
        
        room.game.answers[socket.id] = answer.trim();
        const activeCount = room.players.filter(p => p.isOnline).length;
        const answersCount = Object.keys(room.game.answers).length;

        io.to(roomCode).emit('updateProgress', { current: answersCount, total: activeCount, text: "รอเพื่อนส่งคำตอบ..." });

        if (answersCount >= activeCount) {
            io.to(roomCode).emit('updateProgress', { hide: true });
            
            // Group answers by similarity (simple lowercase match for now)
            const groupsMap = {};
            for (let pid in room.game.answers) {
                const ans = room.game.answers[pid];
                const key = ans.toLowerCase().replace(/\s+/g, '');
                if (!groupsMap[key]) groupsMap[key] = { answer: ans, count: 0, players: [] };
                
                const player = room.players.find(p => p.id === pid);
                if (player) {
                    groupsMap[key].count++;
                    groupsMap[key].players.push({ id: pid, name: player.name, avatar: player.avatar });
                }
            }

            const groups = Object.values(groupsMap).sort((a, b) => b.count - a.count);
            let maxCount = groups.length > 0 ? groups[0].count : 0;
            
            groups.forEach(g => {
                g.isMajority = (g.count === maxCount && maxCount > 1); // Only > 1 counts as herd
                if (g.isMajority) {
                    g.players.forEach(p => {
                        const rp = room.players.find(rp => rp.id === p.id);
                        if (rp) rp.score += 1;
                    });
                }
            });

            updateRoomScores(roomCode);
            room.game.phase = 'result';
            room.game.lastGroups = groups;
            io.to(roomCode).emit('flock_showResult', { groups });
        }
    });

    socket.on('flock_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'same-flock') return;
        if (room.players[0].id === socket.id) {
            room.game.questionIndex = (room.game.questionIndex + 1) % room.game.questions.length;
            room.game.round++;
            startSameFlockRound(roomCode);
        }
    });

    // ==========================================
    // GAME LOGIC: WORD GUESS (Codenames)
    // ==========================================
    function initWordGuessGame(roomCode, activePlayers, wordsArray) {
        const room = rooms[roomCode];
        const isCoop = activePlayers.length <= 2;
        
        let words = shuffle([...wordsArray]).slice(0, 25);
        if(words.length < 25) words = getPackData(wordGuessData, 'general').slice(0, 25);
        
        const board = [];
        if (isCoop) {
            let types = Array(15).fill('green').concat(Array(3).fill('assassin')).concat(Array(7).fill('neutral'));
            types = shuffle(types);
            words.forEach((w, i) => board.push({ word: w, type: types[i], revealed: false }));
        } else {
            let types = Array(9).fill('red').concat(Array(8).fill('blue')).concat(['assassin']).concat(Array(7).fill('neutral'));
            types = shuffle(types);
            words.forEach((w, i) => board.push({ word: w, type: types[i], revealed: false }));
        }

        room.game = {
            type: 'word-guess',
            isCoop, board,
            players: activePlayers.map(p => ({ ...p, team: null, isSpymaster: false })),
            teams: { red: { players: [], spymaster: null }, blue: { players: [], spymaster: null } },
            turn: 'red', clue: null, guessesLeft: 0,
            turnsLeft: 9, wordsFound: 0, wordsToFind: 15
        };

        if (isCoop) {
            room.game.players[0].isSpymaster = true;
            if (room.game.players[1]) room.game.players[1].isSpymaster = false;
        }

        io.to(roomCode).emit('wordGuess_updateState', room.game);
    }

    socket.on('wordGuess_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        const pIndex = room.game.players.findIndex(p => p.id === socket.id);
        if (pIndex > -1 && !room.game.isCoop) {
            const oldTeam = room.game.players[pIndex].team;
            if (oldTeam) room.game.teams[oldTeam].players = room.game.teams[oldTeam].players.filter(id => id !== socket.id);
            room.game.players[pIndex].team = team;
            room.game.players[pIndex].isSpymaster = false;
            room.game.teams[team].players.push(socket.id);
            if (room.game.teams[oldTeam] && room.game.teams[oldTeam].spymaster === socket.id) room.game.teams[oldTeam].spymaster = null;
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        }
    });

    socket.on('wordGuess_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        const pIndex = room.game.players.findIndex(p => p.id === socket.id);
        if (pIndex > -1 && room.game.players[pIndex].team === team) {
            if (room.game.teams[team].spymaster) {
                const oldSpy = room.game.players.find(p => p.id === room.game.teams[team].spymaster);
                if (oldSpy) oldSpy.isSpymaster = false;
            }
            room.game.players[pIndex].isSpymaster = true;
            room.game.teams[team].spymaster = socket.id;
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        }
    });

    socket.on('wordGuess_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        const p = room.game.players.find(p => p.id === socket.id);
        if (p && p.isSpymaster && (!room.game.clue || room.game.guessesLeft === 0)) {
            if (room.game.isCoop || p.team === room.game.turn) {
                room.game.clue = { word, number };
                room.game.guessesLeft = number + 1; // +1 bonus guess
                room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
            }
        }
    });

    socket.on('wordGuess_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        const g = room.game;
        const p = g.players.find(p => p.id === socket.id);
        
        if (p && !p.isSpymaster && g.clue && g.guessesLeft > 0) {
            if (!g.isCoop && p.team !== g.turn) return;
            const card = g.board[cardIndex];
            if (card.revealed) return;
            card.revealed = true;
            g.guessesLeft--;

            if (g.isCoop) {
                if (card.type === 'green') {
                    g.wordsFound++;
                    if(checkWordGuessWinCondition(roomCode)) return;
                } else if (card.type === 'assassin') {
                    io.to(roomCode).emit('wordGuess_gameOver', { winner: 'none', reason: 'เจอสายลับมือสังหาร!', isCoop: true });
                    return;
                } else {
                    g.guessesLeft = 0; g.turnsLeft--; g.clue = null;
                    if(!checkWordGuessWinCondition(roomCode)) {
                        const spymaster = g.players.find(p=>p.isSpymaster); const guesser = g.players.find(p=>!p.isSpymaster);
                        if(spymaster && guesser) { spymaster.isSpymaster = false; guesser.isSpymaster = true; }
                    }
                }
            } else {
                if (card.type === 'assassin') {
                    const winnerTeam = g.turn === 'red' ? 'blue' : 'red';
                    io.to(roomCode).emit('wordGuess_gameOver', { winner: winnerTeam, reason: `ทีม ${g.turn} ทายโดนมือสังหาร!`, isCoop: false });
                    return;
                } else if (card.type !== g.turn) {
                    g.turn = g.turn === 'red' ? 'blue' : 'red'; g.clue = null; g.guessesLeft = 0;
                    checkWordGuessWinCondition(roomCode);
                } else {
                    if (g.guessesLeft <= 0) { g.turn = g.turn === 'red' ? 'blue' : 'red'; g.clue = null; g.guessesLeft = 0; }
                    checkWordGuessWinCondition(roomCode);
                }
            }
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
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
                if(spymaster && guesser) { spymaster.isSpymaster = false; guesser.isSpymaster = true; }
                room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
            }
        } else {
            g.guessesLeft = 0; g.clue = null; g.turn = g.turn === 'red' ? 'blue' : 'red';
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        }
    });

    function checkWordGuessWinCondition(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        if (g.isCoop) {
            if (g.wordsFound >= g.wordsToFind) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'players', reason: 'หาการ์ดสายลับเจอครบแล้ว!', isCoop: true }); return true; }
            if (g.turnsLeft <= 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'none', reason: 'หมดเทิร์นแล้ว!', isCoop: true }); return true; }
        } else {
            const redLeft = g.board.filter(c => c.type === 'red' && !c.revealed).length;
            const blueLeft = g.board.filter(c => c.type === 'blue' && !c.revealed).length;
            if (redLeft === 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'red', reason: 'เปิดการ์ดครบแล้ว!', isCoop: false }); return true; }
            if (blueLeft === 0) { io.to(roomCode).emit('wordGuess_gameOver', { winner: 'blue', reason: 'เปิดการ์ดครบแล้ว!', isCoop: false }); return true; }
        }
        return false;
    }

    // ==========================================
    // OTHER GAMES (Truth or Lie, Secret Painter, Match the Blank, Unique Clue, Friend Quiz, Number Sort)
    // ==========================================

    // Truth or Lie
    function startTruthOrLieRound(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.currentAnswers = {};
        const activePlayers = room.players.filter(p => p.isOnline);
        const prompt = g.prompts[g.promptIdx % g.prompts.length].replace('[Name]', activePlayers[Math.floor(Math.random() * activePlayers.length)].name);
        io.to(roomCode).emit('truthOrLie_newRound', { prompt });
    }

    socket.on('truthOrLie_submitAnswer', ({ truth, lie }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie') return;
        room.game.currentAnswers[socket.id] = { truth, lie };
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const answersCount = Object.keys(room.game.currentAnswers).length;
        io.to(roomCode).emit('updateProgress', { current: answersCount, total: activeCount, text: "รอเพื่อนแต่งเรื่อง..." });

        if (answersCount >= activeCount) {
            io.to(roomCode).emit('updateProgress', { hide: true });
            room.game.turnOrder = Object.keys(room.game.currentAnswers);
            room.game.currentTurnIdx = 0;
            startTruthOrLieVotingTurn(roomCode);
        }
    });

    function startTruthOrLieVotingTurn(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.votes = {};
        const activePlayerId = g.turnOrder[g.currentTurnIdx];
        const activePlayer = room.players.find(p => p.id === activePlayerId);
        const answers = g.currentAnswers[activePlayerId];
        
        g.lieIsA = Math.random() < 0.5;
        const optionA = g.lieIsA ? answers.lie : answers.truth;
        const optionB = g.lieIsA ? answers.truth : answers.lie;

        io.to(roomCode).emit('truthOrLie_startVoting', { activePlayer: { id: activePlayer.id, name: activePlayer.name, avatar: activePlayer.avatar }, optionA, optionB });
    }

    socket.on('truthOrLie_submitVote', ({ vote }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie') return;
        room.game.votes[socket.id] = vote;
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const votesCount = Object.keys(room.game.votes).length;
        // The active player doesn't vote
        if (votesCount >= activeCount - 1) {
            const activePlayerId = room.game.turnOrder[room.game.currentTurnIdx];
            const activePlayer = room.players.find(p => p.id === activePlayerId);
            const answers = room.game.currentAnswers[activePlayerId];
            const lieOption = room.game.lieIsA ? 'A' : 'B';
            
            let fooledCount = 0;
            const voteDetails = [];
            
            for (const [voterId, v] of Object.entries(room.game.votes)) {
                const voter = room.players.find(p => p.id === voterId);
                if (voter) {
                    voteDetails.push({ name: voter.name, avatar: voter.avatar, vote: v });
                    if (v !== lieOption) { fooledCount++; } 
                    else { voter.score += 1; }
                }
            }

            activePlayer.score += fooledCount;
            if (fooledCount > 0 && fooledCount === activeCount - 1) activePlayer.score += 2; // Bonus

            updateRoomScores(roomCode);
            io.to(roomCode).emit('truthOrLie_showVoteResult', {
                activePlayer: { name: activePlayer.name, avatar: activePlayer.avatar },
                truth: answers.truth, lie: answers.lie, lieOption, fooledCount, totalVoters: activeCount - 1, voteDetails
            });
        }
    });

    socket.on('truthOrLie_nextPlayer', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.players[0].id !== socket.id) return;
        
        room.game.currentTurnIdx++;
        if (room.game.currentTurnIdx < room.game.turnOrder.length) {
            startTruthOrLieVotingTurn(roomCode);
        } else {
            io.to(roomCode).emit('truthOrLie_endRound', { players: room.players.map(p=>({name:p.name, avatar:p.avatar, score:p.score})) });
        }
    });

    socket.on('truthOrLie_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'truth-or-lie' && room.players[0].id === socket.id) {
            room.game.promptIdx++; startTruthOrLieRound(roomCode);
        }
    });

    // Match The Blank
    function startMatchTheBlankRound(roomCode) {
        const room = rooms[roomCode];
        room.game.answers = {};
        const prompt = room.game.prompts[room.game.promptIdx % room.game.prompts.length];
        io.to(roomCode).emit('matchTheBlank_newRound', { prompt });
    }

    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'match-the-blank') return;
        room.game.answers[socket.id] = answer.trim().toLowerCase();
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const answersCount = Object.keys(room.game.answers).length;
        io.to(roomCode).emit('updateProgress', { current: answersCount, total: activeCount, text: "รอเพื่อนส่งคำตอบ..." });

        if (answersCount >= activeCount) {
            io.to(roomCode).emit('updateProgress', { hide: true });
            
            const counts = {};
            for (const ans of Object.values(room.game.answers)) { counts[ans] = (counts[ans] || 0) + 1; }
            
            const results = [];
            room.players.forEach(p => {
                if (room.game.answers[p.id]) {
                    const ans = room.game.answers[p.id];
                    const c = counts[ans];
                    let pts = 0;
                    if (c === 2) pts = 3;
                    else if (c > 2) pts = 1;
                    
                    p.score += pts;
                    results.push({ id: p.id, name: p.name, avatar: p.avatar, word: ans, points: pts });
                }
            });
            
            updateRoomScores(roomCode);
            io.to(roomCode).emit('matchTheBlank_showResult', { results });
        }
    });

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'match-the-blank' && room.players[0].id === socket.id) {
            room.game.promptIdx++; startMatchTheBlankRound(roomCode);
        }
    });

    // Unique Clue
    function startUniqueClueRound(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.clues = {};
        const activePlayers = room.players.filter(p => p.isOnline);
        const guesser = activePlayers[g.guesserIdx % activePlayers.length];
        g.currentGuesserId = guesser.id;
        g.currentWord = g.words[g.wordIdx % g.words.length];
        
        io.to(roomCode).emit('uniqueClue_newRound', { guesser: { id: guesser.id, name: guesser.name, avatar: guesser.avatar }, word: g.currentWord });
    }

    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue') return;
        room.game.clues[socket.id] = clue.trim().toLowerCase();
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const cluesCount = Object.keys(room.game.clues).length;
        // Guesser doesn't submit clue
        if (cluesCount >= activeCount - 1) {
            const counts = {};
            for (const c of Object.values(room.game.clues)) { counts[c] = (counts[c] || 0) + 1; }
            
            room.game.validClues = [];
            room.game.playerClues = [];
            for (const [pid, c] of Object.entries(room.game.clues)) {
                const player = room.players.find(p => p.id === pid);
                const isValid = counts[c] === 1;
                if (isValid) room.game.validClues.push(c);
                room.game.playerClues.push({ playerId: pid, playerName: player.name, playerAvatar: player.avatar, clue: c, isValid });
            }
            
            io.to(roomCode).emit('uniqueClue_startGuessing', { validClues: room.game.validClues });
        }
    });

    socket.on('uniqueClue_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue' || socket.id !== room.game.currentGuesserId) return;
        
        const isCorrect = guess.trim().toLowerCase() === room.game.currentWord.toLowerCase();
        if (isCorrect) {
            const guesser = room.players.find(p => p.id === socket.id);
            if (guesser) guesser.score += 2;
            room.game.playerClues.forEach(pc => {
                if (pc.isValid) {
                    const p = room.players.find(p => p.id === pc.playerId);
                    if (p) p.score += 1;
                }
            });
            updateRoomScores(roomCode);
        }
        
        io.to(roomCode).emit('uniqueClue_showResult', {
            isCorrect, word: room.game.currentWord, guess, playerClues: room.game.playerClues
        });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'unique-clue' && room.players[0].id === socket.id) {
            room.game.wordIdx++; room.game.guesserIdx++; startUniqueClueRound(roomCode);
        }
    });

    // Secret Painter
    function startSecretPainterRound(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.lines = []; g.votes = {};
        const activePlayers = room.players.filter(p => p.isOnline);
        const secretIdx = Math.floor(Math.random() * activePlayers.length);
        g.secretPainterId = activePlayers[secretIdx].id;
        
        const wordData = g.words[g.wordIdx % g.words.length];
        g.currentWord = wordData;
        g.category = "หมวดหมู่ทั่วไป (อิงจากชุดคำศัพท์)"; 
        g.turnOrder = shuffle([...activePlayers.map(p => p.id)]);
        g.currentTurnIdx = 0;
        g.round = 1;
        
        const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3'];
        activePlayers.forEach((p, i) => p.spColor = colors[i % colors.length]);

        activePlayers.forEach(p => {
            const pSocket = io.sockets.sockets.get(p.id);
            if (pSocket) {
                pSocket.emit('secretPainter_newRound', {
                    isSecretPainter: p.id === g.secretPainterId,
                    word: g.currentWord, category: g.category,
                    myColor: p.spColor,
                    currentTurnId: g.turnOrder[0],
                    currentTurnName: room.players.find(x => x.id === g.turnOrder[0]).name,
                    currentTurnAvatar: room.players.find(x => x.id === g.turnOrder[0]).avatar
                });
            }
        });
    }

    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        socket.to(roomCode).emit('secretPainter_onDraw', data);
    });

    socket.on('secretPainter_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter' || socket.id !== room.game.turnOrder[room.game.currentTurnIdx]) return;
        
        room.game.currentTurnIdx++;
        if (room.game.currentTurnIdx >= room.game.turnOrder.length) {
            room.game.currentTurnIdx = 0; room.game.round++;
        }
        
        if (room.game.round > 2) {
            const activePlayers = room.players.filter(p => p.isOnline).map(p => ({ id: p.id, name: p.name, avatar: p.avatar, color: p.spColor }));
            io.to(roomCode).emit('secretPainter_startVoting', { players: activePlayers });
        } else {
            const nextP = room.players.find(p => p.id === room.game.turnOrder[room.game.currentTurnIdx]);
            io.to(roomCode).emit('secretPainter_updateTurn', { currentTurnId: nextP.id, currentTurnName: nextP.name, currentTurnAvatar: nextP.avatar, round: room.game.round });
        }
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        
        room.game.votes[votedId] = (room.game.votes[votedId] || 0) + 1;
        const activeCount = room.players.filter(p => p.isOnline).length;
        const totalVotes = Object.values(room.game.votes).reduce((a,b)=>a+b, 0);
        
        if (totalVotes >= activeCount) {
            let maxVotes = 0; let accusedIds = [];
            for (const [id, count] of Object.entries(room.game.votes)) {
                if (count > maxVotes) { maxVotes = count; accusedIds = [id]; }
                else if (count === maxVotes) { accusedIds.push(id); }
            }
            
            const isPainterCaught = accusedIds.length === 1 && accusedIds[0] === room.game.secretPainterId;
            const spPlayer = room.players.find(p => p.id === room.game.secretPainterId);
            
            io.to(roomCode).emit('secretPainter_reveal', {
                votes: room.game.votes, isPainterCaught,
                secretPainterId: spPlayer.id, secretPainterName: spPlayer.name, secretPainterAvatar: spPlayer.avatar
            });
        }
    });

    socket.on('secretPainter_submitGuess', ({ guessWord }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter' || socket.id !== room.game.secretPainterId) return;
        
        const isCorrect = guessWord.trim().toLowerCase() === room.game.currentWord.toLowerCase() || guessWord === "I_WON_ALREADY";
        
        if (isCorrect) {
            const spPlayer = room.players.find(p => p.id === socket.id);
            if (spPlayer) spPlayer.score += 5;
        } else {
            room.players.forEach(p => { if (p.id !== socket.id && p.isOnline) p.score += 2; });
        }
        updateRoomScores(roomCode);
        io.to(roomCode).emit('secretPainter_gameOver', { isCorrect, actualWord: room.game.currentWord });
    });

    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'secret-painter' && room.players[0].id === socket.id) {
            room.game.wordIdx++; startSecretPainterRound(roomCode);
        }
    });

    // Friend Quiz
    function startFriendQuizRound(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.answers = {}; g.bets = {};
        const activePlayers = room.players.filter(p => p.isOnline);
        g.secretPlayerId = activePlayers[Math.floor(Math.random() * activePlayers.length)].id;
        
        const qTemplate = g.questions[g.questionIdx % g.questions.length];
        g.currentQuestion = qTemplate.replace('[Name]', room.players.find(p => p.id === g.secretPlayerId).name);
        
        io.to(roomCode).emit('friendQuiz_newRound', { question: g.currentQuestion });
    }

    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz') return;
        room.game.answers[socket.id] = answer;
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const answersCount = Object.keys(room.game.answers).length;
        if (answersCount >= activeCount) {
            const secretAns = room.game.answers[room.game.secretPlayerId];
            const variance = Math.max(1, Math.floor(secretAns * 0.2)); // 20% variance
            
            const ranges = [
                { min: -Infinity, max: secretAns - variance - 1, label: `น้อยกว่า ${secretAns - variance}` },
                { min: secretAns - variance, max: secretAns + variance, label: `${secretAns - variance} ถึง ${secretAns + variance}` },
                { min: secretAns + variance + 1, max: Infinity, label: `มากกว่า ${secretAns + variance}` }
            ];
            room.game.ranges = ranges;
            
            const secretPlayer = room.players.find(p => p.id === room.game.secretPlayerId);
            io.to(roomCode).emit('friendQuiz_startBetting', { 
                secretPlayer: { id: secretPlayer.id, name: secretPlayer.name, avatar: secretPlayer.avatar }, ranges
            });
        }
    });

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz') return;
        room.game.bets[socket.id] = betOnRangeIndex;
        
        const activeCount = room.players.filter(p => p.isOnline).length;
        const betsCount = Object.keys(room.game.bets).length;
        // Secret player doesn't bet
        if (betsCount >= activeCount - 1) {
            const secretAns = room.game.answers[room.game.secretPlayerId];
            let correctRangeIndex = -1;
            room.game.ranges.forEach((r, idx) => { if (secretAns >= r.min && secretAns <= r.max) correctRangeIndex = idx; });
            
            const winners = [];
            for (const [pid, betIdx] of Object.entries(room.game.bets)) {
                if (betIdx === correctRangeIndex) {
                    winners.push(pid);
                    const p = room.players.find(x => x.id === pid);
                    if(p) p.score += 2;
                }
            }
            updateRoomScores(roomCode);
            
            const allPlayersData = room.players.filter(p => p.isOnline).map(p => ({
                id: p.id, name: p.name, avatar: p.avatar, answer: room.game.answers[p.id], isSecret: p.id === room.game.secretPlayerId
            }));
            
            io.to(roomCode).emit('friendQuiz_showResult', { allPlayers: allPlayersData, correctRangeIndex, winners });
        }
    });

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'friend-quiz' && room.players[0].id === socket.id) {
            room.game.questionIdx++; startFriendQuizRound(roomCode);
        }
    });

    // Number Sort
    function startNumberSortRound(roomCode) {
        const room = rooms[roomCode]; const g = room.game;
        g.numbers = {};
        const activePlayers = room.players.filter(p => p.isOnline);
        const theme = g.themes[g.themeIdx % g.themes.length];
        
        activePlayers.forEach(p => { g.numbers[p.id] = Math.floor(Math.random() * 100) + 1; });
        
        activePlayers.forEach(p => {
            const pSocket = io.sockets.sockets.get(p.id);
            if (pSocket) {
                pSocket.emit('numberSort_newRound', {
                    theme, number: g.numbers[p.id], players: activePlayers.map(x=>({id:x.id, name:x.name, avatar:x.avatar}))
                });
            }
        });
    }

    socket.on('numberSort_submitOrder', ({ orderedPlayerIds }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'number-sort') return;
        
        let isCorrect = true;
        let lastNum = -1;
        orderedPlayerIds.forEach(id => {
            const num = room.game.numbers[id];
            if (num < lastNum) isCorrect = false;
            lastNum = num;
        });

        if (isCorrect) {
            room.players.forEach(p => { if (p.isOnline) p.score += 2; });
            updateRoomScores(roomCode);
        }

        const results = orderedPlayerIds.map(id => {
            const p = room.players.find(x => x.id === id);
            return { id, name: p.name, avatar: p.avatar, number: room.game.numbers[id] };
        });

        io.to(roomCode).emit('numberSort_showResults', { results, success: isCorrect });
    });

    socket.on('numberSort_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'number-sort' && room.players[0].id === socket.id) {
            room.game.themeIdx++; startNumberSortRound(roomCode);
        }
    });

});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server listening on *:3000');
});