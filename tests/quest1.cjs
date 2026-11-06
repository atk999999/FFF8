const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// 1. Mock Canvas context & DOM environment
const g = new Proxy(
  {
    measureText: () => ({ width: 80 })
  },
  {
    get(o, k) {
      if (k in o) return o[k];
      return (...args) => {
        for (const arg of args) {
          if (typeof arg === 'number') assert(Number.isFinite(arg), k + ' ' + arg);
        }
        if (k.includes('Gradient')) return { addColorStop() {} };
        return {};
      };
    },
    set(o, k, v) {
      o[k] = v;
      return true;
    }
  }
);

const domElements = new Map();
function createMockEl() {
  let html = '';
  return {
    hidden: true,
    textContent: '',
    children: [],
    get innerHTML() { return html; },
    set innerHTML(v) { html = v; if (!v) this.children = []; },
    src: '',
    alt: '',
    style: {},
    getContext: () => g,
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener() {},
    setAttribute() {}
  };
}

const storageMap = new Map();
const localStorageMock = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

const c = {
  window: {},
  localStorage: localStorageMock,
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout,
  addEventListener() {},
  document: {
    createElement: (tag) => {
      const el = createMockEl();
      el.tagName = tag.toUpperCase();
      return el;
    },
    getElementById: (id) => {
      if (!domElements.has(id)) {
        domElements.set(id, createMockEl());
      }
      return domElements.get(id);
    }
  }
};

vm.createContext(c);
vm.runInContext(fs.readFileSync('public/game/collision.js', 'utf8') + '; this.Collision = Collision;', c);
vm.runInContext(fs.readFileSync('public/game/character.js', 'utf8') + '; this.Character = Character;', c);
vm.runInContext(fs.readFileSync('public/game/tieu-pham.js', 'utf8') + '; this.TieuPham = TieuPham; this.TieuPhamHome = TieuPhamHome; this.PlayerRoster = PlayerRoster;', c);
vm.runInContext(fs.readFileSync('public/game/npcs.js', 'utf8') + '; this.Villagers = Villagers;', c);
vm.runInContext(fs.readFileSync('public/game/a-huy.js', 'utf8') + '; this.AHuy = AHuy;', c);
vm.runInContext(fs.readFileSync('public/game/quest1.js', 'utf8') + '; this.Quest1 = Quest1;', c);

c.Villagers.init();
const Quest1 = c.Quest1;
const Villagers = c.Villagers;
const TieuPhamHome = c.TieuPhamHome;

// -------------------------------------------------------------
// TEST 1: Khởi tạo và trạng thái ban đầu
// -------------------------------------------------------------
Quest1.resetState();
assert.equal(Quest1.getState(), 'chief_approaching');
assert.equal(Quest1.isQuestBoardVisible(), false, 'Thanh nhiệm vụ ban đầu phải ẩn');
Quest1.init(Villagers);
const truong = Quest1.cachedChief;
assert(truong, 'Trưởng làng phải tồn tại trong danh sách NPC');
assert(c.Collision.canWalk(truong.x, truong.y), 'Vị trí của trưởng làng phải hợp lệ không kẹt');

// -------------------------------------------------------------
// TEST 2: Trưởng làng tìm người chơi sau 30 giây, không đi xuyên vật cản
// -------------------------------------------------------------
const player = { x: 220, y: 316, dir: 'down' };
assert(c.Collision.canWalk(player.x, player.y), 'Vị trí Tiểu Phàm hợp lệ');
assert.equal(Quest1.approachDelay, 30.0, 'Thời gian chờ ban đầu phải là 30 giây');

const initialX = truong.x;
const initialY = truong.y;

// Trong 10 giây đầu (dt = 0.5s x 20 bước), Trưởng làng chưa tìm người chơi
for (let i = 0; i < 20; i++) {
  Quest1.update(0.5, i * 0.5, player, Villagers);
}
assert(Quest1.approachDelay > 0 && Quest1.approachDelay <= 20.0, 'Đếm ngược 30 giây đang hoạt động');
assert.equal(truong.x, initialX, 'Trong 30 giây đầu Trưởng làng chưa đuổi theo Tiểu Phàm');

// Tiến nhanh qua mốc 30 giây (cập nhật thêm 45 bước x 0.5s = 22.5s)
for (let i = 0; i < 45; i++) {
  Quest1.update(0.5, 10 + i * 0.5, player, Villagers);
}
assert.equal(Quest1.approachDelay, 0, 'Sau 30 giây, thời gian chờ đã hết');

