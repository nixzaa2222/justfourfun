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
        "โดราเอมอน", "ชินจัง", "โคนัน", "นารูโตะ", "ลูฟี่", "ซุน โกคู (ดราก้อนบอล)", "สไปเดอร์แมน", "ไอรอนแมน", "กัปตันอเมริกา", "แบทแมน", "ซูเปอร์แมน",
        "โธมัส เชลบี้ (Peaky Blinders)", "จอน สโนว์ (Game of Thrones)", "ดาร์ธ เวเดอร์", "โจ๊กเกอร์", "ธานอส", "มิกกี้ เมาส์", "สพันจ์บ็อบ", "คิตตี้", "หมีพูห์",
        "มาริโอ้", "ปิกาจู", "เซเลอร์มูน", "ก็อตซิลล่า", "คิงคอง", "บาร์บี้", "เจมส์ คาเมรอน", "สตีเวน สปีลเบิร์ก", "แบล็คพิงก์", "BTS", "เบลล่า ราณี",
        "ญาญ่า อุรัสยา", "ณเดชน์", "มาริโอ้ เมาเร่อ", "แจ็คสัน หวัง", "ไมเคิล แจ็คสัน", "อัลเบิร์ต ไอน์สไตน์", "สตีฟ จอบส์", "ทอม ครูซ", "จอห์น วิค", "Deadpool",
        "วันเดอร์วูแมน", "อควาแมน", "แฟลช", "บักส์ บันนี", "สเมิร์ฟ", "เทเลทับบีส์", "พาวเวอร์พัฟฟ์เกิลส์", "ดร.สเตรนจ์", "แพทริค สตาร์ (เพื่อนสพันจ์บ๊อบ)", "เปปป้าพิก"
    ],
    valo: [
        "Jett", "Reyna", "Raze", "Phoenix", "Omen", "Yoru", "Neon", "Brimstone", "Viper", "Omen", "Astra", "Harbor", "Sova", "Killjoy", "Cypher", "Chamber", "Sage", "Skye", "KAY/O", "Fade", "Breach", "Gekko", "Deadlock", "Iso", "Clove"
    ],
    marvel: [
        "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Spider-Man", "Doctor Strange", "Ant-Man", "Black Panther", "Captain Marvel", "Winter Soldier", "Falcon", "Scarlet Witch", "Vision", "Groot", "Wolverine", "Star-Lord", "Gamora", "Drax", "Rocket", "Mantis", "Nebula", "Thanos", "Loki", "Ultron", "Red Skull", "Hela", "Killmonger", "Vulture", "Nick Fury", "Deadpool", "Daredevil", "Punisher", "Magneto", "Professor X", "Mystique", "Venom", "Shang-Chi", "Moon Knight"
    ],
    anime: [
        "Naruto", "Sasuke", "Sakura", "Kakashi", "Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin", "Franky", "Brook", "Goku", "Vegeta", "Gohan", "Piccolo", "Krillin", "Frieza", "Cell", "Majin Buu", "Ichigo", "Rukia", "Orihime", "Renji", "Uryu", "Aizen", "Ulquiorra", "Grimmjow", "Gojo Satoru", "Yuji Itadori", "Megumi Fushiguro", "Nobara Kugisaki", "Sukuna", "Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Rengoku", "Levi", "Mikasa", "Eren", "Armin", "Saitama", "Deku", "Midoriya"
    ]
};

const spyfallLocations = [
    "โรงพยาบาล", "สถานีตำรวจ", "โรงเรียน", "มหาวิทยาลัย", "ร้านอาหาร", "คาเฟ่", "ผับ/บาร์", "โรงแรม", 
    "สวนสาธารณะ", "สวนสัตว์", "พิพิธภัณฑ์", "ห้องสมุด", "โรงภาพยนตร์", "โรงละคร", "สนามบิน", "สถานีรถไฟ", 
    "ท่าเรือ", "ป้ายรถเมล์", "สถานีดับเพลิง", "ค่ายทหาร", "ฐานทัพ", "เรือดำน้ำ", "ยานอวกาศ", "สถานีอวกาศ", 
    "สถานีวิจัย", "ห้องทดลอง", "โรงงาน", "โกดัง", "เหมืองแร่", "แท่นขุดเจาะน้ำมัน", "เรือสำราญ", "เรือโจรสลัด", 
    "เกาะร้าง", "ปราสาท", "พระราชวัง", "วัด", "โบสถ์", "มัสยิด", "ศาลเจ้า", "สุสาน", "ป่าช้า", "คาสิโน", 
    "ค่ายลูกเสือ", "สตูดิโอถ่ายทำ", "กองถ่ายหนัง", "สถานีโทรทัศน์", "สถานีวิทยุ", "สวนสนุก", "สวนน้ำ", "สนามกีฬา",
    "ยิม/ฟิตเนส", "สระว่ายน้ำ", "สนามมวย", "สนามกอล์ฟ", "ลานสเก็ต", "ร้านตัดผม/ซาลอน", "ร้านสปา", "คลินิกทันตกรรม", "ร้านขายยา", "ห้างสรรพสินค้า",
    "ซุปเปอร์มาร์เก็ต", "ตลาดสด", "ตลาดนัดกลางคืน", "ร้านสะดวกซื้อ", "ร้านขายของเล่น", "ร้านหนังสือ", "ร้านขายดอกไม้", "ฟาร์ม/ไร่", "สถานีอวกาศนานาชาติ", "บ้านผีสิง"
];

const wordGuessData = {
    general: [
        "หมา", "แมว", "นก", "ปลา", "ช้าง", "ม้า", "วัว", "ควาย", "หมู", "ไก่", "เป็ด", "ห่าน", "สิงโต", "เสือ", "หมี", "ลิง", "งู", "จระเข้", "เต่า", "ตะพาบ", "กิ้งก่า", "จิ้งจก", "ตุ๊กแก", "จิ้งเหลน", "แย้", "แมงมุม", "แมงป่อง", "ตะขาบ", "กิ้งกือ", "ยุง", "แมลงวัน", "แมลงสาบ", "มด", "ปลวก", "ผึ้ง", "ต่อ", "แตน", "แมลงปอ", "ผีเสื้อ", "หนอน", "หอย", "ปู", "กุ้ง", "ปลาหมึก", "ดาวทะเล", "ม้าน้ำ", "โลมา", "วาฬ", "ฉลาม", "แมงกะพรุน",
        "ทีวี", "ตู้เย็น", "พัดลม", "แอร์", "เตารีด", "โทรศัพท์", "คอมพิวเตอร์", "คีย์บอร์ด", "เมาส์", "โต๊ะ", "เก้าอี้", "เตียง", "หมอน", "ผ้าห่ม", "กระเป๋า", "รองเท้า", "เสื้อ", "กางเกง", "หมวก", "แว่นตา",
        "แอปเปิ้ล", "กล้วย", "ส้ม", "แตงโม", "สับปะรด", "มะม่วง", "ฝรั่ง", "เงาะ", "ชมพู่", "ทุเรียน", "ทะเล", "ภูเขา", "น้ำตก", "แม่น้ำ", "ป่า", "ดวงอาทิตย์", "ดวงจันทร์", "ดาว", "เมฆ", "ฝน"
    ],
    valo: [
        "Spike", "Operator", "Vandal", "Phantom", "Sheriff", "Spectre", "Judge", "Bucky", "Ares", "Stinger", "Marshal", "Ghost", "Frenzy", "Classic", "Shorty", "Odin", "Bulldog", "Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset", "Defuse", "Plant", "Ace", "Clutch", "Flawless", "Thrifty", "Headshot", "Wallbang", "Eco", "Buy", "Drop", "Save", "Rotate", "Rush", "Hold", "Camp", "Lurk", "Flank", "Bait", "Trade", "Peek", "Push", "Defend"
    ],
    marvel: [
        "Iron Man", "Captain America", "Thor", "Hulk", "Black Widow", "Hawkeye", "Spider-Man", "Doctor Strange", "Ant-Man", "Black Panther", "Captain Marvel", "Winter Soldier", "Falcon", "Scarlet Witch", "Vision", "Groot", "Wolverine", "Star-Lord", "Gamora", "Drax", "Rocket", "Mantis", "Nebula", "Thanos", "Loki", "Ultron", "Red Skull", "Hela", "Killmonger", "Vulture", "Nick Fury", "Deadpool", "Daredevil", "Punisher", "Magneto", "Professor X", "Mystique", "Venom", "S.H.I.E.L.D.", "Hydra"
    ],
    anime: [
        "Naruto", "Sasuke", "Sakura", "Kakashi", "Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin", "Franky", "Brook", "Goku", "Vegeta", "Gohan", "Piccolo", "Krillin", "Frieza", "Cell", "Majin Buu", "Ichigo", "Rukia", "Orihime", "Renji", "Uryu", "Aizen", "Gojo", "Yuji", "Megumi", "Nobara", "Sukuna", "Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Rengoku", "Levi", "Mikasa", "Eren", "Armin", "Saitama", "Deku", "Kacchan", "Todoroki", "All Might"
    ]
};

const truthOrLiePrompts = [
    "บอกของแปลกที่สุดที่คุณเคยกินมา 2 อย่าง",
    "บอกวีรกรรมตอนเด็กที่พ่อแม่ยังไม่รู้มา 2 เรื่อง",
    "บอกของที่เคยขโมย (หรือหยิบติดมือ) มา 2 อย่าง",
    "บอกสถานที่ที่เคยไปเดทมา 2 ที่",
    "บอกโรคประจำตัวแปลกๆ หรืออาการแพ้แปลกๆ มา 2 อย่าง",
    "บอกสัตว์เลี้ยงที่เคยเลี้ยงมา 2 ชนิด",
    "บอกชื่อแฟนเก่า (หรือคนคุย) มา 2 คน",
    "บอกความลับที่ปิดบังเพื่อนมา 2 เรื่อง",
    "บอกสิ่งที่เคยทำพลาดในที่ทำงาน/โรงเรียนมา 2 อย่าง",
    "บอกอุบัติเหตุร้ายแรงที่เคยเจอมา 2 ครั้ง",
    "บอกเรื่องน่าอายที่เกิดขึ้นในห้องน้ำมา 2 เรื่อง",
    "บอกความฝันที่อยากเป็นตอนเด็กๆ มา 2 อาชีพ",
    "บอกความกลัว (Phobia) ที่คุณเป็นมา 2 อย่าง",
    "บอกนิสัยแย่ๆ ที่คุณแก้ไม่หายมา 2 อย่าง",
    "บอกดารา/ศิลปินที่คุณเคยคลั่งไคล้มากๆ มา 2 คน",
    "บอกหนัง/ซีรีส์ที่คุณดูแล้วร้องไห้หนักมากมา 2 เรื่อง"
];

