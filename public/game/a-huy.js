'use strict';

// NPC A Huy — Thiếu niên 14 tuổi cùng trang lứa với Tiểu Phàm
// Ngoại hình: Mập mạp, khuôn mặt tròn phúng phính, tính cách thích khoe khoang, hay trêu đùa và so tài với Tiểu Phàm.
const AHuy = (() => {
  const state = {
    id: 'ahuy',
    name: 'A Huy',
    title: 'Bạn cùng tuổi · 14 tuổi',
    x: 295,
    y: 335,
    dir: -1,
    walk: 0,
    hp: 100,
    maxHp: 100,
    hitTimer: 0,
    hitCount: 0,
    tauntTimer: 2.0,
    spokenLine: 'Tiểu Phàm! Lại đây so tài quyền pháp với ta!',
    pause: 3.5,
    hidden: false,
    route: [],
    waypoints: [
      [275, 330],
      [325, 340],
      [360, 365],
      [300, 375]
    ],
    wpIndex: 0,
    roamWait: 4.0
  };

  const TAUNTS = [
    'Tiểu Phàm! Lại đây so tài quyền cước xem ai giỏi hơn nào!',
    'Nhìn áo gấm mới của ta xem, lộng lẫy hơn áo của ngươi nhiều!',
    'Hôm nay mẹ ta làm bánh bao thịt thơm phức, ngươi có muốn nếm thử không?',
    'Bổn thiếu gia vừa luyện xong thế Thiết Bố Sam, đấm thử xem có đau không!',
    'Cùng 14 tuổi mà bước đi của ngươi chậm quá, chạy thi với ta không?',
    'Hê hê! Nắm đấm của ngươi luyện tới đâu rồi? Đỡ một chiêu của ta xem!'
  ];

  const HIT_REACTIONS = [
    'Úi chà! Cú đấm có lực đấy, nhưng mỡ ta dày không xi nhê!',
    'Hay lắm Tiểu Phàm! Đỡ tiếp một chiêu xem nào!',
    'Ai da! Nắm đấm cứng thật, tay ngươi làm bằng đá à?',
    'Được lắm, chờ ta ăn thêm cái bánh bao rồi so tài tiếp!'
  ];

  function shade(col, amt) {
    let num = parseInt(col.replace('#', ''), 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + amt));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    let b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function poly(ctx, pts, fill, stroke = '#241f1a', w = 1.2) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = w;
      ctx.stroke();
    }
  }

  function line(ctx, pts, color, w = 1.2) {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.stroke();
  }

  function takeScenePosition(x, y, direction = state.dir) {
    state.x = x;
    state.y = y;
    state.dir = direction;
    state.walk = 0;
    state.route.length = 0;
  }

  function update(dt, t, player) {
    if (typeof Quest1 !== 'undefined' &&
        ['selection_ready', 'cinematic_active'].includes(Quest1.getState())) return;
    if (state.hidden) return;

    if (state.hitTimer > 0) {
      state.hitTimer = Math.max(0, state.hitTimer - dt);
    }
    if (state.pause > 0) {
      state.pause = Math.max(0, state.pause - dt);
    }

    // Slowly regenerate HP when resting
    if (state.hp < state.maxHp && state.hitTimer <= 0) {
      state.hp = Math.min(state.maxHp, state.hp + dt * 4);
    }

    // Proximity logic with Tiểu Phàm
    const distToPlayer = Math.hypot(player.x - state.x, player.y - state.y);

    if (distToPlayer < 75) {
      // Turn to face Tiểu Phàm
      state.dir = player.x > state.x ? 1 : -1;

      // Periodic friendly taunts/teasing
      state.tauntTimer -= dt;
      if (state.tauntTimer <= 0) {
        state.tauntTimer = 5.5 + Math.random() * 3.5;
        state.spokenLine = TAUNTS[Math.floor(Math.random() * TAUNTS.length)];
        state.pause = 3.2;
      }
    } else {
      // Roaming routine around the village lane
      state.roamWait -= dt;
      if (state.roamWait <= 0 && state.hitTimer <= 0) {
        const target = state.waypoints[state.wpIndex];
        const dx = target[0] - state.x;
        const dy = target[1] - state.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 3) {
          const spd = 36 * dt;
          state.x += (dx / dist) * Math.min(dist, spd);
          state.y += (dy / dist) * Math.min(dist, spd);
          state.dir = dx >= 0 ? 1 : -1;
          state.walk += dt * 8;
        } else {
          state.walk = 0;
          state.wpIndex = (state.wpIndex + 1) % state.waypoints.length;
          state.roamWait = 3.5 + Math.random() * 4.0;
        }
      } else {
        state.walk = 0;
      }
    }
  }

  function draw(ctx, t) {
    if (state.hidden) return;

    const moving = state.walk > 0;
    const step = moving ? Math.sin(state.walk) * 2.8 : 0;
    const isHit = state.hitTimer > 0;
    const jiggle = isHit ? Math.sin(t * 30) * 2.5 : Math.sin(state.walk * 2) * 0.8;
    const bob = (moving ? Math.abs(Math.sin(state.walk)) * 1.6 : Math.sin(t * 2) * 0.4) + (isHit ? -2 : 0);

    ctx.save();
    ctx.translate(Math.round(state.x), Math.round(state.y));

    // Shadow on ground (wider due to chubby build)
    ctx.fillStyle = '#17352955';
    ctx.beginPath();
    ctx.ellipse(0, -1, 14, 5.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.scale(state.dir, 1);
    ctx.translate(0, -bob);

    const goldSilk = '#cda13c';
    const goldHi = '#f0cf74';
    const goldDark = '#8f6c1e';
    const jadeTeal = '#2d6858';
    const skin = '#ebd0b7';
    const skinHi = '#f8e5d3';
    const skinRosy = '#e8a592';
    const ink = '#241f1a';

    // 1. Far arm (chubby, swinging or resting on plump hip)
    ctx.save();
    ctx.translate(5, -42);
    ctx.rotate(moving ? -Math.sin(state.walk) * 0.35 : 0.1);
    poly(ctx, [[-3, 0], [4, 0], [5.5, 12], [3, 17], [-3, 16], [-4, 6]], goldDark);
    poly(ctx, [[-2, 16], [3, 16], [3.5, 20], [0, 22], [-2.5, 20]], skin);
    ctx.restore();

    // 2. Chubby legs & embroidered slippers
    for (const [lx, st] of [[-4, -step * 0.75], [3, step * 0.75]]) {
      ctx.save();
      ctx.translate(lx, -6 + st);
      // Plump trousers
      poly(ctx, [[-4.5, -10], [4.5, -10], [4.5, -3], [-4.5, -3]], jadeTeal);
      // Silk slippers with upturned tips
      poly(ctx, [[-4.5, -3], [4.5, -3], [6.5, 1], [6.5, 4], [-5, 4], [-5, 0]], '#612a28');
      line(ctx, [[-4, 3.2], [6, 3.2]], '#e0bb53', 1.3);
      ctx.restore();
    }

    // 3. Lower tunic stretched across round belly
    poly(ctx, [
      [-9, -30],
      [9 + jiggle * 0.3, -30],
      [11 + step * 0.15, -10],
      [-10, -10],
      [-10, -20]
    ], goldDark);
    poly(ctx, [
      [-8, -29],
      [2, -29],
      [1, -11],
      [-9, -11]
    ], goldSilk, null);
    poly(ctx, [
      [1, -29],
      [8.5, -29],
      [10.2, -11],
      [1, -11]
    ], goldHi, null);

    // 4. Upper torso & broad round belly (bụng bự)
    ctx.beginPath();
    ctx.ellipse(1.5, -36, 10.5 + jiggle * 0.4, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = goldSilk;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Tunic highlight on protruding belly
    ctx.beginPath();
    ctx.ellipse(3, -36, 6, 7.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = goldHi + '66';
    ctx.fill();

    // Wide leather belt with decorative jade buckle over the belly
    poly(ctx, [[-8.5, -31], [9.5, -31], [9.5, -26], [-8.5, -26]], '#4a3220');
    line(ctx, [[-8, -28.5], [9, -28.5]], '#c9a84d', 1.2);
    // Jade pendant
    ctx.beginPath();
    ctx.arc(2, -28.5, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = '#65a88c';
    ctx.fill();
    ctx.strokeStyle = '#c9a84d';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Hanging tassel
    line(ctx, [[2, -25], [2, -19]], '#b83b32', 1.6);

    // Crossed brocade collar
    poly(ctx, [[-2, -47], [5, -47], [7, -41], [3, -35], [-2, -39]], '#e8d59b');
    line(ctx, [[-1, -47], [4, -36]], '#8f6c1e', 1.3);

    // 5. Chubby round face & cheeks (mặt mập, má phúng phính)
    ctx.save();
    ctx.translate(1, -48);

    // Short plump neck
    poly(ctx, [[-3.5, 0], [3.5, 0], [4, 5], [-4, 5]], skin);

    // Round chubby head base
    ctx.beginPath();
    ctx.ellipse(2, -8.5, 8.8, 9.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Chubby double chin fold
    ctx.beginPath();
    ctx.arc(2, -1, 5, 0.2, Math.PI - 0.2);
    ctx.strokeStyle = '#cfa082';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Rosy plump cheek
    ctx.beginPath();
    ctx.ellipse(5, -6, 3.2, 2.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = skinRosy + '88';
    ctx.fill();

    // Cocky, playful expression
    if (isHit) {
      // Surprised / dizzy eyes when hit
      line(ctx, [[2, -11], [5, -11]], '#241f1a', 1.8);
      ctx.fillStyle = '#241f1a';
      ctx.beginPath();
      ctx.arc(5, -9, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // O-shaped mouth
      ctx.beginPath();
      ctx.arc(5, -3, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#9e463a';
      ctx.fill();
    } else {
      // Cocky slanted eye & raised eyebrow
      line(ctx, [[1, -12], [6, -13]], '#362b22', 1.6); // Eyebrow cocked up
      // Narrow sly/smug eye
      ctx.fillStyle = '#241f1a';
      ctx.fillRect(3.5, -10, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, -10, 1, 1);
      // Smug smirk (nhếch mép cười đểu)
      ctx.beginPath();
      ctx.arc(4.5, -4, 3, 0.1, Math.PI * 0.7);
      ctx.strokeStyle = '#8a4133';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Hair cap & topknot wrapped in fancy ribbon
    ctx.beginPath();
    ctx.ellipse(0, -14, 8, 5.5, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#221d18';
    ctx.fill();
    ctx.strokeStyle = ink;
    ctx.stroke();

    // Topknot bun
    ctx.beginPath();
    ctx.arc(-2, -19, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#221d18';
    ctx.fill();
    // Gold hairpin
    line(ctx, [[-6, -21], [3, -17]], '#e0bb53', 2);
    ctx.beginPath();
    ctx.arc(3.5, -17, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#65a88c';
    ctx.fill();

    ctx.restore();

    // 6. Near arm (chubby hand on hip in an arrogant pose)
    ctx.save();
    ctx.translate(-1, -41);
    if (isHit) {
      // Flailing arm when hit
      ctx.rotate(-0.8 + Math.sin(t * 25) * 0.3);
      poly(ctx, [[-3, -1], [4, -1], [5, 12], [2, 16], [-3, 15]], goldSilk);
      poly(ctx, [[-2, 15], [3, 15], [3, 19], [-2, 19]], skin);
    } else {
      // Hand on hip (chống nạnh vênh váo)
      poly(ctx, [[-3, -1], [3.5, -1], [5.5, 7], [3, 13], [-1, 12], [-3, 6]], goldSilk);
      // Plump fist resting proudly against the hip
      ctx.beginPath();
      ctx.arc(1.5, 13, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = skin;
      ctx.fill();
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // 7. Hit sparks / stars if recently hit
    if (isHit) {
      const starPhase = t * 14;
      for (let i = 0; i < 3; i++) {
        const sx = Math.cos(starPhase + (i * Math.PI * 2) / 3) * 15;
        const sy = -60 + Math.sin(starPhase + (i * Math.PI * 2) / 3) * 5;
        ctx.fillStyle = '#ffdf4d';
        ctx.font = 'bold 10px system-ui';
        ctx.fillText('✨', sx, sy);
      }
    }

    ctx.restore();

    // Name tag matching other NPCs exactly (concise: "A Huy")
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px system-ui';
    const label = state.name;
    const w = ctx.measureText(label).width + 12;
    ctx.fillStyle = '#172d23cc';
    ctx.fillRect(state.x - w / 2, state.y - 82, w, 15);
    ctx.fillStyle = '#eee0ae';
    ctx.fillText(label, state.x, state.y - 71);

    // Mini Health bar if damaged or hit
    if (state.hp < state.maxHp || isHit) {
      const barW = 44;
      const barH = 4;
      const bx = state.x - barW / 2;
      const by = state.y - 88;
      ctx.fillStyle = '#111e18dd';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = '#e04538';
      ctx.fillRect(bx, by, Math.max(0, (state.hp / state.maxHp) * barW), barH);
    }

    // Speech bubble for taunts
    if (state.pause > 0 && state.spokenLine) {
      ctx.font = 'italic 9.5px Georgia, serif';
      const text = state.spokenLine.length > 52 ? state.spokenLine.slice(0, 51) + '…' : state.spokenLine;
      const bw = ctx.measureText(text).width + 16;
      ctx.fillStyle = '#182b22f6';
      ctx.fillRect(state.x - bw / 2, state.y - 105, bw, 17);
      ctx.strokeStyle = '#d6b85caa';
      ctx.lineWidth = 1;
      ctx.strokeRect(state.x - bw / 2, state.y - 105, bw, 17);
      ctx.fillStyle = '#fff4cc';
      ctx.fillText(text, state.x, state.y - 93);
    }
  }

  function isNear(player, dist = 48) {
    if (state.hidden) return false;
    return Math.hypot(player.x - state.x, player.y - state.y) <= dist;
  }

  function talk(player) {
    if (state.hidden) return false;
    const dialog = document.getElementById('dialog');
    const title = document.getElementById('dialog-title');
    const body = document.getElementById('dialog-body');
    if (!dialog || !title || !body) return false;

    state.dir = player.x > state.x ? 1 : -1;
    state.pause = 4.0;
    state.spokenLine = 'Hừ! Bản thiếu gia đang bận tập quyền, ngươi tìm ta có việc gì?';

    dialog.hidden = false;
    title.textContent = 'A Huy (14 tuổi) · Bạn cùng làng';
    body.textContent =
      'Hừ! Ngươi tìm đại thiếu gia A Huy ta có việc gì thế, Tiểu Phàm?\n\n' +
      'Ta nghe nói ngươi vừa học được mấy thế quyền cước định ra đồng bắt bướm à? ' +
      'Cơ bắp của ta cuồn cuộn thế này, nếu muốn so tài thì tung một cú đấm vào bụng ta xem ngươi khỏe tới đâu nào!';

    return true;
  }

  function takeHit(player) {
    if (state.hidden) return false;
    const d = Math.hypot(player.x - state.x, player.y - state.y);
    if (d > 52) return false;

    // Check if player is facing A Huy
    const dx = state.x - player.x;
    const dy = state.y - player.y;
    const facing =
      (player.dir === 'right' && dx > -12) ||
      (player.dir === 'left' && dx < 12) ||
      (player.dir === 'down' && dy > -12) ||
      (player.dir === 'up' && dy < 12);

    if (!facing) return false;

    state.hitTimer = 0.55;
    state.hitCount++;
    state.hp = Math.max(10, state.hp - 10);

    // Knockback slightly in direction of punch
    const len = Math.max(1, Math.hypot(dx, dy));
    const kx = state.x + (dx / len) * 14;
    const ky = state.y + (dy / len) * 14;
    if (typeof Collision !== 'undefined' && Collision.canWalk(kx, ky)) {
      state.x = kx;
      state.y = ky;
    }

    state.spokenLine = HIT_REACTIONS[Math.floor(Math.random() * HIT_REACTIONS.length)];
    state.pause = 3.5;
    state.dir = player.x > state.x ? 1 : -1;

    return true;
  }

  return {
    get x() {
      return state.x;
    },
    get y() {
      return state.y;
    },
    get hidden() {
      return state.hidden;
    },
    set hidden(v) {
      state.hidden = v;
    },
    get name() {
      return state.name;
    },
    takeScenePosition,
    update,
    draw,
    isNear,
    talk,
    takeHit
  };
})();