// Sau 30 giây, Trưởng làng chủ động tìm đường và tiến lại gần Tiểu Phàm
let prevDist = Math.hypot(truong.x - player.x, truong.y - player.y);
for (let i = 0; i < 20; i++) {
  Quest1.update(0.2, 33 + i * 0.2, player, Villagers);
  assert(c.Collision.canWalk(truong.x, truong.y), `Trưởng làng bị kẹt tại (${truong.x}, ${truong.y})`);
}
const newDist = Math.hypot(truong.x - player.x, truong.y - player.y);
assert(newDist < prevDist, 'Sau 30 giây Trưởng làng phải tiến lại gần Tiểu Phàm');

// Khi đến gần Tiểu Phàm (<= 56px)
truong.x = player.x + 35;
truong.y = player.y + 10;
assert(c.Collision.canWalk(truong.x, truong.y));
Quest1.update(0.1, 40.0, player, Villagers);

assert(truong.dir === -1 || truong.dir === 1, 'Trưởng làng phải quay mặt về phía Tiểu Phàm');
assert.equal(truong.spokenLine, 'Nhóc con! Nhóc con! Mau lại đây!', 'Trưởng làng phải gọi câu chuẩn xác');
assert(Quest1.isDialogueActive(), 'Hội thoại phải tự động kích hoạt khi trưởng làng tới gần');

// -------------------------------------------------------------
// TEST 3: Kiểm tra hiển thị avatar và nội dung hội thoại mở đầu
// -------------------------------------------------------------
const avatarEl = c.document.getElementById('quest-avatar');
const speakerEl = c.document.getElementById('quest-speaker-name');
assert.equal(speakerEl.textContent, 'Trưởng làng');
assert(avatarEl.src.includes('Truong_Lang_Avatar_9KB.webp'), 'Avatar trưởng làng phải là Truong_Lang_Avatar_9KB.webp');

// Progress through opening 4 dialogue steps
for (let s = 0; s < 3; s++) {
  c.document.getElementById('quest-dialog').onclick(); // fast-forward typewriter
  c.document.getElementById('quest-dialog').onclick(); // next line
}
// Finish typing the 4th line to show choices
c.document.getElementById('quest-dialog').onclick();
const choicesEl = c.document.getElementById('quest-choices');
assert.equal(choicesEl.hidden, false, 'Các lựa chọn phải hiển thị');
assert.equal(choicesEl.children.length, 3, 'Phải có 3 lựa chọn mở đầu');

// Check that NO "linh căn" question choice exists
for (const child of choicesEl.children) {
  assert(!child.textContent.includes('Linh căn là gì'), 'Không được có lựa chọn hỏi về linh căn');
}

// -------------------------------------------------------------
// TEST 4: Nhánh 3 - Từ chối (Lựa chọn: Ta chẳng muốn làm tiên nhân)
// -------------------------------------------------------------
// Select choice 3 (decline)
choicesEl.children[2].onclick({ stopPropagation() {} });
assert(Quest1.isDialogueActive());

// Read through decline dialogue
while (Quest1.isDialogueActive()) {
  c.document.getElementById('quest-dialog').onclick();
}
assert.equal(Quest1.getState(), 'declined', 'Trạng thái phải là declined');
assert(Quest1.getState() !== 'registered', 'Từ chối không được tính là registered');
assert.equal(Quest1.isQuestBoardVisible(), false, 'Thanh nhiệm vụ phải ẩn khi từ chối kiểm tra linh căn');

// Test revisit when declined: Trưởng làng hỏi lại, người chơi đổi ý đăng ký!
Quest1.talk(player);
assert(Quest1.isDialogueActive());
c.document.getElementById('quest-dialog').onclick(); // finish text
const revisitDeclineChoices = c.document.getElementById('quest-choices');
assert.equal(revisitDeclineChoices.children.length, 2);
// Choose to change mind and register!
revisitDeclineChoices.children[0].onclick({ stopPropagation() {} });
while (Quest1.isDialogueActive()) {
  c.document.getElementById('quest-dialog').onclick();
}
assert.equal(Quest1.getState(), 'registered', 'Đổi ý phải chuyển sang registered');
assert.equal(Quest1.registeredDay, Villagers.day);
assert.equal(Quest1.isQuestBoardVisible(), true, 'Thanh nhiệm vụ phải hiển thị khi đổi ý đồng ý kiểm tra linh căn');

