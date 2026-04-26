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

// --- Game Data (Expanded) ---
const wordGuessData = {
    words: [
        'กล้วย', 'โรงเรียน', 'ตำรวจ', 'ดวงจันทร์', 'ทะเล', 'ภูเขา', 'คอมพิวเตอร์', 'โทรศัพท์', 'หนังสือ', 'ปากกา',
        'เครื่องบิน', 'รถไฟ', 'จักรยาน', 'หมอ', 'พยาบาล', 'โรงพยาบาล', 'ตลาด', 'วัด', 'ช้าง', 'สิงโต',
        'กาแฟ', 'ประเทศไทย', 'ญี่ปุ่น', 'อเมริกา', 'ฟุตบอล', 'นักร้อง', 'ดารา', 'ภาพยนตร์', 'ดนตรี', 'ชายหาด',
        'โรงแรม', 'ร้านอาหาร', 'เก้าอี้', 'โต๊ะ', 'เตียง', 'หน้าต่าง', 'ประตู', 'แม่น้ำ', 'สะพาน', 'ถนน',
        'ตู้เย็น', 'พัดลม', 'กระทะ', 'หม้อ', 'กรรไกร', 'ยางลบ', 'นาฬิกา', 'แว่นตา', 'สบู่', 'แชมพู',
        'ผ้าเช็ดตัว', 'หมอน', 'ผ้าห่ม', 'กระเป๋า', 'รองเท้า', 'ถุงเท้า', 'เสื้อยืด', 'กางเกง', 'กระโปรง', 'หมวก',
        'กุญแจ', 'ร่ม', 'เงิน', 'ทอง', 'เพชร', 'แหวน', 'สร้อย', 'กำไล', 'นาฬิกาข้อมือ', 'กระเป๋าตังค์',
        'เมาส์', 'คีย์บอร์ด', 'ลำโพง', 'หูฟัง', 'กระจก', 'แปรงสีฟัน', 'ยาสีฟัน', 'ไม้กวาด', 'ถังขยะ', 'กระถางต้นไม้',
        'ดินสอสี', 'ไม้บรรทัด', 'กระดาษทิชชู่', 'นิตยสาร', 'หนังสือพิมพ์', 'ปฏิทิน', 'แว่นกันแดด', 'เข็มขัด', 'เนคไท', 'ถุงมือ',
        'รองเท้าแตะ', 'รองเท้าผ้าใบ', 'รองเท้าส้นสูง', 'เสื้อกันหนาว', 'เสื้อกันฝน', 'กางเกงขาสั้น', 'กางเกงยีนส์', 'ชุดว่ายน้ำ', 'ผ้าพันคอ', 'หมวกแก๊ป',
        'หมวกกันน็อค', 'เต็นท์', 'ไฟฉาย', 'เข็มทิศ', 'กล้องส่องทางไกล', 'กล้องถ่ายรูป', 'ขาตั้งกล้อง', 'ไมโครโฟน', 'กีตาร์', 'เปียโน'
    ]
};
const numberSortData = {
    themes: [
        "ความนิยมของสัตว์เลี้ยง", "ของที่คิดว่าแพงที่สุด", "ความสามารถพิเศษที่อยากมี",
        "ตัวละครที่แข็งแกร่งที่สุด", "อาหารที่เผ็ดที่สุด", "สถานที่ที่อยากไปมากที่สุด",
        "ระดับความน่ากลัวของผี", "ความอร่อยของเมนูไข่", "ความลำบากในการตื่นตอนเช้า",
        "ระดับความขี้เกียจของตัวเอง", "ความเจ็บปวดตอนอกหัก", "ระดับความร้อนของประเทศไทย",
        "ความน่ารักของแมว", "ความหัวร้อนเวลาเล่นเกมแพ้", "ระดับความหิวตอนดึก",
        "ความรกของห้องนอน", "ความอยากรวย", "ความกลัวแมลงสาบ", "ความบ้าบอของเพื่อนในกลุ่ม",
        "ความอยากไปเที่ยวทะเล", "ระดับความอยากกินหมูกระทะ", "ความอยากลาออก", "ความน่ารำคาญของรถติด",
        "ความยากของการลดน้ำหนัก", "ความสนุกของหนังผี", "ระดับความติ่งดารา", "ความกลัวความสูง",
        "ความอยากถูกหวย", "ระดับความคลั่งรัก", "ความดองแชทเก่ง", "ความจำสั้น ขี้ลืม", "ความเซียนเกม",
        "ความอร่อยของชาบู", "ความตื่นเต้นเวลาเปิดกล่องสุ่ม", "ความทรมานตอนปวดท้องเข้าห้องน้ำ",
        "ระดับความหวงของกิน", "ความชอบใส่เสื้อสีดำ", "ความกลัวเข็มฉีดยา", "ความอยากรวยทางลัด"
    ]
};
const friendQuizData = {
    questions: [
        "คุณมีรองเท้ากี่คู่?", "คุณใช้เวลาอาบน้ำโดยเฉลี่ยกี่นาที?", "คุณดื่มกาแฟ/ชา วันละกี่แก้ว?",
        "คุณนอนวันละกี่ชั่วโมง?", "คุณมีเพื่อนใน Facebook/IG กี่คน?", "คุณคิดว่าคุณจะอายุยืนกี่ปี?",
        "คุณมีแอปในมือถือกี่แอป?", "คุณเคยแอบชอบคนอื่นมากี่ครั้งในชีวิต?", "เดือนนึงคุณกินชาบู/หมูกระทะกี่ครั้ง?",
        "คุณให้คะแนนหน้าตาตัวเองเท่าไหร่ (1-100)?", "คุณมีเงินสดติดกระเป๋าตอนนี้กี่บาท?", "สัปดาห์นึงคุณออกกำลังกายกี่ชั่วโมง?",
        "คุณตื่นนอนกี่โมง (ใส่เป็นตัวเลขเช่น 730 คือ 7:30 น.)?", "วันนึงคุณจับมือถือกี่ชั่วโมง?", "คุณเคยร้องไห้ดูหนังเศร้ามากี่เรื่อง?",
        "คุณไปเที่ยวต่างจังหวัดปีละกี่ครั้ง?", "คุณมีเสื้อยืดในตู้กี่ตัว?", "คุณให้คะแนนความโสดของตัวเองเท่าไหร่ (1-100)?",
        "คุณมีรูปในมือถือกี่รูป?", "คุณซื้อของออนไลน์เดือนละกี่ชิ้น?", "คุณเคยไปต่างประเทศกี่ครั้ง?",
        "คุณเคยกินบุฟเฟต์คุ้มสุดกี่จาน?", "คุณตื่นกี่โมงในวันหยุด (ใส่ตัวเลข)?", "คุณมีเงินเก็บในบัญชีตอนนี้กี่บาท (คร่าวๆ)?",
        "คุณมีแฟนมากี่คน?", "คุณเคยอกหักกี่ครั้ง?", "คุณดูซีรีส์จบไปแล้วกี่เรื่อง?",
        "คุณฟังเพลงวันละกี่ชั่วโมง?", "คุณอาบน้ำนานสุดกี่นาที?", "คุณเคยคุยโทรศัพท์นานสุดกี่นาที?",
        "คุณมีกรุ๊ปไลน์กี่กรุ๊ป?", "คุณเคยกด Snooze นาฬิกาปลุกกี่ครั้งต่อเช้า?", "คุณมีรูปสัตว์เลี้ยงในเครื่องกี่รูป?"
    ]
};
const secretPainterData = {
    categories: [
        { name: "สัตว์ป่า", words: ["ช้าง", "สิงโต", "ยีราฟ", "ลิง", "เสือ", "งู", "หมี", "จระเข้", "แรด", "นกฮูก", "ม้าลาย", "กวาง"] },
        { name: "อาหาร", words: ["พิซซ่า", "แฮมเบอร์เกอร์", "ซูชิ", "ส้มตำ", "ชาบู", "ไข่ดาว", "ต้มยำกุ้ง", "ผัดไทย", "กะเพรา", "ข้าวผัด"] },
        { name: "สถานที่", words: ["โรงพยาบาล", "โรงเรียน", "ชายหาด", "สวนสนุก", "ภูเขา", "สนามบิน", "ตลาดนัด", "วัด", "สถานีตำรวจ", "ธนาคาร"] },
        { name: "อาชีพ", words: ["หมอ", "ตำรวจ", "ครู", "นักดับเพลิง", "ทหาร", "นักร้อง", "โปรแกรมเมอร์", "ช่างภาพ", "พยาบาล", "พ่อครัว"] },
        { name: "ยานพาหนะ", words: ["รถไฟ", "เครื่องบิน", "เรือ", "จักรยาน", "รถมอเตอร์ไซค์", "รถถัง", "เฮลิคอปเตอร์", "รถบรรทุก", "รถตู้"] },
        { name: "ผลไม้", words: ["แอปเปิ้ล", "กล้วย", "ส้ม", "แตงโม", "มะม่วง", "ทุเรียน", "สตรอว์เบอร์รี", "องุ่น", "สับปะรด", "มะละกอ"] },
        { name: "กีฬา", words: ["ฟุตบอล", "บาสเกตบอล", "ว่ายน้ำ", "แบดมินตัน", "เทนนิส", "วอลเลย์บอล", "กอล์ฟ", "มวย", "วิ่ง", "ปิงปอง"] },
        { name: "เครื่องใช้ไฟฟ้า", words: ["ทีวี", "ตู้เย็น", "เครื่องซักผ้า", "แอร์", "พัดลม", "หม้อหุงข้าว", "เตารีด", "ไมโครเวฟ", "ไดร์เป่าผม", "คอมพิวเตอร์"] },
        { name: "อวัยวะ", words: ["ตา", "จมูก", "ปาก", "หู", "มือ", "เท้า", "หัวใจ", "สมอง", "ผม", "ลิ้น"] },
        { name: "ของหวาน", words: ["เค้ก", "โดนัท", "ไอศกรีม", "ช็อกโกแลต", "เยลลี่", "บิงซู", "แพนเค้ก", "คุกกี้", "น้ำแข็งไส"] }
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
        "___ หมา", "แมว ___", "เพื่อน ___", "___ ทิพย์", "คน ___", "รถ ___", "___ บ้าน", "___ แดง", 
        "ดอก ___", "___ กิน", "___ นอน", "เด็ก ___", "___ เรียน", "___ โต", "หมี ___", "เสือ ___", 
        "___ ป่า", "___ เขา", "___ ดำ", "___ สวย", "ช่าง ___", "___ ฟ้า", "แม่ ___", "พ่อ ___",
        "___ แตก", "___ รั่ว", "หน้า ___", "___ หาย", "___ กรอบ", "ไก่ ___", "___ ชิ้น", "ยาง ___",
        "___ เครื่อง", "ท้อง ___", "___ ดี", "___ กว้าง", "___ แคบ", "ตา ___", "___ บอด", "หู ___", 
        "___ หนวก", "มือ ___", "___ ไว", "ขา ___", "___ สั้น", "___ ยาว", "___ ร้อน", "หนาว ___"
    ]
};
const uniqueClueData = {
    words: [
        'ไดโนเสาร์', 'แวมไพร์', 'ซอมบี้', 'แม่มด', 'นางเงือก', 'มนุษย์ต่างดาว', 'ผีดิบ', 'หุ่นยนต์',
        'พีระมิด', 'กำแพงเมืองจีน', 'หอไอเฟล', 'เทพเจ้า', 'มังกร', 'ยูนิคอร์น', 'กุหลาบ', 'ดอกทานตะวัน',
        'แผ่นดินไหว', 'พายุ', 'สึนามิ', 'น้ำท่วม', 'ภูเขาไฟระเบิด', 'หิมะ', 'ทะเลทราย', 'ป่าดิบชื้น',
        'ช็อกโกแลต', 'ไอศกรีม', 'เค้ก', 'คุกกี้', 'ขนมปัง', 'ลูกอม', 'เยลลี่', 'มาการอง', 'แพนเค้ก',
        'โทรทัศน์', 'ตู้เย็น', 'ไมโครเวฟ', 'เครื่องซักผ้า', 'พัดลม', 'แอร์', 'เตารีด', 'เครื่องดูดฝุ่น',
        'แว่นขยาย', 'กล้องโทรทรรศน์', 'กล้องจุลทรรศน์', 'แผนที่', 'เข็มทิศ', 'สมอเรือ', 'โจรสลัด', 'สมบัติ',
        'นินจา', 'เอเลี่ยน', 'ขั้วโลกเหนือ', 'อวกาศ', 'ยานอวกาศ', 'มนุษย์อวกาศ', 'จรวด', 'ดาวเคราะห์', 
        'ดวงอาทิตย์', 'ดาวเทียม', 'ดาวตก', 'หลุมดำ', 'กาแล็กซี', 'ทางช้างเผือก', 'จักรวาล', 'แม่เหล็ก', 
        'ลูกโลก', 'กระเป๋าเดินทาง', 'พาสปอร์ต', 'ตั๋วเครื่องบิน', 'รีสอร์ท', 'แคมป์ปิ้ง', 'ถุงนอน', 'หน้ากาก',
        'โล่', 'ดาบ', 'ธนู', 'ปืน', 'กระสุน', 'ระเบิด', 'รถถัง', 'เฮลิคอปเตอร์', 'เรือดำน้ำ', 'รถดับเพลิง'
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
        if (room && room.players.length < 16 && room.gameState === 'waiting') {
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
                }
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });

    // --- Unique Clue Listeners ---
    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'unique-clue' || room.game.phase !== 'clue_giving') return;

        if (socket.id === room.game.guesserId) return;

        room.game.clues[socket.id] = clue.trim();
        const clueGiversCount = room.players.length - 1;

        if (Object.keys(room.game.clues).length === clueGiversCount) {
            const clueCounts = {};
            Object.values(room.game.clues).forEach(c => {
                const normalized = c.toLowerCase();
                clueCounts[normalized] = (clueCounts[normalized] || 0) + 1;
            });

            const validClues = [];
            const playerClues = [];

            for (const [pId, c] of Object.entries(room.game.clues)) {
                const normalized = c.toLowerCase();
                const playerName = room.players.find(p => p.id === pId).name;
                const isDuplicate = clueCounts[normalized] > 1;

                playerClues.push({ playerId: pId, playerName, clue: c, isValid: !isDuplicate });
                if (!isDuplicate) {
                    validClues.push(c);
                }
            }

            room.game.phase = 'guessing';
            room.game.validClues = validClues;
            room.game.playerClues = playerClues;

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
        }
        
        room.game.phase = 'result';
        io.to(roomCode).emit('uniqueClue_showResult', {
            isCorrect,
            word: room.game.word,
            guess: guess.trim(),
            playerClues: room.game.playerClues,
            players: room.players.map(p => ({id: p.id, name: p.name, score: p.score}))
        });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startUniqueClueRound(roomCode);
        }
    });

    // --- Match The Blank Listeners ---
    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.gameType !== 'match-the-blank') return;

        room.game.answers[socket.id] = answer.trim();

        if (Object.keys(room.game.answers).length === room.players.length) {
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
                
                if (wordCounts[w] === 2) {
                    pointsEarned = 3;
                } else if (wordCounts[w] > 2) {
                    pointsEarned = 1;
                } else {
                    pointsEarned = 0;
                }
                
                p.score += pointsEarned;
                results.push({
                    id: p.id,
                    name: p.name,
                    word: w,
                    points: pointsEarned,
                    totalScore: p.score
                });
            });

            io.to(roomCode).emit('matchTheBlank_showResult', { results });
        }
    });

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startMatchTheBlankRound(roomCode);
        }
    });

    // --- Secret Painter Listeners ---
    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            socket.to(roomCode).emit('secretPainter_onDraw', data);
        }
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
                    players: room.players.map(p => ({ id: p.id, name: p.name, color: game.playerInfo[p.id].color }))
                });
                return;
            }
        }

        const nextPlayerId = game.turnOrder[game.currentTurnIndex];
        const nextPlayer = room.players.find(p => p.id === nextPlayerId);
        
        io.to(roomCode).emit('secretPainter_updateTurn', {
            currentTurnId: nextPlayerId,
            currentTurnName: nextPlayer.name,
            round: game.round
        });
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (!room || !room.game || room.game.phase !== 'voting') return;

        room.game.votes[socket.id] = votedId;

        if (Object.keys(room.game.votes).length === room.players.length) {
            room.game.phase = 'reveal';
            
            const voteCounts = {};
            Object.values(room.game.votes).forEach(id => {
                voteCounts[id] = (voteCounts[id] || 0) + 1;
            });

            let maxVotes = 0;
            let mostVotedId = null;
            let isTie = false;

            for (const [id, count] of Object.entries(voteCounts)) {
                if (count > maxVotes) {
                    maxVotes = count;
                    mostVotedId = id;
                    isTie = false;
                } else if (count === maxVotes) {
                    isTie = true;
                }
            }

            const secretPainter = room.players.find(p => p.id === room.game.secretPainterId);
            const isPainterCaught = (!isTie && mostVotedId === room.game.secretPainterId);

            io.to(roomCode).emit('secretPainter_reveal', {
                votes: voteCounts,
                secretPainterId: room.game.secretPainterId,
                secretPainterName: secretPainter.name,
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
        
        io.to(roomCode).emit('secretPainter_gameOver', {
            isCorrect: isCorrect,
            actualWord: room.game.word,
            category: room.game.category
        });
    });
    
    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            startSecretPainterRound(roomCode);
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
                if (room.game.guessesLeft === 0) {
                    switchWordGuessTurn(roomCode);
                }
            } else {
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

// --- Unique Clue Logic Functions ---
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

    room.game = {
        phase: 'clue_giving',
        word: word,
        guesserId: guesserId,
        clues: {}
    };

    io.to(roomCode).emit('uniqueClue_newRound', {
        guesser: { id: guesserId, name: room.players[guesserIndex].name },
        word: word,
        players: room.players.map(p => ({id: p.id, name: p.name, score: p.score}))
    });
}

