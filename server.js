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
    general: ["ประยุทธ์", "ลุงตู่", "ชัชชาติ", "หนุ่ม กรรชัย", "พี่ตูน บอดี้สแลม", "ลิซ่า BLACKPINK", "หม่ำ จ๊กมก", "แจ๊ส ชวนชื่น", "โน้ต อุดม", "อีลอน มัสก์ (Elon Musk)", "มาร์ก ซักเคอร์เบิร์ก", "มิสเตอร์บีส (MrBeast)", "แฮร์รี่ พอตเตอร์", "เจมส์ บอนด์", "แจ็ค สแปร์โรว์"],
    valo: ["Jett", "Reyna", "Raze", "Killjoy", "Viper", "Omen", "Brimstone", "Astra", "Phoenix", "Sova", "Breach", "Cypher", "Chamber", "Yoru", "Skye", "KAY/O", "Fade", "Neon", "Harbor", "Gekko", "Deadlock", "Iso", "Clove"],
    marvel: [
        "ไอรอนแมน (Iron Man)", "กัปตันอเมริกา (Captain America)", "ธอร์ (Thor)", "ฮัลค์ (Hulk)", "แบล็ควิโดว์ (Black Widow)",
        "ฮอว์คอาย (Hawkeye)", "สไปเดอร์แมน (Spider-Man)", "ด็อกเตอร์สเตรนจ์ (Doctor Strange)", "แบล็คแพนเธอร์ (Black Panther)", "แอนท์แมน (Ant-Man)",
        "กัปตันมาร์เวล (Captain Marvel)", "สการ์เล็ตวิทช์ (Scarlet Witch)", "วิชั่น (Vision)", "สตาร์ลอร์ด (Star-Lord)", "กรูท (Groot)",
        "ร็อคเก็ต (Rocket)", "กาโมร่า (Gamora)", "แดร็กซ์ (Drax)", "ธานอส (Thanos)", "โลกิ (Loki)",
        "เดดพูล (Deadpool)", "วูล์ฟเวอรีน (Wolverine)", "เวน่อม (Venom)", "แม็กนีโต้ (Magneto)", "โปรเฟสเซอร์ เอ็กซ์ (Professor X)"
    ],
    anime: [
        "โงกุน (Dragon Ball)", "โดราเอมอน", "โคนัน (Detective Conan)", "ชินจัง", "ลูฟี่ (One Piece)",
        "โซโล (One Piece)", "นารูโตะ (Naruto)", "ซาสึเกะ (Naruto)", "คาคาชิ (Naruto)", "ไซตามะ (One Punch Man)",
        "เอเรน (Attack on Titan)", "รีไวล์ (Attack on Titan)", "ทันจิโร่ (Demon Slayer)", "เนซึโกะ (Demon Slayer)", "เซนอิทซึ (Demon Slayer)",
        "โกโจ ซาโตรุ (Jujutsu Kaisen)", "อาเนีย (Spy x Family)", "คิรัวร์ (Hunter x Hunter)", "มิโดริยะ / เดกุ (My Hero Academia)", "โทโดโรกิ (My Hero Academia)",
        "ซากุรางิ (Slam Dunk)", "เซเลอร์มูน (Sailor Moon)", "เอ็ดเวิร์ด เอลริค (Fullmetal Alchemist)", "กินโทกิ (Gintama)", "คุโรโร่ (Hunter x Hunter)"
    ]
};

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