// -------------------------------------------------------------
// TEST 5: Nhánh 2 - Do dự và 2 lựa chọn phụ (Bước lên tiên lộ vs Chưa sẵn sàng)
// -------------------------------------------------------------
Quest1.resetState();
Quest1.talk(player);
// Skip to choices in opening
for (let s = 0; s < 4; s++) {
  c.document.getElementById('quest-dialog').onclick();
  c.document.getElementById('quest-dialog').onclick();
}
// Click Choice 2 (hesitant)
c.document.getElementById('quest-choices').children[1].onclick({ stopPropagation() {} });
// Advance until sub-choices appear
while (c.document.getElementById('quest-choices').hidden) {
  c.document.getElementById('quest-dialog').onclick();
}
const subChoices = c.document.getElementById('quest-choices');
assert.equal(subChoices.children.length, 2, 'Phải có 2 lựa chọn phụ trong nhánh do dự');
assert(subChoices.children[0].textContent.includes('Ta đã quyết định, ta muốn bước lên tiên lộ'));
assert(subChoices.children[1].textContent.includes('Ta vẫn chưa sẵn sàng rời khỏi nơi này'));

// Test Sub-choice 2B: Chưa sẵn sàng -> considering
subChoices.children[1].onclick({ stopPropagation() {} });
while (Quest1.isDialogueActive()) {
  c.document.getElementById('quest-dialog').onclick();
}
assert.equal(Quest1.getState(), 'considering', 'Trạng thái phải là considering');
assert(Quest1.getState() !== 'registered', 'Chưa sẵn sàng không được tính là registered');
assert.equal(Quest1.isQuestBoardVisible(), false, 'Thanh nhiệm vụ phải ẩn khi chưa sẵn sàng / đang suy nghĩ');

// Test revisit when considering: Trưởng làng hỏi lại, người chơi đổi ý đăng ký!
Quest1.talk(player);
assert(Quest1.isDialogueActive());
c.document.getElementById('quest-dialog').onclick();
const revisitConsiderChoices = c.document.getElementById('quest-choices');
assert.equal(revisitConsiderChoices.children.length, 2);
// Choose to register
revisitConsiderChoices.children[0].onclick({ stopPropagation() {} });
while (Quest1.isDialogueActive()) {
  c.document.getElementById('quest-dialog').onclick();
}
assert.equal(Quest1.getState(), 'registered', 'Đăng ký sau khi suy nghĩ thành công');
assert.equal(Quest1.isQuestBoardVisible(), true, 'Thanh nhiệm vụ phải hiển thị khi đăng ký sau khi suy nghĩ');

// -------------------------------------------------------------
// TEST 6: Nhánh 1 - Háo hức -> Đăng ký trực tiếp
// -------------------------------------------------------------
Quest1.resetState();
Quest1.talk(player);
for (let s = 0; s < 4; s++) {
  c.document.getElementById('quest-dialog').onclick();
  c.document.getElementById('quest-dialog').onclick();
}
// Choose 1: Háo hức
c.document.getElementById('quest-choices').children[0].onclick({ stopPropagation() {} });
let foundPhamAvatar = false;
while (Quest1.isDialogueActive()) {
  if (speakerEl.textContent === 'Tiểu Phàm') {
    assert(
      avatarEl.src.includes('Tieu_Pham_Avatar_Duoi_10KB.webp') || avatarEl.src.includes('tieu-pham-avatar.webp'),
      'Avatar của Tiểu Phàm phải luôn là chân dung Tiểu Phàm, không được gán avatar trưởng làng'
    );
    assert(
      !avatarEl.src.includes('Truong_Lang'),
      'Thoại của Tiểu Phàm không được gán avatar trưởng làng!'
    );
    foundPhamAvatar = true;
  }
  c.document.getElementById('quest-dialog').onclick();
}
assert(foundPhamAvatar, 'Avatar Tiểu Phàm phải xuất hiện khi người chơi nói');
assert.equal(Quest1.getState(), 'registered');
assert.equal(Quest1.isQuestBoardVisible(), true, 'Thanh nhiệm vụ phải hiển thị ngay khi người chơi háo hức đăng ký');

// -------------------------------------------------------------
// TEST 7: Tiến trình 2 ngày theo lịch game -> selection_ready (Hồi 2)
// -------------------------------------------------------------
const startDay = Villagers.day;
Quest1.registeredDay = startDay;