// --- Secret Painter Logic Functions ---
function startSecretPainterRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }

    const catIndex = Math.floor(Math.random() * secretPainterData.categories.length);
    const categoryObj = secretPainterData.categories[catIndex];
    const wordIndex = Math.floor(Math.random() * categoryObj.words.length);
    const word = categoryObj.words[wordIndex];

    const secretPainterIndex = Math.floor(Math.random() * room.players.length);
    const secretPainterId = room.players[secretPainterIndex].id;

    const shuffledColors = [...secretPainterData.colors].sort(() => 0.5 - Math.random());
    const playerInfo = {};
    const turnOrder = [];

    const shuffledPlayers = [...room.players].sort(() => 0.5 - Math.random());
    
    shuffledPlayers.forEach((p, index) => {
        playerInfo[p.id] = {
            color: shuffledColors[index % shuffledColors.length],
            isSecretPainter: p.id === secretPainterId
        };
        turnOrder.push(p.id);
    });

    room.game = {
        category: categoryObj.name,
        word: word,
        secretPainterId: secretPainterId,
        playerInfo: playerInfo,
        turnOrder: turnOrder,
        currentTurnIndex: 0,
        round: 1, 
        votes: {},
        phase: 'drawing'
    };

    room.players.forEach(p => {
        const info = playerInfo[p.id];
        io.to(p.id).emit('secretPainter_newRound', {
            category: categoryObj.name,
            word: info.isSecretPainter ? null : word, 
            isSecretPainter: info.isSecretPainter,
            myColor: info.color,
            turnOrderNames: turnOrder.map(id => room.players.find(player => player.id === id).name),
            currentTurnId: turnOrder[0],
            currentTurnName: room.players.find(player => player.id === turnOrder[0]).name
        });
    });
}

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

// --- Match The Blank Logic Functions ---
function startMatchTheBlankRound(roomCode) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting';
        io.to(roomCode).emit('updateLobby', room.players);
        return;
    }
    
    const promptIndex = Math.floor(Math.random() * matchTheBlankData.prompts.length);
    const prompt = matchTheBlankData.prompts[promptIndex];

    room.game = {
        prompt: prompt,
        answers: {}
    };

    io.to(roomCode).emit('matchTheBlank_newRound', { 
        prompt: prompt, 
        players: room.players.map(p => ({id: p.id, name: p.name, score: p.score})) 
    });
}

// --- Server Start ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});