const sameFlockPrompts = [
    "ยี่ห้อรถยนต์ยอดฮิต", "ร้านสะดวกซื้อ", "เครื่องดื่มเกลือแร่", "ยี่ห้อบะหมี่กึ่งสำเร็จรูป", "แอปพลิเคชันแชท",
    "สีสัญญาณไฟจราจรที่แปลว่าหยุด", "ยี่ห้อรองเท้าผ้าใบยอดนิยม", "เมนูไก่ทอดแบรนด์ดัง", "เมนูอาหารตามสั่งยอดฮิตเวลาคิดไม่ออก", "ธนาคารที่มีสีเขียว",
    "เครือข่ายมือถือ", "เว็บดูวิดีโอยอดนิยม", "แอปสั่งอาหาร (Delivery)", "ยี่ห้อน้ำอัดลมสีดำ", "ผลไม้ที่มีสีแดง",
    "สัตว์เลี้ยงยอดนิยมในบ้าน", "โซเชียลมีเดียที่เปิดบ่อยที่สุด", "สถานที่ท่องเที่ยววันหยุดยาว", "รถไฟฟ้าในกรุงเทพ (เช่น BTS, MRT)", "รสชาติไอศกรีมยอดฮิต",
    "สัตว์ที่ดุร้ายที่สุดในป่า", "อาวุธในเกมยิงปืนยอดฮิต", "ประเทศที่คนไทยชอบไปเที่ยว", "เครื่องดื่มแก้ง่วง", "ตัวละครหลักในโดราเอมอน"
];

const uniqueClueWords = [
    "แอปเปิ้ล", "กล้วย", "ส้ม", "แตงโม", "มะละกอ", "สับปะรด", "มะม่วง", "ฝรั่ง", "เงาะ", "ชมพู่",
    "คอมพิวเตอร์", "โทรศัพท์", "แท็บเล็ต", "คีย์บอร์ด", "เมาส์", "หน้าจอ", "ลำโพง", "หูฟัง", "ไมโครโฟน", "ปริ้นเตอร์",
    "รถยนต์", "มอเตอร์ไซค์", "จักรยาน", "รถบัส", "รถบรรทุก", "รถไฟ", "เครื่องบิน", "เรือ", "เฮลิคอปเตอร์", "เรือดำน้ำ",
    "เสื้อ", "กางเกง", "กระโปรง", "รองเท้า", "ถุงเท้า", "หมวก", "เข็มขัด", "แว่นตา", "นาฬิกา", "กระเป๋า",
    "เตียง", "ตู้", "โต๊ะ", "เก้าอี้", "โซฟา", "ทีวี", "ตู้เย็น", "พัดลม", "แอร์", "เครื่องซักผ้า",
    "โรงเรียน", "โรงพยาบาล", "วัด", "ตลาด", "ห้างสรรพสินค้า", "สวนสัตว์", "สวนสนุก", "ทะเล", "ภูเขา", "น้ำตก",
    "หมอ", "พยาบาล", "ครู", "ตำรวจ", "ทหาร", "วิศวกร", "ดารา", "นักร้อง", "ชาวนา", "พ่อครัว"
];

const matchTheBlankPrompts = [
    "น้ำ ___", "ข้าว ___", "ผัด ___", "ต้ม ___", "แกง ___", "ทอด ___", "ย่าง ___", "ปิ้ง ___", "อบ ___", "นึ่ง ___",
    "คน ___", "ช่าง ___", "หมอ ___", "ครู ___", "นัก ___", "ผู้ ___", "หัวหน้า ___", "ลูกน้อง ___", "เพื่อน ___", "แฟน ___",
    "รถ ___", "เรือ ___", "เครื่องบิน ___", "รถไฟ ___", "รถบัส ___", "รถบรรทุก ___", "จักรยาน ___", "มอเตอร์ไซค์ ___", "แท็กซี่ ___", "ตุ๊กตุ๊ก ___",
    "หนัง ___", "เพลง ___", "เกม ___", "การ์ตูน ___", "หนังสือ ___", "ละคร ___", "ซีรีส์ ___", "รายการ ___", "ข่าว ___", "โฆษณา ___",
    "ไฟ ___", "ลม ___", "ดิน ___", "ฟ้า ___", "ดาว ___", "เดือน ___", "ตะวัน ___", "พระ ___", "เทพ ___", "มาร ___"
];

const secretPainterCategories = {
    general: [
        { c: "สัตว์เลี้ยง", w: "สุนัข,แมว,ปลาทอง,กระต่าย,นกแก้ว,หนูแฮมสเตอร์,เต่า,นกขุนทอง" },
        { c: "ผลไม้", w: "แอปเปิ้ล,กล้วย,ส้ม,แตงโม,มะม่วง,สับปะรด,องุ่น,สตรอว์เบอร์รี" },
        { c: "ยานพาหนะ", w: "รถยนต์,เครื่องบิน,เรือ,จักรยาน,รถไฟ,เฮลิคอปเตอร์,จรวด,รถม้า" },
        { c: "เครื่องใช้ไฟฟ้า", w: "ทีวี,พัดลม,ตู้เย็น,เตารีด,หม้อหุงข้าว,ไมโครเวฟ,เครื่องปั่น,ไดร์เป่าผม" },
        { c: "อาหาร", w: "แฮมเบอร์เกอร์,พิซซ่า,ซูชิ,ส้มตำ,ต้มยำกุ้ง,ก๋วยเตี๋ยว,สเต็ก,เฟรนช์ฟรายส์" },
        { c: "อวัยวะ", w: "ดวงตา,จมูก,ปาก,หู,มือ,เท้า,หัวใจ,สมอง" }
    ],
    valo: [
        { c: "อาวุธ", w: "Vandal,Phantom,Operator,Sheriff,Judge,Odin,Classic,Knife" },
        { c: "เอเจนต์", w: "Jett,Sage,Reyna,Omen,Killjoy,Sova,Cypher,Viper" }
    ]
};

const friendQuizQuestions = [
    "อายุเท่าไหร่?", "มีแฟนมาแล้วกี่คน?", "เคยไปเที่ยวต่างประเทศกี่ประเทศ?", "มีเงินเก็บในบัญชีตอนนี้กี่บาท?", "น้ำหนักเท่าไหร่?",
    "ส่วนสูงเท่าไหร่ (cm)?", "ไซส์รองเท้าเบอร์อะไร?", "ใช้เวลาอาบน้ำกี่นาที?", "นอนกี่ชั่วโมงต่อวัน?", "กินข้าววันละกี่มื้อ?",
    "ใน 1 เดือน ดูหนังกี่เรื่อง?", "วันเกิดวันที่เท่าไหร่ (เลขวัน)?", "เคยโดนแฟนทิ้งกี่ครั้ง?", "เคยแอบชอบเพื่อนกี่คน?", "มีเสื้อสีดำกี่ตัวในตู้?"
];

const numberSortThemes = [
    "ระดับความเผ็ดของอาหาร", "ระดับความน่ากลัวของผี", "ระดับความเจ็บปวดจากการโดนเตะ", "ระดับความอร่อยของของหวาน", "ระดับความยากของข้อสอบ",
    "ระดับความง่วงนอนตอนบ่าย", "ระดับความหิวตอนดึก", "ระดับความหนาวของแอร์", "ระดับความร้อนของแดด", "ระดับความเหม็นของขยะ",
    "ระดับความขี้เกียจตื่นตอนเช้า", "ระดับความดีใจที่ถูกหวย", "ระดับความเศร้าตอนอกหัก", "ระดับความแพงของกระเป๋าแบรนด์เนม", "ระดับความเร็วของอินเทอร์เน็ต"
];

const wavelengthConcepts = [
    ["ร้อน", "เย็น"], ["ดี", "แย่"], ["ถูก", "แพง"], ["นุ่ม", "แข็ง"], ["สว่าง", "มืด"],
    ["เร็ว", "ช้า"], ["เงียบ", "ดัง"], ["ง่าย", "ยาก"], ["สวย", "น่าเกลียด"], ["หอม", "เหม็น"],
    ["หวาน", "ขม"], ["เปรี้ยว", "เค็ม"], ["ใหญ่", "เล็ก"], ["สูง", "เตี้ย"], ["ยาว", "สั้น"],
    ["กว้าง", "แคบ"], ["ลึก", "ตื้น"], ["หนัก", "เบา"], ["หนา", "บาง"], ["ตลก", "จริงจัง"],
    ["อันตราย", "ปลอดภัย"], ["มีประโยชน์", "ไร้สาระ"], ["ผู้ชายชอบ", "ผู้หญิงชอบ"], ["เด็กชอบ", "ผู้ใหญ่ชอบ"], ["หายาก", "หาง่าย"]
];

// ==========================================
// STATE MANAGEMENT
// ==========================================
let rooms = {};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function findRoomBySocketId(socketId) {
    for (const code in rooms) {
        if (rooms[code].players.some(p => p.id === socketId)) return code;
    }
    return null;
}

// ------------------------------------------
// WORD POOLING LOGIC (No Duplicates)
// ------------------------------------------
function getUniqueWord(roomCode, gameKey, arrayProvider) {
    const room = rooms[roomCode];
    if (!room.wordPools) room.wordPools = {};
    if (!room.wordPools[gameKey] || room.wordPools[gameKey].length === 0) {
        room.wordPools[gameKey] = shuffleArray([...arrayProvider()]);
    }
    return room.wordPools[gameKey].pop();
}

function updateRoomLobby(roomCode) {
    if (rooms[roomCode]) {
        io.to(roomCode).emit('updateLobby', {
            players: rooms[roomCode].players.map(p => ({
                id: p.id, name: p.name, avatar: p.avatar, isHost: p.isHost, score: p.score, isOnline: p.isOnline
            })),
            gameType: rooms[roomCode].gameType
        });
    }
}

function updateRoomScores(roomCode) {
    if (rooms[roomCode]) {
        io.to(roomCode).emit('updateScores', rooms[roomCode].players.map(p => ({
            id: p.id, name: p.name, avatar: p.avatar, score: p.score, isOnline: p.isOnline
        })));
    }
}

function removePlayerFromRoom(socketId) {
    for (const code in rooms) {
        const room = rooms[code];
        const pIndex = room.players.findIndex(p => p.id === socketId);
        if (pIndex !== -1) {
            room.players[pIndex].isOnline = false;
            let onlinePlayers = room.players.filter(p => p.isOnline);
            
            if (onlinePlayers.length === 0) {
                // Set timeout to delete room if empty for 5 minutes
                room.deleteTimer = setTimeout(() => { delete rooms[code]; }, 300000);
            } else {
                if (room.players[pIndex].isHost) {
                    room.players[pIndex].isHost = false;
                    onlinePlayers[0].isHost = true;
                }
                updateRoomLobby(code);
                
                // Alert if game is running and player leaves
                if(room.gameState !== 'lobby') {
                    io.to(code).emit('receiveChat', { sender: 'System', avatar: '🤖', message: `${room.players[pIndex].name} หลุดการเชื่อมต่อ...`, senderId: 'system' });
                }
            }
            break;
        }
    }
}

