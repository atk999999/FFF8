'use strict';

/**
 * NHIỆM VỤ 1: TIÊN DUYÊN KHỞI ĐẦU
 * Hồi 1: Lời Báo Của Trưởng Làng
 * Hồi 2: Tiên Nhân Giáng Lâm — Khảo Nghiệm Linh Căn
 */
const Quest1 = (() => {
  const STORAGE_KEY = 'lang_du_lam_quest1_v1';

  const STATES = {
    NOT_STARTED: 'not_started',
    CHIEF_APPROACHING: 'chief_approaching',
    DIALOGUE_ACTIVE: 'dialogue_active',
    CONSIDERING: 'considering',
    DECLINED: 'declined',
    REGISTERED: 'registered',
    AWAITING_SELECTION: 'awaiting_selection',
    SELECTION_READY: 'selection_ready',
    CINEMATIC_ACTIVE: 'cinematic_active',
    COMPLETED: 'completed'
  };

  const AVATARS = {
    truong: 'Truong_Lang_Avatar_9KB.webp',
    tieuPham: 'tieu-pham-avatar.webp',
    aHuy: 'A_Huy_Avatar_Duoi_10KB.webp',
    lucNham: 'Luc_Nham_Truc_Co_So_Ky_Avatar_Duoi10KB.webp'
  };

  // Tọa độ tâm quảng trường làng (sân làng)
  const SQUARE_CENTER = { x: 800, y: 550 };
  const STONE_POS = { x: 800, y: 520 };
  const LUC_NHAM_STAND = { x: 800, y: 476 };
  const CHIEF_SQUARE_POS = { x: 755, y: 505 };
  const AHUY_SQUARE_POS = { x: 825, y: 560 };
  const PHAM_SQUARE_POS = { x: 775, y: 560 };

  let questData = {
    version: 1,
    state: STATES.CHIEF_APPROACHING,
    approachDelay: 30.0,
    hasMetChief: false,
    registeredDay: null,
    choice: null,
    history: [],
    spiritualRoot: null,
    rivalryReaction: null,
    completed: false
  };

  let questDetailTimer = 0;

  let initialized = false;
  let dialogueActive = false;
  let currentScript = [];
  let scriptIndex = 0;
  let isTyping = false;
  let displayedText = '';
  let fullText = '';
  let typeIndex = 0;
  let typeTimer = null;
  let routeTimer = 0;
  let calloutCooldown = 0;
  let toastTimer = 0;
  let toastMessage = '';
  let cachedChief = null;
  let cachedVillagers = null;
  let cachedPlayer = null;

  // Cinematic State Variables
  let cinematicStep = 0;
  let cinematicTimer = 0;
  let cameraOffset = { x: 0, y: 0 };
  let screenShake = 0;
  let swordTrail = [];
  let shockwave = { active: false, x: 0, y: 0, radius: 0, maxR: 52, alpha: 1 };
  let dustParticles = [];
  let spiritualPillars = [];
  let chaoticMotes = [];
  let observationStone = {
    visible: false,
    alpha: 0,
    scale: 0,
    activeRoot: null, // 'five_intro', 'npc', 'tam_linh_can', 'ngu_tap_can'
    glowColor: null,
    rumble: 0
  };

  let lucNhamEntity = {
    visible: false,
    mode: 'fly_in', // 'fly_in', 'hover', 'ground', 'takeoff', 'fly_away'
    x: 1080,
    y: 160,
    z: 280,
    vx: -180,
    vy: 120,
    vz: -160,
    swordScale: 1,
    swordSheathed: false,
    facing: -1,
    capeWave: 0,
    auraAlpha: 0.8
  };

  // -------------------------------------------------------------
  // AUDIO SYNTHESIZER (WEB AUDIO API TÍCH HỢP CHO TIÊN KIẾM & PHÁP KHÍ)
  // -------------------------------------------------------------
  function getAudioCtx() {
    try {
      if (typeof VillageMusic !== 'undefined' && VillageMusic.audioCtx) {
        return VillageMusic.audioCtx;
      }
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        if (!window._langDuLamSfxCtx) {
          window._langDuLamSfxCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return window._langDuLamSfxCtx;
      }
    } catch (e) {
      // Ignore audio init errors
    }
    return null;
  }

  function playSwordCrySound() {
    const actx = getAudioCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      const filter = actx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 1.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.Q.value = 8;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);

      osc.start(now);
      osc.stop(now + 1.35);
    } catch (e) {}
  }

  function playLandingShockSound() {
    const actx = getAudioCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(actx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {}
  }

  function playStoneSummonSound() {
    const actx = getAudioCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const now = actx.currentTime;
      [220, 330, 440].forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.01, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.8);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.85);
      });
    } catch (e) {}
  }

  function playTamLinhCanSound() {
    const actx = getAudioCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const now = actx.currentTime;
      // 3 nốt ngân vang: Hỏa (D5), Thổ (A4), Thủy (F5)
      [440, 587.33, 698.46].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.12, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 1.8);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 1.85);
      });
    } catch (e) {}
  }

  function playNguTapCanSound() {
    const actx = getAudioCtx();
    if (!actx || actx.state === 'suspended') return;
    try {
      const now = actx.currentTime;
      // 5 nốt yếu ớt, ngắt quãng
      [293.66, 329.63, 349.23, 392.00, 440.00].forEach((f, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.09);
        gain.gain.setValueAtTime(0.04, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.4);
      });
    } catch (e) {}
  }

  // -------------------------------------------------------------
  // LƯU & TẢI TRẠNG THÁI
  // -------------------------------------------------------------
  function loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.version === 1) {
            questData = { ...questData, ...parsed };
            if (questData.state === STATES.CINEMATIC_ACTIVE) {
              questData.state = STATES.SELECTION_READY;
            }
            if (questData.approachDelay === undefined) {
              questData.approachDelay = questData.state === STATES.CHIEF_APPROACHING ? 30.0 : 0;
            }
          }
        }
      }
    } catch (e) {}
  }

  function saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(questData));
      }
    } catch (e) {}
  }

  loadState();

  // -------------------------------------------------------------
  // HỘI THOẠI HỒI 1 (LỜI BÁO CỦA TRƯỞNG LÀNG)
  // -------------------------------------------------------------
  const SCRIPT_AFTER_REGISTER = [
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Được! Tên ngươi đã được lão phu ghi lại.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Nhớ kỹ, hai ngày nữa, khi tiếng chuông vang lên tại quảng trường làng, chính là lúc tiên nhân giáng lâm.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Đến lúc đó, dù có gặp chuyện gì cũng phải giữ tâm bình khí tĩnh, chớ làm điều thất lễ trước mặt tiên nhân.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Đi đi, nhóc con. Hãy tận hưởng những ngày bình yên còn lại. Biết đâu chẳng bao lâu nữa, cuộc đời ngươi sẽ hoàn toàn thay đổi...',
      onFinish: () => {
        completeRegistration();
      }
    }
  ];

  const SCRIPT_BRANCH_EAGER = [
    {
      speaker: 'Tiểu Phàm',
      role: 'Thiếu Niên · 14 tuổi',
      avatar: AVATARS.tieuPham,
      text: 'Tu tiên ư? Ta muốn! Ta muốn trở thành tiên nhân, ngự kiếm bay khắp thiên hạ!'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Ha ha ha! Khá lắm! Tuổi còn nhỏ mà đã có chí khí lớn như vậy, quả nhiên lão phu không nhìn lầm ngươi!'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Nhưng nhóc con, tiên đạo nào có dễ dàng như lời ngươi nói. Thiên hạ phàm nhân nhiều vô kể, kẻ có linh căn lại chẳng được bao nhiêu.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Có điều, chưa thử thì sao biết được? Biết đâu trong cái làng nhỏ bé này, lại xuất hiện một vị tiên nhân danh chấn thiên hạ!'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Được rồi! Lão phu sẽ ghi tên ngươi vào danh sách tuyển chọn. Mấy ngày tới nhớ chuẩn bị cho tốt!'
    },
    ...SCRIPT_AFTER_REGISTER
  ];

  const SCRIPT_BRANCH_HESITANT = [
    {
      speaker: 'Tiểu Phàm',
      role: 'Thiếu Niên · 14 tuổi',
      avatar: AVATARS.tieuPham,
      text: 'Nếu ta thật sự được tiên nhân thu nhận, liệu sau này còn có thể trở về làng không?'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Haizz, nhóc con, ngươi còn nhỏ mà đã biết lưu luyến cố hương rồi sao?'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Tiên lộ xa xôi, một khi bước chân vào tiên môn, có lẽ mười năm, trăm năm, thậm chí lâu hơn nữa mới có dịp trở về.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Đến lúc ấy, cảnh vật có thể vẫn còn, nhưng những người quen biết ngươi hôm nay... chưa chắc đã còn trên nhân thế.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Lão phu không muốn giấu ngươi. Tu tiên là cơ duyên, nhưng cũng là một con đường đầy cô độc.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Có điều, chim non rồi cũng phải rời tổ. Nếu ngươi thật sự có tiên duyên, lão phu mong ngươi đừng vì lưu luyến ngôi làng nhỏ bé này mà bỏ lỡ cả một đời.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Dù ngươi lựa chọn thế nào, nơi đây vẫn là quê hương của ngươi.',
      choices: [
        {
          id: 'step_forward',
          label: '“Ta đã quyết định, ta muốn bước lên tiên lộ.”',
          onSelect: () => {
            startDialogue([
              {
                speaker: 'Tiểu Phàm',
                role: 'Thiếu Niên · 14 tuổi',
                avatar: AVATARS.tieuPham,
                text: 'Ta đã quyết định, ta muốn bước lên tiên lộ.'
              },
              {
                speaker: 'Trưởng làng',
                role: 'Bậc Trưởng Bối · 60 tuổi',
                avatar: AVATARS.truong,
                text: 'Khá lắm! Tuổi trẻ phải có dũng khí bước ra thế giới bao la, lão phu sẽ ghi tên ngươi!'
              },
              ...SCRIPT_AFTER_REGISTER
            ]);
          }
        },
        {
          id: 'not_ready',
          label: '“Ta vẫn chưa sẵn sàng rời khỏi nơi này.”',
          onSelect: () => {
            startDialogue([
              {
                speaker: 'Tiểu Phàm',
                role: 'Thiếu Niên · 14 tuổi',
                avatar: AVATARS.tieuPham,
                text: 'Ta vẫn chưa sẵn sàng rời khỏi nơi này.'
              },
              {
                speaker: 'Trưởng làng',
                role: 'Bậc Trưởng Bối · 60 tuổi',
                avatar: AVATARS.truong,
                text: 'Được rồi, chuyện trọng đại cả đời, ngươi cứ suy nghĩ kỹ đi. Trước khi tiên nhân đến, bất cứ lúc nào đổi ý đều có thể tìm lão phu.',
                onFinish: () => {
                  questData.state = STATES.CONSIDERING;
                  questData.choice = 'considering';
                  saveState();
                  closeDialogue();
                }
              }
            ]);
          }
        }
      ]
    }
  ];

  const SCRIPT_BRANCH_DECLINE = [
    {
      speaker: 'Tiểu Phàm',
      role: 'Thiếu Niên · 14 tuổi',
      avatar: AVATARS.tieuPham,
      text: 'Ta chẳng muốn làm tiên nhân. Sống một đời bình yên trong làng chẳng phải tốt hơn sao?'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Ồ? Ha ha ha! Không ngờ nhóc con ngươi lại có suy nghĩ như vậy.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Người đời tranh nhau cầu tiên vấn đạo, mong được trường sinh bất tử. Còn ngươi, cơ duyên đặt ngay trước mắt lại chẳng chút động lòng.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Nhưng ngẫm kỹ, sống một đời bình an, ngày ngày ngắm mặt trời mọc, tối về quây quần bên bếp lửa, cũng chưa chắc đã kém cuộc sống của tiên nhân.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Tiên nhân có nỗi khổ của tiên nhân, phàm nhân cũng có niềm vui của phàm nhân.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Thôi được, lão phu không ép ngươi.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Chỉ là... nếu một ngày nào đó ngươi thay đổi ý định, hãy đến tìm lão phu. Trước khi tiên nhân rời làng, cơ duyên này vẫn còn.',
      onFinish: () => {
        questData.state = STATES.DECLINED;
        questData.choice = 'declined';
        saveState();
        closeDialogue();
      }
    }
  ];

  const SCRIPT_OPENING = [
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Nhóc con! Nhóc con! Mau lại đây, lão phu có chuyện quan trọng muốn nói với ngươi!'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Ngươi đã từng nghe nói đến tiên nhân chưa? Những người có thể ngự kiếm phi thiên, dời non lấp biển, thậm chí sống đến hàng nghìn năm ấy!'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Lão phu vừa nhận được tin, hai ngày nữa sẽ có tiên nhân từ tiên môn giáng lâm xuống làng ta, tuyển chọn đệ tử có linh căn.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Đây chính là cơ duyên trăm năm khó gặp! Thế nào, nhóc con, ngươi có muốn thử bước lên tiên lộ không?',
      choices: [
        {
          id: 'eager',
          label: '“Tu tiên ư? Ta muốn! Ta muốn trở thành tiên nhân, ngự kiếm bay khắp thiên hạ!”',
          onSelect: () => startDialogue(SCRIPT_BRANCH_EAGER)
        },
        {
          id: 'hesitant',
          label: '“Nếu ta thật sự được tiên nhân thu nhận, liệu sau này còn có thể trở về làng không?”',
          onSelect: () => startDialogue(SCRIPT_BRANCH_HESITANT)
        },
        {
          id: 'decline',
          label: '“Ta chẳng muốn làm tiên nhân. Sống một đời bình yên trong làng chẳng phải tốt hơn sao?”',
          onSelect: () => startDialogue(SCRIPT_BRANCH_DECLINE)
        }
      ]
    }
  ];

  function getRevisitScript() {
    if (questData.state === STATES.SELECTION_READY) {
      return [
        {
          speaker: 'Trưởng làng',
          role: 'Bậc Trưởng Bối · 60 tuổi',
          avatar: AVATARS.truong,
          text: 'Nhóc con! Mau đến quảng trường! Tiên nhân sắp giáng lâm rồi, đừng để lỡ đại sự!',
          onFinish: () => closeDialogue()
        }
      ];
    }

    if (questData.state === STATES.REGISTERED || questData.state === STATES.AWAITING_SELECTION) {
      return [
        {
          speaker: 'Trưởng làng',
          role: 'Bậc Trưởng Bối · 60 tuổi',
          avatar: AVATARS.truong,
          text: 'Nhóc con, tên ngươi đã có trong danh sách. Chớ sốt ruột, cứ chuẩn bị tinh thần cho tốt.',
          onFinish: () => closeDialogue()
        }
      ];
    }

    if (questData.state === STATES.CONSIDERING) {
      return [
        {
          speaker: 'Trưởng làng',
          role: 'Bậc Trưởng Bối · 60 tuổi',
          avatar: AVATARS.truong,
          text: 'Nhóc con, chuyện tiên duyên ngươi đã suy nghĩ kỹ chưa? Lão phu không ép, nhưng cơ duyên chẳng chờ ai mãi đâu.',
          choices: [
            {
              id: 'change_mind_register',
              label: '“Ta đã suy nghĩ kỹ, ta muốn ghi tên tham gia tuyển chọn!”',
              onSelect: () => {
                startDialogue([
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: 'Ta đã suy nghĩ kỹ, ta muốn ghi tên tham gia tuyển chọn!'
                  },
                  {
                    speaker: 'Trưởng làng',
                    role: 'Bậc Trưởng Bối · 60 tuổi',
                    avatar: AVATARS.truong,
                    text: 'Tốt lắm! Lão phu sẽ ghi tên ngươi vào danh sách ngay!'
                  },
                  ...SCRIPT_AFTER_REGISTER
                ]);
              }
            },
            {
              id: 'keep_considering',
              label: '“Xin cho ta thêm thời gian suy nghĩ.”',
              onSelect: () => {
                startDialogue([
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: 'Xin cho ta thêm thời gian suy nghĩ.'
                  },
                  {
                    speaker: 'Trưởng làng',
                    role: 'Bậc Trưởng Bối · 60 tuổi',
                    avatar: AVATARS.truong,
                    text: 'Được, chuyện hệ trọng, cứ thong thả suy nghĩ.',
                    onFinish: () => closeDialogue()
                  }
                ]);
              }
            }
          ]
        }
      ];
    }

    if (questData.state === STATES.DECLINED) {
      return [
        {
          speaker: 'Trưởng làng',
          role: 'Bậc Trưởng Bối · 60 tuổi',
          avatar: AVATARS.truong,
          text: 'Ồ, nhóc con lại đến tìm lão phu sao? Thế nào, đã đổi ý muốn thử tiên duyên rồi ư?',
          choices: [
            {
              id: 'change_mind_register_declined',
              label: '“Ta muốn thử, xin trưởng làng ghi tên ta vào danh sách!”',
              onSelect: () => {
                startDialogue([
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: 'Ta muốn thử, xin trưởng làng ghi tên ta vào danh sách!'
                  },
                  {
                    speaker: 'Trưởng làng',
                    role: 'Bậc Trưởng Bối · 60 tuổi',
                    avatar: AVATARS.truong,
                    text: 'Ha ha ha! Biết quay đầu là tốt! Cơ duyên trăm năm có một này suýt nữa thì ngươi bỏ lỡ!'
                  },
                  ...SCRIPT_AFTER_REGISTER
                ]);
              }
            },
            {
              id: 'just_greeting',
              label: '“Ta chỉ ghé qua chào hỏi lão bá thôi.”',
              onSelect: () => {
                startDialogue([
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: 'Ta chỉ ghé qua chào hỏi lão bá thôi.'
                  },
                  {
                    speaker: 'Trưởng làng',
                    role: 'Bậc Trưởng Bối · 60 tuổi',
                    avatar: AVATARS.truong,
                    text: 'Ừ, nhóc con cứ thong thả dạo chơi trong làng.',
                    onFinish: () => closeDialogue()
                  }
                ]);
              }
            }
          ]
        }
      ];
    }

    return SCRIPT_OPENING;
  }

  function completeRegistration() {
    const curDay = typeof Villagers !== 'undefined' && Villagers.day ? Villagers.day : 1;
    questData.state = STATES.REGISTERED;
    questData.choice = 'registered';
    questData.registeredDay = curDay;
    saveState();
    closeDialogue();
    showToast(
      'Nhiệm vụ đã nhận: Tiên Duyên Khởi Đầu\nMục tiêu: Chờ hai ngày, đến quảng trường làng tham gia tuyển chọn linh căn.'
    );
  }

  function showToast(msg) {
    toastMessage = msg;
    toastTimer = 6.0;

    const toastEl = document.getElementById('quest-toast');
    if (toastEl) {
      toastEl.hidden = false;
      const lines = msg.split('\n');
      const titleEl = document.getElementById('quest-toast-title');
      const bodyEl = document.getElementById('quest-toast-body');
      if (titleEl) titleEl.textContent = lines[0] || '';
      if (bodyEl) bodyEl.textContent = lines.slice(1).join('\n') || '';
      toastEl.style.opacity = '1';
    }
  }

  function showResultCard(info) {
    const card = document.getElementById('quest-result-card');
    if (!card) return;
    const nameEl = document.getElementById('result-name');
    const rootEl = document.getElementById('result-root');
    const typeEl = document.getElementById('result-type');
    const gradeEl = document.getElementById('result-grade');

    if (nameEl) nameEl.textContent = info.name || '';
    if (rootEl) rootEl.textContent = info.root || '';
    if (typeEl) typeEl.textContent = info.type || '';
    if (gradeEl) gradeEl.textContent = info.grade || '';

    card.hidden = false;
    card.style.opacity = '1';
  }

  function hideResultCard() {
    const card = document.getElementById('quest-result-card');
    if (card) {
      card.hidden = true;
    }
  }

  // -------------------------------------------------------------
  // DIALOGUE UI CONTROLLER (TYPEWRITER, CHOICES, NEXT)
  // -------------------------------------------------------------
  function startDialogue(script) {
    if (!script || !script.length) return;
    currentScript = script;
    scriptIndex = 0;
    dialogueActive = true;
    questData.hasMetChief = true;
    saveState();

    // Face each other
    if (cachedChief && typeof p !== 'undefined') {
      cachedChief.route = [];
      cachedChief.walk = 0;
      cachedChief.dir = p.x > cachedChief.x ? 1 : -1;
      p.walk = 0;
    }

    renderCurrentStep();
  }

  function resolveAvatar(step) {
    if (!step) return AVATARS.truong;
    const speaker = (step.speaker || '').trim();
    if (speaker === 'Tiểu Phàm' || speaker === 'Trương Tiểu Phàm') {
      return AVATARS.tieuPham;
    }
    if (speaker === 'A Huy') {
      return AVATARS.aHuy;
    }
    if (speaker === 'Lục Nham') {
      return AVATARS.lucNham;
    }
    if (speaker === 'Trưởng làng') {
      return AVATARS.truong;
    }
    return step.avatar || AVATARS.truong;
  }

  function renderCurrentStep() {
    if (scriptIndex >= currentScript.length) {
      closeDialogue();
      return;
    }

    const step = currentScript[scriptIndex];
    const container = document.getElementById('quest-dialog');
    const speakerEl = document.getElementById('quest-speaker-name');
    const roleEl = document.getElementById('quest-speaker-role');
    const avatarEl = document.getElementById('quest-avatar');
    const textEl = document.getElementById('quest-dialog-text');
    const promptEl = document.getElementById('quest-prompt-tap');
    const choicesEl = document.getElementById('quest-choices');

    if (!container || !textEl) {
      return;
    }

    container.hidden = false;
    if (speakerEl) speakerEl.textContent = step.speaker;
    if (roleEl) roleEl.textContent = step.role || '';
    if (avatarEl) {
      const targetAvatar = resolveAvatar(step);
      avatarEl.src = targetAvatar;
      avatarEl.alt = step.speaker;
      avatarEl.onerror = () => {
        if (step.speaker === 'Tiểu Phàm' || step.speaker === 'Trương Tiểu Phàm') {
          avatarEl.src = 'tieu-pham-avatar.webp';
        } else if (step.speaker === 'Trưởng làng') {
          avatarEl.src = 'Truong_Lang_Avatar_9KB.webp';
        } else if (step.speaker === 'Lục Nham') {
          avatarEl.src = 'luc-nham-avatar.webp';
        }
      };
      if (avatarEl.classList && avatarEl.classList.remove) {
        avatarEl.classList.remove('quest-avatar-enter');
        if (avatarEl.offsetWidth !== undefined) void avatarEl.offsetWidth;
        avatarEl.classList.add('quest-avatar-enter');
      }
    }
    if (textEl && textEl.classList && textEl.classList.remove) {
      textEl.classList.remove('quest-text-fadeIn');
      if (textEl.offsetWidth !== undefined) void textEl.offsetWidth;
      textEl.classList.add('quest-text-fadeIn');
    }

    // Prepare typewriter
    fullText = step.text;
    displayedText = '';
    typeIndex = 0;
    isTyping = true;
    textEl.textContent = '';
    if (promptEl) promptEl.hidden = true;
    if (choicesEl) {
      choicesEl.hidden = true;
      choicesEl.innerHTML = '';
    }

    if (typeof clearInterval !== 'undefined') clearInterval(typeTimer);
    if (typeof setInterval !== 'undefined') {
      typeTimer = setInterval(() => {
        if (typeIndex < fullText.length) {
          typeIndex++;
          displayedText = fullText.slice(0, typeIndex);
          textEl.textContent = displayedText;
        } else {
          finishTyping();
        }
      }, 24);
    } else {
      finishTyping();
    }
  }

  function finishTyping() {
    if (!isTyping) return;
    if (typeof clearInterval !== 'undefined') clearInterval(typeTimer);
    isTyping = false;
    displayedText = fullText;

    const textEl = document.getElementById('quest-dialog-text');
    const promptEl = document.getElementById('quest-prompt-tap');
    const choicesEl = document.getElementById('quest-choices');
    if (textEl) textEl.textContent = fullText;

    const step = currentScript[scriptIndex];
    if (step && step.choices && step.choices.length) {
      if (promptEl) promptEl.hidden = true;
      if (choicesEl) {
        choicesEl.hidden = false;
        choicesEl.innerHTML = '';
        step.choices.forEach((c) => {
          const btn = document.createElement('button');
          btn.className = 'quest-choice-btn';
          btn.textContent = c.label;
          btn.onclick = (e) => {
            e.stopPropagation();
            c.onSelect();
          };
          choicesEl.appendChild(btn);
        });
      }
    } else {
      if (promptEl) promptEl.hidden = false;
    }
  }

  function handleBoxClick() {
    if (!dialogueActive) return;
    if (isTyping) {
      finishTyping();
      return;
    }
    const step = currentScript[scriptIndex];
    if (step && step.choices && step.choices.length) {
      return;
    }

    if (step && typeof step.onFinish === 'function') {
      step.onFinish();
      return;
    }

    scriptIndex++;
    if (scriptIndex < currentScript.length) {
      renderCurrentStep();
    } else {
      closeDialogue();
    }
  }

  function closeDialogue() {
    if (typeof clearInterval !== 'undefined') clearInterval(typeTimer);
    isTyping = false;
    dialogueActive = false;
    currentScript = [];
    scriptIndex = 0;

    const container = document.getElementById('quest-dialog');
    if (container) container.hidden = true;

    if (cachedChief) {
      cachedChief.pause = 1.0;
    }
  }

  // -------------------------------------------------------------
  // ĐIỀU PHỐI CINEMATIC HỒI 2 (10 PHÂN CẢNH)
  // -------------------------------------------------------------
  function arrangeSquareSquad(villagers) {
    if (!villagers || !villagers.list) return;

    // Trưởng làng ở vị trí phía trước
    if (cachedChief) {
      cachedChief.x = CHIEF_SQUARE_POS.x;
      cachedChief.y = CHIEF_SQUARE_POS.y;
      cachedChief.dir = 1;
      cachedChief.route = [];
      cachedChief.walk = 0;
      cachedChief.pause = 9999;
    }

    // A Huy ở hàng đầu thiếu niên
    if (typeof AHuy !== 'undefined') {
      AHuy.takeScenePosition(AHUY_SQUARE_POS.x, AHUY_SQUARE_POS.y, -1);
    }

    // Các thiếu niên và dân làng xếp hàng hợp lệ quanh sân
    const teenageSlots = [
      { id: 'an', x: 740, y: 560 },
      { id: 'minh', x: 860, y: 560 },
      { id: 'cuc', x: 890, y: 560 },
      { id: 'sen', x: 710, y: 560 }
    ];
    teenageSlots.forEach((slot) => {
      const npc = villagers.list.find((n) => n.id === slot.id);
      if (npc) {
        npc.x = slot.x;
        npc.y = slot.y;
        npc.dir = 1;
        npc.route = [];
        npc.walk = 0;
        npc.pause = 9999;
      }
    });

    const elderSlots = [
      { id: 'tran', x: 720, y: 595 },
      { id: 'ho', x: 760, y: 600 },
      { id: 'ngu', x: 800, y: 605 },
      { id: 'hong', x: 840, y: 600 },
      { id: 'son', x: 880, y: 595 }
    ];
    elderSlots.forEach((slot) => {
      const npc = villagers.list.find((n) => n.id === slot.id);
      if (npc) {
        npc.x = slot.x;
        npc.y = slot.y;
        npc.dir = 1;
        npc.route = [];
        npc.walk = 0;
        npc.pause = 9999;
      }
    });
  }

  function startCinematic(player, villagers) {
    questData.state = STATES.CINEMATIC_ACTIVE;
    cinematicStep = 1;
    cinematicTimer = 0;
    saveState();

    arrangeSquareSquad(villagers);

    // Dẫn Tiểu Phàm vào vị trí hàng đầu
    player.x = PHAM_SQUARE_POS.x;
    player.y = PHAM_SQUARE_POS.y;
    player.dir = 'up';
    player.walk = 0;
    if (typeof p !== 'undefined' && p) {
      p.x = PHAM_SQUARE_POS.x;
      p.y = PHAM_SQUARE_POS.y;
      p.dir = 'up';
      p.walk = 0;
    }
    if (typeof TieuPhamHome !== 'undefined' && TieuPhamHome.inside) {
      TieuPhamHome.inside = false;
    }

    // PHÂN CẢNH 1: HỘI THOẠI MỞ ĐẦU
    startDialogue([
      {
        speaker: 'Trưởng làng',
        role: 'Bậc Trưởng Bối · 60 tuổi',
        avatar: AVATARS.truong,
        text: 'Các vị hương thân! Hôm nay là ngày trọng đại của làng chúng ta. Tiên nhân từ tiên môn sắp giáng lâm, mong mọi người giữ trật tự, chớ gây ồn ào!'
      },
      {
        speaker: 'A Huy',
        role: 'Bạn cùng tuổi · 14 tuổi',
        avatar: AVATARS.aHuy,
        text: 'Tiểu Phàm, ngươi cũng đến rồi à? Hừ, hôm nay ta nhất định phải được tiên nhân thu nhận. Đến lúc đó, ngươi đừng có mà ghen tị đấy!'
      },
      {
        speaker: 'Tiểu Phàm',
        role: 'Thiếu Niên · 14 tuổi',
        avatar: AVATARS.tieuPham,
        text: 'Còn chưa khảo nghiệm, sao ngươi biết mình sẽ được chọn?'
      },
      {
        speaker: 'A Huy',
        role: 'Bạn cùng tuổi · 14 tuổi',
        avatar: AVATARS.aHuy,
        text: 'Cứ chờ xem!',
        onFinish: () => {
          closeDialogue();
          // Tiếng kiếm minh vang lên
          playSwordCrySound();
          cinematicStep = 2; // Chuyển sang ngự kiếm giáng lâm
          cinematicTimer = 0;
          lucNhamEntity.visible = true;
          lucNhamEntity.mode = 'fly_in';
          lucNhamEntity.x = 1120;
          lucNhamEntity.y = 120;
          lucNhamEntity.z = 320;
        }
      }
    ]);
  }

  // -------------------------------------------------------------
  // UPDATE VÀ RENDER GAME LOOP
  // -------------------------------------------------------------
  function init(villagers) {
    if (!villagers || !villagers.list) return;
    cachedVillagers = villagers;
    cachedChief = villagers.list.find((n) => n.id === 'truong');

    const container = document.getElementById('quest-dialog');
    if (container) container.onclick = handleBoxClick;
    const nextBtn = document.getElementById('quest-prompt-tap');
    if (nextBtn) nextBtn.onclick = handleBoxClick;

    if (questData.state === STATES.CHIEF_APPROACHING && cachedChief) {
      cachedChief.x = 480;
      cachedChief.y = 350;
      cachedChief.home = [480, 350];
      cachedChief.dir = -1;
      cachedChief.route = [];
      cachedChief.walk = 0;
      cachedChief.pause = 0;
      cachedChief.spokenLine = '';
    }

    initialized = true;
  }

  function update(dt, t, player, villagers) {
    if (!initialized && villagers) init(villagers);
    if (!cachedChief && villagers && villagers.list) {
      cachedChief = villagers.list.find((n) => n.id === 'truong');
    }
    cachedVillagers = villagers;
    cachedPlayer = player;

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt);
    }

    // Cập nhật ngày theo dõi (Chờ 2 ngày trong game)
    const currentDay = villagers && villagers.day ? villagers.day : 1;
    if (
      questData.state !== STATES.COMPLETED &&
      questData.state !== STATES.CINEMATIC_ACTIVE &&
      questData.state !== STATES.SELECTION_READY &&
      (currentDay >= 3 || (questData.registeredDay != null && currentDay >= questData.registeredDay + 2))
    ) {
      questData.state = STATES.SELECTION_READY;
      saveState();
      showToast(
        'Tiếng chuông vang vọng khắp Làng Du Lãm.\nHôm nay chính là ngày tiên nhân giáng lâm tuyển chọn đệ tử! Mau đến quảng trường!'
      );
    }

    // Toast Timer
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) {
        const toastEl = document.getElementById('quest-toast');
        if (toastEl) toastEl.style.opacity = '0';
      }
    }

    // Khi ở trạng thái SELECTION_READY:
    // Dân làng xếp hàng tại quảng trường, Tiểu Phàm tới gần sẽ tự động kích hoạt
    if (questData.state === STATES.SELECTION_READY) {
      arrangeSquareSquad(villagers);

      // Nếu đang trong nhà (ngủ/nghỉ), không kích hoạt cinematic từ xa
      if (typeof TieuPhamHome !== 'undefined' && TieuPhamHome.inside) {
        return;
      }

      const distToSquare = Math.hypot(player.x - SQUARE_CENTER.x, player.y - SQUARE_CENTER.y);
      if (distToSquare <= 96 && !dialogueActive) {
        startCinematic(player, villagers);
        return;
      }
    }

    // HỒI 1: Trưởng làng tiếp cận
    if (questData.state === STATES.CHIEF_APPROACHING) {
      if (!cachedChief) return;

      // Nếu Tiểu Phàm đang ở trong nhà (ngủ/nghỉ), Trưởng làng đứng chờ ở sân trước cửa, không kích hoạt đối thoại xuyên tường
      if (typeof TieuPhamHome !== 'undefined' && TieuPhamHome.inside) {
        cachedChief.route = [];
        cachedChief.walk = 0;
        cachedChief.x = 236;
        cachedChief.y = 326;
        cachedChief.dir = -1;
        return;
      }

      // Đảm bảo Trưởng Làng luôn trong phạm vi xóm gần nhà Tiểu Phàm
      if (cachedChief.x > 750 || cachedChief.y > 600 || cachedChief.x < 180) {
        cachedChief.x = 480;
        cachedChief.y = 350;
        cachedChief.home = [480, 350];
        cachedChief.route = [];
      }

      const distToPlayer = Math.hypot(cachedChief.x - player.x, cachedChief.y - player.y);

      if (dialogueActive) {
        cachedChief.route = [];
        cachedChief.walk = 0;
        cachedChief.dir = player.x > cachedChief.x ? 1 : -1;
        return;
      }

      if (questData.approachDelay > 0) {
        questData.approachDelay = Math.max(0, questData.approachDelay - dt);
        if (questData.approachDelay === 0) saveState();

        // Trong 30s đầu: Đứng chờ tại chỗ, quay mặt về phía Tiểu Phàm
        cachedChief.route = [];
        cachedChief.walk = 0;
        cachedChief.dir = player.x > cachedChief.x ? 1 : -1;

        if (distToPlayer <= 56) {
          cachedChief.route = [];
          cachedChief.walk = 0;
          cachedChief.dir = player.x > cachedChief.x ? 1 : -1;
          cachedChief.spokenLine = 'Nhóc con! Nhóc con! Mau lại đây!';
          cachedChief.pause = 3.5;
          if (!dialogueActive) {
            questData.approachDelay = 0;
            saveState();
            startDialogue(SCRIPT_OPENING);
          }
        }
        return;
      }

      // Hết 30 giây: Trưởng làng chủ động tìm và tiến lại gần Tiểu Phàm
      if (distToPlayer <= 56) {
        cachedChief.route = [];
        cachedChief.walk = 0;
        cachedChief.dir = player.x > cachedChief.x ? 1 : -1;
        cachedChief.spokenLine = 'Nhóc con! Nhóc con! Mau lại đây!';
        cachedChief.pause = 3.5;
        if (!dialogueActive) startDialogue(SCRIPT_OPENING);
      } else {
        routeTimer -= dt;
        if (routeTimer <= 0 || !cachedChief.route || !cachedChief.route.length) {
          routeTimer = 0.8;
          if (villagers && typeof villagers.route === 'function') {
            cachedChief.route = villagers.route([cachedChief.x, cachedChief.y], [player.x, player.y]);
          }
        }

        calloutCooldown -= dt;
        if (calloutCooldown <= 0) {
          calloutCooldown = 3.5;
          cachedChief.spokenLine = 'Tiểu Phàm! Đợi lão phu một chút!';
        }

        let budget = 78 * dt;
        while (budget > 0 && cachedChief.route && cachedChief.route.length) {
          const [tx, ty] = cachedChief.route[0];
          const dx = tx - cachedChief.x,
            dy = ty - cachedChief.y;
          const len = Math.hypot(dx, dy);
          const amount = Math.min(len, budget);
          if (len < 0.1) {
            cachedChief.route.shift();
            continue;
          }
          const nx = cachedChief.x + (dx / len) * amount;
          const ny = cachedChief.y + (dy / len) * amount;
          if (typeof Collision === 'undefined' || Collision.canWalk(nx, ny)) {
            cachedChief.x = nx;
            cachedChief.y = ny;
            budget -= amount;
            cachedChief.walk = t * 9;
            if (Math.abs(dx) > 0.4) cachedChief.dir = dx < 0 ? -1 : 1;
            if (amount === len) cachedChief.route.shift();
          } else {
            if (villagers && typeof villagers.route === 'function') {
              cachedChief.route = villagers.route([cachedChief.x, cachedChief.y], [player.x, player.y]);
            }
            break;
          }
        }

        // Bước trực tiếp nếu không còn lộ trình trung gian nhưng khoảng cách vẫn > 56px
        if ((!cachedChief.route || !cachedChief.route.length) && distToPlayer > 56) {
          const directDx = player.x - cachedChief.x;
          const directDy = player.y - cachedChief.y;
          const directDist = Math.hypot(directDx, directDy);
          if (directDist > 0.1) {
            const stepLen = Math.min(directDist, 78 * dt);
            const nx = cachedChief.x + (directDx / directDist) * stepLen;
            const ny = cachedChief.y + (directDy / directDist) * stepLen;
            if (typeof Collision === 'undefined' || Collision.canWalk(nx, ny)) {
              cachedChief.x = nx;
              cachedChief.y = ny;
              cachedChief.walk = t * 9;
              if (Math.abs(directDx) > 0.4) cachedChief.dir = directDx < 0 ? -1 : 1;
            }
          }
        }
      }
      return;
    }

    // ---------------------------------------------------------
    // CẬP NHẬT TIẾN TRÌNH CINEMATIC HỒI 2
    // ---------------------------------------------------------
    if (questData.state === STATES.CINEMATIC_ACTIVE) {
      updateCinematicSequence(dt, t, player, villagers);
    }
  }

  function updateCinematicSequence(dt, t, player, villagers) {
    cinematicTimer += dt;

    // Cập nhật hạt bụi xung kích
    for (let i = dustParticles.length - 1; i >= 0; i--) {
      const p = dustParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 1.8;
      if (p.alpha <= 0) dustParticles.splice(i, 1);
    }

    // Cập nhật sóng xung kích
    if (shockwave.active) {
      shockwave.radius += dt * 140;
      shockwave.alpha = Math.max(0, 1 - shockwave.radius / shockwave.maxR);
      if (shockwave.radius >= shockwave.maxR) {
        shockwave.active = false;
      }
    }

    // Cập nhật vệt kiếm quang
    if (lucNhamEntity.visible && !lucNhamEntity.swordSheathed) {
      const swordX = lucNhamEntity.x;
      const swordY = lucNhamEntity.y - (lucNhamEntity.z || 0);
      swordTrail.unshift({ x: swordX, y: swordY, alpha: 0.85 });
      if (swordTrail.length > 18) swordTrail.pop();
    } else {
      if (swordTrail.length) swordTrail.shift();
    }

    // Cập nhật các cột sáng và đốm sáng
    if (spiritualPillars.length) {
      spiritualPillars.forEach((col) => {
        col.height = Math.min(col.maxH, col.height + dt * 160);
        col.glowPhase = (col.glowPhase || 0) + dt * 6;
      });
    }

    for (let i = chaoticMotes.length - 1; i >= 0; i--) {
      const m = chaoticMotes[i];
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      m.alpha -= dt * 0.9;
      if (m.alpha <= 0) chaoticMotes.splice(i, 1);
    }

    // PHÂN CẢNH 2: LỤC NHAM NGỰ KIẾM GIÁNG LÂM
    if (cinematicStep === 2) {
      // Camera ngước lên góc trời
      cameraOffset.y = Math.max(-120, cameraOffset.y - dt * 180);

      // Phi kiếm lao theo đường cong chéo từ cao xuống
      const targetX = LUC_NHAM_STAND.x;
      const targetY = LUC_NHAM_STAND.y;

      const progress = Math.min(1, cinematicTimer / 2.8);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic Ease-Out

      lucNhamEntity.x = 1120 + (targetX - 1120) * ease;
      lucNhamEntity.y = 120 + (targetY - 120) * ease;
      lucNhamEntity.z = Math.max(0, 320 * (1 - ease));

      if (progress >= 1 && lucNhamEntity.mode === 'fly_in') {
        // Tiếp đất!
        lucNhamEntity.mode = 'ground';
        lucNhamEntity.z = 0;
        screenShake = 0.15;
        playLandingShockSound();

        // Kích hoạt vòng sóng xung kích linh khí
        shockwave.active = true;
        shockwave.x = lucNhamEntity.x;
        shockwave.y = lucNhamEntity.y + 12;
        shockwave.radius = 0;
        shockwave.alpha = 1;

        // Sinh 14 hạt bụi đất nhẹ
        for (let i = 0; i < 14; i++) {
          const ang = (i / 14) * Math.PI * 2;
          dustParticles.push({
            x: shockwave.x,
            y: shockwave.y,
            vx: Math.cos(ang) * (30 + Math.random() * 40),
            vy: Math.sin(ang) * (14 + Math.random() * 18),
            size: 2 + Math.random() * 2.5,
            alpha: 0.8
          });
        }

        // Thu kiếm vào tay áo
        setTimeout(() => {
          lucNhamEntity.swordSheathed = true;
        }, 350);

        // Chuyển sang đối thoại phân cảnh 2
        setTimeout(() => {
          cameraOffset.y = 0;
          startDialogue([
            {
              speaker: 'Dân làng',
              role: 'Quần Chúng',
              avatar: AVATARS.truong,
              text: 'Tiên nhân! Là tiên nhân thật sự! Trời ơi, ngự kiếm phi hành! Không ngờ đời này ta lại có thể tận mắt nhìn thấy tiên nhân!'
            },
            {
              speaker: 'Trưởng làng',
              role: 'Bậc Trưởng Bối · 60 tuổi',
              avatar: AVATARS.truong,
              text: 'Lão hủ là trưởng làng Du Lãm, cung nghênh tiên sư đại giá quang lâm! Đường sá xa xôi, chẳng hay tiên sư có cần nghỉ ngơi đôi chút?'
            },
            {
              speaker: 'Lục Nham',
              role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
              avatar: AVATARS.lucNham,
              text: 'Không cần đa lễ. Ta là Lục Nham, đệ tử ngoại môn phụ trách tuyển chọn lần này. Phụng mệnh tông môn đến các thôn làng khảo nghiệm linh căn. Kẻ có tư chất thích hợp, ta sẽ dẫn về tông môn tu hành.'
            },
            {
              speaker: 'Trưởng làng',
              role: 'Bậc Trưởng Bối · 60 tuổi',
              avatar: AVATARS.truong,
              text: 'Đa tạ tiên sư đã ban cho đám trẻ trong làng một cơ duyên lớn lao! Lão hủ đã cho tập hợp tất cả thiếu niên đủ tuổi, xin tiên sư xem xét.'
            },
            {
              speaker: 'Lục Nham',
              role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
              avatar: AVATARS.lucNham,
              text: 'Ừm. Vậy bắt đầu đi.',
              onFinish: () => {
                closeDialogue();
                cinematicStep = 3; // Triệu hồi Quan Trắc Thạch
                cinematicTimer = 0;
                observationStone.visible = true;
                playStoneSummonSound();
              }
            }
          ]);
        }, 900);
      }
    }

    // PHÂN CẢNH 3: TRIỆU HỒI QUAN TRẮC THẠCH
    if (cinematicStep === 3) {
      if (cinematicTimer < 1.8) {
        observationStone.scale = Math.min(1, cinematicTimer / 1.5);
        observationStone.alpha = Math.min(1, cinematicTimer / 1.2);
        observationStone.activeRoot = 'five_intro';
      } else if (!dialogueActive && cinematicTimer >= 2.0) {
        observationStone.activeRoot = null;
        startDialogue([
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
            avatar: AVATARS.lucNham,
            text: 'Đây là Quan Trắc Thạch, pháp khí chuyên dùng để khảo nghiệm linh căn. Phàm nhân muốn tu tiên, trước hết phải có tư chất cảm ứng linh khí thiên địa.'
          },
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
            avatar: AVATARS.lucNham,
            text: 'Lần lượt tiến lên, đặt tay lên mặt đá. Chớ vận lực, chớ kinh hoảng, chỉ cần giữ tâm thần bình tĩnh.'
          },
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Các ngươi nghe rõ chưa? Lần lượt tiến lên! Không được chen lấn, càng không được vô lễ trước mặt tiên sư!',
            onFinish: () => {
              closeDialogue();
              cinematicStep = 4; // Khảo nghiệm 3 NPC thiếu niên
              cinematicTimer = 0;
            }
          }
        ]);
      }
    }

    // PHÂN CẢNH 4: KHẢO NGHIỆM THIẾU NIÊN NPC
    if (cinematicStep === 4) {
      if (cinematicTimer < 1.2) {
        // NPC 1 (Tiểu An) bước lên
        const npc = villagers.list.find((n) => n.id === 'an');
        if (npc) {
          npc.x = STONE_POS.x - 24;
          npc.y = STONE_POS.y + 12;
        }
      } else if (cinematicTimer < 2.4) {
        observationStone.glowColor = 'rgba(180, 180, 180, 0.4)';
      } else if (!dialogueActive && cinematicTimer >= 2.5) {
        observationStone.glowColor = null;
        startDialogue([
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử',
            avatar: AVATARS.lucNham,
            text: 'Không có linh căn. Người tiếp theo.'
          },
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử',
            avatar: AVATARS.lucNham,
            text: 'Linh khí quá yếu, không đạt yêu cầu. Người tiếp theo.'
          },
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử',
            avatar: AVATARS.lucNham,
            text: 'Đáng tiếc, ngươi không có tư chất nhập đạo.',
            onFinish: () => {
              closeDialogue();
              // Đưa NPC về vị trí cũ
              const npc = villagers.list.find((n) => n.id === 'an');
              if (npc) {
                npc.x = 740;
                npc.y = 560;
              }
              cinematicStep = 5; // A Huy khảo nghiệm
              cinematicTimer = 0;
            }
          }
        ]);
      }
    }

    // PHÂN CẢNH 5: A HUY KHẢO NGHIỆM (TAM LINH CĂN)
    if (cinematicStep === 5) {
      if (cinematicTimer < 0.6) {
        // Trưởng làng gọi tên A Huy
      } else if (!dialogueActive && cinematicTimer >= 0.8 && !observationStone.activeRoot) {
        startDialogue([
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Người tiếp theo, A Huy!'
          },
          {
            speaker: 'A Huy',
            role: 'Bạn cùng tuổi · 14 tuổi',
            avatar: AVATARS.aHuy,
            text: 'Tiểu Phàm, mở to mắt mà nhìn cho kỹ!',
            onFinish: () => {
              closeDialogue();
              // A Huy bước lên Quan Trắc Thạch
              if (typeof AHuy !== 'undefined') {
                AHuy.takeScenePosition(STONE_POS.x + 22, STONE_POS.y + 12, -1);
              }
              // Khối đá chấn động mạnh!
              screenShake = 0.22;
              observationStone.activeRoot = 'tam_linh_can';
              playTamLinhCanSound();

              // Tạo 3 cột sáng năng lượng Hỏa (đỏ rực), Thổ (vàng đất), Thủy (xanh lam)
              spiritualPillars = [
                { color: '#ff4d4d', glow: 'rgba(255, 77, 77, 0.7)', x: STONE_POS.x - 22, height: 0, maxH: 82 },
                { color: '#e5b94c', glow: 'rgba(229, 185, 76, 0.7)', x: STONE_POS.x, height: 0, maxH: 90 },
                { color: '#4da6ff', glow: 'rgba(77, 166, 255, 0.7)', x: STONE_POS.x + 22, height: 0, maxH: 84 }
              ];

              showResultCard({
                name: 'A Huy',
                root: 'Hỏa — Thổ — Thủy',
                type: 'Tam Linh Căn',
                grade: 'Phẩm chất: Trung đẳng'
              });

              setTimeout(() => {
                startDialogue([
                  {
                    speaker: 'Lục Nham',
                    role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
                    avatar: AVATARS.lucNham,
                    text: 'Ồ? Hỏa, Thổ, Thủy... Tam Linh Căn. Không tệ... Dẫu không phải tư chất thượng thừa, nhưng đã đủ điều kiện bước lên tiên lộ. Nếu chịu khó tu luyện, ngày sau chưa chắc không thể Trúc Cơ.'
                  },
                  {
                    speaker: 'A Huy',
                    role: 'Đệ Tử Nhập Môn · 14 tuổi',
                    avatar: AVATARS.aHuy,
                    text: 'Đa tạ tiên sư! Đệ tử nhất định chăm chỉ tu hành, không phụ kỳ vọng!'
                  },
                  {
                    speaker: 'Lục Nham',
                    role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
                    avatar: AVATARS.lucNham,
                    text: 'Ngươi tạm đứng sang bên phải, chờ khảo nghiệm kết thúc.'
                  },
                  {
                    speaker: 'Trưởng làng',
                    role: 'Bậc Trưởng Bối · 60 tuổi',
                    avatar: AVATARS.truong,
                    text: 'Ha ha ha! Tốt! Tốt lắm! Làng chúng ta cuối cùng cũng xuất hiện một người có tiên duyên!'
                  },
                  {
                    speaker: 'Dân làng',
                    role: 'Quần Chúng',
                    avatar: AVATARS.truong,
                    text: 'A Huy thật có phúc! Cha mẹ nó phen này nở mày nở mặt rồi!',
                    onFinish: () => {
                      closeDialogue();
                      hideResultCard();
                      observationStone.activeRoot = null;
                      spiritualPillars = [];
                      if (typeof AHuy !== 'undefined') {
                        AHuy.takeScenePosition(LUC_NHAM_STAND.x + 46, LUC_NHAM_STAND.y + 4, -1);
                      }
                      cinematicStep = 6; // Tiểu Phàm khảo nghiệm
                      cinematicTimer = 0;
                    }
                  }
                ]);
              }, 2200);
            }
          }
        ]);
      }
    }

    // PHÂN CẢNH 6: TIỂU PHÀM KHẢO NGHIỆM (NGŨ HÀNH TẠP LINH CĂN)
    if (cinematicStep === 6) {
      if (!dialogueActive && cinematicTimer >= 0.5 && !observationStone.activeRoot) {
        startDialogue([
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Người tiếp theo... Tiểu Phàm!'
          },
          {
            speaker: 'Lục Nham',
            role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
            avatar: AVATARS.lucNham,
            text: 'Đặt tay lên.',
            onFinish: () => {
              closeDialogue();
              // Tiểu Phàm bước lên Quan Trắc Thạch
              player.x = STONE_POS.x - 18;
              player.y = STONE_POS.y + 12;
              player.dir = 'up';

              observationStone.activeRoot = 'ngu_tap_can';
              playNguTapCanSound();

              // Tạo các đốm sáng 5 màu chập chờn phân tán
              const colors = ['#f5d76e', '#5cd65c', '#4da6ff', '#ff4d4d', '#cca370'];
              for (let i = 0; i < 28; i++) {
                chaoticMotes.push({
                  x: STONE_POS.x + (Math.random() - 0.5) * 24,
                  y: STONE_POS.y - 12 + (Math.random() - 0.5) * 20,
                  vx: (Math.random() - 0.5) * 35,
                  vy: -15 - Math.random() * 25,
                  color: colors[i % 5],
                  size: 2.2 + Math.random() * 2,
                  alpha: 0.95
                });
              }

              showResultCard({
                name: 'Tiểu Phàm',
                root: 'Kim — Mộc — Thủy — Hỏa — Thổ',
                type: 'Ngũ Hành Tạp Linh Căn',
                grade: 'Phẩm chất: Hạ đẳng'
              });

              questData.spiritualRoot = 'Ngũ Hành Tạp Linh Căn';
              saveState();

              setTimeout(() => {
                startDialogue([
                  {
                    speaker: 'Lục Nham',
                    role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
                    avatar: AVATARS.lucNham,
                    text: 'Kim, Mộc, Thủy, Hỏa, Thổ... Ngũ Hành Tạp Linh Căn. Ngũ hành hỗn tạp, linh khí khó tụ. Với tư chất này, dù có dốc sức tu luyện, tiến cảnh cũng chậm chạp hơn người thường rất nhiều.'
                  },
                  {
                    speaker: 'Lục Nham',
                    role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
                    avatar: AVATARS.lucNham,
                    text: 'Tiên đạo vô vọng...'
                  },
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: 'Tiên sư... chẳng lẽ có linh căn mà vẫn không thể tu tiên sao?'
                  },
                  {
                    speaker: 'Lục Nham',
                    role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
                    avatar: AVATARS.lucNham,
                    text: 'Có linh căn không đồng nghĩa với có tiên duyên. Con đường tu hành tranh đoạt với thiên địa. Kẻ tư chất xuất chúng còn có thể bỏ mạng giữa đường, huống chi là Ngũ Hành Tạp Linh Căn. Ta không nói ngươi tuyệt đối không thể tu luyện. Nhưng với điều kiện của tông môn, không thể thu nhận ngươi.'
                  },
                  {
                    speaker: 'Tiểu Phàm',
                    role: 'Thiếu Niên · 14 tuổi',
                    avatar: AVATARS.tieuPham,
                    text: '... Ta hiểu rồi.',
                    onFinish: () => {
                      closeDialogue();
                      hideResultCard();
                      observationStone.activeRoot = null;
                      // Lùi Tiểu Phàm về vị trí hàng
                      player.x = PHAM_SQUARE_POS.x;
                      player.y = PHAM_SQUARE_POS.y;
                      cinematicStep = 7; // Trưởng làng an ủi
                      cinematicTimer = 0;
                    }
                  }
                ]);
              }, 2200);
            }
          }
        ]);
      }
    }

    // PHÂN CẢNH 7: TRƯỞNG LÀNG AN ỦI
    if (cinematicStep === 7) {
      if (!dialogueActive && cinematicTimer >= 0.5) {
        startDialogue([
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Nhóc con... Haizz, tạo hóa trêu ngươi. Lão phu vốn còn mong ngươi có thể cùng A Huy bước lên tiên lộ.'
          },
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Nhưng ngươi chớ quá đau lòng. Tu tiên hay không cũng chẳng quyết định giá trị một đời người. Dù không được tiên môn thu nhận, ngươi vẫn là đứa trẻ của làng Du Lãm chúng ta.'
          },
          {
            speaker: 'Trưởng làng',
            role: 'Bậc Trưởng Bối · 60 tuổi',
            avatar: AVATARS.truong,
            text: 'Lão phu già rồi, chẳng hiểu hết chuyện tiên đạo. Nhưng lão phu tin rằng, con đường của một người không nên chỉ được định đoạt bởi một khối đá.',
            onFinish: () => {
              closeDialogue();
              cinematicStep = 8; // A Huy khiêu khích
              cinematicTimer = 0;
            }
          }
        ]);
      }
    }

    // PHÂN CẢNH 8: A HUY KHIÊU KHÍCH & 3 LỰA CHỌN PHẢN ỨNG
    if (cinematicStep === 8) {
      if (!dialogueActive && cinematicTimer >= 0.5) {
        if (typeof AHuy !== 'undefined') {
          AHuy.takeScenePosition(player.x + 24, player.y, -1);
        }

        startDialogue([
          {
            speaker: 'A Huy',
            role: 'Đệ Tử Tiên Môn · 14 tuổi',
            avatar: AVATARS.aHuy,
            text: 'Ha ha ha! Tiểu Phàm, ngươi nghe rõ chưa? Ngũ Hành Tạp Linh Căn! Ta còn tưởng ngươi có bản lĩnh gì ghê gớm lắm! Ngày trước ngươi còn dám cãi lời ta. Bây giờ thì sao? Ta sắp trở thành đệ tử tiên môn, còn ngươi vẫn chỉ là một tên phàm nhân trong làng!',
            choices: [
              {
                id: 'defiant',
                label: '“Hừ, hôm nay ngươi hơn ta, chưa chắc cả đời đều hơn ta!”',
                onSelect: () => {
                  questData.rivalryReaction = 'defiant';
                  saveState();
                  startDialogue([
                    {
                      speaker: 'Tiểu Phàm',
                      role: 'Thiếu Niên · 14 tuổi',
                      avatar: AVATARS.tieuPham,
                      text: 'Hừ, hôm nay ngươi hơn ta, chưa chắc cả đời đều hơn ta!'
                    },
                    {
                      speaker: 'A Huy',
                      role: 'Đệ Tử Tiên Môn · 14 tuổi',
                      avatar: AVATARS.aHuy,
                      text: 'Ha ha! Khẩu khí lớn thật! Vậy ta sẽ chờ xem một tên Tạp Linh Căn như ngươi có thể làm nên trò trống gì!'
                    },
                    ...SCRIPT_STOP_BY_LUC
                  ]);
                }
              },
              {
                id: 'lucky',
                label: '“Có gì đáng khoe khoang? Chẳng qua ngươi may mắn hơn ta mà thôi.”',
                onSelect: () => {
                  questData.rivalryReaction = 'lucky';
                  saveState();
                  startDialogue([
                    {
                      speaker: 'Tiểu Phàm',
                      role: 'Thiếu Niên · 14 tuổi',
                      avatar: AVATARS.tieuPham,
                      text: 'Có gì đáng khoe khoang? Chẳng qua ngươi may mắn hơn ta mà thôi.'
                    },
                    {
                      speaker: 'A Huy',
                      role: 'Đệ Tử Tiên Môn · 14 tuổi',
                      avatar: AVATARS.aHuy,
                      text: 'May mắn? Hừ! Trong tiên đạo, tư chất chính là vốn liếng. Ngươi không có, thì đừng trách trời bất công!'
                    },
                    ...SCRIPT_STOP_BY_LUC
                  ]);
                }
              },
              {
                id: 'silent',
                label: '“...” (Im lặng, không đáp)',
                onSelect: () => {
                  questData.rivalryReaction = 'silent';
                  saveState();
                  startDialogue([
                    {
                      speaker: 'Tiểu Phàm',
                      role: 'Thiếu Niên · 14 tuổi',
                      avatar: AVATARS.tieuPham,
                      text: '...'
                    },
                    {
                      speaker: 'A Huy',
                      role: 'Đệ Tử Tiên Môn · 14 tuổi',
                      avatar: AVATARS.aHuy,
                      text: 'Sao thế? Không còn lời nào để nói à? Xem ra ngươi cũng biết thân biết phận rồi!'
                    },
                    ...SCRIPT_STOP_BY_LUC
                  ]);
                }
              }
            ]
          }
        ]);
      }
    }

    // PHÂN CẢNH 10: RỜI LÀNG (PHI KIẾM CẤT CÁNH BAY ĐI)
    if (cinematicStep === 10) {
      const progress = Math.min(1, cinematicTimer / 3.4);
      const ease = Math.pow(progress, 2.8); // Exponential Acceleration

      lucNhamEntity.mode = 'fly_away';
      lucNhamEntity.swordSheathed = false;
      lucNhamEntity.swordScale = 1.6;

      // Phi kiếm cất cánh chở Lục Nham và A Huy bay về góc chân trời
      lucNhamEntity.x = LUC_NHAM_STAND.x + ease * 520;
      lucNhamEntity.y = LUC_NHAM_STAND.y - ease * 440;
      lucNhamEntity.z = ease * 340;

      if (typeof AHuy !== 'undefined') {
        AHuy.takeScenePosition(lucNhamEntity.x - 18, lucNhamEntity.y + 4);
      }

      if (progress >= 1) {
        // Hoàn thành nhiệm vụ!
        cinematicStep = 11;
        completeQuest(player, villagers);
      }
    }
  }

  // PHÂN CẢNH 9: LỤC NHAM NGĂN LẠI VÀ CHUYỂN TIẾP RỜI LÀNG
  const SCRIPT_STOP_BY_LUC = [
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Đủ rồi. Chưa bước chân vào tiên môn đã sinh lòng kiêu ngạo, ngươi tưởng có Tam Linh Căn là có thể tung hoành thiên hạ sao? Tu tiên không chỉ xét tư chất, mà còn phải xét tâm tính. Nếu giữ thái độ này, sớm muộn cũng tự chuốc lấy tai họa.'
    },
    {
      speaker: 'A Huy',
      role: 'Đệ Tử Tiên Môn · 14 tuổi',
      avatar: AVATARS.aHuy,
      text: 'Đệ tử biết sai! Xin tiên sư trách phạt!'
    },
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Biết sai thì sửa. Lần sau chớ tái phạm.'
    },
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Tiểu tử, ngươi cũng không cần quá để tâm. Đại đạo vô tình, nhưng thiên địa rộng lớn, không ai có thể nhìn thấu hết mọi cơ duyên. Chỉ là hôm nay, ta không thể đưa ngươi đi.'
    },
    // PHÂN CẢNH 10
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Khảo nghiệm đến đây kết thúc. Lần tuyển chọn này, chỉ có A Huy đạt yêu cầu nhập môn. A Huy, tiến lên.'
    },
    {
      speaker: 'A Huy',
      role: 'Đệ Tử Tiên Môn · 14 tuổi',
      avatar: AVATARS.aHuy,
      text: 'Có đệ tử!'
    },
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Ngươi hãy theo ta trở về tông môn. Từ hôm nay, ngươi cần đoạn tuyệt sự lười biếng của phàm tục, chuyên tâm tu hành.'
    },
    {
      speaker: 'Trưởng làng',
      role: 'Bậc Trưởng Bối · 60 tuổi',
      avatar: AVATARS.truong,
      text: 'Tiên sư! Đa tạ ngài đã ban cho làng chúng ta cơ duyên này! Còn A Huy, sau này dù tu hành đến cảnh giới nào, cũng chớ quên nơi mình sinh ra.'
    },
    {
      speaker: 'A Huy',
      role: 'Đệ Tử Tiên Môn · 14 tuổi',
      avatar: AVATARS.aHuy,
      text: 'Trưởng làng cứ yên tâm! Ngày sau ta tu luyện thành công, nhất định sẽ trở về!'
    },
    {
      speaker: 'A Huy',
      role: 'Đệ Tử Tiên Môn · 14 tuổi',
      avatar: AVATARS.aHuy,
      text: 'Tiểu Phàm, bảo trọng nhé. Lần sau gặp lại, chỉ e ngươi phải gọi ta một tiếng tiên sư rồi! Ha ha!'
    },
    {
      speaker: 'Lục Nham',
      role: 'Tiên Môn Đệ Tử · Trúc Cơ Sơ Kỳ',
      avatar: AVATARS.lucNham,
      text: 'Lên đây. Đứng vững, chớ vọng động.',
      onFinish: () => {
        closeDialogue();
        observationStone.visible = false;
        playSwordCrySound();
        cinematicStep = 10; // Bắt đầu cất cánh bay đi
        cinematicTimer = 0;
      }
    }
  ];

  function completeQuest(player, villagers) {
    questData.state = STATES.COMPLETED;
    questData.completed = true;
    saveState();

    if (typeof AHuy !== 'undefined') {
      AHuy.hidden = true;
    }
    lucNhamEntity.visible = false;

    // Trưởng làng tiễn biệt
    startDialogue([
      {
        speaker: 'Trưởng làng',
        role: 'Bậc Trưởng Bối · 60 tuổi',
        avatar: AVATARS.truong,
        text: 'Haizz... đi rồi. Nhóc con, về thôi. Đường đời còn dài. Hôm nay không có tiên duyên, chưa chắc ngày mai đã không có cơ hội khác. Chỉ cần ngươi còn sống, còn bước tiếp, thì mọi chuyện vẫn chưa phải kết thúc.',
        onFinish: () => {
          closeDialogue();
          showToast(
            'Nhiệm vụ hoàn thành: Tiên Duyên Khởi Đầu!\nTiểu Phàm xác định tư chất: Ngũ Hành Tạp Linh Căn.\nA Huy đã theo Lục Nham bước lên tiên lộ.'
          );
          // Cho dân làng giải tán trở lại sinh hoạt
          if (villagers && villagers.list) {
            villagers.list.forEach((n) => {
              n.pause = 1.0;
            });
          }
        }
      }
    ]);
  }

  // -------------------------------------------------------------
  // DRAWING HỆ THỐNG VẬT THỂ & CINEMATIC TRONG WORLD CANVAS
  // -------------------------------------------------------------
  function drawWorld(ctx, t) {
    // 1. Vẽ dấu chấm than (!) trên đầu Trưởng làng khi có nhiệm vụ
    if (cachedChief && !cachedChief.hidden) {
      const showExclamation =
        questData.state === STATES.CHIEF_APPROACHING ||
        questData.state === STATES.CONSIDERING ||
        questData.state === STATES.DECLINED ||
        questData.state === STATES.SELECTION_READY;

      if (showExclamation) {
        ctx.save();
        const x = Math.round(cachedChief.x);
        const bounce = Math.sin(t * 4.5) * 3.5;
        const y = Math.round(cachedChief.y - 88 + bounce);

        const glow = ctx.createRadialGradient(x, y, 2, x, y, 16);
        glow.addColorStop(0, 'rgba(255, 225, 90, 0.7)');
        glow.addColorStop(0.6, 'rgba(218, 165, 32, 0.35)');
        glow.addColorStop(1, 'rgba(218, 165, 32, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 10.5, 0, Math.PI * 2);
        ctx.fillStyle = '#b8860b';
        ctx.fill();
        ctx.strokeStyle = '#fff2a8';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = '#142a1f';
        ctx.fill();

        ctx.font = 'bold 12px "Noto Serif", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffe266';
        ctx.fillText('!', x, y);
        ctx.restore();
      }

      // 1b. Bong bóng lời gọi khi Trưởng làng chủ động tìm Tiểu Phàm
      if (
        questData.state === STATES.CHIEF_APPROACHING &&
        questData.approachDelay <= 0 &&
        !dialogueActive &&
        cachedChief.spokenLine
      ) {
        ctx.save();
        ctx.font = 'italic 10.5px "Noto Serif", Georgia, serif';
        const text = cachedChief.spokenLine;
        const bw = ctx.measureText(text).width + 16;
        const cx = Math.round(cachedChief.x);
        const cy = Math.round(cachedChief.y - 105);
        ctx.fillStyle = '#13281fe8';
        ctx.fillRect(cx - bw / 2, cy - 8, bw, 18);
        ctx.strokeStyle = '#d6c384cc';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - bw / 2, cy - 8, bw, 18);
        ctx.fillStyle = '#f7e9bc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, cx, cy + 1);
        ctx.restore();
      }
    }

    // 2. Vẽ vòng sóng xung kích khi tiếp đất
    if (shockwave.active && shockwave.alpha > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(shockwave.x, shockwave.y, shockwave.radius, shockwave.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(125, 249, 255, ${shockwave.alpha * 0.8})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(shockwave.x, shockwave.y, shockwave.radius * 0.65, shockwave.radius * 0.3, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(229, 255, 240, ${shockwave.alpha * 0.6})`;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Vẽ bụi đất nhẹ
    if (dustParticles.length) {
      ctx.save();
      dustParticles.forEach((dp) => {
        ctx.fillStyle = `rgba(212, 190, 145, ${dp.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 4. Vẽ Quan Trắc Thạch & Pháp Trận Phù Văn
    if (observationStone.visible && observationStone.alpha > 0) {
      ctx.save();
      const sx = STONE_POS.x;
      const sy = STONE_POS.y;

      // Vòng tròn trận pháp phù văn xoay tròn trên mặt đất
      ctx.save();
      ctx.translate(sx, sy + 18);
      ctx.scale(1, 0.45);
      ctx.rotate(t * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, 36 * observationStone.scale, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 235, 190, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.restore();

      // Bệ đá Quan Trắc Thạch (Hình lăng trụ lục giác)
      ctx.translate(sx, sy);
      ctx.scale(observationStone.scale, observationStone.scale);

      // Thân đá xám đen bóng cổ kính
      ctx.fillStyle = '#202927';
      ctx.strokeStyle = '#62857a';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-16, 12);
      ctx.lineTo(-12, -28);
      ctx.lineTo(0, -38);
      ctx.lineTo(12, -28);
      ctx.lineTo(16, 12);
      ctx.lineTo(0, 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Đường vân phù văn cổ trên thân đá
      ctx.strokeStyle = observationStone.glowColor || 'rgba(140, 220, 190, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, 8);
      ctx.lineTo(-4, -14);
      ctx.lineTo(0, -22);
      ctx.lineTo(4, -14);
      ctx.lineTo(6, 8);
      ctx.stroke();

      // Hiệu ứng 5 màu linh quang khi Lục Nham triệu hồi
      if (observationStone.activeRoot === 'five_intro') {
        const cArr = ['#f5d76e', '#5cd65c', '#4da6ff', '#ff4d4d', '#cca370'];
        const activeC = cArr[Math.floor((t * 5) % 5)];
        ctx.shadowColor = activeC;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = activeC;
        ctx.stroke();
      }

      ctx.restore();
    }

    // 5. Vẽ 3 Cột Sáng Tam Linh Căn của A Huy
    if (spiritualPillars.length) {
      ctx.save();
      spiritualPillars.forEach((p) => {
        const py = STONE_POS.y - 10;
        const grad = ctx.createLinearGradient(p.x, py, p.x, py - p.height);
        grad.addColorStop(0, p.glow);
        grad.addColorStop(0.5, p.color);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(p.x - 7, py - p.height, 14, p.height);

        // Hạt tinh hoa bay lên
        for (let k = 0; k < 3; k++) {
          const sparkY = py - ((t * 40 + k * 28) % p.height);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(t * 8 + k) * 5, sparkY, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 6. Vẽ các đốm sáng Ngũ Hành Tạp Linh Căn chập chờn của Tiểu Phàm
    if (chaoticMotes.length) {
      ctx.save();
      chaoticMotes.forEach((m) => {
        ctx.fillStyle = m.color;
        ctx.globalAlpha = Math.max(0, m.alpha);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }

    // 7. Vẽ Vệt Kiếm Quang (Blade Ribbon Trail)
    if (swordTrail.length > 1) {
      ctx.save();
      for (let i = 0; i < swordTrail.length - 1; i++) {
        const p1 = swordTrail[i];
        const p2 = swordTrail[i + 1];
        const w = (1 - i / swordTrail.length) * 8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(125, 249, 255, ${p1.alpha * (1 - i / swordTrail.length)})`;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. Vẽ Lục Nham & Phi Kiếm Bạc Xanh
    if (lucNhamEntity.visible) {
      drawLucNham(ctx, t);
    }
  }

  function drawLucNham(ctx, t) {
    ctx.save();
    const lx = lucNhamEntity.x;
    const ly = lucNhamEntity.y - (lucNhamEntity.z || 0);

    // Bóng phi kiếm trên mặt đất
    if (lucNhamEntity.z > 0) {
      ctx.save();
      ctx.translate(lucNhamEntity.x, lucNhamEntity.y + 12);
      ctx.scale(1, 0.4);
      ctx.beginPath();
      const shadowAlpha = Math.max(0.12, 0.5 - lucNhamEntity.z / 600);
      ctx.fillStyle = `rgba(15, 30, 22, ${shadowAlpha})`;
      ctx.arc(0, 0, 24 * (1 - lucNhamEntity.z / 800), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.translate(lx, ly);

    // Phi kiếm bạc xanh (nếu chưa thu vào tay áo)
    if (!lucNhamEntity.swordSheathed) {
      ctx.save();
      const sScale = lucNhamEntity.swordScale || 1;
      ctx.scale(sScale, sScale);

      // Kiếm quang phát sáng
      ctx.shadowColor = '#50e3c2';
      ctx.shadowBlur = 14;

      // Lưỡi kiếm bạc ánh xanh
      ctx.fillStyle = '#e8f7f5';
      ctx.strokeStyle = '#4ee1a0';
      ctx.lineWidth = 1.4;

      ctx.beginPath();
      ctx.moveTo(-28, 22);
      ctx.lineTo(28, 22);
      ctx.lineTo(36, 24);
      ctx.lineTo(0, 28);
      ctx.lineTo(-36, 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cán kiếm & bảo châu
      ctx.fillStyle = '#2c5a4d';
      ctx.fillRect(-5, 22, 10, 4);
      ctx.fillStyle = '#a8ffeb';
      ctx.beginPath();
      ctx.arc(0, 24, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Màng hào quang linh khí hộ thể (khi bay)
    if (lucNhamEntity.mode === 'fly_in' || lucNhamEntity.mode === 'fly_away') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, 32, 44, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 245, 220, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.restore();
    }

    // The flying blade is at his feet. His personal sword stays strapped diagonally to his back.
    const wind = Math.sin(t * 3.4) * (lucNhamEntity.z > 0 ? 3.2 : 1.3);
    const panel = (points, fill, edge) => {
      ctx.beginPath();
      points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.closePath();ctx.fillStyle = fill;ctx.fill();
      if (edge) {ctx.lineWidth=1;ctx.strokeStyle=edge;ctx.stroke();}
    };
    ctx.save();ctx.translate(-1,-20);ctx.rotate(.57);
    ctx.fillStyle='#233b38';ctx.fillRect(-3,-27,6,62);
    ctx.fillStyle='#a9ac86';ctx.fillRect(-3,31,6,4);
    ctx.fillStyle='#677e70';ctx.fillRect(-1,-25,1.5,56);
    ctx.fillStyle='#d2b77c';ctx.fillRect(-7,-28,14,3);
    ctx.fillStyle='#354d49';ctx.fillRect(-2,-42,4,14);
    ctx.fillStyle='#dbcb9c';for(let i=0;i<3;i++)ctx.fillRect(-2,-39+i*4,4,1);
    ctx.fillRect(-3,-44,6,3);ctx.restore();
    // Loose layered robes, cloud-pattern brocade and a white cross collar.
    panel([[-9,-16],[9,-16],[16+wind,18],[7+wind,21],[-1,19],[-14+wind,21]],'#84927c','#3e5149');
    panel([[-5,-16],[4,-15],[8+wind,17],[-3,19],[-8,16]],'#ede8d8');
    panel([[5,-17],[11,-16],[15+wind,18],[10+wind,20]],'#60756a');
    panel([[-9,-17],[-13,-16],[-19+wind,4],[-12+wind,8],[-4,-8]],'#98a48b','#52655a');
    panel([[11,-17],[15,-14],[18+wind,0],[12,4],[7,-6]],'#9eac93','#52655a');
    ctx.fillStyle='#eff0dd';ctx.fillRect(-16+wind,4,7,2);ctx.fillRect(12+wind,0,6,2);
    // Use the supplied transparent portrait for the head, hairpin and familiar shoulders.
    if (typeof avatarLuc !== 'undefined' && avatarLuc.complete && avatarLuc.naturalWidth) {
      ctx.drawImage(avatarLuc,-17,-51,34,34);
    }
    panel([[-8,-18],[1,-12],[8,-18],[9,-16],[0,-8],[-9,-15]],'#f1edde');
    panel([[-9,-9],[10,-9],[10,-5],[-10,-5]],'#455f56');
    ctx.fillStyle='#b9a97e';ctx.fillRect(-1,-9,4,3);
    ctx.strokeStyle='#d4d6bb';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(10,3);ctx.bezierCurveTo(19,6,8,13,7,9);ctx.bezierCurveTo(6,5,14,8,10,10);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-7,-16);ctx.lineTo(7,-6);ctx.strokeStyle='#857857';ctx.lineWidth=2;ctx.stroke();
    ctx.restore();
  }

  // -------------------------------------------------------------
  // TƯƠNG TÁC
  // -------------------------------------------------------------
  function isNearChief(player, dist = 56) {
    if (!cachedChief || cachedChief.hidden) return false;
    return Math.hypot(cachedChief.x - player.x, cachedChief.y - player.y) <= dist;
  }

  function talk(player) {
    if (!cachedChief) return false;
    if (dialogueActive) return true;

    cachedChief.dir = player.x > cachedChief.x ? 1 : -1;
    cachedChief.pause = 4.0;

    if (questData.state === STATES.CHIEF_APPROACHING) {
      questData.approachDelay = 0;
      saveState();
      startDialogue(SCRIPT_OPENING);
      return true;
    }

    const script = getRevisitScript();
    startDialogue(script);
    return true;
  }

  function interact(player) {
    if (isNearChief(player, 56)) {
      return talk(player);
    }
    return false;
  }

  // -------------------------------------------------------------
  // BẢNG NHIỆM VỤ DƯỚI AVATAR NGƯỜI CHƠI (PHƯƠNG ÁN A - CANVAS 2D)
  // -------------------------------------------------------------
  function isQuestBoardVisible() {
    if (dialogueActive) return false;
    // Thanh nhiệm vụ ẩn đi, chỉ hiển thị khi người chơi đồng ý kiểm tra linh căn
    const s = questData.state;
    return (
      s === STATES.REGISTERED ||
      s === STATES.AWAITING_SELECTION ||
      s === STATES.SELECTION_READY ||
      s === STATES.CINEMATIC_ACTIVE ||
      s === STATES.COMPLETED
    );
  }

  function getQuestHUDInfo() {
    const currentDay = typeof Villagers !== 'undefined' && Villagers.day ? Villagers.day : 1;

    if (questData.state === STATES.SELECTION_READY || (currentDay >= 3 && questData.state !== STATES.COMPLETED && questData.state !== STATES.CINEMATIC_ACTIVE)) {
      return {
        title: 'Tiên Nhân Giáng Lâm',
        tag: 'Đại Sự',
        tagColor: '#ef4444',
        objective: 'Đến Quảng Trường Làng ngay!',
        status: '⚡ Cấp báo',
        statusColor: '#ffe066',
        urgent: true,
        hint: 'Tiên nhân tiên môn sắp giáng thế tại sân làng. Mau tới xem khảo nghiệm linh căn!'
      };
    }

    if (questData.state === STATES.CINEMATIC_ACTIVE) {
      return {
        title: 'Khảo Nghiệm Linh Căn',
        tag: 'Kỳ Duyên',
        tagColor: '#38bdf8',
        objective: 'Chứng kiến tiên nhân hạ phàm',
        status: 'Đang diễn ra',
        statusColor: '#67e8f9',
        urgent: false,
        hint: 'Khảo nghiệm linh căn tại Quan Trắc Thạch.'
      };
    }

    if (questData.state === STATES.COMPLETED) {
      const rootName = questData.spiritualRoot ? questData.spiritualRoot.name : 'Ngũ Hành Tạp Linh Căn';
      return {
        title: 'Tiên Duyên Đã Định',
        tag: 'Xong',
        tagColor: '#eab308',
        objective: rootName,
        status: '✓ Xong',
        statusColor: '#a3e635',
        urgent: false,
        hint: 'Đã hoàn thành khảo nghiệm tiên môn. Tạp linh căn khó bước lên tiên lộ, nhưng tiền đồ còn dài.'
      };
    }

    if (questData.state === STATES.REGISTERED || questData.state === STATES.AWAITING_SELECTION) {
      const regDay = questData.registeredDay || 1;
      const targetDay = regDay + 2;
      const daysLeft = Math.max(0, targetDay - currentDay);
      const dayText = daysLeft === 0 ? 'Hôm nay giáng lâm' : `Còn ${daysLeft} ngày (Ngày ${targetDay})`;
      return {
        title: 'Tiên Duyên Khởi Đầu',
        tag: 'Chờ Đợi',
        tagColor: '#22c55e',
        objective: `Chờ tuyển chọn · ${dayText}`,
        status: `Ngày ${currentDay}`,
        statusColor: '#86efac',
        urgent: false,
        hint: 'Trưởng làng đã ghi tên ngươi vào danh sách. Hãy rèn luyện thể chất và chờ tiên nhân đến làng.'
      };
    }

    if (questData.state === STATES.CONSIDERING) {
      return {
        title: 'Tiên Duyên Khởi Đầu',
        tag: 'Cân Nhắc',
        tagColor: '#f59e0b',
        objective: 'Gặp Trưởng Làng để đổi ý',
        status: 'Suy nghĩ',
        statusColor: '#fde047',
        urgent: false,
        hint: 'Ngươi vẫn còn thời gian suy nghĩ. Hãy tìm Trưởng Làng nếu muốn ghi tên tham dự tuyển chọn.'
      };
    }

    if (questData.state === STATES.DECLINED) {
      return {
        title: 'Tiên Duyên Khởi Đầu',
        tag: 'Từ Chối',
        tagColor: '#94a3b8',
        objective: 'Có thể đổi ý với Trưởng Làng',
        status: 'An yên',
        statusColor: '#cbd5e1',
        urgent: false,
        hint: 'Ngươi đã chọn sống đời bình yên. Trước khi tiên nhân rời làng, ngươi vẫn có thể đổi ý.'
      };
    }

    // STATES.CHIEF_APPROACHING sau khi đã tiếp xúc/gặp Trưởng Làng
    return {
      title: 'Tiên Duyên Khởi Đầu',
      tag: 'Tiếp Nhận',
      tagColor: '#eab308',
      objective: 'Trò chuyện cùng Trưởng Làng',
      status: '[!] Đang chờ',
      statusColor: '#fef08a',
      urgent: false,
      hint: 'Trưởng làng có tin đại sự muốn báo cho thiếu niên trong làng.'
    };
  }

  function drawHUD(ctx, p, W, H, t, dt = 0.016) {
    if (!ctx) return;
    if (questDetailTimer > 0) questDetailTimer = Math.max(0, questDetailTimer - dt);

    if (!isQuestBoardVisible()) return;

    const info = getQuestHUDInfo();
    if (!info) return;

    ctx.save();
    const hx = 12, hy = 12;
    const isNarrow = W < 430;
    const barW = isNarrow ? 116 : 132;
    const panelW = barW + 58;
    const qx = hx;
    const qy = hy + 50 + 6; // y = 68
    const qw = panelW;
    const qh = 42;

    // 1. Nền ngọc bích sẫm đồng nhất với Avatar Plaque
    ctx.beginPath();
    ctx.roundRect(qx, qy, qw, qh, 6);
    ctx.fillStyle = info.urgent ? '#162b20f2' : '#0e231be8';
    ctx.fill();

    // Viền kim loại hoàng đồng (nhấp nháy vàng khi có sự kiện giáng lâm)
    let strokeCol = '#bfa35bcc';
    if (info.urgent) {
      const pulse = 0.6 + 0.4 * Math.sin(t * 6);
      strokeCol = `rgba(255, 224, 102, ${pulse})`;
    }
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = info.urgent ? 1.5 : 1.1;
    ctx.stroke();

    // Viền ngọc trong tinh tế
    ctx.beginPath();
    ctx.roundRect(qx + 2, qy + 2, qw - 4, qh - 4, 4);
    ctx.strokeStyle = 'rgba(50, 88, 68, 0.45)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 4 góc đinh tán đồng
    ctx.fillStyle = '#d6c07a';
    for (const [rx, ry] of [
      [qx + 4, qy + 4],
      [qx + qw - 4, qy + 4],
      [qx + 4, qy + qh - 4],
      [qx + qw - 4, qy + qh - 4]
    ]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Huy hiệu biểu tượng: Thẻ ngọc 「務」 (Nhiệm vụ)
    const iconX = qx + 8;
    const iconY = qy + 8;
    const iconS = 15;
    ctx.fillStyle = '#22150a';
    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconS, iconS, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#d6b567';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 8.5px "Noto Serif", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe899';
    ctx.fillText('務', iconX + iconS / 2, iconY + iconS / 2 + 0.5);

    // Đèn ngọc báo trạng thái nhỏ
    ctx.beginPath();
    ctx.arc(iconX + iconS - 1.5, iconY + iconS - 1.5, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = info.statusColor || '#86efac';
    ctx.fill();
    ctx.strokeStyle = '#11251c';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 3. Dòng 1: Tiêu đề nhiệm vụ & Tag phân loại
    const textX = iconX + iconS + 6;
    const row1Y = qy + 13;

    ctx.font = 'bold 9.5px "Noto Serif", Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000bb';
    ctx.fillText(info.title, textX + 0.5, row1Y + 0.5);
    ctx.fillStyle = info.urgent ? '#fff3ba' : '#fef2d0';
    ctx.fillText(info.title, textX, row1Y);

    // Tag trạng thái nhỏ góc phải dòng 1
    ctx.font = 'bold 7px system-ui, sans-serif';
    const tagText = info.tag;
    const tagW = ctx.measureText(tagText).width + 6;
    const tagX = qx + qw - tagW - 6;
    ctx.fillStyle = 'rgba(20, 48, 36, 0.75)';
    ctx.beginPath();
    ctx.roundRect(tagX, row1Y - 6, tagW, 11, 2);
    ctx.fill();
    ctx.strokeStyle = info.tagColor || '#d4ba75';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = info.tagColor || '#d4ba75';
    ctx.fillText(tagText, tagX + tagW / 2, row1Y);

    // 4. Dòng 2: Mục tiêu nhiệm vụ
    const row2Y = qy + 28;
    ctx.font = '8.5px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    let objText = info.objective;
    const maxObjW = qw - (textX - qx) - 8;
    while (ctx.measureText(objText).width > maxObjW && objText.length > 5) {
      objText = objText.slice(0, -2) + '…';
    }

    ctx.fillStyle = '#000000aa';
    ctx.fillText(objText, textX + 0.5, row2Y + 0.5);
    ctx.fillStyle = info.urgent ? '#ffd666' : '#9dd5b8';
    ctx.fillText(objText, textX, row2Y);

    // 5. Thẻ chi tiết khi người chơi chạm/click vào (Quest Detail Popover)
    if (questDetailTimer > 0) {
      const popW = Math.min(270, W - 24);
      const popX = qx;
      const popY = qy + qh + 6;
      const lines = [
        `[Nhiệm vụ] ${info.title}`,
        `• Mục tiêu: ${info.objective}`,
        `• ${info.hint}`
      ];
      const popH = lines.length * 15 + 14;

      ctx.beginPath();
      ctx.roundRect(popX, popY, popW, popH, 5);
      ctx.fillStyle = '#0b1d16f6';
      ctx.fill();
      ctx.strokeStyle = '#d6b567';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = 'bold 9.5px "Noto Serif", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffeaa7';
      ctx.fillText(lines[0], popX + 8, popY + 12);

      ctx.font = '9px system-ui, sans-serif';
      ctx.fillStyle = '#d1e7dd';
      ctx.fillText(lines[1], popX + 8, popY + 28);
      ctx.fillStyle = '#a3c2b2';
      ctx.fillText(lines[2], popX + 8, popY + 43);
    }

    ctx.restore();
  }

  function handleClickHUD(cx, cy, W, p) {
    if (!isQuestBoardVisible()) return false;
    const hx = 12, hy = 12;
    const isNarrow = W < 430;
    const barW = isNarrow ? 116 : 132;
    const panelW = barW + 58;
    const qx = hx;
    const qy = hy + 50 + 6;
    const qw = panelW;
    const qh = 42;

    if (cx >= qx && cx <= qx + qw && cy >= qy && cy <= qy + qh) {
      questDetailTimer = questDetailTimer > 0 ? 0 : 4.5;
      return true;
    }
    return false;
  }

  return {
    STATES,
    AVATARS,
    init,
    update,
    drawWorld,
    drawHUD,
    handleClickHUD,
    isQuestBoardVisible,
    getQuestHUDInfo,
    talk,
    interact,
    isNearChief,
    isDialogueActive: () => dialogueActive,
    isCinematicActive: () => questData.state === STATES.CINEMATIC_ACTIVE,
    isInputLocked: () => dialogueActive || questData.state === STATES.CINEMATIC_ACTIVE,
    isChiefControlled: () => {
      return (
        questData.state === STATES.CHIEF_APPROACHING ||
        questData.state === STATES.CINEMATIC_ACTIVE ||
        questData.state === STATES.SELECTION_READY ||
        dialogueActive
      );
    },
    getCameraOffset: () => cameraOffset,
    getState: () => questData.state,
    getData: () => ({ ...questData }),
    get state() {
      return questData.state;
    },
    set state(v) {
      questData.state = v;
      saveState();
    },
    get registeredDay() {
      return questData.registeredDay;
    },
    set registeredDay(v) {
      questData.registeredDay = v;
      saveState();
    },
    get approachDelay() {
      return questData.approachDelay;
    },
    set approachDelay(v) {
      questData.approachDelay = v;
      saveState();
    },
    resetState: () => {
      questData = {
        version: 1,
        state: STATES.CHIEF_APPROACHING,
        approachDelay: 30.0,
        hasMetChief: false,
        registeredDay: null,
        choice: null,
        history: [],
        spiritualRoot: null,
        rivalryReaction: null,
        completed: false
      };
      saveState();
      closeDialogue();
      hideResultCard();
      cinematicStep = 0;
      questDetailTimer = 0;
      if (cachedChief) {
        cachedChief.x = 480;
        cachedChief.y = 350;
        cachedChief.home = [480, 350];
        cachedChief.dir = -1;
        cachedChief.route = [];
        cachedChief.walk = 0;
        cachedChief.pause = 0;
        cachedChief.spokenLine = '';
      }
    },
    startDialogue,
    closeDialogue,
    showToast,
    get cachedChief() {
      return cachedChief;
    }
  };
})();
