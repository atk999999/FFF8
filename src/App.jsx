import React from 'react';
// Keep the canvas engine isolated so React updates never duplicate its animation loop,
// keyboard handlers or Web Audio context. All editable game source is in public/game.
export default function App() {
  return <iframe title="Làng Du Lãm — Tiểu Phàm, 14 tuổi"
    src={`${import.meta.env.BASE_URL}game/index.html`}
    allow="autoplay; fullscreen" allowFullScreen />;
}