// Day + 1 -> still registered
Villagers.day = startDay + 1;
Quest1.update(0.1, 10.0, player, Villagers);
assert.equal(Quest1.getState(), 'registered');
assert.equal(Quest1.isQuestBoardVisible(), true, 'Thanh nhiệm vụ hiển thị trong thời gian chờ');

// Talk before 2 days
Quest1.talk(player);
assert(Quest1.isDialogueActive());
c.document.getElementById('quest-dialog').onclick();
assert(c.document.getElementById('quest-dialog-text').textContent.includes('Chớ sốt ruột, cứ chuẩn bị tinh thần'));
Quest1.closeDialogue();

// Day + 2 -> selection_ready (Mốc 2 ngày chuẩn Hồi 2)
Villagers.day = startDay + 2;
Quest1.update(0.1, 11.0, player, Villagers);
assert.equal(Quest1.getState(), 'selection_ready', 'Sau 2 ngày trạng thái phải là selection_ready');
assert.equal(Quest1.isQuestBoardVisible(), true, 'Thanh nhiệm vụ tiếp tục hiển thị khi tới ngày tuyển chọn');

// Talk when selection_ready
Quest1.talk(player);
assert(Quest1.isDialogueActive());
c.document.getElementById('quest-dialog').onclick();
assert(c.document.getElementById('quest-dialog-text').textContent.includes('Mau đến quảng trường! Tiên nhân sắp giáng lâm'));
Quest1.closeDialogue();

// -------------------------------------------------------------
// TEST 8: Kiểm tra lưu và khôi phục trạng thái (Persistence / LocalStorage)
// -------------------------------------------------------------
const savedRaw = localStorageMock.getItem('lang_du_lam_quest1_v1');
assert(savedRaw, 'Phải có dữ liệu lưu trong localStorage');
const savedObj = JSON.parse(savedRaw);
assert.equal(savedObj.state, 'selection_ready');

// -------------------------------------------------------------
// TEST 9: Kiểm tra vẽ biểu tượng dấu chấm than (!) và hiển thị
// -------------------------------------------------------------
Quest1.drawWorld(g, 1.0);

// -------------------------------------------------------------
// TEST 10: Kiểm tra Hồi 2 (Tiên Nhân Giáng Lâm, Khảo Nghiệm Linh Căn)
// -------------------------------------------------------------
// Di chuyển Tiểu Phàm vào quảng trường [800, 550]
player.x = 800;
player.y = 550;
Quest1.update(0.1, 15.0, player, Villagers);
assert.equal(Quest1.getState(), 'cinematic_active', 'Tiểu Phàm vào sân làng phải kích hoạt cinematic');
assert(Quest1.isDialogueActive(), 'Điều khiển người chơi phải bị khóa khi cinematic diễn ra');

// Duyệt qua Phân cảnh 1 (Trưởng làng, A Huy thì thầm, kiếm minh)
while (Quest1.isDialogueActive()) {
  c.document.getElementById('quest-dialog').onclick();
}

// Phân cảnh 2 (Ngự kiếm bay giáng lâm & tiếp đất)
Quest1.update(3.0, 18.0, player, Villagers); // Cho phi kiếm bay tới và tiếp đất
Quest1.drawWorld(g, 18.0);
assert(Quest1.getCameraOffset(), 'Camera offset phải có giá trị');

// Kiểm tra avatar Lục Nham và A Huy trong đối thoại
assert(Quest1.AVATARS.lucNham, 'Phải có avatar Lục Nham');
assert(Quest1.AVATARS.lucNham.includes('Luc_Nham_Truc_Co_So_Ky_Avatar_Duoi10KB.webp'), 'Avatar Lục Nham phải trỏ tới file mới');
assert(Quest1.AVATARS.aHuy, 'Phải có avatar A Huy');
assert(Quest1.AVATARS.aHuy.includes('A_Huy_Avatar_Duoi_10KB.webp'), 'Avatar A Huy phải trỏ tới file mới');

// -------------------------------------------------------------
// TEST 11: Ngủ vào ngày khảo nghiệm linh căn (Day 2 -> Day 3) không bị kẹt
// -------------------------------------------------------------
Quest1.resetState();
Villagers.day = 1;
Villagers.minutes = 480;
Quest1.state = 'registered';
Quest1.registeredDay = 1;

const testPlayer = { ...c.PlayerRoster.tieuPham, x: 220, y: 316, hp: 100, maxHp: 100, dir: 'down', walk: 0 };
c.p = testPlayer;

