const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Mock Web Audio API
class MockAudioParam {
  constructor(initial = 0) {
    this.value = initial;
  }
  setValueAtTime(val, time) {
    assert(Number.isFinite(val), 'setValueAtTime value must be finite');
    assert(Number.isFinite(time), 'setValueAtTime time must be finite');
    this.value = val;
  }
  linearRampToValueAtTime(val, time) {
    assert(Number.isFinite(val), 'linearRampToValueAtTime value must be finite');
    assert(Number.isFinite(time), 'linearRampToValueAtTime time must be finite');
    this.value = val;
  }
  exponentialRampToValueAtTime(val, time) {
    assert(Number.isFinite(val), 'exponentialRampToValueAtTime value must be finite');
    assert(Number.isFinite(time), 'exponentialRampToValueAtTime time must be finite');
    this.value = val;
  }
}

class MockAudioNode {
  constructor() {
    this.connectedTo = [];
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.connectedTo = [];
  }
}

class MockGainNode extends MockAudioNode {
  constructor() {
    super();
    this.gain = new MockAudioParam(1);
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
  }
  start(time = 0) {}
  stop(time = 0) {}
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor() {
    super();
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(350);
    this.Q = new MockAudioParam(1);
  }
}

class MockAudioContext {
  constructor() {
    this.state = 'suspended';
    this.currentTime = 0.5;
    this.destination = new MockAudioNode();
  }
  async resume() {
    this.state = 'running';
  }
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createBiquadFilter() {
    return new MockBiquadFilterNode();
  }
  createBuffer(channels, length, sampleRate) {
    return {
      getChannelData: () => new Float32Array(length)
    };
  }
  createBufferSource() {
    const node = new MockAudioNode();
    node.buffer = null;
    node.loop = false;
    node.start = () => {};
    node.stop = () => {};
    return node;
  }
}

// Mock DOM
const domMap = new Map();
function createMockEl(tag = 'div') {
  const classes = new Set();
  const textChild = { textContent: '' };
  return {
    tagName: tag.toUpperCase(),
    textContent: '',
    style: {},
    children: [textChild],
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c)
    },
    querySelector: (selector) => {
      if (selector === '.music-text') return textChild;
      if (selector === '.music-icon') return { textContent: '🎵' };
      return null;
    },
    setAttribute: () => {},
    addEventListener: () => {}
  };
}

const storage = new Map();
const mockLocalStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k)
};

const windowListeners = new Map();
const mockWindow = {
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  addEventListener: (ev, fn) => {
    if (!windowListeners.has(ev)) windowListeners.set(ev, []);
    windowListeners.get(ev).push(fn);
  },
  removeEventListener: (ev, fn) => {
    const list = windowListeners.get(ev);
    if (list) {
      const idx = list.indexOf(fn);
      if (idx !== -1) list.splice(idx, 1);
    }
  }
};

const musicBtn = createMockEl('button');
domMap.set('music-btn', musicBtn);

const mockDocument = {
  getElementById: (id) => domMap.get(id) || null
};

const ctx = {
  window: mockWindow,
  AudioContext: MockAudioContext,
  webkitAudioContext: MockAudioContext,
  document: mockDocument,
  localStorage: mockLocalStorage,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  console
};

vm.createContext(ctx);

// Run music.js
const code = fs.readFileSync('public/game/music.js', 'utf8');
vm.runInContext(code + '; this.VillageMusic = VillageMusic;', ctx);

const VM = ctx.VillageMusic;
assert(VM, 'VillageMusic must be exported to context');
assert(typeof VM.init === 'function', 'VM.init must be a function');
assert(typeof VM.start === 'function', 'VM.start must be a function');
assert(typeof VM.pause === 'function', 'VM.pause must be a function');
assert(typeof VM.toggle === 'function', 'VM.toggle must be a function');
assert(typeof VM.playFlute === 'function', 'VM.playFlute must be a function');
assert(typeof VM.playGuzheng === 'function', 'VM.playGuzheng must be a function');
assert(typeof VM.playBell === 'function', 'VM.playBell must be a function');

// 1. Test init
VM.init();
assert.strictEqual(VM.isMuted, false, 'Default should not be muted');
assert(windowListeners.has('pointerdown'), 'pointerdown listener should be registered for browser autoUnlock');
assert(windowListeners.has('keydown'), 'keydown listener should be registered for browser autoUnlock');

// 2. Test start
(async () => {
  const started = await VM.start();
  assert.strictEqual(started, true, 'VM.start() should return true');
  assert.strictEqual(VM.isPlaying, true, 'VM.isPlaying should be true when started and not muted');

  const textEl = musicBtn.querySelector('.music-text');
  assert.strictEqual(textEl.textContent, 'Nhạc: Bật', 'Button label should be "Nhạc: Bật"');
  assert(musicBtn.classList.contains('active'), 'Button should have active class when playing');

  // 3. Test instrument synthesis functions
  assert.doesNotThrow(() => {
    VM.playFlute(440, 0.5, 1.5, 0.5);
    VM.playGuzheng(293.66, 0.5, 0.4);
    VM.playBell(587.33, 0.5);
    VM.updateWeather('rain', 0.8, 0);
    VM.updateWeather('storm', 1.0, 0.9);
    VM.playThunder();
    VM.updateWeather('sun', 0, 0);
  }, 'Instrument and ambient weather synthesis must run without error');

  // 4. Test toggle mute
  VM.toggle();
  assert.strictEqual(VM.isMuted, true, 'VM.isMuted should be true after toggle');
  assert.strictEqual(VM.isPlaying, false, 'VM.isPlaying should be false when muted');
  assert.strictEqual(textEl.textContent, 'Nhạc: Tắt', 'Button label should be "Nhạc: Tắt" when muted');
  assert(!musicBtn.classList.contains('active'), 'Button should not have active class when muted');
  assert.strictEqual(mockLocalStorage.getItem('lang_du_lam_bgm_state'), 'muted', 'Muted state should be saved in localStorage');

  // 5. Test toggle back unmute
  VM.toggle();
  assert.strictEqual(VM.isMuted, false, 'VM.isMuted should be false after toggling back');
  assert.strictEqual(VM.isPlaying, true, 'VM.isPlaying should be true after unmuting');
  assert.strictEqual(mockLocalStorage.getItem('lang_du_lam_bgm_state'), 'unmuted', 'Unmuted state saved in localStorage');

  // 6. Test pause
  VM.pause();
  assert.strictEqual(VM.isPlaying, false, 'VM.isPlaying should be false after pause');

  console.log('✓ music.cjs: All VillageMusic Web Audio tests passed successfully.');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