const spyfallData = {
    general: [
        { name: "โรงพยาบาล", roles: ["หมอศัลยกรรม", "พยาบาล", "คนไข้", "ยาม", "ผู้อำนวยการ", "คนขับรถพยาบาล", "เภสัชกร", "ญาติคนไข้", "พนักงานทำความสะอาด", "หมอฟัน"] },
        { name: "ค่ายทหาร", roles: ["ผู้บัญชาการ", "ทหารเกณฑ์", "พลซุ่มยิง", "พ่อครัว", "หน่วยแพทย์", "ทหารสื่อสาร", "ช่างซ่อมอาวุธ", "ทหารลาดตระเวน", "ครูฝึก", "ทหารยาม"] },
        { name: "โรงเรียน", roles: ["ครูใหญ่", "ครูพละ", "นักเรียน", "ภารโรง", "แม่ครัว", "บรรณารักษ์", "หัวหน้าห้อง", "สภานักเรียน", "รปภ.", "ครูแนะแนว"] },
        { name: "สถานีตำรวจ", roles: ["ผู้กำกับ", "สารวัตร", "ตำรวจจราจร", "ผู้ต้องหา", "ทนายความ", "พนักงานสอบสวน", "สายสืบ", "ประชาชนแจ้งความ", "นักข่าว", "ตำรวจสายตรวจ"] },
        { name: "สถานีอวกาศ", roles: ["นักบินอวกาศ", "วิศวกร", "นักวิจัย", "ผู้บัญชาการสถานี", "หมออวกาศ", "ช่างซ่อมบำรุง", "นักพฤกษศาสตร์", "นักท่องเที่ยวอวกาศ", "คนควบคุมหุ่นยนต์", "เจ้าหน้าที่สื่อสาร"] },
        { name: "เรือดำน้ำ", roles: ["กัปตัน", "ต้นหน", "พลเรดาร์", "ช่างเครื่อง", "พ่อครัว", "ผู้เชี่ยวชาญอาวุธ", "หมอ", "พลวิทยุ", "ลูกเรือ", "วิศวกรนิวเคลียร์"] },
        { name: "คาสิโน", roles: ["ดีลเลอร์", "ผู้เล่นวีไอพี", "นักพนันหน้าใหม่", "รปภ.", "ผู้จัดการคาสิโน", "พนักงานเสิร์ฟเครื่องดื่ม", "นักเต้นโชว์", "คนแลกชิป", "นักสืบเอกชน", "มาเฟีย"] },
        { name: "กองถ่ายทำหนัง", roles: ["ผู้กำกับ", "ดารานำ", "ตัวประกอบ", "ตากล้อง", "คนจัดไฟ", "ช่างแต่งหน้า", "คนเขียนบท", "ผู้ช่วยผู้กำกับ", "เด็กเสิร์ฟน้ำ", "สตันท์แมน"] },
        { name: "เครื่องบินโดยสาร", roles: ["กัปตัน", "ผู้ช่วยนักบิน", "แอร์โฮสเตส", "ผู้โดยสารวีไอพี", "ผู้โดยสารเด็ก", "คนกลัวความสูง", "ช่างเครื่อง", "แอร์มาร์แชล", "นักธุรกิจ", "คนแอบสูบบุหรี่"] },
        { name: "ร้านอาหารหรู", roles: ["เชฟใหญ่", "ผู้จัดการร้าน", "พนักงานเสิร์ฟ", "นักวิจารณ์อาหาร", "ลูกค้าวีไอพี", "พนักงานล้างจาน", "บาร์เทนเดอร์", "นักดนตรี", "พนักงานต้อนรับ", "ลูกค้าเรื่องเยอะ"] },
        { name: "ซูเปอร์มาร์เก็ต", roles: ["ผู้จัดการ", "แคชเชียร์", "คนจัดชั้นวางของ", "ลูกค้า", "เด็กหลงทาง", "รปภ.", "คนขโมยของ", "พนักงานทำความสะอาด", "พนักงานเข็นรถเข็น", "คนขายเนื้อ"] },
        { name: "ธนาคาร", roles: ["ผู้จัดการธนาคาร", "พนักงานเคาน์เตอร์", "รปภ.", "ลูกค้ามาฝากเงิน", "ลูกค้ามากู้เงิน", "คนปล้นธนาคาร", "พนักงานทำความสะอาด", "คนเติมเงินตู้เอทีเอ็ม", "ที่ปรึกษาการลงทุน", "พนักงานสินเชื่อ"] },
        { name: "เรือโจรสลัด", roles: ["กัปตัน", "ต้นหน", "พลปืนใหญ่", "คนเฝ้ารังนก", "พ่อครัว", "ช่างไม้", "หมอเถื่อน", "ลูกเรือ", "นักโทษ", "ลิงกัปตัน"] },
        { name: "สวนสนุก", roles: ["คนคุมเครื่องเล่น", "มาสคอต", "คนขายสายไหม", "เด็ก", "ผู้ปกครอง", "พนักงานทำความสะอาด", "คนขายตั๋ว", "วัยรุ่น", "รปภ.", "ช่างซ่อมเครื่องเล่น"] }
    ],
    valo: [
        { name: "Bind", roles: ["คนดักซุ่ม", "คนถือ Spike", "สโมคเกอร์", "คนเช็คกล้อง", "คนแคมป์หลังกล่อง", "สไนเปอร์", "ตัวเปิด", "ฮีลเลอร์", "คนวิ่งหนี", "ตัวแจก"] },
        { name: "Haven", roles: ["คนเฝ้าฮุกคา (Hookah)", "ตัวบุกจากลอง (Long)", "คนดักใน Teleporter", "คนถือสไนเปอร์", "คนแอบหลังตู้คอนเทนเนอร์", "คนวาง Spike", "คนปาแฟลช", "สโมคเกอร์", "ตัวล้วง", "ฮีลเลอร์"] },
        { name: "Split", roles: ["คน AFK", "คนกำลังแต่งปืน", "คนโยนปืนให้เพื่อน", "คนขอซื้อปืน", "คนดรอปมีด", "คนซ้อมยิงกำแพง", "คนพ่นสเปรย์", "ตัววิ่งนำ", "คนหลุด", "คนเต้น"] },
        { name: "Ascent", roles: ["คนแบก Spike", "คน AFK", "คนขอปืน", "คนวอร์มอัพยิง", "ตัววิ่งเปิด", "สไนเปอร์", "คนพ่นสเปรย์", "คนดูแผนที่", "คนหลุด", "คนหัวร้อน"] },
        { name: "Icebox", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
        { name: "Breeze (Buy Phase)", roles: ["คนเงินหมด", "คนขอปืน", "คนดรอปปืน", "คนซื้อสไน", "คนซื้อแต่ปืนพก", "คนลืมซื้อเกราะ", "คนกดสแปมขอของ", "คนใจดีซื้อให้", "คนกำลังตัดสินใจ", "คนบอกแผน"] },
		{ name: "Lotus", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
		{ name: "Pearl", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
		{ name: "Fracture", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
		{ name: "Sunset", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
		{ name: "Abyss", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] },
		{ name: "Corrode", roles: ["คนแอบดักยิง", "คนกำลังคลาน", "ตัววิ่งทะลวง", "คนปาแฟลชเข้าท่อ", "คนยิงทะลุกำแพง", "สโมคเกอร์", "ตัวแจก", "คนซุ่ม", "คนเช็คเสียงเท้า", "สไนเปอร์"] }
    ]
};

const bluffData = {
    deck: [
        'sniper','sniper','sniper','sniper','sniper',
        'assassin','assassin','assassin','assassin','assassin',
        'hacker','hacker','hacker','hacker','hacker',
        'spy','spy','spy','spy','spy',
        'healer','healer','healer','healer','healer'
    ],
    roleNames: { 'sniper': '🔫 มือปืน', 'assassin': '🔪 นักฆ่า', 'hacker': '💻 แฮกเกอร์', 'spy': '🕶️ สายลับ', 'healer': '💉 หมอเถื่อน' }
};

const rooms = {};

// ==========================================
// UTILITY FUNCTIONS (Global Scope)
// ==========================================

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

function getGameData(dataset, packType, customWords = null) {
    if (packType === 'custom' && customWords && customWords.length > 0) {
        if (dataset === secretPainterData) return [{ name: "คำศัพท์กำหนดเอง", words: customWords }];
        if (dataset === spyfallData) return customWords.map(w => ({ name: w, roles: ["คนในพื้นที่", "นักท่องเที่ยว", "คนเดินผ่านไปมา", "พนักงาน", "ลูกค้าทั่วไป", "ยาม", "ผู้จัดการ", "เด็กหลงทาง"] }));
        return customWords;
    }
    
    let result = [];
    if (packType === 'general' && dataset.general) result = [...dataset.general];
    else if (packType === 'valo' && dataset.valo) result = [...dataset.valo];
    else if (packType === 'marvel' && dataset.marvel) result = [...dataset.marvel];
    else if (packType === 'anime' && dataset.anime) result = [...dataset.anime];
    else {
        // mixed: combine all available categories
        if (dataset.general) result.push(...dataset.general);
        if (dataset.valo) result.push(...dataset.valo);
        if (dataset.marvel) result.push(...dataset.marvel);
        if (dataset.anime) result.push(...dataset.anime);
    }
    return result;
}

function syncGameStateToPlayer(socket, room, roomCode) {
    if (!socket || !room || !room.game || room.gameState !== 'playing') return;
    
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
    } else if (room.gameType === 'secret-agent') {
        if (g.phase === 'playing' && g.playerRoles[socket.id]) {
            socket.emit('spyfall_newRound', {
                endTime: g.endTime,
                allLocations: g.allLocations,
                playedLocations: room.playedSpyfallLocs || [],
                location: g.playerRoles[socket.id].isSpy ? null : g.location,
                role: g.playerRoles[socket.id].role,
                isSpy: g.playerRoles[socket.id].isSpy
            });
        } else if (g.phase === 'spy_guessing') {
            socket.emit('spyfall_spyGuessingPhase', { spyId: g.spyId, allLocations: g.allLocations, playedLocations: room.playedSpyfallLocs || [] });
        } else if (g.phase === 'voting') {
            socket.emit('spyfall_startVoting', { players: pList });
        }
    } else if (room.gameType === 'who-am-i') {
        if (g.phase === 'playing') {
            const others = room.players.filter(pl => pl.id !== socket.id).map(pl => ({
                id: pl.id,
                name: pl.name,
                avatar: pl.avatar,
                character: g.playerCharacters[pl.id]
            }));
            socket.emit('whoAmI_newRound', { others });
        }
    }
}

// ==========================================
// WHO AM I LOGIC (ทายสิฉันคือใคร)
// ==========================================

function startWhoAmIRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'เกมทายสิฉันคือใคร ต้องมีผู้เล่นอย่างน้อย 2 คน');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    const allData = getGameData(whoAmIData, pack, customWords);
    if (!allData || allData.length === 0) return;

    let charPool = [...allData].sort(() => Math.random() - 0.5);
    const playerCharacters = {};
    
    room.players.forEach(p => {
        if (charPool.length === 0) charPool = [...allData].sort(() => Math.random() - 0.5); 
        playerCharacters[p.id] = charPool.pop();
    });

    room.game = {
        phase: 'playing',
        playerCharacters,
        customWords // เก็บไว้ใช้ตาถัดไปได้ถ้าเป็นโหมดแต่งเอง
    };

    room.players.forEach(p => {
        const others = room.players.filter(pl => pl.id !== p.id).map(pl => ({
            id: pl.id,
            name: pl.name,
            avatar: pl.avatar,
            character: playerCharacters[pl.id]
        }));
        io.to(p.id).emit('whoAmI_newRound', { others });
    });
}

// ==========================================
// SECRET AGENT (SPYFALL) LOGIC
// ==========================================

function startSpyfallRound(roomCode, pack, timerMin, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'เกมสายลับแฝงตัว ต้องมีผู้เล่นอย่างน้อย 3 คน');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    if (!room.playedSpyfallLocs) room.playedSpyfallLocs = [];

    const allData = getGameData(spyfallData, pack, customWords);
    if (!allData || allData.length === 0) return;

    let availableLocs = allData.filter(loc => !room.playedSpyfallLocs.includes(loc.name));
    
    if (availableLocs.length === 0) {
        room.playedSpyfallLocs = []; 
        availableLocs = allData;
    }

    const pickedLocData = availableLocs[Math.floor(Math.random() * availableLocs.length)];
    const locationName = pickedLocData.name;
    
    let turnOrder = room.players.map(p => p.id);
    turnOrder.sort(() => Math.random() - 0.5);
    
    const spyId = turnOrder[Math.floor(Math.random() * turnOrder.length)];

    let rolesPool = [...pickedLocData.roles];
    rolesPool.sort(() => Math.random() - 0.5);

    const playerRoles = {};
    turnOrder.forEach((id) => {
        if (id === spyId) {
            playerRoles[id] = { isSpy: true, role: "สายลับ" };
        } else {
            if (rolesPool.length === 0) rolesPool = [...pickedLocData.roles].sort(() => Math.random() - 0.5);
            playerRoles[id] = { isSpy: false, role: rolesPool.pop() };
        }
    });

    const endTime = Date.now() + (timerMin * 60 * 1000);

    room.game = { 
        phase: 'playing', 
        location: locationName, 
        allLocations: allData.map(d => d.name),
        spyId, 
        playerRoles, 
        endTime,
        timerMin,
        votes: {}
    };

    room.players.forEach(p => {
        io.to(p.id).emit('spyfall_newRound', {
            endTime,
            allLocations: room.game.allLocations,
            playedLocations: room.playedSpyfallLocs,
            location: playerRoles[p.id].isSpy ? null : locationName,
            role: playerRoles[p.id].role,
            isSpy: playerRoles[p.id].isSpy
        });
    });
}

