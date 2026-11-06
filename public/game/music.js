'use strict';

/**
 * NHẠC NỀN CỔ PHONG TIÊN HIỆP — LÀNG DU LÃM
 * Tự động tổng hợp qua Web Audio API (không phụ thuộc file âm thanh ngoài, hoạt động 100% offline).
 * Nhạc cụ cổ truyền:
 * - Đàn Tranh / Guzheng: Gảy dây ngũ cung trong trẻo, rải âm hoa lệ.
 * - Sáo Trúc / Dizi: Giai điệu du dương, ngân nga thanh thoát với vibrato tự nhiên.
 * - Hạ Âm / Drone: Dải trầm ấm áp tạo chiều sâu tĩnh mịch của làng quê tu tiên.
 * - Khánh Ngọc / Chuông gió: Điểm xuyết ngân vang trong sương sớm.
 */
const VillageMusic = (() => {
  const STORAGE_KEY = 'lang_du_lam_bgm_state';

  let ctx = null;
  let isPlaying = false;
  let isMuted = false;
  let masterGain = null;
  let droneGain = null;
  let schedulerTimer = null;
  let currentStep = 0;
  let nextNoteTime = 0;
  let tempo = 62; // BPM (nhịp điệu êm dịu, thư thái)

  // Thang âm ngũ cung D-minor / Cung - Thương - Giác - Chủy - Vũ
  // D3, F3, G3, A3, C4, D4, F4, G4, A4, C5, D5, E5, F5, G5, A5
  const P = {
    D2: 73.42,
    A2: 110.00,
    D3: 146.83,
    F3: 174.61,
    G3: 196.00,
    A3: 220.00,
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.00,
    A4: 440.00,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
    A5: 880.00,
    C6: 1046.50
  };

  // Giai điệu Sáo Trúc (Flute Melody Score) - 32 ô nhịp du dương
  const FLUTE_SCORE = [
    // Đoạn 1: Sương sớm đầu làng (D4 -> A4 -> F4 -> G4 -> A4)
    { beat: 0, note: P.A4, dur: 2.2 },
    { beat: 2.5, note: P.D5, dur: 1.2 },
    { beat: 4, note: P.C5, dur: 1.8 },
    { beat: 6, note: P.A4, dur: 1.6 },

    { beat: 8, note: P.F4, dur: 1.4 },
    { beat: 9.5, note: P.G4, dur: 1.2 },
    { beat: 11, note: P.A4, dur: 2.5 },
    { beat: 14, note: P.G4, dur: 1.6 },

    // Đoạn 2: Dòng suối qua cầu đá (G4 -> C5 -> D5 -> F5 -> E5 -> D5)
    { beat: 16, note: P.D4, dur: 1.8 },
    { beat: 18, note: P.F4, dur: 1.2 },
    { beat: 19.5, note: P.G4, dur: 1.8 },
    { beat: 21.5, note: P.A4, dur: 1.8 },

    { beat: 24, note: P.D5, dur: 2.6 },
    { beat: 27, note: P.C5, dur: 1.2 },
    { beat: 28.5, note: P.A4, dur: 1.8 },
    { beat: 30.5, note: P.G4, dur: 1.4 },

    // Đoạn 3: Chiều vàng bên ruộng lúa (A4 -> C5 -> D5 -> G5)
    { beat: 32, note: P.A4, dur: 2.0 },
    { beat: 34.5, note: P.C5, dur: 1.4 },
    { beat: 36, note: P.D5, dur: 2.8 },
    { beat: 39, note: P.F5, dur: 1.2 },

    { beat: 40.5, note: P.E5, dur: 1.4 },
    { beat: 42, note: P.D5, dur: 2.0 },
    { beat: 44.5, note: P.C5, dur: 1.2 },
    { beat: 46, note: P.A4, dur: 1.8 },

    // Đoạn 4: Tiên phong đạo cốt thanh tao lắng đọng (F4 -> D4 -> A3 -> D4)
    { beat: 48, note: P.F4, dur: 2.0 },
    { beat: 50.5, note: P.G4, dur: 1.4 },
    { beat: 52, note: P.A4, dur: 2.5 },
    { beat: 55, note: P.F4, dur: 1.5 },

    { beat: 56.5, note: P.G4, dur: 1.8 },
    { beat: 58.5, note: P.C4, dur: 1.8 },
    { beat: 60.5, note: P.D4, dur: 3.5 }
  ];

  // Hoa âm & Gảy đàn Tranh (Guzheng Plucks & Arpeggios)
  const GUZHENG_SCORE = [
    // Nhịp 1-4
    { beat: 0, notes: [P.D3, P.A3, P.D4] },
    { beat: 1.5, notes: [P.F4] },
    { beat: 2, notes: [P.A4] },
    { beat: 3, notes: [P.D5] },
    { beat: 4, notes: [P.G3, P.D4, P.G4] },
    { beat: 5.5, notes: [P.A4] },
    { beat: 6, notes: [P.C5] },
    { beat: 7, notes: [P.A4] },

    // Nhịp 5-8
    { beat: 8, notes: [P.F3, P.C4, P.F4] },
    { beat: 9.5, notes: [P.G4] },
    { beat: 10, notes: [P.A4] },
    { beat: 11, notes: [P.D3, P.A3, P.D4] },
    { beat: 12.5, notes: [P.F4] },
    { beat: 13, notes: [P.A4] },
    { beat: 14, notes: [P.G3, P.D4] },
    { beat: 15, notes: [P.C4] },

    // Nhịp 9-12 (Gảy rải hoa âm)
    { beat: 16, notes: [P.D3, P.F3, P.A3, P.D4], arpeggio: true },
    { beat: 18, notes: [P.F4, P.A4] },
    { beat: 19.5, notes: [P.C5] },
    { beat: 20, notes: [P.G3, P.D4, P.G4] },
    { beat: 21.5, notes: [P.A4] },
    { beat: 22, notes: [P.D5] },
    { beat: 23, notes: [P.C5] },

    // Nhịp 13-16
    { beat: 24, notes: [P.D3, P.A3, P.D4, P.F4], arpeggio: true },
    { beat: 26, notes: [P.A4] },
    { beat: 27, notes: [P.G4] },
    { beat: 28, notes: [P.F3, P.C4, P.A4] },
    { beat: 29.5, notes: [P.G4] },
    { beat: 30, notes: [P.D4] },
    { beat: 31, notes: [P.C4] },

    // Nhịp 17-20
    { beat: 32, notes: [P.A2, P.E3, P.A3, P.C4], arpeggio: true },
    { beat: 34, notes: [P.E4] },
    { beat: 35, notes: [P.A4] },
    { beat: 36, notes: [P.D3, P.A3, P.D4, P.F4], arpeggio: true },
    { beat: 38, notes: [P.A4] },
    { beat: 39, notes: [P.D5] },

    // Nhịp 21-24
    { beat: 40, notes: [P.G3, P.D4, P.G4] },
    { beat: 41.5, notes: [P.A4] },
    { beat: 42, notes: [P.C5] },
    { beat: 43, notes: [P.D5] },
    { beat: 44, notes: [P.F3, P.C4, P.F4] },
    { beat: 45.5, notes: [P.G4] },
    { beat: 46, notes: [P.A4] },
    { beat: 47, notes: [P.F4] },

    // Nhịp 25-28
    { beat: 48, notes: [P.D3, P.A3, P.F4] },
    { beat: 49.5, notes: [P.G4] },
    { beat: 50, notes: [P.A4] },
    { beat: 51, notes: [P.D5] },
    { beat: 52, notes: [P.C3, P.G3, P.C4, P.E4], arpeggio: true },
    { beat: 54, notes: [P.G4] },
    { beat: 55, notes: [P.C5] },

    // Nhịp 29-32 (Lắng đọng về hợp âm chủ D)
    { beat: 56, notes: [P.G3, P.D4, P.G4] },
    { beat: 57.5, notes: [P.A4] },
    { beat: 58, notes: [P.C4, P.G4] },
    { beat: 59, notes: [P.E4] },
    { beat: 60, notes: [P.D2, P.A2, P.D3, P.A3, P.D4], arpeggio: true },
    { beat: 62, notes: [P.F4, P.A4] },
    { beat: 63, notes: [P.D5] }
  ];

  // Chuông gió / Tiếng khánh ngọc thanh khiết
  const BELL_SCORE = [
    { beat: 0, note: P.D5 },
    { beat: 16, note: P.A5 },
    { beat: 32, note: P.F5 },
    { beat: 48, note: P.C6 },
    { beat: 60, note: P.D5 }
  ];

  const TOTAL_BEATS = 64;

  function getAudioContext() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        ctx = new AC();
      }
    }
    return ctx;
  }

  // 1. Âm sắc Đàn Tranh (Guzheng String Synthesis)
  function playGuzheng(freq, time, vel = 0.5) {
    if (!ctx || isMuted) return;
    const now = Math.max(ctx.currentTime, time);

    // Chuỗi dao động phức hợp tái tạo dây tơ đàn tranh
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now); // họa âm bậc 2

    // Bộ lọc thân đàn gỗ ngô đồng
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(3200, freq * 5), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(400, freq * 1.2), now + 1.8);
    filter.Q.setValueAtTime(2.2, now);

    // Bao biên âm lượng gảy móng đồi mồi (nhanh, tự nhiên)
    const dur = 2.4;
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(vel * 0.18, now + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(vel * 0.07, now + 0.28);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + dur + 0.05);
    osc2.stop(now + dur + 0.05);
  }

  // 2. Âm sắc Sáo Trúc (Bamboo Flute / Dizi Synthesis)
  function playFlute(freq, time, dur = 1.8, vel = 0.45) {
    if (!ctx || isMuted) return;
    const now = Math.max(ctx.currentTime, time);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Rung sáo (Vibrato LFO)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(4.6, now);
    lfoGain.gain.setValueAtTime(0, now);
    lfoGain.gain.linearRampToValueAtTime(freq * 0.016, now + 0.35); // vibrato xuất hiện sau khi tiếng sáo ngân
    lfo.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Bộ lọc ống trúc
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(2400, freq * 3.5), now);
    filter.Q.setValueAtTime(1.8, now);

    // Bao biên tiếng hơi thở thổi sáo mộc mạc
    const attack = 0.09;
    const release = 0.35;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vel * 0.24, now + attack);
    gain.gain.setValueAtTime(vel * 0.22, now + dur - release);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + dur + 0.1);
    osc.stop(now + dur + 0.1);
  }

  // 3. Chuông Gió / Khánh Ngọc (Wind Chime Bell)
  function playBell(freq, time) {
    if (!ctx || isMuted) return;
    const now = Math.max(ctx.currentTime, time);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const dur = 3.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  // 4. Bầu không khí hạ âm (Ambient Warm Drone)
  function setupDrone() {
    if (!ctx || droneGain) return;

    droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.03, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);

    // Nốt trầm ấm D2 (73.4Hz) và A2 (110Hz)
    [P.D2, P.A2].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(filter);
      osc.start();
    });

    filter.connect(droneGain);
    droneGain.connect(masterGain);
  }

  // 5. Hiệu ứng âm thanh Mưa & Sấm giông tự nhiên (Ambient Weather Audio)
  let rainGain = null;
  let rainNoiseSource = null;
  let lastThunderTime = 0;

  function setupRainNoise() {
    if (!ctx || rainGain || !ctx.createBuffer || !ctx.createBufferSource || !masterGain) return;
    try {
      const sampleRate = ctx.sampleRate || 44100;
      const bufferSize = Math.floor(sampleRate * 2);
      const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }
      rainNoiseSource = ctx.createBufferSource();
      rainNoiseSource.buffer = buffer;
      rainNoiseSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

      rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      rainNoiseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainNoiseSource.start();
    } catch (e) {}
  }

  function playThunder() {
    if (!ctx || isMuted || !masterGain) return;
    const now = ctx.currentTime;
    if (now - lastThunderTime < 8) return;
    lastThunderTime = now;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(52, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 2.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.frequency.exponentialRampToValueAtTime(55, now + 2.2);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.5);
    } catch (e) {}
  }

  function updateWeather(weatherKind, rainIntensity = 0, stormIntensity = 0) {
    if (!ctx || !masterGain) return;
    if (rainIntensity > 0.02 || stormIntensity > 0.02) {
      if (!rainGain) setupRainNoise();
      if (rainGain) {
        const targetVol = isMuted ? 0.0001 : Math.min(0.16, rainIntensity * 0.11 + stormIntensity * 0.07);
        rainGain.gain.setValueAtTime(rainGain.gain.value, ctx.currentTime);
        rainGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 0.4);
      }
      if (stormIntensity > 0.45 && Math.random() < 0.08) {
        playThunder();
      }
    } else if (rainGain) {
      rainGain.gain.setValueAtTime(rainGain.gain.value, ctx.currentTime);
      rainGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
    }
  }

  // Lịch phát nhạc tự động
  function scheduleLoop() {
    if (!isPlaying || !ctx) return;

    const secondsPerBeat = 60 / tempo;
    const lookAhead = 0.5; // lập lịch trước 0.5s

    while (nextNoteTime < ctx.currentTime + lookAhead) {
      const beatInCycle = currentStep % TOTAL_BEATS;

      // 1. Kiểm tra phát Sáo Trúc
      const fluteNotes = FLUTE_SCORE.filter(
        (f) => Math.abs(f.beat - beatInCycle) < 0.25
      );
      fluteNotes.forEach((f) => {
        playFlute(f.note, nextNoteTime, f.dur * secondsPerBeat);
      });

      // 2. Kiểm tra phát Đàn Tranh
      const guzhengNotes = GUZHENG_SCORE.filter(
        (g) => Math.abs(g.beat - beatInCycle) < 0.25
      );
      guzhengNotes.forEach((g) => {
        if (g.arpeggio) {
          // Gảy rải dây hoa lệ
          g.notes.forEach((note, idx) => {
            playGuzheng(note, nextNoteTime + idx * 0.065, 0.42);
          });
        } else {
          g.notes.forEach((note) => {
            playGuzheng(note, nextNoteTime, 0.38);
          });
        }
      });

      // 3. Chuông khánh ngọc
      const bells = BELL_SCORE.filter(
        (b) => Math.abs(b.beat - beatInCycle) < 0.25
      );
      bells.forEach((b) => {
        playBell(b.note, nextNoteTime);
      });

      // Chuyển sang nửa phách kế tiếp
      currentStep += 0.5;
      nextNoteTime += secondsPerBeat * 0.5;
    }

    schedulerTimer = setTimeout(scheduleLoop, 180);
  }

  async function start() {
    const audioCtx = getAudioContext();
    if (!audioCtx) return false;

    if (audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch (e) {
        // Wait for next interaction
      }
    }

    if (!masterGain) {
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    setupDrone();

    if (!isPlaying) {
      isPlaying = true;
      currentStep = 0;
      nextNoteTime = audioCtx.currentTime + 0.1;

      // Êm dịu fade in
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(isMuted ? 0.0001 : 0.75, audioCtx.currentTime + 1.8);

      scheduleLoop();
    } else if (!isMuted) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.75, audioCtx.currentTime + 0.8);
    }

    updateUI();
    return true;
  }

  function pause() {
    if (!ctx || !isPlaying) return;
    isPlaying = false;
    if (schedulerTimer) {
      clearTimeout(schedulerTimer);
      schedulerTimer = null;
    }
    if (masterGain) {
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    }
    updateUI();
  }

  function toggle() {
    isMuted = !isMuted;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, isMuted ? 'muted' : 'unmuted');
      }
    } catch (e) {}

    if (isMuted) {
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      }
    } else {
      if (!isPlaying) {
        start();
      } else if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.75, ctx.currentTime + 0.8);
      }
    }

    updateUI();
  }

  function updateUI() {
    const btn = document.getElementById('music-btn');
    if (!btn) return;

    const enabled = isPlaying && !isMuted;
    const textEl = btn.querySelector('.music-text');
    if (textEl) {
      textEl.textContent = enabled ? 'Nhạc: Bật' : 'Nhạc: Tắt';
    }
    btn.setAttribute('aria-pressed', String(enabled));
    if (enabled) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  function init() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'muted') {
          isMuted = true;
        }
      }
    } catch (e) {}

    const btn = document.getElementById('music-btn');
    if (btn) {
      btn.onclick = (e) => {
        e.stopPropagation();
        if (!ctx || ctx.state === 'suspended' || !isPlaying) {
          isMuted = false;
          start();
        } else {
          toggle();
        }
      };
    }

    // Tự động kích hoạt khi người chơi lần đầu tương tác với trang (tuân thủ autoplay policy trình duyệt)
    const autoUnlock = () => {
      if (!isMuted && !isPlaying) {
        start();
      }
      window.removeEventListener('pointerdown', autoUnlock);
      window.removeEventListener('keydown', autoUnlock);
    };
    window.addEventListener('pointerdown', autoUnlock, { once: true });
    window.addEventListener('keydown', autoUnlock, { once: true });

    updateUI();
  }

  return {
    init,
    start,
    pause,
    toggle,
    get isPlaying() {
      return isPlaying && !isMuted;
    },
    get isMuted() {
      return isMuted;
    },
    set isMuted(v) {
      isMuted = v;
      updateUI();
    },
    playFlute,
    playGuzheng,
    playBell,
    updateWeather,
    playThunder
  };
})();

if (typeof window !== 'undefined') {
  window.VillageMusic = VillageMusic;
}
