const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const ALL_ITEMS = [
    // หมวดกาแฟ
    "☕ เอสเพรสโซ่ร้อน", "🧊 อเมริกาโน่เย็น", "☕ อเมริกาโน่ร้อน", "🥛 ลาเต้ร้อน", "🧊 ลาเต้เย็น", 
    "🍫 มอคค่าเย็น", "🍮 คาราเมลมัคคิอาโต้", "☕ คาปูชิโน่", "🥥 กาแฟมะพร้าว", "🍊 กาแฟส้มยูซุ", "☕ เดอร์ตี้คอฟฟี่", 
    // หมวดชา
    "🍵 มัทฉะลาเต้", "🍵 โฮจิฉะร้อน", "🧊 ชาเขียวเย็น", "🧋 ชานมไข่มุก", "🇹🇭 ชาไทยไข่มุก", 
    "🍋 ชามะนาว", "🍑 ชาพีช", "🍎 ชาแอปเปิ้ล", "🌼 ชาคาโมมายล์", 
    // หมวดนมและปั่น
    "🍫 โกโก้เย็น", "🥛 นมสดคาราเมล", "🍓 นมสตรอว์เบอร์รี่", "🍠 นมมันม่วง", "🍫 ช็อกโกแลตมิ้นต์", 
    "🍓 สตรอว์เบอร์รี่ปั่น", "🥭 มะม่วงสมูทตี้", "🫐 มิกซ์เบอร์รี่ปั่น", "🍫 โกโก้ปั่นโอริโอ้", "🍵 มัทฉะแฟรปเป้",
    // หมวดเค้ก
    "🍰 เค้กส้ม", "🍰 เค้กช็อกโกแลตฟัดจ์", "🍰 เค้กเรดเวลเวท", "🍰 ชิฟฟ่อนมะพร้าว", "🧀 ชีสเค้กหน้าไหม้", 
    "🧀 บลูเบอร์รี่ชีสพาย", "🍰 สตรอว์เบอร์รี่ชอร์ตเค้ก", "🥕 เค้กแครอท", "🍰 ทีรามิสุ", "🍰 เครปเค้กชาไทย",
    // หมวดเบเกอรี่และขนมหวาน
    "🥐 ครัวซองต์เนยสด", "🥐 อัลมอนด์ครัวซองต์", "🥐 ครัวซองต์ลาวา", "🥧 พายแอปเปิ้ล", "🥧 พายข้าวโพด", 
    "🧇 วาฟเฟิลน้ำผึ้ง", "🥞 แพนเค้กซูเฟล่", "🍞 ฮันนี่โทสต์", "🍞 ปังปิ้งเนยนม", "🥨 เพรทเซลอัลมอนด์", 
    "🥯 เบเกิลครีมชีส", "🍪 คุกกี้ช็อกโกแลตชิพ", "🍩 โดนัทเคลือบน้ำตาล", "🍮 พุดดิ้งคาราเมล", "🍮 บราวนี่หนึบ",
    // หมวดของคาว
    "🥪 แซนด์วิชแฮมชีส", "🥪 แซนด์วิชทูน่า", "🍟 เฟรนช์ฟรายส์ชีส", "🍗 นักเก็ตไก่", "🥗 สลัดอกไก่", 
    "🍝 สปาเก็ตตี้คาโบนาร่า", "🍝 สปาเก็ตตี้ขี้เมา"
];

let gameState = {
    players: {}, 
    status: 'lobby', 
    level: 1,
    lives: 3,
    maxLives: 3,
    targetItems: [],
    shuffledOptions: [],
    guessedCorrectly: [],
    wrongGuesses: [],
    readerId: null,
    playerHands: {},
    turnOrder: [],
    currentTurnIndex: 0
};