function finishSpyfallGame(roomCode, spyWon, spyBonusWon = false, titleMsg = "") {
    const room = rooms[roomCode]; if (!room || !room.game) return;
    const g = room.game;
    const spyPlayer = room.players.find(p => p.id === g.spyId);
    
    if (!room.playedSpyfallLocs.includes(g.location)) {
        room.playedSpyfallLocs.push(g.location);
    }
    
    broadcastScores(roomCode);
    
    const voteCounts = {};
    if (g.votes) {
        for (let v in g.votes) {
            voteCounts[g.votes[v]] = (voteCounts[g.votes[v]] || 0) + 1;
        }
    }

    const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));

    io.to(roomCode).emit('spyfall_showResult', {
        titleMsg,
        spyWon,
        spyId: g.spyId,
        spyName: spyPlayer ? spyPlayer.name : 'Unknown',
        spyAvatar: spyPlayer ? spyPlayer.avatar : '🕵️',
        location: g.location,
        votes: voteCounts,
        players: pList
    });
}

// ==========================================
// POWER STRUGGLE LOGIC (เหลี่ยมมาเฟีย)
// ==========================================

function syncBluffState(roomCode, specificSocketId = null) {
    const room = rooms[roomCode];
    if (!room || !room.game) return;
    const g = room.game;

    const globalState = {
        phase: g.phase, 
        currentTurnId: g.turnOrder[g.currentTurnIndex],
        pendingAction: g.pendingAction, 
        pendingBlock: g.pendingBlock, 
        playerLosingCard: g.playerLosingCard,
        exchangeOptions: g.phase === 'exchange' ? g.exchangeOptions : null,
        playersStatus: room.players.map(p => {
            const ps = g.players[p.id];
            if(!ps) return null;
            const deadCards = ps.cards.filter(c => c.dead).map(c => c.role);
            return { id: p.id, name: p.name, avatar: p.avatar, coins: ps.coins, cardsCount: ps.cards.filter(c => !c.dead).length, deadCards, isEliminated: ps.isEliminated };
        }).filter(p=>p!==null)
    };

    if (specificSocketId) {
        const myState = g.players[specificSocketId];
        if(myState) io.to(specificSocketId).emit('coup_updateState', { myState, globalState });
    } else {
        room.players.forEach(p => {
            const myState = g.players[p.id];
            if(myState) io.to(p.id).emit('coup_updateState', { myState, globalState });
        });
    }
}

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

    room.game = { 
        deck, players: playersStatus, turnOrder, currentTurnIndex: 0, 
        phase: 'action', pendingAction: null, pendingBlock: null, 
        responses: {}, playerLosingCard: null, afterLoseCardAction: null, exchangeOptions: null
    };
    
    io.to(roomCode).emit('bluff_newRound');
    syncBluffState(roomCode);
}

function advanceBluffTurn(roomCode) {
    const room = rooms[roomCode]; 
    if(!room || !room.game) return;
    const g = room.game;
    
    g.phase = 'action'; 
    g.pendingAction = null; 
    g.pendingBlock = null; 
    g.responses = {}; 
    g.playerLosingCard = null; 
    g.afterLoseCardAction = null;
    g.exchangeOptions = null;
    
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
    const targetPlayer = targetId ? room.players.find(p=>p.id===targetId) : null;
    const targetName = targetPlayer ? targetPlayer.name : 'ใครบางคน';
    
    if(type==='foreign_aid') return 'รับของสนับสนุน (+2 เครดิต)';
    if(type==='tax') return 'เก็บส่วย (มือปืน +3 เครดิต)';
    if(type==='assassinate') return `ลอบสังหาร (นักฆ่า เล็งไปที่ ${targetName})`;
    if(type==='steal') return `แฮกเงิน (แฮกเกอร์ เล็งไปที่ ${targetName})`;
    if(type==='exchange') return 'เปลี่ยนไพ่ (สายลับ)';
    return '';
}

function handleChallenge(roomCode, challengerId, claimedId, claimRole, successAction, failAction) {
    const room = rooms[roomCode]; const g = room.game;
    const challenger = room.players.find(p=>p.id===challengerId);
    const claimed = room.players.find(p=>p.id===claimedId);
    
    if(!challenger || !claimed) return;
    
    systemChat(roomCode, `🚨 ${challenger.name} ขอจับโกหก ${claimed.name} ว่าเป็น ${bluffData.roleNames[claimRole]} จริงหรือมั่ว!`);

    const p = g.players[claimedId];
    const hasCard = p.cards.some(c => !c.dead && c.role === claimRole);

    if (hasCard) {
        systemChat(roomCode, `✔️ ${claimed.name} โชว์ไพ่ ${bluffData.roleNames[claimRole]}! (ของจริง)`);
        const cardIdx = p.cards.findIndex(c => !c.dead && c.role === claimRole);
        
        g.deck.push(p.cards[cardIdx].role);
        g.deck.sort(() => Math.random() - 0.5);
        p.cards[cardIdx].role = g.deck.pop();

        systemChat(roomCode, `💀 ${challenger.name} จับผิดพลาด! ต้องเสีย 1 ชีวิต`);
        g.phase = 'lose_card'; 
        g.playerLosingCard = challengerId; 
        g.afterLoseCardAction = successAction;
        syncBluffState(roomCode);
    } else {
        systemChat(roomCode, `❌ ${claimed.name} โดนจับโป๊ะ! (ไม่มีไพ่จริง) แอคชันถูกยกเลิก`);
        g.phase = 'lose_card'; 
        g.playerLosingCard = claimedId; 
        g.afterLoseCardAction = failAction;
        syncBluffState(roomCode);
    }
}

function resolveAction(roomCode) {
    const room = rooms[roomCode]; const g = room.game;
    const p = g.players[g.pendingAction.source];
    const type = g.pendingAction.type;
    const tId = g.pendingAction.target;

    if (type === 'foreign_aid') { 
        p.coins += 2; systemChat(roomCode, `💰 รับของสนับสนุนสำเร็จ (+2)`); advanceBluffTurn(roomCode); 
    }
    else if (type === 'tax') { 
        p.coins += 3; systemChat(roomCode, `🔫 มือปืนเก็บส่วยสำเร็จ (+3)`); advanceBluffTurn(roomCode); 
    }
    else if (type === 'steal') {
        const target = g.players[tId];
        if(target) {
            const amount = Math.min(2, target.coins);
            target.coins -= amount; p.coins += amount;
            systemChat(roomCode, `💻 แฮกเกอร์แฮกได้ ${amount} เครดิต สำเร็จ!`);
        }
        advanceBluffTurn(roomCode);
    }
    else if (type === 'assassinate') {
        systemChat(roomCode, `🔪 นักฆ่าลงมือสำเร็จ!`);
        g.phase = 'lose_card'; 
        g.playerLosingCard = tId; 
        g.afterLoseCardAction = 'advanceTurn';
        syncBluffState(roomCode);
    }
    else if (type === 'exchange') {
        const newCards = [g.deck.pop(), g.deck.pop()];
        const aliveCards = p.cards.filter(c => !c.dead).map(c => c.role);
        const totalCards = [...aliveCards, ...newCards].filter(c => c); 
        
        g.exchangeOptions = totalCards.map(role => ({ role, dead: false }));
        g.phase = 'exchange';
        systemChat(roomCode, `🕶️ สายลับกำลังเลือกเปลี่ยนไพ่...`);
        syncBluffState(roomCode);
    }
}