// Tiến vào nhà
TieuPhamHome.enter(testPlayer);
assert.equal(TieuPhamHome.inside, true, 'Tiểu Phàm phải ở trong nhà');

// Ngày 1 -> Ngày 2: Ngủ bình thường
TieuPhamHome.sleepInBed(testPlayer);
assert.equal(TieuPhamHome.pose, 'sleeping');
// Cập nhật 2.5 giây: Phải tự động thức dậy, không bị kẹt trên giường
for (let step = 0; step < 25; step++) {
  TieuPhamHome.updateInterior(testPlayer, 0.1, false);
}
assert.equal(Villagers.day, 2, 'Sau giấc ngủ ngày 1 phải sang ngày 2');
assert.equal(TieuPhamHome.pose, 'none', 'Tiểu Phàm phải tự động thức dậy sau hiệu ứng ngủ');
assert.equal(testPlayer.x, 532);
assert.equal(testPlayer.y, 232);
assert(TieuPhamHome.canWalk(testPlayer.x, testPlayer.y), 'Vị trí sau khi thức dậy phải bước đi được bình thường');

// Ngày 2 -> Ngày 3: NGỦ VÀO NGÀY KHẢO NGHIỆM LINH CĂN
TieuPhamHome.sleepInBed(testPlayer);
assert.equal(TieuPhamHome.pose, 'sleeping');

// Cập nhật trong thời gian ngủ, kiểm tra game loop thế giới & nhiệm vụ
for (let step = 0; step < 25; step++) {
  const worldP = { ...testPlayer, x: 221, y: 314, sprinting: false };
  Quest1.update(0.1, step * 0.1, worldP, Villagers);
  TieuPhamHome.updateInterior(testPlayer, 0.1, false);
}

// Kiểm tra: Đã sang ngày 3 (ngày khảo nghiệm), nhiệm vụ chuyển sang selection_ready
assert.equal(Villagers.day, 3, 'Phải sang Ngày 3 (Ngày khảo nghiệm)');
assert.equal(Quest1.getState(), 'selection_ready', 'Nhiệm vụ 1 phải sẵn sàng khảo nghiệm (selection_ready)');
assert.equal(TieuPhamHome.pose, 'none', 'Tiểu Phàm phải tự động thức dậy đón ngày khảo nghiệm');
assert.equal(testPlayer.x, 532);
assert.equal(testPlayer.y, 232);
assert(TieuPhamHome.canWalk(testPlayer.x, testPlayer.y), 'Tiểu Phàm không bị kẹt trong va chạm giường');

// Kiểm tra khi đang ở Ngày Khảo Nghiệm Linh Căn: Tương tác giường nhắc nhở không ngủ tiếp
TieuPhamHome.sleepInBed(testPlayer);
assert.equal(TieuPhamHome.pose, 'none', 'Ngày khảo nghiệm linh căn không cho ngủ quên kỳ khảo nghiệm');

// Kiểm tra gọi hàm talk() với PointerEvent không làm lệch tọa độ hay kẹt va chạm

c.Villagers.talk({ clientX: 100, clientY: 100 }); // PointerEvent
assert.equal(testPlayer.x, 532, 'Tọa độ người chơi thực không bị ghi đè thành đối tượng sự kiện');
assert.equal(TieuPhamHome.pose, 'none', 'Tiểu Phàm thức dậy an toàn');
assert(TieuPhamHome.canWalk(testPlayer.x, testPlayer.y), 'Tiểu Phàm có thể di chuyển ra khỏi phòng');

// Reopen saved quest state during the exam morning; A Huy must still assemble.
vm.runInContext(fs.readFileSync('public/game/quest1.js', 'utf8')
  .replace('const Quest1 =', 'const ReloadedQuest =') + ';this.reloaded = ReloadedQuest;', c);
c.reloaded.init(Villagers);
assert.equal(c.reloaded.getState(), 'selection_ready');
c.reloaded.update(0.016, 10, testPlayer, Villagers);
assert.equal(TieuPhamHome.pose, 'none');

// Use the same wake-up prompt as touch players.
assert.equal(typeof domElements.get('go-square-modal-btn').onclick, 'function');
domElements.get('go-square-modal-btn').onclick();
assert.equal(TieuPhamHome.inside,false);
assert.equal(Quest1.getState(),'cinematic_active');
console.log('PASS: exam morning, saved quest reload and departure from bed to square with real A Huy');
process.exit(0);
