// Kaboom mobile demo – touch controls + effect toggles
// ----------------------------------------------------

// Start game
kaboom()

// Load assets
loadSprite("bean", "/sprites/bean.png")
loadSprite("coin", "/sprites/coin.png")
loadSprite("spike", "/sprites/spike.png")
loadSprite("grass", "/sprites/grass.png")
loadSprite("ghosty", "/sprites/ghosty.png")
loadSound("score", "/examples/sounds/score.mp3")

// Post-processing effects (matches your original)
const effects = {
	crt: () => ({
		"u_flatness": 3,
	}),
	vhs: () => ({
		"u_intensity": 12,
	}),
	pixelate: () => ({
		"u_resolution": vec2(width(), height()),
		"u_size": wave(2, 16, time() * 2),
	}),
	invert: () => ({
		"u_invert": 1,
	}),
	light: () => ({
		"u_radius": 64,
		"u_blur": 64,
		"u_resolution": vec2(width(), height()),
		"u_mouse": mousePos(),
	}),
}

// Load effect shaders
for (const effect in effects) {
	loadShaderURL(effect, null, `/examples/shaders/${effect}.frag`)
}

let curEffect = 0
const SPEED = 480
const JUMP_VEL = 960

setGravity(2400)

// Level
const level = addLevel([
	"@  ^ $$",
	"=======",
], {
	tileWidth: 64,
	tileHeight: 64,
	pos: vec2(100, 200),
	tiles: {
		"@": () => [
			sprite("bean"),
			area(),
			body(),
			anchor("bot"),
			"player",
		],
		"=": () => [
			sprite("grass"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
		],
		"$": () => [
			sprite("coin"),
			area(),
			anchor("bot"),
			"coin",
		],
		"^": () => [
			sprite("spike"),
			area(),
			anchor("bot"),
			"danger",
		],
	},
})

// Player ref
const player = level.get("player")[0]

// UI: current effect label
const label = add([
	pos(8, 8),
	text(Object.keys(effects)[curEffect]),
	anchor("topleft"),
	fixed(),
])

// Hint text (mobile + keyboard)
add([
	pos(8, height() - 8),
	text("Tap ▲ / ▼ to switch effects (or use up / down)"),
	anchor("botleft"),
	fixed(),
])

// ------------------- TOUCH / MOBILE CONTROLS -------------------

// movement flags driven by touch buttons
let moveLeft = false
let moveRight = false
let jumpQueued = false

// tiny helper to make a clickable/touchable UI rect button
function makeButton({ x, y, w, h, labelText, onPress, onRelease, anchorPos = "center" }) {
	const btn = add([
		pos(x, y),
		rect(w, h, { radius: 8 }),
		area(),
		outline(2),
		color(0, 0, 0),
		opacity(0.12),
		anchor(anchorPos),
		fixed(),
		"uiButton",
		{ isDown: false, onPress, onRelease },
	])

	// label atop the button
	add([
		text(labelText, { size: Math.min(24, Math.floor(h * 0.6)) }),
		pos(x, y),
		anchor("center"),
		color(255, 255, 255),
		fixed(),
	])

	// pointer handling that works for both touch & mouse
	onMouseDown(() => {
		if (!btn.isDown && btn.hasPoint(mousePos())) {
			btn.isDown = true
			btn.opacity = 0.25
			if (btn.onPress) btn.onPress()
		}
	})
	onMouseRelease(() => {
		if (btn.isDown) {
			btn.isDown = false
			btn.opacity = 0.12
			if (btn.onRelease) btn.onRelease()
		}
	})
	// if the user drags off the button, treat it as release when finger lifts
	onUpdate(() => {
		if (btn.isDown && !isMouseDown()) {
			btn.isDown = false
			btn.opacity = 0.12
			if (btn.onRelease) btn.onRelease()
		}
	})

	return btn
}

// layout
const margin = 18
const btnH = 72
const btnW = 72

// left / right buttons (bottom-left)
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

// jump button (bottom-right, bigger)
makeButton({
	x: width() - margin - 88 / 2,
	y: height() - margin - 88 / 2,
	w: 88,
	h: 88,
	labelText: "⤴",
	onPress: () => { jumpQueued = true }, // queued to be forgiving
	onRelease: () => {},
})

// ▲ / ▼ effect toggles (top-left)
const effBtnW = 36, effBtnH = 28
makeButton({
	x: margin + effBtnW / 2,
	y: margin + effBtnH / 2,
	w: effBtnW,
	h: effBtnH,
	labelText: "▲",
	onPress: () => {
		const list = Object.keys(effects)
		curEffect = (curEffect - 1 + list.length) % list.length
		label.text = list[curEffect]
	},
	onRelease: () => {},
	anchorPos: "topleft",
})

makeButton({
	x: margin + effBtnW / 2,
	y: margin + effBtnH + 8 + effBtnH / 2,
	w: effBtnW,
	h: effBtnH,
	labelText: "▼",
	onPress: () => {
		const list = Object.keys(effects)
		curEffect = (curEffect + 1) % list.length
		label.text = list[curEffect]
	},
	onRelease: () => {},
	anchorPos: "topleft",
})

// Keyboard fallback (optional, non-mobile)
onKeyPress("space", () => { jumpQueued = true })
onKeyDown("left", () => { moveLeft = true })
onKeyRelease("left", () => { moveLeft = false })
onKeyDown("right", () => { moveRight = true })
onKeyRelease("right", () => { moveRight = false })
onKeyPress("up", () => {
	const list = Object.keys(effects)
	curEffect = (curEffect - 1 + list.length) % list.length
	label.text = list[curEffect]
})
onKeyPress("down", () => {
	const list = Object.keys(effects)
	curEffect = (curEffect + 1) % list.length
	label.text = list[curEffect]
})

// Drive movement from flags
onUpdate(() => {
	if (moveLeft && !moveRight) {
		player.move(-SPEED, 0)
	} else if (moveRight && !moveLeft) {
		player.move(SPEED, 0)
	}

	if (jumpQueued && player.isGrounded()) {
		player.jump(JUMP_VEL)
	}
	// consume the queued jump each frame to avoid multi-taps
	jumpQueued = false
})

// ---------------- END TOUCH / MOBILE CONTROLS ------------------

// Death: reset to spawn
player.onCollide("danger", () => {
	player.pos = level.tile2Pos(0, 0)
})

// Coins
player.onCollide("coin", (coin) => {
	destroy(coin)
	play("score")
})

// Apply post effect
onUpdate(() => {
	const effect = Object.keys(effects)[curEffect]
	usePostEffect(effect, effects[effect]())
})