function checkReactionsComplete(roomCode) {
    const room = rooms[roomCode]; const g = room.game;
    const alivePlayers = Object.values(g.players).filter(p => !p.isEliminated);
    
    let requiredResponses = alivePlayers.length - 1; 
    if (g.phase === 'block_reaction' || g.phase === 'block_challenge_reaction') {
        requiredResponses = alivePlayers.length - 1;
    }

    if (Object.keys(g.responses).length >= requiredResponses) {
        if (g.phase === 'reaction') {
            resolveAction(roomCode);
        }
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
        if(winner) winner.score += 5;
        systemChat(roomCode, `🏆 จบเกม! ${winner ? winner.name : 'ผู้เล่น'} เป็นผู้ชนะในศึกชิงอำนาจ!`);
        broadcastScores(roomCode);
        room.gameState = 'waiting';
        setTimeout(() => io.to(roomCode).emit('backToLobby', room.players), 5000);
        return true;
    }
    return false;
}

// ==========================================
// OTHER GAMES LOGIC (Global Scope)
// ==========================================

function startTruthOrLieRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    const dataPack = getGameData(truthOrLieData, pack, customWords);
    const prompt = dataPack[Math.floor(Math.random() * dataPack.length)];
    
    let turnOrder = room.players.map(p => p.id);
    turnOrder.sort(() => Math.random() - 0.5);

    room.game = { prompt, answers: {}, turnOrder, activePlayerIndex: 0, phase: 'answering', votes: {} };
    io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนแต่งเรื่อง...' });
    io.to(roomCode).emit('truthOrLie_newRound', { prompt });
}

function startUniqueClueRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    const dataPack = getGameData(uniqueClueData, pack, customWords);
    const word = dataPack[Math.floor(Math.random() * dataPack.length)];
    const guesserIndex = Math.floor(Math.random() * room.players.length);
    const guesserId = room.players[guesserIndex].id;

    room.game = { word, guesserId, phase: 'clue_giving', clues: {} };
    const guesser = room.players.find(p => p.id === guesserId);
    
    io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length - 1, text: 'รอเพื่อนส่งคำใบ้...' });
    io.to(roomCode).emit('uniqueClue_newRound', { guesser, word });
}

function startSecretPainterRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 3) {
        io.to(roomCode).emit('error', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    const dataPack = getGameData(secretPainterData, pack, customWords);
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

function startMatchTheBlankRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    const dataPack = getGameData(matchTheBlankData, pack, customWords);
    const prompt = dataPack[Math.floor(Math.random() * dataPack.length)];

    room.game = { prompt: prompt, answers: {} };
    io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });
    io.to(roomCode).emit('matchTheBlank_newRound', { prompt });
}

function startFriendQuizRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }
    
    const dataPack = getGameData(friendQuizData, pack, customWords);
    const question = dataPack[Math.floor(Math.random() * dataPack.length)];

    room.game = { question, answers: {}, phase: 'answering', secretPlayerId: null, ranges: [], bets: {} };
    io.to(roomCode).emit('updateProgress', { current: 0, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });
    io.to(roomCode).emit('friendQuiz_newRound', { question });
}

function findQuizCorrectRangeIndex(secretAnswer, ranges) {
    return ranges.findIndex(r => secretAnswer >= r.min && secretAnswer <= r.max);
}

function startNumberSortRound(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    if (!room || room.players.length < 2) {
        io.to(roomCode).emit('error', 'ผู้เล่นไม่พอสำหรับเกมนี้');
        room.gameState = 'waiting'; io.to(roomCode).emit('updateLobby', room.players); return;
    }

    const dataPack = getGameData(numberSortData, pack, customWords);
    const theme = dataPack[Math.floor(Math.random() * dataPack.length)];
    
    room.game = { theme, playerNumbers: {} };
    const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));

    room.players.forEach(p => {
        const num = Math.floor(Math.random() * 100) + 1;
        room.game.playerNumbers[p.id] = num;
        io.to(p.id).emit('numberSort_newRound', { theme, number: num, players: pList });
    });
}

function generateWordGuessBoard(pack, customWords) {
    const dataPack = getGameData(wordGuessData, pack, customWords);
    const shuffledWords = [...dataPack].sort(() => 0.5 - Math.random()).slice(0, 25);
    return shuffledWords.map(word => ({ word, type: 'neutral', revealed: false }));
}

function startWordGuessTeamGame(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    const board = generateWordGuessBoard(pack, customWords);
    if(board.length < 25) { io.to(roomCode).emit('error', 'คำศัพท์ไม่พอ 25 คำสำหรับเล่นรหัสคำทาย'); return; }
    
    let types = Array(9).fill('red').concat(Array(8).fill('blue')).concat(Array(7).fill('neutral')).concat(['assassin']);
    types.sort(() => 0.5 - Math.random());
    board.forEach((card, i) => card.type = types[i]);

    room.game = {
        isCoop: false, board, turn: 'red', clue: null, guessesLeft: 0,
        teams: { red: { players: [], spymaster: null, score: 9 }, blue: { players: [], spymaster: null, score: 8 } },
        players: room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, team: null, isSpymaster: false }))
    };
    syncGameStateToPlayer(null, room, roomCode);
    room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
}

