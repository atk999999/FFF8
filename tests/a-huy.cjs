const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

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
const c = {
  window: {},
  addEventListener() {},
  document: {
    createElement: () => ({ getContext: () => g }),
    getElementById: (id) => {
      if (!domElements.has(id)) {
        domElements.set(id, { hidden: true, textContent: '' });
      }
      return domElements.get(id);
    }
  }
};

vm.createContext(c);
vm.runInContext(fs.readFileSync('public/game/collision.js', 'utf8') + '; this.Collision = Collision;', c);
vm.runInContext(fs.readFileSync('public/game/a-huy.js', 'utf8') + '; this.AHuy = AHuy;', c);

const ahuy = c.AHuy;
assert.equal(ahuy.name, 'A Huy');
assert(Number.isFinite(ahuy.x));
assert(Number.isFinite(ahuy.y));

// Test proximity detection
const playerFar = { x: 800, y: 800, dir: 'right' };
const playerNear = { x: ahuy.x - 20, y: ahuy.y, dir: 'right' };

assert(!ahuy.isNear(playerFar, 50));
assert(ahuy.isNear(playerNear, 50));

// Test update with nearby player (taunts & faces player)
ahuy.update(0.05, 1.0, playerNear);

// Test talk interaction
const talked = ahuy.talk(playerNear);
assert(talked, 'A Huy should respond to talk');
assert.equal(c.document.getElementById('dialog').hidden, false);
assert(c.document.getElementById('dialog-title').textContent.includes('A Huy'));

// Test punch / take hit
const initialX = ahuy.x;
const hit = ahuy.takeHit(playerNear);
assert(hit, 'Punch should land on A Huy when player faces him');
assert(ahuy.x !== initialX, 'A Huy should experience knockback');

// Test rendering
for (let t = 0; t < 5; t += 0.5) {
  ahuy.draw(g, t);
}

console.log('PASS: A Huy NPC creation, roaming, proximity detection, dialog, punch reaction, and rendering.');
