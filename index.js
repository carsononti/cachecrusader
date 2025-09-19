<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Kaboom Mobile Demo</title>
  <style>
    html, body { margin: 0; padding: 0; background:#121212; color:#eee; height:100%; }
    /* Prevent long-press selection on mobile buttons */
    * { -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select:none; }
  </style>
</head>
<body>
  <!-- Kaboom ESM via unpkg -->
  <script type="module">
    import kaboom from "https://unpkg.com/kaboom/dist/kaboom.mjs";
    // Expose kaboom to main.js by attaching to window (handy for super-simple setups)
    window.kaboom = kaboom;
    // Load your game code
    import "./main.js";
  </script>
</body>
</html>