function startWordGuessCoopGame(roomCode, pack, customWords) {
    const room = rooms[roomCode];
    const board = generateWordGuessBoard(pack, customWords);
    if(board.length < 25) { io.to(roomCode).emit('error', 'คำศัพท์ไม่พอ 25 คำสำหรับเล่นรหัสคำทาย'); return; }
    
    let types = Array(15).fill('green').concat(Array(9).fill('neutral')).concat(['assassin']);
    types.sort(() => 0.5 - Math.random());
    board.forEach((card, i) => card.type = types[i]);

    room.game = {
        isCoop: true, board, turnsLeft: 9, wordsFound: 0, wordsToFind: 15, clue: null, guessesLeft: 0,
        players: room.players.map((p, i) => ({ id: p.id, name: p.name, avatar: p.avatar, team: 'coop', isSpymaster: i === 0 }))
    };
    syncGameStateToPlayer(null, room, roomCode);
    room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
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

// ==========================================
// SOCKET CONNECTION & EVENT HANDLERS
// ==========================================

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

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
                if (room.game.pendingBlock && room.game.pendingBlock.source === oldId) room.game.pendingBlock.source = socket.id;
                if (room.game.playerLosingCard === oldId) room.game.playerLosingCard = socket.id;

                if (room.game.responses && room.game.responses[oldId]) {
                    room.game.responses[socket.id] = room.game.responses[oldId];
                    delete room.game.responses[oldId];
                }
            } else if (room.gameType === 'secret-agent' && room.game && room.game.playerRoles) {
                if (room.game.playerRoles[oldId]) {
                    room.game.playerRoles[socket.id] = room.game.playerRoles[oldId];
                    delete room.game.playerRoles[oldId];
                }
                if (room.game.spyId === oldId) room.game.spyId = socket.id;
                if (room.game.votes && room.game.votes[oldId]) {
                    room.game.votes[socket.id] = room.game.votes[oldId];
                    delete room.game.votes[oldId];
                }
            } else if (room.gameType === 'who-am-i' && room.game && room.game.playerCharacters) {
                if (room.game.playerCharacters[oldId]) {
                    room.game.playerCharacters[socket.id] = room.game.playerCharacters[oldId];
                    delete room.game.playerCharacters[oldId];
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
            socket.emit('rejoinGameStarted', room.gameType);
            syncGameStateToPlayer(socket, room, roomCode);
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

    socket.on('host_kickPlayer', (targetId) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id && targetId !== socket.id) {
            const targetSocket = io.sockets.sockets.get(targetId);
            if (targetSocket) targetSocket.emit('kicked');
            room.players = room.players.filter(p => p.id !== targetId);
            
            if (room.players.length === 0) {
                delete rooms[roomCode];
            } else {
                io.to(roomCode).emit('updateLobby', room.players);
                broadcastScores(roomCode);
            }
        }
    });

    socket.on('host_changeBGM', (trackUrl) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            io.to(roomCode).emit('bgm_changed', trackUrl);
        }
    });

    socket.on('host_selectGame', (gameType) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (rooms[roomCode] && rooms[roomCode].players[0].id === socket.id) {
            rooms[roomCode].gameType = gameType; io.to(roomCode).emit('gameSelected', gameType);
        }
    });

    socket.on('host_selectPack', (pack) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            room.currentPack = pack;
            io.to(roomCode).emit('packSelected', pack);
        }
    });
    
    socket.on('startGame', (data) => {
        const roomCode = typeof data === 'string' ? data : data.roomCode;
        const pack = data.pack || 'mixed';
        const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id && room.gameType) {
            room.gameState = 'playing'; 
            room.currentPack = pack;
            
            let payload = { gameType: room.gameType, pack };
            if (room.gameType === 'secret-agent' && data.timerMin) payload.timerMin = data.timerMin;
            if (data.customWords) payload.customWords = data.customWords;
            
            io.to(roomCode).emit('gameStarted', payload);
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
        const room = rooms[roomCode];
        const pack = data.pack || (room ? room.currentPack : 'mixed') || 'mixed';
        const customWords = data.customWords || null;

        if (room && room.players.length > 0 && room.players[0].id === socket.id) {
            room.currentPack = pack;
            try {
                if (room.gameType === 'word-guess') {
                    if (room.players.length >= 2 && room.players.length <= 2) startWordGuessCoopGame(roomCode, pack, customWords);
                    else startWordGuessTeamGame(roomCode, pack, customWords);
                } else if (room.gameType === 'number-sort') startNumberSortRound(roomCode, pack, customWords);
                else if (room.gameType === 'friend-quiz') startFriendQuizRound(roomCode, pack, customWords);
                else if (room.gameType === 'secret-painter') startSecretPainterRound(roomCode, pack, customWords);
                else if (room.gameType === 'match-the-blank') startMatchTheBlankRound(roomCode, pack, customWords);
                else if (room.gameType === 'unique-clue') startUniqueClueRound(roomCode, pack, customWords);
                else if (room.gameType === 'truth-or-lie') startTruthOrLieRound(roomCode, pack, customWords);
                else if (room.gameType === 'bluff-overthrow') startBluffRound(roomCode);
                else if (room.gameType === 'secret-agent') startSpyfallRound(roomCode, pack, data.timerMin || 5, customWords);
                else if (room.gameType === 'who-am-i') startWhoAmIRound(roomCode, pack, customWords);
            } catch (e) {
                console.error(`Error starting game logic in room ${roomCode}:`, e);
                io.to(roomCode).emit('error', 'เกิดข้อผิดพลาดร้ายแรงขณะเริ่มเกม');
            }
        }
    });

    // --- Who Am I Events ---
    socket.on('whoAmI_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'who-am-i' || room.game.phase !== 'playing') return;

        const myChar = room.game.playerCharacters[socket.id];
        if (!myChar) return;

        // ลบช่องว่าง วงเล็บ และทำให้เป็นตัวพิมพ์เล็กทั้งหมด เพื่อให้เช็คได้ยืดหยุ่นขึ้น
        const cleanStr = (str) => str.replace(/[\s\(\)]/g, '').toLowerCase();
        
        const cleanGuess = cleanStr(guess);
        const cleanChar = cleanStr(myChar);
        
        // ถือว่าตอบถูกถ้าทายมาเกิน 2 ตัวอักษร และมีคำนี้อยู่ในชื่อตัวละคร (หรือชื่อตัวละครมีอยู่ในคำทาย)
        const isCorrect = cleanGuess.length >= 2 && (cleanChar.includes(cleanGuess) || cleanGuess.includes(cleanChar));

        if (isCorrect) {
            room.game.phase = 'ended';
            const winner = room.players.find(p => p.id === socket.id);
            if (winner) winner.score += 3;
            broadcastScores(roomCode);

            const revealData = room.players.map(p => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                character: room.game.playerCharacters[p.id]
            }));

            io.to(roomCode).emit('whoAmI_endRound', { 
                winnerId: winner.id, 
                winnerName: winner.name, 
                revealData 
            });
            systemChat(roomCode, `🎉 ${winner.name} ทายถูกเป็นคนแรก! (+3 แต้ม)`);
        } else {
            socket.emit('whoAmI_wrongGuess');
        }
    });

    socket.on('whoAmI_skipRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'who-am-i' || room.game.phase !== 'playing' || room.players[0].id !== socket.id) return;

        room.game.phase = 'ended';
        const revealData = room.players.map(p => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            character: room.game.playerCharacters[p.id]
        }));

        io.to(roomCode).emit('whoAmI_endRound', { 
            winnerId: null, 
            revealData 
        });
        systemChat(roomCode, `⏩ หัวหน้าห้องกดข้ามรอบนี้!`);
    });

    socket.on('whoAmI_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            startWhoAmIRound(roomCode, room.currentPack, room.game.customWords);
        }
    });

    // --- Secret Agent (Spyfall) Events ---
    socket.on('spyfall_timeUp', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'secret-agent' || room.game.phase !== 'playing') return;
        
        room.game.phase = 'voting';
        const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
        io.to(roomCode).emit('spyfall_startVoting', { players: pList });
        systemChat(roomCode, `⏳ หมดเวลา! ถึงเวลาโหวตหาตัวสายลับแล้ว!`);
    });

    socket.on('spyfall_spyEarlyGuess', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'secret-agent' || room.game.phase !== 'playing') return;
        if(socket.id !== room.game.spyId) return;

        room.game.phase = 'spy_guessing';
        io.to(roomCode).emit('spyfall_spyGuessingPhase', { spyId: room.game.spyId, allLocations: room.game.allLocations, playedLocations: room.playedSpyfallLocs || [] });
        systemChat(roomCode, `🚨 สายลับขอชิงตอบสถานที่ก่อนหมดเวลา!`);
    });

    socket.on('spyfall_submitSpyGuess', ({ location, isBonus }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'secret-agent') return;
        if(socket.id !== room.game.spyId) return;

        const isCorrect = location === room.game.location;
        const spyPlayer = room.players.find(p => p.id === room.game.spyId);

        if (isBonus) {
            if (isCorrect) {
                if (spyPlayer) spyPlayer.score += 2;
                finishSpyfallGame(roomCode, true, true, `สายลับรอดตัว แถมได้โบนัสทายสถานที่ถูกเป๊ะ! (+5 แต้ม)`);
            } else {
                finishSpyfallGame(roomCode, true, false, `สายลับรอดตัว แต่ทายสถานที่ผิด! (ได้แค่ +3 แต้ม)`);
            }
        } else {
            if (isCorrect) {
                if (spyPlayer) spyPlayer.score += 5;
                finishSpyfallGame(roomCode, true, true, `โคตรตึง! สายลับทายถูกก่อนหมดเวลา! (+5 แต้ม)`);
            } else {
                room.players.forEach(p => { if (p.id !== room.game.spyId) p.score += 2; });
                finishSpyfallGame(roomCode, false, false, `โป๊ะแตก! สายลับชิงตอบแต่ทายผิด! (คนอื่น +2 แต้ม)`);
            }
        }
    });

    socket.on('spyfall_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if(!room || room.gameType !== 'secret-agent' || room.game.phase !== 'voting') return;
        
        room.game.votes[socket.id] = votedId;
        
        if (Object.keys(room.game.votes).length === room.players.length) {
            const voteCounts = {};
            for (let v in room.game.votes) {
                voteCounts[room.game.votes[v]] = (voteCounts[room.game.votes[v]] || 0) + 1;
            }
            
            let maxVotes = 0; let votedOutId = null; let isTie = false;
            for (let id in voteCounts) {
                if (voteCounts[id] > maxVotes) { maxVotes = voteCounts[id]; votedOutId = id; isTie = false; }
                else if (voteCounts[id] === maxVotes) { isTie = true; }
            }

            const spyCaught = (!isTie && votedOutId === room.game.spyId);
            const spyPlayer = room.players.find(p => p.id === room.game.spyId);

            if (spyCaught) {
                for (let voterId in room.game.votes) {
                    if (room.game.votes[voterId] === room.game.spyId) {
                        const p = room.players.find(pl => pl.id === voterId);
                        if(p) p.score += 2;
                    }
                }
                finishSpyfallGame(roomCode, false, false, `จับสายลับได้แล้ว! (คนที่โหวตถูก +2 แต้ม)`);
            } else {
                if (spyPlayer) spyPlayer.score += 3;
                room.game.phase = 'bonus_phase';
                
                if (!room.playedSpyfallLocs.includes(room.game.location)) {
                    room.playedSpyfallLocs.push(room.game.location);
                }
                broadcastScores(roomCode);
                
                const pList = room.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar }));
                
                io.to(roomCode).emit('spyfall_showResult', {
                    titleMsg: `โหวตผิดคน! สายลับรอดตัวไปได้ (+3 แต้ม)`,
                    spyWon: true,
                    spyId: room.game.spyId,
                    spyName: spyPlayer ? spyPlayer.name : 'Unknown',
                    spyAvatar: spyPlayer ? spyPlayer.avatar : '🕵️',
                    location: room.game.location,
                    votes: voteCounts,
                    players: pList
                });

                io.to(roomCode).emit('spyfall_bonusPhase', {
                    spyId: room.game.spyId,
                    allLocations: room.game.allLocations,
                    playedLocations: room.playedSpyfallLocs
                });
            }
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.votes).length, total: room.players.length, text: 'รอเพื่อนโหวตให้ครบ...' });
        }
    });

    socket.on('spyfall_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            const timerMin = room.game.timerMin || 5; 
            const customWords = room.currentPack === 'custom' && room.game.allLocations ? room.game.allLocations : null;
            startSpyfallRound(roomCode, room.currentPack, timerMin, customWords);
        }
    });

    // --- Bluff Overthrow Events ---
    socket.on('bluff_action', ({ type, targetId }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'action') return;
            if (room.game.turnOrder[room.game.currentTurnIndex] !== socket.id) return;

            const player = room.game.players[socket.id];
            const g = room.game;
            const pObj = room.players.find(p=>p.id===socket.id);
            if(!pObj) return;
            const pName = pObj.name;

            if (type === 'eliminate' && player.coins < 7) return socket.emit('error', 'เครดิตไม่พอสำหรับปิดบัญชี');
            if (type === 'assassinate' && player.coins < 3) return socket.emit('error', 'เครดิตไม่พอสำหรับจ้างนักฆ่า');
            if (player.coins >= 10 && type !== 'eliminate') return socket.emit('error', 'เครดิตถึง 10 แล้ว บังคับต้องปิดบัญชีเท่านั้น!');

            g.pendingAction = { type, source: socket.id, target: targetId, claim: getClaimForAction(type) };
            g.responses = {};

            if (type === 'income') {
                player.coins += 1; systemChat(roomCode, `${pName} รับรายได้ปกติ (+1 เครดิต)`);
                advanceBluffTurn(roomCode);
            } else if (type === 'eliminate') {
                player.coins -= 7; 
                const targetObj = room.players.find(p=>p.id===targetId);
                const targetName = targetObj ? targetObj.name : 'ใครบางคน';
                systemChat(roomCode, `💥 ${pName} ใช้สิทธิ์ปิดบัญชี ใส่ ${targetName}!`);
                g.phase = 'lose_card'; 
                g.playerLosingCard = targetId; 
                g.afterLoseCardAction = 'advanceTurn';
                syncBluffState(roomCode);
            } else {
                if (type === 'assassinate') player.coins -= 3;
                g.phase = 'reaction';
                const actionText = getActionText(type, targetId, room);
                systemChat(roomCode, `⚡ ${pName} ต้องการ: ${actionText}`);
                syncBluffState(roomCode);
            }
        } catch (e) { console.error('Bluff action error:', e); }
    });

    socket.on('bluff_react', ({ response, claimRole }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow') return;
            const g = room.game;
            if (!g.players[socket.id] || g.players[socket.id].isEliminated) return;

            if (g.phase === 'reaction') {
                if (response === 'challenge') {
                    handleChallenge(roomCode, socket.id, g.pendingAction.source, g.pendingAction.claim, 'advanceTurn', 'resolveAction');
                } else if (response === 'block') {
                    g.pendingBlock = { source: socket.id, claim: claimRole };
                    g.phase = 'block_challenge_reaction'; g.responses = {};
                    const blockerName = room.players.find(p=>p.id===socket.id)?.name || 'Someone';
                    systemChat(roomCode, `🛡️ ${blockerName} ประกาศบล็อก! (อ้างเป็น ${bluffData.roleNames[claimRole]})`);
                    syncBluffState(roomCode);
                } else {
                    g.responses[socket.id] = 'pass';
                    checkReactionsComplete(roomCode);
                }
            } else if (g.phase === 'block_reaction' || g.phase === 'block_challenge_reaction') {
                if (response === 'challenge') {
                    handleChallenge(roomCode, socket.id, g.pendingBlock.source, g.pendingBlock.claim, 'resolveAction', 'advanceTurn');
                } else {
                    g.responses[socket.id] = 'pass';
                    checkReactionsComplete(roomCode);
                }
            }
        } catch (e) { console.error('Bluff react error:', e); }
    });

    socket.on('bluff_loseCard', ({ cardIndex }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'lose_card') return;
            if (socket.id !== room.game.playerLosingCard) return;

            const p = room.game.players[socket.id];
            if (!p.cards[cardIndex] || p.cards[cardIndex].dead) return;

            p.cards[cardIndex].dead = true;
            const pName = room.players.find(x=>x.id===socket.id)?.name || 'Unknown';
            systemChat(roomCode, `💀 ${pName} ทิ้งไพ่ ${bluffData.roleNames[p.cards[cardIndex].role]}`);

            if (p.cards.every(c => c.dead)) {
                p.isEliminated = true;
                systemChat(roomCode, `❌ ${pName} ถูกคัดออกจากเกมแล้ว!`);
            }

            const action = room.game.afterLoseCardAction;
            room.game.afterLoseCardAction = null;

            if (action === 'advanceTurn') advanceBluffTurn(roomCode);
            else if (action === 'resolveAction') resolveAction(roomCode);
            else advanceBluffTurn(roomCode);
        } catch(e) { console.error('Bluff lose card error', e); }
    });

    socket.on('bluff_exchange', ({ keepIndices }) => {
        try {
            const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
            if (!room || room.gameType !== 'bluff-overthrow' || room.game.phase !== 'exchange') return;
            if (socket.id !== room.game.pendingAction.source) return;

            const p = room.game.players[socket.id];
            const newCards = keepIndices.map(idx => room.game.exchangeOptions[idx]);
            
            room.game.exchangeOptions.forEach((opt, idx) => {
                if(!keepIndices.includes(idx) && opt && opt.role) {
                    room.game.deck.push(opt.role);
                }
            });
            room.game.deck.sort(() => Math.random() - 0.5);
            p.cards = newCards;

            systemChat(roomCode, `🕶️ สายลับเปลี่ยนไพ่เสร็จสิ้น`);
            advanceBluffTurn(roomCode);
        } catch(e) { console.error('Bluff exchange error', e); }
    });

    // --- Truth or Lie Events ---
    socket.on('truthOrLie_submitAnswer', ({ truth, lie }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.game.phase !== 'answering') return;

        const options = Math.random() > 0.5 ? { A: truth, B: lie } : { A: lie, B: truth };
        room.game.answers[socket.id] = { truth, lie, optionA: options.A, optionB: options.B, lieOption: options.A === lie ? 'A' : 'B' };
        
        if (Object.keys(room.game.answers).length === room.players.length) {
            room.game.phase = 'voting';
            io.to(roomCode).emit('truthOrLie_startVoting', {
                activePlayer: room.players.find(p => p.id === room.game.turnOrder[room.game.activePlayerIndex]),
                optionA: room.game.answers[room.game.turnOrder[room.game.activePlayerIndex]].optionA,
                optionB: room.game.answers[room.game.turnOrder[room.game.activePlayerIndex]].optionB
            });
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.answers).length, total: room.players.length, text: 'รอเพื่อนส่งเรื่อง...' });
        }
    });

    socket.on('truthOrLie_submitVote', ({ vote }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.game.phase !== 'voting') return;

        const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
        if (socket.id === activePlayerId) return;

        room.game.votes[socket.id] = vote;
        if (Object.keys(room.game.votes).length === room.players.length - 1) {
            let fooledCount = 0;
            const voteDetails = [];
            const lieOpt = room.game.answers[activePlayerId].lieOption;
            
            for (let vid in room.game.votes) {
                const p = room.players.find(pl => pl.id === vid);
                if(p) {
                    voteDetails.push({ id: p.id, name: p.name, avatar: p.avatar, vote: room.game.votes[vid] });
                    if (room.game.votes[vid] !== lieOpt) {
                        fooledCount++; 
                    } else {
                        p.score += 1; 
                    }
                }
            }

            const activePlayerObj = room.players.find(pl => pl.id === activePlayerId);
            if (activePlayerObj) {
                activePlayerObj.score += fooledCount;
                if (fooledCount === room.players.length - 1) activePlayerObj.score += 2;
            }

            io.to(roomCode).emit('truthOrLie_showVoteResult', {
                activePlayer: activePlayerObj,
                truth: room.game.answers[activePlayerId].truth,
                lie: room.game.answers[activePlayerId].lie,
                lieOption: lieOpt,
                fooledCount,
                totalVoters: room.players.length - 1,
                voteDetails
            });
            broadcastScores(roomCode);
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.votes).length, total: room.players.length - 1, text: 'รอเพื่อนโหวต...' });
        }
    });

    socket.on('truthOrLie_nextPlayer', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie' || room.players[0].id !== socket.id) return;

        room.game.activePlayerIndex++;
        if (room.game.activePlayerIndex >= room.players.length) {
            io.to(roomCode).emit('truthOrLie_endRound', { players: room.players.map(p => ({id:p.id, name:p.name, avatar:p.avatar, score:p.score})) });
        } else {
            room.game.votes = {};
            const activePlayerId = room.game.turnOrder[room.game.activePlayerIndex];
            io.to(roomCode).emit('truthOrLie_startVoting', {
                activePlayer: room.players.find(p => p.id === activePlayerId),
                optionA: room.game.answers[activePlayerId].optionA,
                optionB: room.game.answers[activePlayerId].optionB
            });
        }
    });

    socket.on('truthOrLie_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            const customWords = room.currentPack === 'custom' ? room.game.prompt : null; 
            startTruthOrLieRound(roomCode, room.currentPack, customWords);
        }
    });

    // --- Unique Clue Events ---
    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue' || room.game.phase !== 'clue_giving') return;

        room.game.clues[socket.id] = clue.trim().toLowerCase();
        
        if (Object.keys(room.game.clues).length === room.players.length - 1) {
            room.game.phase = 'guessing';
            const clueCounts = {};
            for (let id in room.game.clues) {
                const c = room.game.clues[id];
                clueCounts[c] = (clueCounts[c] || 0) + 1;
            }

            const validClues = [];
            const playerClues = [];
            for (let id in room.game.clues) {
                const p = room.players.find(pl => pl.id === id);
                const c = room.game.clues[id];
                const isValid = clueCounts[c] === 1;
                if (isValid) validClues.push(c);
                if (p) playerClues.push({ playerId: p.id, playerName: p.name, playerAvatar: p.avatar, clue: c, isValid });
            }

            room.game.validClues = validClues;
            room.game.playerClues = playerClues;
            io.to(roomCode).emit('uniqueClue_startGuessing', { validClues, playerClues });
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.clues).length, total: room.players.length - 1, text: 'รอเพื่อนส่งคำใบ้...' });
        }
    });

    socket.on('uniqueClue_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue' || room.game.phase !== 'guessing') return;
        if (socket.id !== room.game.guesserId) return;

        const isCorrect = guess.trim().toLowerCase() === room.game.word.toLowerCase();
        if (isCorrect) {
            room.players.find(p => p.id === socket.id).score += 2;
            room.game.playerClues.forEach(pc => {
                if (pc.isValid) {
                    const p = room.players.find(pl => pl.id === pc.playerId);
                    if (p) p.score += 1;
                }
            });
        }
        broadcastScores(roomCode);
        io.to(roomCode).emit('uniqueClue_showResult', { isCorrect, word: room.game.word, guess, playerClues: room.game.playerClues });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) {
            startUniqueClueRound(roomCode, room.currentPack);
        }
    });

    // --- Secret Painter Events ---
    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        if (socket.id === room.game.turnOrder[room.game.currentTurnIndex]) socket.to(roomCode).emit('secretPainter_onDraw', data);
    });

    socket.on('secretPainter_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        if (socket.id !== room.game.turnOrder[room.game.currentTurnIndex]) return;

        room.game.currentTurnIndex++;
        if (room.game.currentTurnIndex >= room.game.turnOrder.length) {
            room.game.currentTurnIndex = 0;
            room.game.currentRound++;
        }

        if (room.game.currentRound > room.game.maxRounds) {
            io.to(roomCode).emit('secretPainter_startVoting', { players: room.players.map(p => ({id: p.id, name: p.name, avatar: p.avatar, color: room.game.playerInfo[p.id].color})) });
        } else {
            const nextPlayerId = room.game.turnOrder[room.game.currentTurnIndex];
            const nextPlayer = room.players.find(p => p.id === nextPlayerId);
            io.to(roomCode).emit('secretPainter_updateTurn', { currentTurnId: nextPlayerId, currentTurnName: nextPlayer.name, currentTurnAvatar: nextPlayer.avatar, round: room.game.currentRound });
        }
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;

        room.game.votes[socket.id] = votedId;
        if (Object.keys(room.game.votes).length === room.players.length) {
            const voteCounts = {};
            for (let v in room.game.votes) {
                voteCounts[room.game.votes[v]] = (voteCounts[room.game.votes[v]] || 0) + 1;
            }
            
            let maxVotes = 0; let votedOutId = null; let isTie = false;
            for (let id in voteCounts) {
                if (voteCounts[id] > maxVotes) { maxVotes = voteCounts[id]; votedOutId = id; isTie = false; }
                else if (voteCounts[id] === maxVotes) { isTie = true; }
            }

            const isPainterCaught = !isTie && votedOutId === room.game.secretPainterId;
            const sp = room.players.find(p => p.id === room.game.secretPainterId);

            io.to(roomCode).emit('secretPainter_reveal', {
                votes: voteCounts, isPainterCaught,
                secretPainterId: sp.id, secretPainterName: sp.name, secretPainterAvatar: sp.avatar
            });

            if (!isPainterCaught) secretPainter_checkGameOver(roomCode, true);
        }
    });

    socket.on('secretPainter_submitGuess', ({ guessWord }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter' || socket.id !== room.game.secretPainterId) return;

        if (guessWord === "I_WON_ALREADY") return;
        const isCorrect = guessWord.trim().toLowerCase() === room.game.word.toLowerCase();
        secretPainter_checkGameOver(roomCode, isCorrect);
    });

    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startSecretPainterRound(roomCode, room.currentPack);
    });

    // --- Match The Blank Events ---
    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'match-the-blank') return;

        room.game.answers[socket.id] = answer.trim().toLowerCase();
        
        if (Object.keys(room.game.answers).length === room.players.length) {
            const answerCounts = {};
            for(let id in room.game.answers) {
                let ans = room.game.answers[id];
                answerCounts[ans] = (answerCounts[ans] || 0) + 1;
            }

            const results = [];
            for (let id in room.game.answers) {
                let ans = room.game.answers[id];
                let count = answerCounts[ans];
                let points = 0;
                if (count === 2) points = 3;
                else if (count >= 3) points = 1;
                
                const p = room.players.find(pl => pl.id === id);
                if(p) { p.score += points; results.push({ id: p.id, name: p.name, avatar: p.avatar, word: ans, points }); }
            }
            broadcastScores(roomCode);
            io.to(roomCode).emit('matchTheBlank_showResult', { results });
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.answers).length, total: room.players.length, text: 'รอเพื่อนส่งคำตอบ...' });
        }
    });

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startMatchTheBlankRound(roomCode, room.currentPack);
    });

    // --- Friend Quiz Events ---
    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz' || room.game.phase !== 'answering') return;

        room.game.answers[socket.id] = answer;
        
        if (Object.keys(room.game.answers).length === room.players.length) {
            room.game.phase = 'betting';
            const playerIds = Object.keys(room.game.answers);
            room.game.secretPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
            
            const secretAns = room.game.answers[room.game.secretPlayerId];
            let offset = Math.max(1, Math.floor(Math.abs(secretAns) * 0.2)); 
            if (offset < 5) offset = 5;

            const baseMid = secretAns;
            room.game.ranges = [
                { label: `น้อยกว่า ${baseMid - offset}`, min: -Infinity, max: baseMid - offset - 1 },
                { label: `${baseMid - offset} ถึง ${baseMid + offset}`, min: baseMid - offset, max: baseMid + offset },
                { label: `มากกว่า ${baseMid + offset}`, min: baseMid + offset + 1, max: Infinity }
            ];

            const sp = room.players.find(p => p.id === room.game.secretPlayerId);
            io.to(roomCode).emit('friendQuiz_startBetting', { secretPlayer: sp, ranges: room.game.ranges });
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.answers).length, total: room.players.length, text: 'รอเพื่อนตอบคำถาม...' });
        }
    });

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz' || room.game.phase !== 'betting') return;

        if (socket.id === room.game.secretPlayerId) return; 
        room.game.bets[socket.id] = betOnRangeIndex;

        if (Object.keys(room.game.bets).length === room.players.length - 1) {
            const secretAns = room.game.answers[room.game.secretPlayerId];
            const correctRangeIdx = findQuizCorrectRangeIndex(secretAns, room.game.ranges);
            
            const winners = [];
            for (let id in room.game.bets) {
                if (room.game.bets[id] === correctRangeIdx) {
                    winners.push(id);
                    const p = room.players.find(pl => pl.id === id);
                    if(p) p.score += 2;
                }
            }
            
            const sp = room.players.find(p => p.id === room.game.secretPlayerId);
            if (winners.length === 0 && sp) sp.score += 2; 

            const allPlayersData = room.players.map(p => ({
                id: p.id, name: p.name, avatar: p.avatar, answer: room.game.answers[p.id], isSecret: (p.id === room.game.secretPlayerId)
            }));

            broadcastScores(roomCode);
            io.to(roomCode).emit('friendQuiz_showResult', { allPlayers: allPlayersData, correctRangeIndex: correctRangeIdx, winners });
        } else {
            io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.bets).length, total: room.players.length - 1, text: 'รอเพื่อนทายช่วงคะแนน...' });
        }
    });

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startFriendQuizRound(roomCode, room.currentPack);
    });

    // --- Number Sort Events ---
    socket.on('numberSort_submitOrder', ({ orderedPlayerIds }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'number-sort') return;

        let isCorrect = true;
        let prevNum = -1;
        for (let i = 0; i < orderedPlayerIds.length; i++) {
            const num = room.game.playerNumbers[orderedPlayerIds[i]];
            if (num < prevNum) { isCorrect = false; break; }
            prevNum = num;
        }

        const results = orderedPlayerIds.map(id => {
            const p = room.players.find(pl => pl.id === id);
            return { id, name: p.name, avatar: p.avatar, number: room.game.playerNumbers[id] };
        });

        if (isCorrect) {
            room.players.forEach(p => p.score += 2);
            broadcastScores(roomCode);
        }
        
        io.to(roomCode).emit('numberSort_showResults', { results, success: isCorrect });
    });

    socket.on('numberSort_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.players[0].id === socket.id) startNumberSortRound(roomCode, room.currentPack);
    });

    // --- Word Guess Events ---
    socket.on('wordGuess_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess' || room.game.isCoop) return;

        const g = room.game;
        const player = g.players.find(p => p.id === socket.id);
        if (player.team === team) return;

        if (player.team) {
            g.teams[player.team].players = g.teams[player.team].players.filter(id => id !== socket.id);
            if (g.teams[player.team].spymaster === socket.id) {
                g.teams[player.team].spymaster = null; player.isSpymaster = false;
            }
        }
        player.team = team;
        g.teams[team].players.push(socket.id);
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    });

    socket.on('wordGuess_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess' || room.game.isCoop) return;

        const g = room.game;
        const player = g.players.find(p => p.id === socket.id);
        if (player.team !== team || g.teams[team].spymaster) return;

        g.teams[team].spymaster = socket.id;
        player.isSpymaster = true;
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    });

    socket.on('wordGuess_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;

        const g = room.game;
        const player = g.players.find(p => p.id === socket.id);
        
        if (!player.isSpymaster) return;
        if (!g.isCoop && g.turn !== player.team) return;

        g.clue = { word, number };
        g.guessesLeft = number + 1;
        room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
    });

    socket.on('wordGuess_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;

        const g = room.game;
        const player = g.players.find(p => p.id === socket.id);
        
        if (player.isSpymaster || !g.clue || g.guessesLeft <= 0) return;
        if (!g.isCoop && g.turn !== player.team) return;

        const card = g.board[cardIndex];
        if (card.revealed) return;

        card.revealed = true;
        g.guessesLeft--;

        if (g.isCoop) {
            if (card.type === 'green') {
                g.wordsFound++;
            } else if (card.type === 'assassin') {
                io.to(roomCode).emit('wordGuess_gameOver', { winner: 'none', reason: 'เจอสายลับ 2 หน้า!', isCoop: true });
                return;
            } else {
                g.guessesLeft = 0; 
            }
        } else {
            if (card.type === g.turn) {
                g.teams[g.turn].score--;
            } else if (card.type === 'assassin') {
                const winner = g.turn === 'red' ? 'blue' : 'red';
                io.to(roomCode).emit('wordGuess_gameOver', { winner, reason: 'เจอการ์ดมือสังหาร!', isCoop: false });
                return;
            } else {
                if (card.type !== 'neutral') g.teams[card.type].score--;
                g.guessesLeft = 0;
            }
        }

        if (!checkWordGuessWinCondition(roomCode)) {
            if (g.guessesLeft === 0) {
                if (g.isCoop) {
                    g.turnsLeft--; g.clue = null;
                    const spymaster = g.players.find(p=>p.isSpymaster); const guesser = g.players.find(p=>!p.isSpymaster);
                    if(spymaster && guesser) { spymaster.isSpymaster = false; guesser.isSpymaster = true; }
                    if (g.turnsLeft <= 0) io.to(roomCode).emit('wordGuess_gameOver', { winner: 'none', reason: 'หมดเทิร์นแล้ว!', isCoop: true });
                } else {
                    g.turn = g.turn === 'red' ? 'blue' : 'red'; g.clue = null; g.guessesLeft = 0;
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
            g.guessesLeft = 0; g.turn = g.turn === 'red' ? 'blue' : 'red'; g.clue = null;
            room.players.forEach(p => syncGameStateToPlayer(io.sockets.sockets.get(p.id), room, roomCode));
        }
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});