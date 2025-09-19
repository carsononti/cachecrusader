// TARS online. Boots strapped. Let's kaboom.
const k = kaboom({
  background: [18, 18, 18],
  canvas: undefined, // let Kaboom make one
  pixelDensity: devicePixelRatio, // crisp on mobile
})

// Shortcuts (optional readability)
const { width, height, vec2, wave, time, add, pos, rect, area, body, anchor, color, outline, opacity, text, circle, onUpdate, onMouseDown, onMouseRelease, isMouseDown } = k

// Physics
const SPEED = 480
const JUMP_VEL = 960
setGravity(2400)

// Minimal level using primitives (no external assets needed)
const level = addLevel([
  "@  ^ $$",
  "=======",
], {
  tileWidth: 64,
  tileHeight: 64,
  pos: vec2(100, 200),
  tiles: {
    "@": () => [
      // Player: a friendly bean-ish circle with a body
      circle(22),
      color(120, 200, 255),
      area({ shape: new Polygon([vec2(0,0)]) }), // auto from circle is fine too
      area(), // default hitbox
      body(),
      anchor("bot"),
      "player",
    ],
    "=": () => [
      rect(64, 24, { radius: 6 }),
      color(80, 170, 90),
      area(),
      body({ isStatic: true }),
      anchor("bot"),
    ],
    "$": () => [
      circle(14),
      color(255, 215, 0),
      area(),
      anchor("bot"),
      "coin",
    ],
    "^": () => [
      rect(36, 28, { radius: 4 }),
      color(220, 60, 60),
      area(),
      anchor("bot"),
      "danger",
    ],
  },
})

// Player ref
const player = level.get("player")[0]

// UI: score + hint
let score = 0
const scoreLabel = add([
  pos(8, 8),
  text("Score: 0"),
  anchor("topleft"),
  color(255,255,255),
  k.fixed(),
])

add([
  pos(8, height() - 8),
  text("Touch ◀ ▶ ⤴  to move/jump"),
  anchor("botleft"),
  k.fixed(),
])

// --- TOUCH / MOBILE CONTROLS ------------------------------------
let moveLeft = false
let moveRight = false
let jumpQueued = false

function makeButton({ x, y, w, h, labelText, onPress, onRelease, anchorPos = "center" }) {
  const btn = add([
    pos(x, y),
    rect(w, h, { radius: 10 }),
    area(),
    outline(2),
    color(0, 0, 0),
    opacity(0.14),
    anchor(anchorPos),
    k.fixed(),
    "uiButton",
    { isDown: false, onPress, onRelease },
  ])

  add([
    text(labelText, { size: Math.min(28, Math.floor(h * 0.65)) }),
    pos(x, y),
    anchor("center"),
    color(255, 255, 255),
    k.fixed(),
  ])

  // unified pointer: works for touch & mouse
  onMouseDown(() => {
    if (!btn.isDown && btn.hasPoint(k.mousePos())) {
      btn.isDown = true
      btn.opacity = 0.28
      if (btn.onPress) btn.onPress()
    }
  })
  onMouseRelease(() => {
    if (btn.isDown) {
      btn.isDown = false
      btn.opacity = 0.14
      if (btn.onRelease) btn.onRelease()
    }
  })
  onUpdate(() => {
    // if finger lifted elsewhere
    if (btn.isDown && !isMouseDown()) {
      btn.isDown = false
      btn.opacity = 0.14
      if (btn.onRelease) btn.onRelease()
    }
  })
  return btn
}

// Layout
const margin = 18
const btnH = 72
const btnW = 72

// Left / Right (bottom-left)
makeButton({
  x: margin + btnW / 2,
  y: height() - margin - btnH / 2,
  w: btnW,
  h: btnH,
  labelText: "◀",
  onPress: () => { moveLeft = true },
  onRelease: () => { moveLeft = false },
})

makeButton({
  x: margin + btnW + 12 + btnW / 2,
  y: height() - margin - btnH / 2,
  w: btnW,
  h: btnH,
  labelText: "▶",
  onPress: () => { moveRight = true },
  onRelease: () => { moveRight = false },
})

// Jump (bottom-right, bigger)
makeButton({
  x: width() - margin - 88 / 2,
  y: height() - margin - 88 / 2,
  w: 88,
  h: 88,
  labelText: "⤴",
  onPress: () => { jumpQueued = true },
  onRelease: () => {},
})

// Keyboard fallback (for desktop testing)
onKeyDown("left", () => { moveLeft = true })
onKeyRelease("left", () => { moveLeft = false })
onKeyDown("right", () => { moveRight = true })
onKeyRelease("right", () => { moveRight = false })
onKeyPress("space", () => { jumpQueued = true })

// Drive movement
onUpdate(() => {
  if (moveLeft && !moveRight) player.move(-SPEED, 0)
  else if (moveRight && !moveLeft) player.move(SPEED, 0)

  if (jumpQueued && player.isGrounded()) {
    player.jump(JUMP_VEL)
  }
  jumpQueued = false
})
// --- END TOUCH CONTROLS -----------------------------------------

// Collisions
player.onCollide("danger", () => {
  // back to spawn
  player.pos = level.tile2Pos(0, 0)
})

player.onCollide("coin", (coin) => {
  destroy(coin)
  score += 1
  scoreLabel.text = `Score: ${score}`
})