// ==========================================
// SOCKET.IO LOGIC
// ==========================================
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // --- Room Management ---
    socket.on('createRoom', ({ playerName, avatar, playerId }) => {
        let roomCode;
        do { roomCode = Math.random().toString(36).substring(2, 6).toUpperCase(); } while (rooms[roomCode]);

        rooms[roomCode] = {
            players: [{ id: socket.id, realId: playerId, name: playerName, avatar: avatar, isHost: true, score: 0, isOnline: true }],
            gameType: null,
            gameState: 'lobby',
            pack: 'mixed',
            game: {},
            wordPools: {} // Initialize Word Pools
        };
        socket.join(roomCode);
        socket.emit('roomCreated', { roomCode, players: rooms[roomCode].players });
    });

    socket.on('joinRoom', ({ playerName, avatar, roomCode, playerId }) => {
        const room = rooms[roomCode];
        if (room) {
            if (room.players.length >= 16) { socket.emit('error', 'ห้องเต็มแล้ว (สูงสุด 16 คน)'); return; }
            
            // Check if reconnecting
            const existingPlayerIndex = room.players.findIndex(p => p.realId === playerId || p.name === playerName);
            if (existingPlayerIndex !== -1) {
                const oldSocketId = room.players[existingPlayerIndex].id;
                room.players[existingPlayerIndex].id = socket.id;
                room.players[existingPlayerIndex].isOnline = true;
                room.players[existingPlayerIndex].avatar = avatar;
                if(room.deleteTimer) { clearTimeout(room.deleteTimer); room.deleteTimer = null; }
            } else {
                room.players.push({ id: socket.id, realId: playerId, name: playerName, avatar: avatar, isHost: false, score: 0, isOnline: true });
            }

            socket.join(roomCode);
            socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
            updateRoomLobby(roomCode);
            
            // Reconnect logic
            if (room.gameState !== 'lobby') {
                socket.emit('rejoinGameStarted', room.gameType);
            }

        } else {
            socket.emit('error', 'ไม่พบห้องนี้ หรือห้องถูกลบไปแล้ว');
        }
    });

    socket.on('rejoinRoom', ({ roomCode, playerId, playerName, avatar }) => {
        const room = rooms[roomCode];
        if (room) {
             const pIndex = room.players.findIndex(p => p.realId === playerId || p.name === playerName);
             if (pIndex !== -1) {
                 room.players[pIndex].id = socket.id;
                 room.players[pIndex].isOnline = true;
                 room.players[pIndex].avatar = avatar;
                 if(room.deleteTimer) { clearTimeout(room.deleteTimer); room.deleteTimer = null; }
                 socket.join(roomCode);
                 socket.emit('joinSuccess', { roomCode, players: room.players, gameType: room.gameType });
                 updateRoomLobby(roomCode);
                 if (room.gameState !== 'lobby') socket.emit('rejoinGameStarted', room.gameType);
             } else {
                 socket.emit('clearSession');
             }
        } else {
            socket.emit('clearSession');
        }
    });

    socket.on('leaveRoom', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode) {
            const room = rooms[roomCode];
            // ลบผู้เล่นออกจาก array ทันที
            room.players = room.players.filter(p => p.id !== socket.id);
            socket.leave(roomCode);
            
            if (room.players.length === 0) {
                delete rooms[roomCode]; // ลบห้องถ้าไม่มีใครเหลือ
            } else {
                // ถ้าคนที่ออกคือ Host ให้โอนสิทธิ์ให้คนแรกในห้อง
                if (!room.players.some(p => p.isHost)) {
                    room.players[0].isHost = true;
                }
                updateRoomLobby(roomCode);
            }
        }
    });

    socket.on('host_kickPlayer', (targetId) => {
        const roomCode = findRoomBySocketId(socket.id);
        const room = rooms[roomCode];
        if (room && room.players.find(p => p.id === socket.id)?.isHost) {
            room.players = room.players.filter(p => p.id !== targetId);
            io.to(targetId).emit('kicked');
            
            // ให้ socket ของคนที่โดนเตะออกจากห้อง (Room) บน Socket.IO
            const targetSocket = io.sockets.sockets.get(targetId);
            if(targetSocket) {
                targetSocket.leave(roomCode);
            }
            updateRoomLobby(roomCode);
        }
    });

    socket.on('host_selectGame', (gameType) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) {
            rooms[roomCode].gameType = gameType;
            socket.to(roomCode).emit('gameSelected', gameType);
        }
    });

    socket.on('host_selectPack', (pack) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) {
            rooms[roomCode].pack = pack;
            io.to(roomCode).emit('packSelected', pack);
        }
    });

    socket.on('host_changeBGM', (trackUrl) => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) {
            io.to(roomCode).emit('bgm_changed', trackUrl);
        }
    });

    socket.on('startGame', (payload) => {
        const roomCode = payload.roomCode;
        if (rooms[roomCode] && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) {
            rooms[roomCode].gameState = 'playing';
            // Save custom settings
            if (payload.customWords) rooms[roomCode].customWords = payload.customWords;
            if (payload.timerMin) rooms[roomCode].timerMin = payload.timerMin;
            
            io.to(roomCode).emit('gameStarted', { gameType: rooms[roomCode].gameType, ...payload });
        }
    });

    socket.on('returnToLobby', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) {
            rooms[roomCode].gameState = 'lobby';
            rooms[roomCode].gameType = null;
            rooms[roomCode].game = {}; // Clear game data
            rooms[roomCode].wordPools = {}; // Reset Word Pools here!
            io.to(roomCode).emit('backToLobby', rooms[roomCode].players);
        }
    });

    // --- Chat & Social ---
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

    // ==========================================
    // GAME ROUTER: HOST GAME START
    // ==========================================
    socket.on('host_gameLogicStart', (data) => {
        const roomCode = data.roomCode; const room = rooms[roomCode];
        if (!room) return;
        const gameType = room.gameType;

        if (gameType === 'who-am-i') startWhoAmI(roomCode);
        else if (gameType === 'secret-agent') startSecretAgent(roomCode, data);
        else if (gameType === 'bluff-overthrow') startBluffOverthrow(roomCode);
        else if (gameType === 'truth-or-lie') startTruthOrLie(roomCode);
        else if (gameType === 'unique-clue') startUniqueClue(roomCode, data);
        else if (gameType === 'match-the-blank') startMatchTheBlank(roomCode);
        else if (gameType === 'secret-painter') startSecretPainter(roomCode, data);
        else if (gameType === 'friend-quiz') startFriendQuiz(roomCode);
        else if (gameType === 'number-sort') startNumberSort(roomCode);
        else if (gameType === 'word-guess') startWordGuess(roomCode, data);
        else if (gameType === 'mind-frequency') {
            room.game = { mode: 'versus', coopType: 'shared', teams: { red: [], blue: [] }, scores: { red: 0, blue: 0, coop: 0, individual: {} } };
            const activePlayers = room.players.filter(p => p.isOnline);
            io.to(roomCode).emit('mindFrequency_setupState', { 
                mode: 'versus', coopType: 'shared', teams: { red: [], blue: [] },
                allPlayers: activePlayers.map(x=>({id:x.id, name:x.name, avatar:x.avatar}))
            });
        }
        else if (gameType === 'same-flock') startSameFlock(roomCode);
    });

    // Helper for Data Pack
    function getWordsArray(room) {
        if(room.pack === 'custom' && room.customWords) return room.customWords;
        if(whoAmIData[room.pack]) return whoAmIData[room.pack];
        if(wordGuessData[room.pack]) return wordGuessData[room.pack];
        
        let allWords = [];
        for (let key in whoAmIData) allWords = allWords.concat(whoAmIData[key]);
        return allWords;
    }

    // ==========================================
    // GAME: WHO AM I
    // ==========================================
    function startWhoAmI(roomCode) {
        const room = rooms[roomCode];
        room.game = { answers: {} };
        const activePlayers = room.players.filter(p => p.isOnline);
        
        activePlayers.forEach((p) => {
            room.game.answers[p.id] = getUniqueWord(roomCode, 'whoAmI', () => getWordsArray(room));
        });

        activePlayers.forEach(p => {
            const othersData = activePlayers.filter(o => o.id !== p.id).map(o => ({
                id: o.id, name: o.name, avatar: o.avatar, character: room.game.answers[o.id]
            }));
            io.to(p.id).emit('whoAmI_newRound', { others: othersData });
        });
    }

    socket.on('whoAmI_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'who-am-i') return;

        const correctAns = room.game.answers[socket.id];
        if (guess.trim().toLowerCase() === correctAns.toLowerCase()) {
            const winner = room.players.find(p => p.id === socket.id);
            winner.score += 3; updateRoomScores(roomCode);

            const activePlayers = room.players.filter(p => p.isOnline);
            const revealData = activePlayers.map(p => ({
                id: p.id, name: p.name, avatar: p.avatar, character: room.game.answers[p.id]
            }));

            io.to(roomCode).emit('whoAmI_endRound', {
                winnerId: socket.id, winnerName: winner.name, revealData
            });
        } else {
            socket.emit('whoAmI_wrongGuess');
        }
    });

    socket.on('whoAmI_skipRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'who-am-i') return;
        if (!room.players.find(p => p.id === socket.id)?.isHost) return;

        const activePlayers = room.players.filter(p => p.isOnline);
        const revealData = activePlayers.map(p => ({
            id: p.id, name: p.name, avatar: p.avatar, character: room.game.answers[p.id]
        }));
        io.to(roomCode).emit('whoAmI_endRound', { winnerId: null, revealData });
    });

    socket.on('whoAmI_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startWhoAmI(roomCode);
    });

    // ==========================================
    // GAME: SPYFALL (Secret Agent)
    // ==========================================
    function startSecretAgent(roomCode, data) {
        const room = rooms[roomCode];
        const activePlayers = room.players.filter(p => p.isOnline);
        
        let allLocs = [];
        if(room.pack === 'custom' && room.customWords && room.customWords.length >= 10) allLocs = room.customWords;
        else allLocs = spyfallLocations;

        if(!room.game.playedLocations) room.game.playedLocations = [];
        
        let availableLocs = allLocs.filter(l => !room.game.playedLocations.includes(l));
        if(availableLocs.length === 0) { availableLocs = allLocs; room.game.playedLocations = []; }

        const chosenLoc = availableLocs[Math.floor(Math.random() * availableLocs.length)];
        
        // Copy before pushing, so the client doesn't see it crossed out on the first turn!
        const locsToSendToClient = [...room.game.playedLocations];
        
        room.game.playedLocations.push(chosenLoc);
        
        // Select random locs to show on board (including chosen)
        let locBoard = shuffleArray([...allLocs]);
        if(!locBoard.includes(chosenLoc)) locBoard[0] = chosenLoc;
        locBoard = shuffleArray(locBoard.slice(0, 15)); // Show 15 locations

        const spyIdx = Math.floor(Math.random() * activePlayers.length);
        const roles = ["คนปกติ", "นักสืบ", "ผู้จัดการ", "พนักงานทำความสะอาด", "นักท่องเที่ยว", "ยาม", "ผู้โชคร้าย", "ช่างซ่อมบำรุง", "ดาราหน้าใหม่", "ลูกค้าวีไอพี"]; 
        
        room.game.spyId = activePlayers[spyIdx].id;
        room.game.location = chosenLoc;
        room.game.allLocations = locBoard;
        room.game.votes = {};

        const duration = (data.timerMin || 5) * 60 * 1000;
        room.game.endTime = Date.now() + duration;
        room.game.phase = 'playing';

        activePlayers.forEach((p, idx) => {
            const isSpy = idx === spyIdx;
            const role = roles[Math.floor(Math.random() * roles.length)];
            io.to(p.id).emit('spyfall_newRound', {
                isSpy, location: chosenLoc, role, endTime: room.game.endTime,
                allLocations: locBoard, playedLocations: locsToSendToClient // Send safe copy
            });
        });
    }

    socket.on('spyfall_timeUp', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent') return;
        if (room.game.phase !== 'playing') return;

        room.game.phase = 'voting';
        const activePlayers = room.players.filter(p => p.isOnline);
        io.to(roomCode).emit('spyfall_startVoting', { players: activePlayers.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, color: p.color })) });
    });

    socket.on('spyfall_spyEarlyGuess', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent') return;
        if (room.game.spyId === socket.id && room.game.phase === 'playing') {
            room.game.phase = 'spy_guessing';
            
            // Remove current loc before sending to Spy for guess so it's not crossed out
            const locsToGuess = room.game.playedLocations.filter(loc => loc !== room.game.location);
            
            io.to(roomCode).emit('spyfall_spyGuessingPhase', { 
                spyId: socket.id, 
                allLocations: room.game.allLocations,
                playedLocations: locsToGuess
            });
        }
    });

    socket.on('spyfall_submitSpyGuess', ({ location, isBonus }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent') return;

        const isCorrect = location === room.game.location;
        const spyPlayer = room.players.find(p => p.id === room.game.spyId);
        
        let titleMsg = "";
        let spyWon = false;

        if (isBonus) {
            // โบนัสเฟส (สายลับรอดโหวต เลยได้ทาย)
            if (isCorrect) {
                spyPlayer.score += 2;
                titleMsg = `😭 สายลับหนีรอด แถมรู้สถานที่ด้วย! (+5 ให้สายลับ)`;
                spyWon = true;
            } else {
                titleMsg = `😱 สายลับหนีรอด แต่ไม่รู้ว่าคือที่ไหน! (+3 ให้สายลับ)`;
                spyWon = true;
            }
        } else {
            // สายลับชิงตอบก่อน
            if (isCorrect) {
                spyPlayer.score += 5;
                titleMsg = `🕵️‍♂️ สายลับรู้ทัน! สายลับชนะ! (+5 ให้สายลับ)`;
                spyWon = true;
            } else {
                titleMsg = `🤡 สายลับโป๊ะแตก! ทายผิดจ้า (+2 ให้ทุกคนที่เหลือ)`;
                room.players.forEach(p => { if(p.id !== room.game.spyId && p.isOnline) p.score += 2; });
                spyWon = false;
            }
        }

        updateRoomScores(roomCode);
        io.to(roomCode).emit('spyfall_showResult', {
            location: room.game.location, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar, spyId: spyPlayer.id,
            titleMsg, spyWon, players: room.players, votes: room.game.votes
        });
    });

    socket.on('spyfall_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-agent') return;
        
        if(!room.game.votes[votedId]) room.game.votes[votedId] = 0;
        room.game.votes[votedId]++;
        
        const activePlayers = room.players.filter(p => p.isOnline);
        const totalVotes = Object.values(room.game.votes).reduce((a,b)=>a+b, 0);

        io.to(roomCode).emit('updateProgress', { current: totalVotes, total: activePlayers.length, text: "รอเพื่อนโหวต..." });

        if (totalVotes === activePlayers.length) {
            setTimeout(() => evaluateSpyfallVotes(roomCode), 1000);
        }
    });

    function evaluateSpyfallVotes(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        // หาคนที่ได้โหวตมากสุด
        let maxVotes = 0; let votedOutLoc = [];
        for (let id in room.game.votes) {
            if (room.game.votes[id] > maxVotes) { maxVotes = room.game.votes[id]; votedOutLoc = [id]; }
            else if (room.game.votes[id] === maxVotes) { votedOutLoc.push(id); }
        }

        const spyPlayer = room.players.find(p => p.id === room.game.spyId);
        let spyCaught = false;

        // ถ้ามีคนได้โหวตมากสุดคนเดียว และเป็นสายลับ = จับได้
        if (votedOutLoc.length === 1 && votedOutLoc[0] === room.game.spyId) spyCaught = true;

        if (spyCaught) {
            // จับได้! ใครโหวตสายลับได้ +2 แต้ม
            room.players.forEach(p => { if(p.id !== room.game.spyId && p.isOnline) p.score += 2; });
            updateRoomScores(roomCode);
            
            io.to(roomCode).emit('spyfall_showResult', {
                location: room.game.location, spyName: spyPlayer.name, spyAvatar: spyPlayer.avatar, spyId: spyPlayer.id,
                titleMsg: "🎉 จับสายลับได้แล้ว! ทีมคนปกติชนะ!", spyWon: false, players: room.players, votes: room.game.votes
            });
        } else {
            // จับไม่ได้! สายลับได้ +3 แต้ม และได้เข้าสู่โบนัสเฟสทายสถานที่
            spyPlayer.score += 3;
            updateRoomScores(roomCode);
            room.game.phase = 'bonus_guess';
            
            const locsToGuess = room.game.playedLocations.filter(loc => loc !== room.game.location);

            io.to(roomCode).emit('spyfall_bonusPhase', {
                spyId: room.game.spyId, allLocations: room.game.allLocations, playedLocations: locsToGuess
            });
        }
    }

    socket.on('spyfall_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startSecretAgent(roomCode, {});
    });

    // ==========================================
    // GAME: BLUFF OVERTHROW (Mafia / Coup)
    // ==========================================
    const allRoles = ['sniper', 'assassin', 'hacker', 'spy', 'healer'];
    function startBluffOverthrow(roomCode) {
        const room = rooms[roomCode];
        const activePlayers = room.players.filter(p => p.isOnline);
        
        let deck = [];
        for(let i=0; i<3; i++) deck = deck.concat(allRoles); // 3 of each role
        deck = shuffleArray(deck);

        room.game = {
            deck: deck, phase: 'action', currentTurnIndex: 0,
            turnOrder: shuffleArray(activePlayers.map(p=>p.id)),
            playersState: {}
        };

        room.game.turnOrder.forEach(id => {
            room.game.playersState[id] = {
                coins: 2,
                cards: [ {role: room.game.deck.pop(), dead: false}, {role: room.game.deck.pop(), dead: false} ],
                isEliminated: false
            };
        });

        io.to(roomCode).emit('bluff_newRound');
        broadcastCoupState(roomCode);
    }

    function broadcastCoupState(roomCode) {
        const room = rooms[roomCode];
        if(!room || !room.game || !room.game.playersState) return;

        const globalState = {
            phase: room.game.phase,
            currentTurnId: room.game.turnOrder[room.game.currentTurnIndex],
            pendingAction: room.game.pendingAction,
            pendingBlock: room.game.pendingBlock,
            playerLosingCard: room.game.playerLosingCard,
            playersStatus: room.game.turnOrder.map(id => {
                const state = room.game.playersState[id];
                const p = room.players.find(x => x.id === id);
                return {
                    id, name: p ? p.name : 'Unknown', avatar: p ? p.avatar : '👤',
                    coins: state.coins, isEliminated: state.isEliminated,
                    cardsCount: state.cards.filter(c => !c.dead).length,
                    deadCards: state.cards.filter(c => c.dead).map(c => c.role)
                }
            })
        };

        room.players.forEach(p => {
            if(!p.isOnline) return;
            const myState = room.game.playersState[p.id];
            io.to(p.id).emit('coup_updateState', { myState, globalState });
        });
    }

    function coupNextTurn(roomCode) {
        const room = rooms[roomCode];
        room.game.phase = 'action';
        room.game.pendingAction = null;
        room.game.pendingBlock = null;
        room.game.playerLosingCard = null;

        let loops = 0;
        do {
            room.game.currentTurnIndex = (room.game.currentTurnIndex + 1) % room.game.turnOrder.length;
            loops++;
        } while (room.game.playersState[room.game.turnOrder[room.game.currentTurnIndex]].isEliminated && loops < 10);

        // Check win condition
        const alivePlayers = room.game.turnOrder.filter(id => !room.game.playersState[id].isEliminated);
        if(alivePlayers.length === 1) {
            const winner = room.players.find(p => p.id === alivePlayers[0]);
            if(winner) winner.score += 5;
            updateRoomScores(roomCode);
            io.to(roomCode).emit('receiveChat', { sender: 'System', avatar: '🏆', message: `${winner.name} คือผู้รอดชีวิตคนสุดท้าย!`, senderId: 'system' });
            // Host needs to start new game manually
        } else {
            broadcastCoupState(roomCode);
        }
    }

    socket.on('bluff_action', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow' || room.game.turnOrder[room.game.currentTurnIndex] !== socket.id) return;
        
        const myState = room.game.playersState[socket.id];
        let claimRole = null;

        if (data.type === 'income') {
            myState.coins += 1; coupNextTurn(roomCode); return;
        } else if (data.type === 'eliminate') {
            if (myState.coins >= 7 && data.targetId) {
                myState.coins -= 7;
                room.game.phase = 'lose_card';
                room.game.playerLosingCard = data.targetId;
                broadcastCoupState(roomCode);
            }
            return;
        } else if (data.type === 'foreign_aid') { claimRole = null; }
        else if (data.type === 'tax') { claimRole = 'sniper'; }
        else if (data.type === 'assassinate') { 
            if(myState.coins >= 3) { myState.coins -= 3; claimRole = 'assassin'; } else return;
        }
        else if (data.type === 'steal') { claimRole = 'hacker'; }
        else if (data.type === 'exchange') { claimRole = 'spy'; }

        room.game.phase = 'reaction';
        room.game.pendingAction = { type: data.type, source: socket.id, target: data.targetId, claim: claimRole };
        room.game.passCount = 0;
        
        broadcastCoupState(roomCode);
    });

    socket.on('bluff_react', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow') return;

        const aliveCount = room.game.turnOrder.filter(id => !room.game.playersState[id].isEliminated).length;

        if (data.response === 'pass') {
            room.game.passCount++;
            if (room.game.passCount >= aliveCount - 1) {
                // All passed, execute action or block
                if (room.game.phase === 'reaction') {
                    executeCoupAction(roomCode);
                } else if (room.game.phase === 'block_reaction') {
                    // Block succeeded (nobody challenged the block)
                    coupNextTurn(roomCode);
                }
            }
        } 
        else if (data.response === 'challenge') {
            // Check if claim is true
            let claimRole = ''; let sourceId = '';
            if (room.game.phase === 'reaction') { claimRole = room.game.pendingAction.claim; sourceId = room.game.pendingAction.source; }
            else if (room.game.phase === 'block_reaction') { claimRole = room.game.pendingBlock.claim; sourceId = room.game.pendingBlock.source; }

            const targetState = room.game.playersState[sourceId];
            const hasCard = targetState.cards.some(c => !c.dead && c.role === claimRole);

            if (hasCard) {
                // Challenger loses a card. Source shuffles card into deck and draws new one.
                room.game.playerLosingCard = socket.id;
                
                const cardIdx = targetState.cards.findIndex(c => !c.dead && c.role === claimRole);
                if(cardIdx !== -1) {
                    room.game.deck.push(targetState.cards[cardIdx].role);
                    room.game.deck = shuffleArray(room.game.deck);
                    targetState.cards[cardIdx].role = room.game.deck.pop();
                }

                if (room.game.phase === 'reaction') {
                    // Action still goes through after loser picks card
                    room.game.phase = 'lose_card';
                    room.game.afterLoseCardPhase = 'execute_action'; 
                } else {
                    // Block still goes through, action fails
                    room.game.phase = 'lose_card';
                    room.game.afterLoseCardPhase = 'next_turn';
                }
            } else {
                // Liar loses a card.
                room.game.playerLosingCard = sourceId;
                if (room.game.phase === 'reaction') {
                    // Action fails
                    room.game.phase = 'lose_card';
                    room.game.afterLoseCardPhase = 'next_turn';
                } else {
                    // Block fails, original action goes through
                    room.game.phase = 'lose_card';
                    room.game.afterLoseCardPhase = 'execute_action';
                }
            }
            broadcastCoupState(roomCode);
        }
        else if (data.response === 'block') {
            room.game.phase = 'block_reaction';
            room.game.pendingBlock = { source: socket.id, claim: data.claimRole };
            room.game.passCount = 0;
            broadcastCoupState(roomCode);
        }
    });

    socket.on('bluff_loseCard', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow') return;

        const myState = room.game.playersState[socket.id];
        if (!myState.cards[data.cardIndex].dead) {
            myState.cards[data.cardIndex].dead = true;
            
            if (myState.cards.every(c => c.dead)) {
                myState.isEliminated = true;
                // If current turn player is eliminated, need to end their turn immediately
            }

            // Decide what to do next based on what caused the loss
            if (room.game.afterLoseCardPhase === 'execute_action') {
                executeCoupAction(roomCode);
            } else if (room.game.afterLoseCardPhase === 'next_turn') {
                coupNextTurn(roomCode);
            } else {
                // Normal elimination action
                if(room.game.pendingAction && room.game.pendingAction.type === 'eliminate') coupNextTurn(roomCode);
                else coupNextTurn(roomCode); // Fallback
            }
        }
    });

    socket.on('bluff_exchange', ({ keepIndices }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'bluff-overthrow') return;

        const myState = room.game.playersState[socket.id];
        const options = room.game.exchangeOptions;
        
        let newCards = [];
        keepIndices.forEach(idx => { newCards.push({role: options[idx].role, dead: false}); });
        
        // Put rest back in deck
        options.forEach((c, idx) => {
            if(!keepIndices.includes(idx)) room.game.deck.push(c.role);
        });
        room.game.deck = shuffleArray(room.game.deck);

        // Update cards, maintaining dead cards if any
        const deadCards = myState.cards.filter(c => c.dead);
        myState.cards = newCards.concat(deadCards);
        
        room.game.exchangeOptions = null;
        coupNextTurn(roomCode);
    });

    function executeCoupAction(roomCode) {
        const room = rooms[roomCode];
        const action = room.game.pendingAction;
        const sourceState = room.game.playersState[action.source];
        const targetState = action.target ? room.game.playersState[action.target] : null;

        if (sourceState.isEliminated) { coupNextTurn(roomCode); return; }

        if (action.type === 'foreign_aid') { sourceState.coins += 2; coupNextTurn(roomCode); }
        else if (action.type === 'tax') { sourceState.coins += 3; coupNextTurn(roomCode); }
        else if (action.type === 'assassinate') { 
            room.game.phase = 'lose_card'; room.game.playerLosingCard = action.target; room.game.afterLoseCardPhase = 'next_turn';
            broadcastCoupState(roomCode);
        }
        else if (action.type === 'steal') {
            const stealAmt = Math.min(2, targetState.coins);
            targetState.coins -= stealAmt; sourceState.coins += stealAmt;
            coupNextTurn(roomCode);
        }
        else if (action.type === 'exchange') {
            room.game.phase = 'exchange';
            const aliveCount = sourceState.cards.filter(c => !c.dead).length;
            let options = [];
            sourceState.cards.forEach(c => { if(!c.dead) options.push({role: c.role}); });
            options.push({role: room.game.deck.pop()}); options.push({role: room.game.deck.pop()});
            room.game.exchangeOptions = options;
            broadcastCoupState(roomCode);
        }
    }

    // ==========================================
    // GAME: TRUTH OR LIE
    // ==========================================
    function startTruthOrLie(roomCode) {
        const room = rooms[roomCode];
        room.game = { 
            roundPrompt: getUniqueWord(roomCode, 'truthOrLie', () => truthOrLiePrompts), 
            answers: {}, 
            phase: 'answering',
            turnOrder: [],
            currentTurnIndex: 0,
            votes: {},
            votersDict: {}
        };

        const activePlayers = room.players.filter(p => p.isOnline);
        room.game.turnOrder = shuffleArray(activePlayers.map(p=>p.id));

        io.to(roomCode).emit('truthOrLie_newRound', { prompt: room.game.roundPrompt });
    }

    socket.on('truthOrLie_submitAnswer', ({ truth, lie }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie') return;

        room.game.answers[socket.id] = { truth, lie };
        const activePlayers = room.players.filter(p => p.isOnline);

        io.to(roomCode).emit('updateProgress', { current: Object.keys(room.game.answers).length, total: activePlayers.length, text: "รอคนแต่งเรื่อง..." });

        if (Object.keys(room.game.answers).length === activePlayers.length) {
            setTimeout(() => startTruthOrLieVotingPhase(roomCode), 1000);
        }
    });

    function startTruthOrLieVotingPhase(roomCode) {
        const room = rooms[roomCode];
        room.game.phase = 'voting';
        room.game.votes = {};
        room.game.votersDict = {};

        const activeId = room.game.turnOrder[room.game.currentTurnIndex];
        const answerData = room.game.answers[activeId];
        const activePlayer = room.players.find(p => p.id === activeId);

        // Randomize A and B
        const isTruthA = Math.random() > 0.5;
        room.game.currentOptions = {
            A: isTruthA ? answerData.truth : answerData.lie,
            B: isTruthA ? answerData.lie : answerData.truth,
            lieOption: isTruthA ? 'B' : 'A'
        };

        io.to(roomCode).emit('updateProgress', { hide: true });
        io.to(roomCode).emit('truthOrLie_startVoting', { 
            activePlayer: { id: activePlayer.id, name: activePlayer.name, avatar: activePlayer.avatar },
            optionA: room.game.currentOptions.A,
            optionB: room.game.currentOptions.B
        });
    }

    socket.on('truthOrLie_submitVote', ({ vote }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie') return;

        room.game.votes[socket.id] = vote;
        const activePlayers = room.players.filter(p => p.isOnline);
        const votersCount = Object.keys(room.game.votes).length;
        // Host + Active player doesn't vote, so total - 1
        const totalExpected = activePlayers.length - 1;

        io.to(roomCode).emit('updateProgress', { current: votersCount, total: totalExpected, text: "รอเพื่อนโหวตจับผิด..." });

        if (votersCount >= totalExpected) {
            setTimeout(() => revealTruthOrLie(roomCode), 1000);
        }
    });

    function revealTruthOrLie(roomCode) {
        const room = rooms[roomCode];
        const activeId = room.game.turnOrder[room.game.currentTurnIndex];
        const activePlayer = room.players.find(p => p.id === activeId);
        const lieOption = room.game.currentOptions.lieOption;
        
        let fooledCount = 0;
        let voteDetails = [];

        for (let pId in room.game.votes) {
            const v = room.game.votes[pId];
            const voter = room.players.find(x => x.id === pId);
            if (voter) {
                voteDetails.push({ name: voter.name, avatar: voter.avatar, vote: v });
                if (v !== lieOption) {
                    fooledCount++;
                    activePlayer.score += 1; // Fooled someone
                } else {
                    voter.score += 1; // Guessed correctly
                }
            }
        }

        const totalVoters = Object.keys(room.game.votes).length;
        if (fooledCount === totalVoters && totalVoters > 0) activePlayer.score += 2; // Bonus

        updateRoomScores(roomCode);
        io.to(roomCode).emit('updateProgress', { hide: true });
        
        io.to(roomCode).emit('truthOrLie_showVoteResult', {
            truth: room.game.answers[activeId].truth,
            lie: room.game.answers[activeId].lie,
            lieOption: lieOption,
            fooledCount: fooledCount,
            totalVoters: totalVoters,
            activePlayer: { name: activePlayer.name },
            voteDetails: voteDetails
        });
    }

    socket.on('truthOrLie_nextPlayer', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'truth-or-lie') return;

        room.game.currentTurnIndex++;
        if (room.game.currentTurnIndex < room.game.turnOrder.length) {
            startTruthOrLieVotingPhase(roomCode);
        } else {
            // End of round
            io.to(roomCode).emit('truthOrLie_endRound', {
                players: room.players.map(p => ({ name: p.name, avatar: p.avatar, score: p.score }))
            });
        }
    });

    socket.on('truthOrLie_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startTruthOrLie(roomCode);
    });

    // ==========================================
    // GAME: UNIQUE CLUE
    // ==========================================
    function startUniqueClue(roomCode, data) {
        const room = rooms[roomCode];
        
        if (!room.game || !room.game.turnOrder) {
            const activePlayers = room.players.filter(p => p.isOnline);
            room.game = { turnOrder: shuffleArray(activePlayers.map(p=>p.id)), currentTurnIndex: 0 };
        } else {
            room.game.currentTurnIndex = (room.game.currentTurnIndex + 1) % room.game.turnOrder.length;
        }

        room.game.word = getUniqueWord(roomCode, 'uniqueClue', () => getWordsArray(room));
        if(!room.game.word) room.game.word = getUniqueWord(roomCode, 'uniqueClue', () => uniqueClueWords); // Fallback
        
        room.game.clues = {};
        room.game.guesserId = room.game.turnOrder[room.game.currentTurnIndex];
        
        const guesser = room.players.find(p => p.id === room.game.guesserId);
        
        io.to(roomCode).emit('uniqueClue_newRound', { 
            guesser: { id: guesser.id, name: guesser.name, avatar: guesser.avatar },
            word: room.game.word 
        });
    }

    socket.on('uniqueClue_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue') return;

        room.game.clues[socket.id] = clue.toLowerCase().trim();
        const activePlayers = room.players.filter(p => p.isOnline);
        const cluesCount = Object.keys(room.game.clues).length;

        io.to(roomCode).emit('updateProgress', { current: cluesCount, total: activePlayers.length - 1, text: "รอคนส่งคำใบ้..." });

        if (cluesCount >= activePlayers.length - 1) {
            setTimeout(() => evaluateUniqueClues(roomCode), 1000);
        }
    });

    function evaluateUniqueClues(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        const clueCounts = {};
        for (let pId in room.game.clues) {
            const c = room.game.clues[pId];
            clueCounts[c] = (clueCounts[c] || 0) + 1;
        }

        const validClues = [];
        for (let pId in room.game.clues) {
            const c = room.game.clues[pId];
            if (clueCounts[c] === 1) validClues.push(c);
        }

        room.game.validClueObjects = validClues;
        io.to(roomCode).emit('uniqueClue_startGuessing', { validClues });
    }

    socket.on('uniqueClue_submitGuess', ({ guess }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'unique-clue') return;

        const isCorrect = guess.toLowerCase().trim() === room.game.word.toLowerCase().trim();
        
        // Prepare summary data
        const playerClues = [];
        const clueCounts = {};
        for (let pId in room.game.clues) {
            const c = room.game.clues[pId];
            clueCounts[c] = (clueCounts[c] || 0) + 1;
        }

        for (let pId in room.game.clues) {
            const p = room.players.find(x => x.id === pId);
            const c = room.game.clues[pId];
            const isValid = clueCounts[c] === 1;
            if(p) {
                playerClues.push({ playerName: p.name, playerAvatar: p.avatar, clue: c, isValid: isValid });
                // Scoring
                if (isCorrect && isValid) p.score += 1;
            }
        }

        if (isCorrect) {
            const guesser = room.players.find(p => p.id === socket.id);
            if(guesser) guesser.score += 2;
        }

        updateRoomScores(roomCode);

        io.to(roomCode).emit('uniqueClue_showResult', {
            isCorrect, word: room.game.word, guess, playerClues
        });
    });

    socket.on('uniqueClue_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startUniqueClue(roomCode, {});
    });

    // ==========================================
    // GAME: SECRET PAINTER
    // ==========================================
    const colors = ['#e41a1c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16'];
    function startSecretPainter(roomCode, data) {
        const room = rooms[roomCode];
        const activePlayers = room.players.filter(p => p.isOnline);
        
        let cats = secretPainterCategories.general;
        if(room.pack === 'valo') cats = secretPainterCategories.valo;
        
        const cat = cats[Math.floor(Math.random() * cats.length)];
        const wordsList = cat.w.split(',');
        const chosenWord = getUniqueWord(roomCode, 'secretPainter', () => wordsList);
        
        const painterIdx = Math.floor(Math.random() * activePlayers.length);
        
        room.game = {
            category: cat.c, word: chosenWord,
            secretPainterId: activePlayers[painterIdx].id,
            turnOrder: shuffleArray(activePlayers.map(p=>p.id)),
            currentTurnIndex: 0, currentRound: 1,
            playerColors: {}, votes: {}
        };

        activePlayers.forEach((p, i) => { room.game.playerColors[p.id] = colors[i % colors.length]; });

        const firstPlayer = room.players.find(p => p.id === room.game.turnOrder[0]);

        activePlayers.forEach((p) => {
            io.to(p.id).emit('secretPainter_newRound', {
                category: cat.c,
                word: p.id === room.game.secretPainterId ? '???' : chosenWord,
                isSecretPainter: p.id === room.game.secretPainterId,
                myColor: room.game.playerColors[p.id],
                currentTurnId: firstPlayer.id, currentTurnName: firstPlayer.name, currentTurnAvatar: firstPlayer.avatar
            });
        });
    }

    socket.on('secretPainter_drawLine', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        socket.to(roomCode).emit('secretPainter_onDraw', data);
    });

    socket.on('secretPainter_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;

        room.game.currentTurnIndex++;
        if (room.game.currentTurnIndex >= room.game.turnOrder.length) {
            room.game.currentTurnIndex = 0;
            room.game.currentRound++;
        }

        if (room.game.currentRound > 2) {
            // End drawing, start voting
            const activePlayers = room.players.filter(p => p.isOnline);
            io.to(roomCode).emit('secretPainter_startVoting', {
                players: activePlayers.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, color: room.game.playerColors[p.id] }))
            });
        } else {
            const nextPlayer = room.players.find(p => p.id === room.game.turnOrder[room.game.currentTurnIndex]);
            io.to(roomCode).emit('secretPainter_updateTurn', {
                currentTurnId: nextPlayer.id, currentTurnName: nextPlayer.name, currentTurnAvatar: nextPlayer.avatar, round: room.game.currentRound
            });
        }
    });

    socket.on('secretPainter_submitVote', ({ votedId }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;
        
        room.game.votes[votedId] = (room.game.votes[votedId] || 0) + 1;
        const activePlayers = room.players.filter(p => p.isOnline);
        const totalVotes = Object.values(room.game.votes).reduce((a,b)=>a+b, 0);

        io.to(roomCode).emit('updateProgress', { current: totalVotes, total: activePlayers.length, text: "รอคนโหวตจับผิด..." });

        if (totalVotes === activePlayers.length) {
            setTimeout(() => evaluatePainterVotes(roomCode), 1000);
        }
    });

    function evaluatePainterVotes(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        let maxVotes = 0; let votedOut = [];
        for (let id in room.game.votes) {
            if (room.game.votes[id] > maxVotes) { maxVotes = room.game.votes[id]; votedOut = [id]; }
            else if (room.game.votes[id] === maxVotes) { votedOut.push(id); }
        }

        let isPainterCaught = (votedOut.length === 1 && votedOut[0] === room.game.secretPainterId);
        const secretPainter = room.players.find(p => p.id === room.game.secretPainterId);

        if (!isPainterCaught) {
            secretPainter.score += 5; updateRoomScores(roomCode);
        }

        io.to(roomCode).emit('secretPainter_reveal', {
            isPainterCaught, secretPainterId: secretPainter.id, secretPainterName: secretPainter.name, secretPainterAvatar: secretPainter.avatar, votes: room.game.votes
        });
    }

    socket.on('secretPainter_submitGuess', ({ guessWord }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'secret-painter') return;

        if (guessWord === "I_WON_ALREADY") {
            io.to(roomCode).emit('secretPainter_gameOver', { isCorrect: true, actualWord: room.game.word });
            return;
        }

        const isCorrect = guessWord.toLowerCase().trim() === room.game.word.toLowerCase().trim();
        if (isCorrect) {
            const secretPainter = room.players.find(p => p.id === room.game.secretPainterId);
            if(secretPainter) secretPainter.score += 5;
        } else {
            room.players.forEach(p => { if (p.id !== room.game.secretPainterId && p.isOnline) p.score += 2; });
        }
        
        updateRoomScores(roomCode);
        io.to(roomCode).emit('secretPainter_gameOver', { isCorrect, actualWord: room.game.word });
    });

    socket.on('secretPainter_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startSecretPainter(roomCode, {});
    });

    // ==========================================
    // GAME: MATCH THE BLANK
    // ==========================================
    function startMatchTheBlank(roomCode) {
        const room = rooms[roomCode];
        room.game = { answers: {}, prompt: getUniqueWord(roomCode, 'matchTheBlank', () => matchTheBlankPrompts) };
        io.to(roomCode).emit('matchTheBlank_newRound', { prompt: room.game.prompt });
    }

    socket.on('matchTheBlank_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'match-the-blank') return;

        room.game.answers[socket.id] = answer.trim().toLowerCase();
        const activePlayers = room.players.filter(p => p.isOnline);
        const ansCount = Object.keys(room.game.answers).length;

        io.to(roomCode).emit('updateProgress', { current: ansCount, total: activePlayers.length, text: "รอคนตอบให้ครบ..." });

        if (ansCount === activePlayers.length) {
            setTimeout(() => evaluateMatchTheBlank(roomCode), 1000);
        }
    });

    function evaluateMatchTheBlank(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        const answerCounts = {};
        for (let id in room.game.answers) {
            const ans = room.game.answers[id];
            answerCounts[ans] = (answerCounts[ans] || 0) + 1;
        }

        const results = [];
        for (let id in room.game.answers) {
            const ans = room.game.answers[id];
            const count = answerCounts[ans];
            const p = room.players.find(x => x.id === id);
            
            let points = 0;
            if (count === 2) points = 3;
            else if (count >= 3) points = 1;

            if (p) {
                p.score += points;
                results.push({ name: p.name, avatar: p.avatar, word: ans, points: points });
            }
        }
        updateRoomScores(roomCode);
        io.to(roomCode).emit('matchTheBlank_showResult', { results });
    }

    socket.on('matchTheBlank_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startMatchTheBlank(roomCode);
    });

    // ==========================================
    // GAME: FRIEND QUIZ
    // ==========================================
    function startFriendQuiz(roomCode) {
        const room = rooms[roomCode];
        room.game = { answers: {}, bets: {}, question: getUniqueWord(roomCode, 'friendQuiz', () => friendQuizQuestions) };
        io.to(roomCode).emit('friendQuiz_newRound', { question: room.game.question });
    }

    socket.on('friendQuiz_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz') return;

        room.game.answers[socket.id] = answer;
        const activePlayers = room.players.filter(p => p.isOnline);
        const ansCount = Object.keys(room.game.answers).length;

        io.to(roomCode).emit('updateProgress', { current: ansCount, total: activePlayers.length, text: "รอคนส่งคำตอบ..." });

        if (ansCount === activePlayers.length) {
            setTimeout(() => startFriendQuizBetting(roomCode), 1000);
        }
    });

    function startFriendQuizBetting(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        const activePlayers = room.players.filter(p => p.isOnline);
        const secretPlayerId = activePlayers[Math.floor(Math.random() * activePlayers.length)].id;
        room.game.secretPlayerId = secretPlayerId;

        let answersArray = Object.values(room.game.answers).map(Number).sort((a,b)=>a-b);
        let min = answersArray[0]; let max = answersArray[answersArray.length-1];
        if (min === max) { max = min + 10; min = min - 10; }
        
        const diff = max - min;
        const step = Math.max(1, Math.ceil(diff / 4));
        
        let ranges = [];
        let curr = min - step;
        for(let i=0; i<4; i++) {
            ranges.push({ min: curr, max: curr + step * 2, label: `${curr} ถึง ${curr + step * 2}` });
            curr += step * 2 + 1;
        }
        
        const correctAns = room.game.answers[secretPlayerId];
        let correctIdx = ranges.findIndex(r => correctAns >= r.min && correctAns <= r.max);
        if (correctIdx === -1) {
            ranges.push({ min: correctAns-5, max: correctAns+5, label: `${correctAns-5} ถึง ${correctAns+5}` });
            correctIdx = ranges.length - 1;
        }

        room.game.ranges = ranges;
        room.game.correctRangeIndex = correctIdx;

        const sp = room.players.find(p=>p.id===secretPlayerId);
        io.to(roomCode).emit('friendQuiz_startBetting', {
            secretPlayer: { id: sp.id, name: sp.name, avatar: sp.avatar }, ranges
        });
    }

    socket.on('friendQuiz_placeBet', ({ betOnRangeIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'friend-quiz') return;

        room.game.bets[socket.id] = betOnRangeIndex;
        const activePlayers = room.players.filter(p => p.isOnline);
        const betCount = Object.keys(room.game.bets).length;

        io.to(roomCode).emit('updateProgress', { current: betCount, total: activePlayers.length - 1, text: "รอคนโหวตทายผล..." });

        if (betCount >= activePlayers.length - 1) {
            setTimeout(() => evaluateFriendQuiz(roomCode), 1000);
        }
    });

    function evaluateFriendQuiz(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        const winners = [];
        for (let id in room.game.bets) {
            if (room.game.bets[id] === room.game.correctRangeIndex) {
                winners.push(id);
                const p = room.players.find(x => x.id === id);
                if(p) p.score += 2;
            }
        }
        
        // Give secret player points if someone guessed right
        if (winners.length > 0) {
            const sp = room.players.find(x => x.id === room.game.secretPlayerId);
            if(sp) sp.score += 1;
        }

        updateRoomScores(roomCode);

        const allPData = room.players.filter(p=>p.isOnline).map(p => ({
            id: p.id, name: p.name, avatar: p.avatar, answer: room.game.answers[p.id], isSecret: p.id === room.game.secretPlayerId
        }));

        io.to(roomCode).emit('friendQuiz_showResult', {
            allPlayers: allPData, correctRangeIndex: room.game.correctRangeIndex, winners
        });
    }

    socket.on('friendQuiz_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startFriendQuiz(roomCode);
    });

    // ==========================================
    // GAME: NUMBER SORT
    // ==========================================
    function startNumberSort(roomCode) {
        const room = rooms[roomCode];
        const activePlayers = room.players.filter(p => p.isOnline);
        
        room.game = { theme: getUniqueWord(roomCode, 'numberSort', () => numberSortThemes), numbers: {} };
        
        let nums = []; while(nums.length < activePlayers.length) {
            let r = Math.floor(Math.random() * 100) + 1; if(nums.indexOf(r) === -1) nums.push(r);
        }
        nums.sort((a,b)=>a-b); // Sort strictly for logic

        activePlayers.forEach((p, i) => {
            room.game.numbers[p.id] = nums[i];
            io.to(p.id).emit('numberSort_newRound', {
                theme: room.game.theme, number: room.game.numbers[p.id],
                players: activePlayers.map(x=>({id:x.id, name:x.name, avatar:x.avatar}))
            });
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
        if (roomCode && room.players.find(p => p.id === socket.id)?.isHost) startNumberSort(roomCode);
    });

    // ==========================================
    // GAME: WORD GUESS (Codenames)
    // ==========================================
    function startWordGuess(roomCode, data) {
        const room = rooms[roomCode];
        const isCoop = room.players.length === 2; // Auto-coop for 2 players
        room.game = {
            isCoop: isCoop,
            board: generateWordGuessBoard(roomCode, getWordsArray(room), isCoop),
            teams: { red: { players: [], spymaster: null }, blue: { players: [], spymaster: null } },
            turn: 'red',
            clue: null,
            guessesLeft: 0,
            turnsLeft: isCoop ? 9 : null,
            wordsToFind: isCoop ? 15 : null,
            wordsFound: isCoop ? 0 : null
        };
        
        if (isCoop) {
            const activePlayers = room.players.filter(p => p.isOnline);
            room.game.teams.red.players = activePlayers.map(p => p.id);
            if(activePlayers[0]) room.game.teams.red.spymaster = activePlayers[0].id;
        }

        broadcastWordGuessState(roomCode);
    }

    function generateWordGuessBoard(roomCode, wordList, isCoop) {
        let selectedWords = [];
        for(let i=0; i<25; i++) {
            selectedWords.push(getUniqueWord(roomCode, 'wordGuess', () => wordList));
        }

        let types = [];
        if (isCoop) {
            types = Array(15).fill('green').concat(Array(9).fill('neutral')).concat(['assassin']);
        } else {
            types = Array(9).fill('red').concat(Array(8).fill('blue')).concat(Array(7).fill('neutral')).concat(['assassin']);
        }
        
        types = shuffleArray(types);
        return selectedWords.map((word, i) => ({ word, type: types[i], revealed: false }));
    }

    function broadcastWordGuessState(roomCode) {
        const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;

        const state = {
            isCoop: room.game.isCoop,
            board: room.game.board.map(c => c.revealed ? c : { word: c.word, type: 'hidden', revealed: false }),
            teams: room.game.teams,
            turn: room.game.turn,
            clue: room.game.clue,
            guessesLeft: room.game.guessesLeft,
            turnsLeft: room.game.turnsLeft,
            wordsToFind: room.game.wordsToFind,
            wordsFound: room.game.wordsFound,
            players: room.players.map(p => {
                let pTeam = null; let isSpymaster = false;
                if(room.game.teams.red.players.includes(p.id)) { pTeam = 'red'; isSpymaster = room.game.teams.red.spymaster === p.id; }
                if(room.game.teams.blue.players.includes(p.id)) { pTeam = 'blue'; isSpymaster = room.game.teams.blue.spymaster === p.id; }
                return { id: p.id, name: p.name, avatar: p.avatar, team: pTeam, isSpymaster: isSpymaster };
            })
        };

        room.players.forEach(p => {
            if (!p.isOnline) return;
            const pTeam = room.game.teams.red.players.includes(p.id) ? 'red' : (room.game.teams.blue.players.includes(p.id) ? 'blue' : null);
            const isSpymaster = (pTeam === 'red' && room.game.teams.red.spymaster === p.id) || (pTeam === 'blue' && room.game.teams.blue.spymaster === p.id);
            
            const playerState = { ...state };
            if (isSpymaster) {
                playerState.board = room.game.board; // Spymaster sees everything
            }
            io.to(p.id).emit('wordGuess_updateState', playerState);
        });
    }

    socket.on('wordGuess_joinTeam', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;

        // Remove from current team
        room.game.teams.red.players = room.game.teams.red.players.filter(id => id !== socket.id);
        room.game.teams.blue.players = room.game.teams.blue.players.filter(id => id !== socket.id);
        if(room.game.teams.red.spymaster === socket.id) room.game.teams.red.spymaster = null;
        if(room.game.teams.blue.spymaster === socket.id) room.game.teams.blue.spymaster = null;

        // Add to new team
        room.game.teams[team].players.push(socket.id);
        broadcastWordGuessState(roomCode);
    });

    socket.on('wordGuess_becomeSpymaster', ({ team }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        
        if(room.game.teams[team].players.includes(socket.id)) {
            room.game.teams[team].spymaster = socket.id;
            broadcastWordGuessState(roomCode);
        }
    });

    socket.on('wordGuess_giveClue', ({ word, number }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;
        
        const pTeam = room.game.teams.red.players.includes(socket.id) ? 'red' : (room.game.teams.blue.players.includes(socket.id) ? 'blue' : null);
        const isSpymaster = (pTeam && room.game.teams[pTeam].spymaster === socket.id);

        // Ensure it's the right person's turn to give clue
        const isTurnValid = room.game.isCoop || room.game.turn === pTeam;

        if (isSpymaster && isTurnValid && (!room.game.clue || !room.game.clue.word)) {
            room.game.clue = { word, number };
            room.game.guessesLeft = number + 1; // +1 for bonus guess
            broadcastWordGuessState(roomCode);
        }
    });

    socket.on('wordGuess_makeGuess', ({ cardIndex }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'word-guess') return;

        const pTeam = room.game.teams.red.players.includes(socket.id) ? 'red' : (room.game.teams.blue.players.includes(socket.id) ? 'blue' : null);
        const isSpymaster = (pTeam && room.game.teams[pTeam].spymaster === socket.id);
        
        // Validation
        if (isSpymaster || room.game.guessesLeft <= 0 || !room.game.clue) return;
        if (!room.game.isCoop && room.game.turn !== pTeam) return;

        const card = room.game.board[cardIndex];
        if (card.revealed) return;
        
        card.revealed = true;
        room.game.guessesLeft--;

        if (room.game.isCoop) {
            handleCoopGuessResult(roomCode, card);
        } else {
            handleVersusGuessResult(roomCode, card, pTeam);
        }
    });

    function handleCoopGuessResult(roomCode, card) {
        const room = rooms[roomCode];
        if (card.type === 'assassin') {
            endWordGuess(roomCode, 'assassin', 'เจอการ์ดมือสังหาร!');
        } else if (card.type === 'green') {
            room.game.wordsFound++;
            if (room.game.wordsFound >= room.game.wordsToFind) {
                endWordGuess(roomCode, 'players', 'หาการ์ดสายลับครบแล้ว!');
            } else {
                if (room.game.guessesLeft === 0) endWordGuessTurn(roomCode);
                else broadcastWordGuessState(roomCode);
            }
        } else {
            // Neutral or other
            endWordGuessTurn(roomCode);
        }
    }

    function handleVersusGuessResult(roomCode, card, pTeam) {
        const room = rooms[roomCode];
        if (card.type === 'assassin') {
            const winner = pTeam === 'red' ? 'blue' : 'red';
            endWordGuess(roomCode, winner, 'อีกทีมโดนมือสังหาร!');
        } else if (card.type === pTeam) {
            // Correct guess
            const teamWordsLeft = room.game.board.filter(c => c.type === pTeam && !c.revealed).length;
            if (teamWordsLeft === 0) {
                endWordGuess(roomCode, pTeam, 'หาการ์ดสายลับครบแล้ว!');
            } else {
                if (room.game.guessesLeft === 0) endWordGuessTurn(roomCode);
                else broadcastWordGuessState(roomCode);
            }
        } else {
            // Wrong guess (Neutral or Opponent's card)
            const oppTeam = pTeam === 'red' ? 'blue' : 'red';
            if (card.type === oppTeam) {
                const oppWordsLeft = room.game.board.filter(c => c.type === oppTeam && !c.revealed).length;
                if (oppWordsLeft === 0) {
                    endWordGuess(roomCode, oppTeam, 'อีกทีมหาการ์ดครบจากที่เราเปิดให้!');
                    return;
                }
            }
            endWordGuessTurn(roomCode);
        }
    }

    socket.on('wordGuess_endTurn', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (room && room.gameType === 'word-guess') {
            endWordGuessTurn(roomCode);
        }
    });

    function endWordGuessTurn(roomCode) {
        const room = rooms[roomCode];
        room.game.clue = null;
        room.game.guessesLeft = 0;
        
        if (room.game.isCoop) {
            room.game.turnsLeft--;
            if (room.game.turnsLeft <= 0 && room.game.wordsFound < room.game.wordsToFind) {
                endWordGuess(roomCode, 'system', 'หมดเทิร์นแล้ว!');
            } else {
                broadcastWordGuessState(roomCode);
            }
        } else {
            room.game.turn = room.game.turn === 'red' ? 'blue' : 'red';
            broadcastWordGuessState(roomCode);
        }
    }

    function endWordGuess(roomCode, winner, reason) {
        const room = rooms[roomCode];
        // Reveal all board
        room.game.board.forEach(c => c.revealed = true);
        
        if (winner === 'red') room.players.forEach(p => { if (room.game.teams.red.players.includes(p.id)) p.score += 5; });
        if (winner === 'blue') room.players.forEach(p => { if (room.game.teams.blue.players.includes(p.id)) p.score += 5; });
        if (winner === 'players') room.players.forEach(p => p.score += 5); // Coop win

        updateRoomScores(roomCode);
        io.to(roomCode).emit('wordGuess_gameOver', { winner, reason, isCoop: room.game.isCoop });
    }

    // ==========================================
    // GAME: SAME FLOCK
    // ==========================================
    function startSameFlock(roomCode) {
        const room = rooms[roomCode];
        // Maintain Black Sheep state
        const bsId = room.game && room.game.blackSheepId;
        const bsName = room.game && room.game.blackSheepName;
        const bsAvatar = room.game && room.game.blackSheepAvatar;
        
        room.game = { 
            answers: {}, 
            question: getUniqueWord(roomCode, 'sameFlock', () => sameFlockPrompts),
            blackSheepId: bsId,
            blackSheepName: bsName,
            blackSheepAvatar: bsAvatar
        };
        io.to(roomCode).emit('sameFlock_newRound', { question: room.game.question });
    }

    socket.on('sameFlock_submitAnswer', ({ answer }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'same-flock') return;

        room.game.answers[socket.id] = answer.trim();
        const activePlayers = room.players.filter(p => p.isOnline);
        const ansCount = Object.keys(room.game.answers).length;

        io.to(roomCode).emit('updateProgress', { current: ansCount, total: activePlayers.length, text: "รอคนตอบให้ครบ..." });

        if (ansCount === activePlayers.length) {
            setTimeout(() => evaluateSameFlock(roomCode), 1000);
        }
    });

    function evaluateSameFlock(roomCode) {
        const room = rooms[roomCode];
        io.to(roomCode).emit('updateProgress', { hide: true });

        // Group by similarity
        const groupsObj = {};
        for(let pId in room.game.answers) {
            const ans = room.game.answers[pId].toLowerCase();
            const player = room.players.find(p => p.id === pId);
            if(!groupsObj[ans]) groupsObj[ans] = { answer: room.game.answers[pId], players: [] }; 
            if(player) groupsObj[ans].players.push({ name: player.name, avatar: player.avatar, id: player.id });
        }

        const groups = Object.values(groupsObj);
        groups.sort((a, b) => b.players.length - a.players.length);

        // --- BLACK SHEEP LOGIC ---
        let groupsOfOne = groups.filter(g => g.players.length === 1);
        if (groupsOfOne.length === 1) {
            // If EXACTLY one person is unique, they become the new Black Sheep
            room.game.blackSheepId = groupsOfOne[0].players[0].id;
            room.game.blackSheepName = groupsOfOne[0].players[0].name;
            room.game.blackSheepAvatar = groupsOfOne[0].players[0].avatar;
        }

        // --- SCORING ---
        if (groups.length > 0) {
            const maxPlayers = groups[0].players.length;
            if (maxPlayers > 1) { 
                groups.forEach(g => {
                    if (g.players.length === maxPlayers) {
                        g.players.forEach(pData => {
                            const p = room.players.find(x => x.id === pData.id);
                            if(p) p.score += 1;
                        });
                    }
                });
                updateRoomScores(roomCode);
            }
        }

        const blackSheepData = room.game.blackSheepId ? { name: room.game.blackSheepName, avatar: room.game.blackSheepAvatar, id: room.game.blackSheepId } : null;

        io.to(roomCode).emit('sameFlock_showResult', { groups, blackSheep: blackSheepData });
    }

    socket.on('sameFlock_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id);
        if (roomCode && rooms[roomCode].players.find(p => p.id === socket.id)?.isHost) startSameFlock(roomCode);
    });

    // ==========================================
    // GAME: MIND FREQUENCY (Wavelength)
    // ==========================================

    socket.on('mindFrequency_updateSetup', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        if (room.players.find(p => p.id === socket.id)?.isHost) {
            room.game.mode = data.mode;
            room.game.coopType = data.coopType;
            broadcastMindFrequencySetup(roomCode);
        }
    });

    socket.on('mindFrequency_joinTeam', (data) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency' || room.gameState !== 'lobby') return;

        room.game.teams.red = room.game.teams.red.filter(id => id !== socket.id);
        room.game.teams.blue = room.game.teams.blue.filter(id => id !== socket.id);
        room.game.teams[data.team].push(socket.id);
        
        broadcastMindFrequencySetup(roomCode);
    });

    function broadcastMindFrequencySetup(roomCode) {
        const room = rooms[roomCode];
        const activePlayers = room.players.filter(p => p.isOnline);
        io.to(roomCode).emit('mindFrequency_setupState', {
            mode: room.game.mode, coopType: room.game.coopType, teams: room.game.teams,
            allPlayers: activePlayers.map(x=>({id:x.id, name:x.name, avatar:x.avatar}))
        });
    }

    socket.on('mindFrequency_startGameLogic', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        
        room.gameState = 'playing';
        room.game.roundCount = 0;
        
        if (room.game.mode === 'versus') {
            room.game.activeTeam = 'red';
            room.game.scores = { red: 0, blue: 0 };
        } else {
            room.game.activeTeam = 'coop';
            room.game.scores = { coop: 0, individual: {} };
            // Initialize individual scores if coop
            room.players.forEach(p => room.game.scores.individual[p.id] = 0);
        }
        
        startMindFrequencyRound(roomCode);
    });

    function startMindFrequencyRound(roomCode) {
        const room = rooms[roomCode];
        room.game.roundCount++;
        room.game.concept = getUniqueWord(roomCode, 'mindFrequency', () => wavelengthConcepts);
        
        // Pick psychic based on mode
        let availablePlayers = [];
        if (room.game.mode === 'versus') {
            availablePlayers = room.game.teams[room.game.activeTeam].filter(id => {
                const p = room.players.find(x => x.id === id);
                return p && p.isOnline;
            });
            if(availablePlayers.length === 0) {
                // Skip turn if team empty
                room.game.activeTeam = room.game.activeTeam === 'red' ? 'blue' : 'red';
                availablePlayers = room.game.teams[room.game.activeTeam].filter(id => {
                    const p = room.players.find(x => x.id === id);
                    return p && p.isOnline;
                });
            }
        } else {
            availablePlayers = room.players.filter(p => p.isOnline).map(p => p.id);
        }

        room.game.psychicId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
        // Add random variance to target (center is 50%, ranges from 10% to 90%)
        room.game.targetValue = Math.floor(Math.random() * 80) + 10; 
        
        room.game.clue = null;
        room.game.guessLocks = {}; // For individual coop
        
        const activePlayers = room.players.filter(p => p.isOnline);
        io.to(roomCode).emit('mindFrequency_newRound', {
            mode: room.game.mode, activeTeam: room.game.activeTeam,
            psychicId: room.game.psychicId, concept: room.game.concept,
            targetValue: room.game.targetValue, scores: room.game.scores,
            players: activePlayers.map(x=>({id:x.id, name:x.name, avatar:x.avatar}))
        });
    }

    socket.on('mindFrequency_submitClue', ({ clue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency' || room.game.psychicId !== socket.id) return;
        
        room.game.clue = clue;
        io.to(roomCode).emit('mindFrequency_startGuessing', { clue, activeTeam: room.game.activeTeam, psychicId: room.game.psychicId });
    });

    socket.on('mindFrequency_syncDial', ({ value }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;
        
        const isMyTeamTurn = (room.game.mode === 'versus' && room.game.teams[room.game.activeTeam].includes(socket.id)) || (room.game.mode === 'coop');
        
        if (isMyTeamTurn && socket.id !== room.game.psychicId) {
             // Only broadcast to other players
             socket.to(roomCode).emit('mindFrequency_syncDial', value);
        }
    });

    socket.on('mindFrequency_lockGuess', ({ guessValue }) => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency') return;

        const isMyTeamTurn = (room.game.mode === 'versus' && room.game.teams[room.game.activeTeam].includes(socket.id)) || (room.game.mode === 'coop');
        
        if (isMyTeamTurn && socket.id !== room.game.psychicId) {
            
            if (room.game.mode === 'coop' && room.game.coopType === 'individual') {
                room.game.guessLocks[socket.id] = guessValue;
                const activeGuessers = room.players.filter(p => p.isOnline && p.id !== room.game.psychicId);
                io.to(socket.id).emit('mindFrequency_individualLocked');
                
                if (Object.keys(room.game.guessLocks).length >= activeGuessers.length) {
                    evaluateMindFrequencyIndividual(roomCode);
                }
            } else {
                 evaluateMindFrequencyShared(roomCode, guessValue);
            }
        }
    });

    function calculateMindFrequencyPoints(guess, target) {
        const diff = Math.abs(guess - target);
        if (diff <= 7.5) return 4;
        if (diff <= 15) return 3;
        if (diff <= 22.5) return 2;
        return 0;
    }

    function evaluateMindFrequencyShared(roomCode, finalGuess) {
        const room = rooms[roomCode];
        const points = calculateMindFrequencyPoints(finalGuess, room.game.targetValue);
        
        if (room.game.mode === 'versus') {
            room.game.scores[room.game.activeTeam] += points;
            room.game.teams[room.game.activeTeam].forEach(id => {
                 const p = room.players.find(x => x.id === id);
                 if(p) p.score += points;
            });
        } else {
            room.game.scores.coop += points;
            room.players.forEach(p => p.score += points);
        }

        updateRoomScores(roomCode);
        io.to(roomCode).emit('mindFrequency_showResult', {
            targetValue: room.game.targetValue, points: points, coopType: 'shared'
        });
    }
    
    function evaluateMindFrequencyIndividual(roomCode) {
         const room = rooms[roomCode];
         const results = [];
         let totalRoundPoints = 0;
         
         for (const [pId, guessVal] of Object.entries(room.game.guessLocks)) {
             const points = calculateMindFrequencyPoints(guessVal, room.game.targetValue);
             totalRoundPoints += points;
             
             if(room.game.scores.individual[pId] === undefined) room.game.scores.individual[pId] = 0;
             room.game.scores.individual[pId] += points;
             
             const p = room.players.find(x => x.id === pId);
             if(p) {
                 p.score += points;
                 results.push({ id: p.id, name: p.name, avatar: p.avatar, guess: guessVal, points: points });
             }
         }
         
         room.game.scores.coop += totalRoundPoints;
         updateRoomScores(roomCode);
         
         io.to(roomCode).emit('mindFrequency_showResult', {
            targetValue: room.game.targetValue, points: 0, coopType: 'individual', individualResults: results
        });
    }

    socket.on('mindFrequency_nextRound', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (!room || room.gameType !== 'mind-frequency' || !room.players.find(p=>p.id===socket.id)?.isHost) return;

        // Check End Game Condition
        const maxRounds = room.game.mode === 'versus' ? 6 : room.players.filter(p=>p.isOnline).length * 2;
        
        if (room.game.roundCount >= maxRounds) {
            let individualScores = null;
            if(room.game.mode === 'coop' && room.game.coopType === 'individual') {
                individualScores = room.players.map(p => ({
                    name: p.name, avatar: p.avatar, mfScore: room.game.scores.individual[p.id] || 0
                })).sort((a,b) => b.mfScore - a.mfScore);
            }
            
            io.to(roomCode).emit('mindFrequency_gameOver', { 
                mode: room.game.mode, coopType: room.game.coopType, 
                scores: room.game.scores, totalRounds: room.game.roundCount,
                individualScores: individualScores
            });
        } else {
            if (room.game.mode === 'versus') {
                room.game.activeTeam = room.game.activeTeam === 'red' ? 'blue' : 'red';
            }
            startMindFrequencyRound(roomCode);
        }
    });

    socket.on('mindFrequency_returnToSetup', () => {
        const roomCode = findRoomBySocketId(socket.id); const room = rooms[roomCode];
        if (roomCode && room.players.find(p=>p.id===socket.id)?.isHost) {
            room.gameState = 'lobby'; // Set back to lobby so setup shows
            broadcastMindFrequencySetup(roomCode);
        }
    });

    // ==========================================
    // DISCONNECT
    // ==========================================
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        removePlayerFromRoom(socket.id);
    });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});