// ฟังก์ชันสุ่ม Array
function shuffleArray(array) {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

// เริ่มเกมใหม่
function initGame() {
    gameState.level = 1;
    gameState.lives = gameState.maxLives;
    startLevel();
}

// เริ่มเลเวลใหม่
function startLevel() {
    const playerIds = Object.keys(gameState.players);
    const playerCount = playerIds.length;
    
    // จำนวนการ์ดทั้งหมด = จำนวนผู้เล่น x เลเวล (รับประกันว่าหารลงตัวและได้คนละเท่าๆ กัน)
    const orderCount = Math.min(playerCount * gameState.level, ALL_ITEMS.length - 5);
    const decoyCount = Math.min(6 + gameState.level, 10); // เมนูหลอก
    
    const shuffledAll = shuffleArray(ALL_ITEMS);
    gameState.targetItems = shuffledAll.slice(0, orderCount);
    
    const decoys = shuffledAll.slice(orderCount, orderCount + decoyCount);
    gameState.shuffledOptions = shuffleArray([...gameState.targetItems, ...decoys]);
    
    gameState.guessedCorrectly = [];
    gameState.wrongGuesses = [];

    // สุ่มคนอ่าน
    gameState.readerId = playerIds[Math.floor(Math.random() * playerIds.length)];
    gameState.status = 'reader_phase';
    
    // สุ่มคิวการเล่น
    gameState.turnOrder = shuffleArray(playerIds);
    gameState.currentTurnIndex = 0;
    
    // แจกการ์ดให้ผู้เล่น (วนแจกทีละใบจนหมด)
    gameState.playerHands = {};
    playerIds.forEach(id => gameState.playerHands[id] = []);
    
    let itemsToDistribute = [...gameState.targetItems];
    let pIndex = 0;
    while(itemsToDistribute.length > 0) {
        gameState.playerHands[playerIds[pIndex]].push(itemsToDistribute.pop());
        pIndex = (pIndex + 1) % playerIds.length;
    }

    io.emit('state_update', gameState);
}

io.on('connection', (socket) => {
    
    // ผู้เล่นขอเข้าห้อง
    socket.on('join_game', (playerName) => {
        const playerCount = Object.keys(gameState.players).length;
        if (playerCount >= 10) {
            socket.emit('error_msg', 'ขออภัย ห้องเต็มแล้ว');
            return;
        }

        const isHost = playerCount === 0;
        // บันทึกข้อมูลผู้เล่นลงในห้อง
        gameState.players[socket.id] = { id: socket.id, name: playerName.substring(0, 15), isHost: isHost };

        // ส่งสถานะอัพเดทไปให้ทุกคน
        io.emit('state_update', gameState);
    });

    socket.on('start_game', () => {
        const player = gameState.players[socket.id];
        if (player && player.isHost) {
            // ต้องมีอย่างน้อย 2 คนถึงเริ่มได้ (หรือ 1 คนสำหรับทดสอบ)
            initGame();
        }
    });

    socket.on('next_level', () => {
        const player = gameState.players[socket.id];
        if (player && player.isHost) {
            gameState.level++;
            startLevel();
        }
    });

    socket.on('return_lobby', () => {
        const player = gameState.players[socket.id];
        if (player && player.isHost) {
            gameState.status = 'lobby';
            io.emit('state_update', gameState);
        }
    });

    socket.on('reader_ready', () => {
        if (gameState.status === 'reader_phase' && socket.id === gameState.readerId) {
            gameState.status = 'turn_phase';
            io.emit('state_update', gameState);
        }
    });

    // ระบบทายการ์ด
    socket.on('guess_item', (item) => {
        if (gameState.status !== 'turn_phase') return;
        if (gameState.guessedCorrectly.includes(item) || gameState.wrongGuesses.includes(item)) return;

        const currentPlayerId = gameState.turnOrder[gameState.currentTurnIndex];
        const playerName = gameState.players[socket.id]?.name || 'ผู้เล่น';
        
        // เช็คว่าใช่คิวของคนที่กดหรือไม่
        if (socket.id !== currentPlayerId) return;

        // เช็คว่ากดการ์ดในมือตัวเองหรือไม่ (ถ้าใช่ ไม่อนุญาต)
        const myHand = gameState.playerHands[socket.id] || [];
        if (myHand.includes(item)) {
            socket.emit('error_msg', 'คุณไม่สามารถทายการ์ดในมือตัวเองได้!');
            return;
        }

        // ตรวจสอบว่าเมนูนี้ อยู่ใน targetItems (มีคนถืออยู่) หรือไม่
        if (gameState.targetItems.includes(item)) {
            // ทายถูก! มีคนถือใบนี้อยู่
            gameState.guessedCorrectly.push(item);
            
            // หาว่าใครเป็นคนถือ เพื่อโชว์ใน log
            let ownerName = 'เพื่อน';
            for (const [id, hand] of Object.entries(gameState.playerHands)) {
                if (hand.includes(item)) {
                    ownerName = gameState.players[id]?.name;
                    break;
                }
            }

            io.emit('play_event', { type: 'correct', msg: `${playerName} ทายถูก! (${ownerName} ถือ ${item})` });
            
            // เปลี่ยนคิวไปที่คนถัดไป
            gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length;

            // เช็คว่าทายครบหมดทุกใบในเกมหรือยัง
            if (gameState.guessedCorrectly.length === gameState.targetItems.length) {
                gameState.status = 'level_clear';
            }
        } else {
            // ทายผิด! ไม่มีใครถือใบนี้เลย (เป็นเมนูหลอก)
            gameState.wrongGuesses.push(item);
            gameState.lives--;
            io.emit('play_event', { type: 'wrong', msg: `${playerName} ทายพลาด! (ไม่มีใครสั่ง ${item})` });
            
            // เปลี่ยนคิวไปที่คนถัดไป
            gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length;

            if (gameState.lives <= 0) {
                gameState.status = 'game_over';
            }
        }

        io.emit('state_update', gameState);
    });

    socket.on('disconnect', () => {
        if (gameState.players[socket.id]) {
            const wasHost = gameState.players[socket.id].isHost;
            delete gameState.players[socket.id];
            
            const remainingPlayers = Object.keys(gameState.players);
            if (remainingPlayers.length > 0 && wasHost) {
                gameState.players[remainingPlayers[0]].isHost = true;
            } else if (remainingPlayers.length === 0) {
                gameState.status = 'lobby'; // รีเซ็ตห้องเมื่อออกหมด
            }
            io.emit('state_update', gameState);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});