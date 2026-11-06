// ===== Brotty: la mascota (dibujo, ánimos y trajes) =====
(function () {
  let n = 0;
  const COLORES = {
    verde:   { g: ["#9dff5c", "#3fd629", "#1f9a12"], o: "#123d0a", i: ["#7dff8a", "#0d5a1c"], n: "Verde" },
    celeste: { g: ["#b5f0ff", "#3cb8f0", "#1a6fb0"], o: "#0b3355", i: ["#9fe8ff", "#0b3f6e"], n: "Celeste" },
    morado:  { g: ["#e2c8ff", "#9b5cf0", "#5a2aa8"], o: "#2a1257", i: ["#d6b3ff", "#3a1680"], n: "Morado" },
    rosado:  { g: ["#ffd3e6", "#ff7ab0", "#c23a76"], o: "#5a1030", i: ["#ffb3d1", "#7a1844"], n: "Rosado" },
    dorado:  { g: ["#fff4b0", "#ffcf2e", "#c28a00"], o: "#5a3d00", i: ["#ffe680", "#6b4a00"], n: "Dorado" },
    naranja: { g: ["#ffdcb0", "#ff9a3c", "#c45a10"], o: "#5a2a00", i: ["#ffc48a", "#7a3400"], n: "Naranja" }
  };
  const ESTILOS = {
    mono: { n: "Moño", e: "🎀" }, pestanas: { n: "Pestañas", e: "👁️" }, gorrita: { n: "Gorrita", e: "🧢" },
    lentes: { n: "Lentes", e: "👓" }, bigote: { n: "Bigotito", e: "🥸" }
  };
  function estilosDefs(k) {
    return `<linearGradient id="len${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8f6ff" stop-opacity=".55"/><stop offset="1" stop-color="#6ec8ff" stop-opacity=".25"/></linearGradient>
      <linearGradient id="gor${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#c81d2e"/></linearGradient>
      <linearGradient id="mon${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ccc"/><stop offset="1" stop-color="#e0337a"/></linearGradient>
      <linearGradient id="big${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a26"/><stop offset="1" stop-color="#3a1f0c"/></linearGradient>`;
  }
  function estilosSVG(est, traje, o, k) {
    let s = "";
    if (est.includes("pestanas")) s += `
      <path d="M70 116 Q 96 98 122 116" stroke="#14070a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M138 116 Q 164 98 190 116" stroke="#14070a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <g fill="#14070a"><path d="M72 114 C 62 110,56 100,58 92 C 62 100,68 104,78 108 Z"/><path d="M80 108 C 74 100,72 90,76 84 C 78 92,82 98,88 104 Z"/><path d="M90 104 C 88 96,90 88,94 84 C 94 92,96 98,98 103 Z"/>
        <path d="M188 114 C 198 110,204 100,202 92 C 198 100,192 104,182 108 Z"/><path d="M180 108 C 186 100,188 90,184 84 C 182 92,178 98,172 104 Z"/><path d="M170 104 C 172 96,170 88,166 84 C 166 92,164 98,162 103 Z"/></g>`;
    if (est.includes("lentes") && traje !== "anionuevo") s += `
      <g>
        <path d="M64 128 L 40 120 M196 128 L 220 120" stroke="#2a1a40" stroke-width="6" stroke-linecap="round"/>
        <rect x="62" y="104" width="68" height="58" rx="24" fill="url(#len${k})" stroke="#2a1a40" stroke-width="7"/>
        <rect x="130" y="104" width="68" height="58" rx="24" fill="url(#len${k})" stroke="#2a1a40" stroke-width="7"/>
        <rect x="66" y="108" width="60" height="50" rx="20" fill="none" stroke="#a77bff" stroke-width="2.5" opacity=".8"/>
        <rect x="134" y="108" width="60" height="50" rx="20" fill="none" stroke="#a77bff" stroke-width="2.5" opacity=".8"/>
        <path d="M122 120 Q 130 112 138 120" stroke="#2a1a40" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M74 120 L 92 112 M74 130 L 84 126" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
        <path d="M142 120 L 160 112 M142 130 L 152 126" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      </g>`;
    if (est.includes("bigote")) s += `
      <path d="M130 158 C 122 146,100 144,90 152 C 82 158,76 152,78 146 C 70 152,74 166,90 166 C 104 166,116 162,130 160
               C 144 162,156 166,170 166 C 186 166,190 152,182 146 C 184 152,178 158,170 152 C 160 144,138 146,130 158 Z"
            fill="url(#big${k})" stroke="#1b0f06" stroke-width="3" stroke-linejoin="round"/>
      <path d="M96 152 C 104 150,114 152,122 156 M164 152 C 156 150,146 152,138 156" stroke="#b07a4a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
    if (est.includes("gorrita")) s += `
      <path d="M68 98 C 64 44,196 44,192 98 Q 130 108 68 98 Z" fill="url(#gor${k})" stroke="#5a0a12" stroke-width="5" stroke-linejoin="round"/>
      <path d="M130 50 L 130 100 M98 56 C 92 70,90 86,92 100 M162 56 C 168 70,170 86,168 100" stroke="#8a1020" stroke-width="3" fill="none" stroke-dasharray="5 4"/>
      <path d="M84 68 C 92 58,106 52,118 52" stroke="#ffb3b3" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
      <circle cx="130" cy="78" r="15" fill="#fff" stroke="#5a0a12" stroke-width="3"/>
      <text x="130" y="85" text-anchor="middle" font-size="19" font-weight="900" fill="#c81d2e" font-family="Arial Black,Arial">B</text>
      <path d="M66 96 C 40 94,20 100,14 112 C 30 120,60 114,82 104 Z" fill="#c81d2e" stroke="#5a0a12" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M22 110 C 40 106,60 104,76 102" stroke="#7a0f1a" stroke-width="3" fill="none" opacity=".6"/>
      <circle cx="130" cy="50" r="6" fill="#c81d2e" stroke="#5a0a12" stroke-width="3"/>`;
    if (est.includes("mono")) s += `
      <g transform="translate(184 82) rotate(18)">
        <path d="M-4 6 L -14 34 L -4 28 L 2 36 Z M4 6 L 14 32 L 4 26 L -2 34 Z" fill="#e0337a" stroke="#7a1844" stroke-width="3" stroke-linejoin="round"/>
        <path d="M0 0 C -14 -24,-46 -20,-40 4 C -36 22,-14 14,0 0 Z" fill="url(#mon${k})" stroke="#7a1844" stroke-width="4" stroke-linejoin="round"/>
        <path d="M0 0 C 14 -24,46 -20,40 4 C 36 22,14 14,0 0 Z" fill="url(#mon${k})" stroke="#7a1844" stroke-width="4" stroke-linejoin="round"/>
        <path d="M-8 -2 C -18 -10,-28 -10,-32 -4 M8 -2 C 18 -10,28 -10,32 -4" stroke="#b02060" stroke-width="2.5" fill="none" opacity=".7"/>
        <circle cx="-26" cy="-6" r="3.5" fill="#fff" opacity=".9"/><circle cx="-18" cy="6" r="2.8" fill="#fff" opacity=".9"/><circle cx="26" cy="-6" r="3.5" fill="#fff" opacity=".9"/><circle cx="20" cy="6" r="2.8" fill="#fff" opacity=".9"/>
        <ellipse cx="0" cy="0" rx="9" ry="10" fill="#ff7ab0" stroke="#7a1844" stroke-width="3.5"/>
        <path d="M-30 -12 C -24 -16,-16 -14,-12 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      </g>`;
    return s;
  }
  function trajeDeHoy(fecha, manual) {
    const d = fecha || new Date();
    if (manual && manual.mes === d.toLocaleDateString("en-CA").slice(0, 7)) return manual.traje || null;
    const m = d.getMonth(), dia = d.getDate();
    if ((m === 9 && dia === 31) || m === 10) return "halloween";
    return ["anionuevo", "sanvalentin", "clases", "otonio", "mama", "sanjuan",
            "patrias", "cumple", "primavera", "morado", null, "navidad"][m];
  }

  function brote(c1, c2) {
    return `
    <path d="M128 64 C 126 50,128 40,134 32" stroke="#2a7a14" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M134 36 C 148 16,178 14,186 26 C 170 36,152 42,134 36 Z" fill="${c1}" stroke="#123d0a" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M132 42 C 116 24,92 26,88 38 C 102 46,118 48,132 42 Z" fill="${c2}" stroke="#123d0a" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M146 28 C 158 24,170 24,178 27" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  }

  function cuerpo(g, o) {
    return `
    <ellipse cx="130" cy="242" rx="92" ry="10" fill="#000" opacity=".3"/>
    <g transform="translate(-4,48) rotate(-12 34 140)"><path d="M30 150 C 18 140,20 118,34 116 C 48 116,54 136,48 156 Z" fill="url(#${g})" stroke="${o}" stroke-width="5"/></g>
    <g transform="translate(4,48) rotate(12 226 140)"><path d="M230 150 C 242 140,240 118,226 116 C 212 116,206 136,212 156 Z" fill="url(#${g})" stroke="${o}" stroke-width="5"/></g>
    <path d="M40 160 C 36 94,78 60,130 60 C 182 60,224 94,220 160
       C 232 168,236 190,226 204 C 232 214,226 228,212 226 C 204 236,188 236,180 228
       C 170 238,152 238,144 230 C 134 238,118 238,110 230 C 100 238,82 236,76 226
       C 62 230,48 222,50 210 C 34 206,28 186,40 160 Z" fill="url(#${g})" stroke="${o}" stroke-width="5.5" stroke-linejoin="round"/>
    <path d="M70 108 C 78 86,98 74,122 72" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round" opacity=".7"/>
    <circle cx="64" cy="124" r="6" fill="#fff" opacity=".65"/>
    <path d="M192 98 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff" opacity=".85"/>
    <ellipse cx="88" cy="214" rx="6" ry="4" fill="#fff" opacity=".55"/><ellipse cx="170" cy="218" rx="5" ry="3" fill="#fff" opacity=".55"/>`;
  }

  function ojosAbiertos(iris, chicos) {
    const h = chicos ? 6 : 9;
    return `<g class="ojos">
      <ellipse cx="96" cy="134" rx="25" ry="28" fill="#0a1f0c"/><ellipse cx="164" cy="134" rx="25" ry="28" fill="#0a1f0c"/>
      <ellipse cx="96" cy="140" rx="17" ry="18" fill="url(#${iris})"/><ellipse cx="164" cy="140" rx="17" ry="18" fill="url(#${iris})"/>
      <ellipse cx="104" cy="122" rx="${h}" ry="${h - 1}" fill="#fff"/><ellipse cx="172" cy="122" rx="${h}" ry="${h - 1}" fill="#fff"/>
      <circle cx="88" cy="148" r="4" fill="#fff"/><circle cx="156" cy="148" r="4" fill="#fff"/></g>`;
  }
  const rubor = (op) => `
    <ellipse cx="66" cy="172" rx="17" ry="10" fill="#ff8fb0" opacity="${op}"/>
    <ellipse cx="194" cy="172" rx="17" ry="10" fill="#ff8fb0" opacity="${op}"/>
    <path d="M60 168 l4 -4 M68 170 l4 -4 M188 168 l4 -4 M196 170 l4 -4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
  const bocaFeliz = `
    <path d="M110 166 Q 120 162 130 168 Q 140 162 150 166 Q 152 198 130 200 Q 108 198 110 166 Z" fill="#7a1f2b" stroke="#123d0a" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M116 186 Q 130 176 144 186 Q 140 198 130 198 Q 120 198 116 186 Z" fill="#ff7f8f"/>`;

  function cara(animo, iris) {
    if (animo === "celebrando") return `
      <path d="M76 140 Q 96 114 116 140" stroke="#0a1f0c" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M144 140 Q 164 114 184 140" stroke="#0a1f0c" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${rubor(1)}
      <path d="M104 162 Q 130 158 156 162 Q 158 206 130 208 Q 102 206 104 162 Z" fill="#7a1f2b" stroke="#123d0a" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M112 190 Q 130 178 148 190 Q 142 206 130 206 Q 118 206 112 190 Z" fill="#ff7f8f"/>`;
    if (animo === "preocupado") return `
      ${ojosAbiertos(iris, true)}
      <path d="M72 106 L 110 96" stroke="#123d0a" stroke-width="6" stroke-linecap="round"/>
      <path d="M188 106 L 150 96" stroke="#123d0a" stroke-width="6" stroke-linecap="round"/>
      ${rubor(.6)}
      <path d="M112 184 Q 121 176 130 184 Q 139 192 148 184" stroke="#123d0a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M210 88 C 218 100,218 108,210 110 C 202 108,202 100,210 88 Z" fill="#8fd8ff" stroke="#123d0a" stroke-width="3"/>`;
    if (animo === "triste") return `
      ${ojosAbiertos(iris, true)}
      <path d="M74 148 Q 96 160 118 148 L 118 142 Q 96 154 74 142 Z" fill="#8fd8ff" opacity=".9"/>
      <path d="M142 148 Q 164 160 186 148 L 186 142 Q 164 154 142 142 Z" fill="#8fd8ff" opacity=".9"/>
      <path d="M72 106 L 110 96" stroke="#123d0a" stroke-width="6" stroke-linecap="round"/>
      <path d="M188 106 L 150 96" stroke="#123d0a" stroke-width="6" stroke-linecap="round"/>
      ${rubor(.5)}
      <path d="M112 194 Q 130 176 148 194" stroke="#123d0a" stroke-width="5.5" fill="none" stroke-linecap="round"/>
      <path d="M80 164 C 76 176,74 184,80 190 C 86 184,84 176,80 164 Z" fill="#8fd8ff" stroke="#123d0a" stroke-width="2.5"/>`;
    return `${ojosAbiertos(iris)}${rubor(.9)}${bocaFeliz}`;
  }

  // ---------- Trajes: { atras, frente, brote:[c1,c2], encima } ----------
  const corazon = (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C -10 -6,-24 4,0 22 C 24 4,10 -6,0 6 Z" fill="${c}" stroke="#5a0d24" stroke-width="2.5"/>`;
  const flor = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-9" rx="6" ry="9" transform="rotate(${a})" fill="${c}" stroke="#7a2048" stroke-width="2"/>`).join("")}<circle r="5.5" fill="#ffd23f" stroke="#7a5200" stroke-width="2"/></g>`;
  const hoja = (x, y, r, c) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M0 0 C 6 -10,18 -10,22 0 C 18 10,6 10,0 0 Z" fill="${c}" stroke="#5a2a00" stroke-width="2"/>`;
  const confeti = `
    <rect x="20" y="40" width="8" height="14" rx="2" fill="#ffd23f" transform="rotate(20 24 47)"/>
    <rect x="230" y="60" width="8" height="14" rx="2" fill="#a77bff" transform="rotate(-25 234 67)"/>
    <rect x="12" y="110" width="7" height="12" rx="2" fill="#39ff88" transform="rotate(40 15 116)"/>
    <rect x="244" y="130" width="7" height="12" rx="2" fill="#ff7a59" transform="rotate(-10 247 136)"/>
    <circle cx="40" cy="20" r="4" fill="#ff7a59"/><circle cx="226" cy="30" r="4" fill="#39ff88"/>`;

  const TRAJES = {
    halloween: {
      atras: `<path d="M56 118 C 20 160,10 220,4 246 L 256 246 C 250 220,240 160,204 118 Z" fill="#3a1352" stroke="#12051c" stroke-width="5" stroke-linejoin="round"/>
              <path d="M70 128 C 44 170,34 220,30 240 L 230 240 C 226 220,216 170,190 128 Z" fill="#b3122e" opacity=".85"/>`,
      sombrero: `
        <path d="M66 96 C 60 44,200 44,194 96 Q 130 110 66 96 Z" fill="#ff8c1a" stroke="#5a2a00" stroke-width="5" stroke-linejoin="round"/>
        <path d="M100 54 C 92 70,92 88,98 102 M130 50 L130 106 M160 54 C 168 70,168 88,162 102" stroke="#c45f00" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M84 64 C 92 56,104 52,112 52" stroke="#ffd09a" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      frente: `
        <path d="M116 168 L 121 182 L 126 168 Z M134 168 L 139 182 L 144 168 Z" fill="#fff" stroke="#123d0a" stroke-width="2" stroke-linejoin="round"/>
        <g transform="translate(196 180)">
          <path d="M-6 6 Q 22 -10 50 6" stroke="#444" stroke-width="3" fill="none"/>
          <circle cx="8" cy="0" r="7" fill="#ff5ea8" stroke="#5a0d24" stroke-width="2"/><circle cx="22" cy="-4" r="7" fill="#ffd23f" stroke="#7a5200" stroke-width="2"/><circle cx="36" cy="0" r="7" fill="#39ff88" stroke="#0b3a1f" stroke-width="2"/>
          <path d="M-8 4 L 52 4 C 54 30,40 44,22 44 C 4 44,-10 30,-8 4 Z" fill="#26222b" stroke="#000" stroke-width="4"/>
          <ellipse cx="22" cy="4" rx="30" ry="6" fill="#3c3644" stroke="#000" stroke-width="3"/>
        </g>`,
      brote: ["#5fbf2a", "#4aa020"]
    },
    navidad: {
      sombrero: `
        <path d="M70 94 C 70 50,190 50,190 94 Z" fill="#e0242f" stroke="#5a0a0f" stroke-width="5" stroke-linejoin="round"/>
        <path d="M180 76 C 200 66,210 76,214 90" stroke="#e0242f" stroke-width="16" fill="none" stroke-linecap="round"/>
        <circle cx="216" cy="96" r="13" fill="#fff" stroke="#9aa" stroke-width="3"/>
        <rect x="62" y="86" width="136" height="20" rx="10" fill="#fff" stroke="#9aa" stroke-width="3"/>`,
      frente: `
        <g transform="translate(6 176)"><rect x="0" y="10" width="40" height="34" rx="5" fill="#39ff88" stroke="#0b3a1f" stroke-width="3.5"/>
          <rect x="16" y="10" width="8" height="34" fill="#e0242f"/><rect x="-3" y="4" width="46" height="12" rx="4" fill="#2fd36b" stroke="#0b3a1f" stroke-width="3"/>
          <path d="M20 4 C 10 -8,4 2,20 4 C 36 2,30 -8,20 4 Z" fill="#e0242f" stroke="#5a0a0f" stroke-width="2.5"/></g>`
    },
    anionuevo: {
      frente: `
        <g fill="none" stroke="#ffd23f" stroke-width="6"><circle cx="96" cy="134" r="31"/><circle cx="164" cy="134" r="31"/><path d="M127 130 Q 130 124 133 130"/></g>
        <text x="130" y="98" text-anchor="middle" font-size="30" font-weight="900" fill="#ffd23f" stroke="#7a5200" stroke-width="2" font-family="Arial Black,Arial">2027</text>
        <path d="M16 70 q 10 -14 20 0 t 20 0" stroke="#a77bff" stroke-width="4" fill="none"/>
        <path d="M206 54 q 10 -14 20 0 t 20 0" stroke="#ff7a59" stroke-width="4" fill="none"/>${confeti}`
    },
    sanvalentin: {
      atras: `<path d="M50 120 C 10 90,0 140,30 160 C 0 170,20 200,56 176 Z" fill="#fff" stroke="#c9c9d9" stroke-width="4"/>
              <path d="M210 120 C 250 90,260 140,230 160 C 260 170,240 200,204 176 Z" fill="#fff" stroke="#c9c9d9" stroke-width="4"/>`,
      frente: `${corazon(40, 60, 1, "#ff4f86")}${corazon(222, 76, .8, "#ff7aa8")}${corazon(214, 30, .6, "#ff4f86")}
        <g transform="translate(200 196) rotate(-30)"><rect x="0" y="-2" width="50" height="4" fill="#ffd23f"/>${corazon(54, -11, .7, "#ff4f86")}</g>`
    },
    clases: {
      atras: `<rect x="22" y="110" width="216" height="110" rx="26" fill="#2f6bff" stroke="#0a1f5a" stroke-width="5"/>`,
      frente: `
        <path d="M60 108 C 56 140,58 180,64 214" stroke="#1d47b8" stroke-width="10" fill="none" stroke-linecap="round"/>
        <path d="M200 108 C 204 140,202 180,196 214" stroke="#1d47b8" stroke-width="10" fill="none" stroke-linecap="round"/>
        <g transform="translate(206 210) rotate(-55)"><rect x="0" y="-6" width="56" height="12" rx="2" fill="#ffd23f" stroke="#7a5200" stroke-width="2.5"/>
          <path d="M56 -6 L 70 0 L 56 6 Z" fill="#f2c28b" stroke="#7a5200" stroke-width="2.5"/><rect x="-8" y="-6" width="10" height="12" rx="2" fill="#ff8fb0" stroke="#7a2048" stroke-width="2.5"/></g>`
    },
    otonio: {
      frente: `${hoja(20, 60, 30, "#ff8c1a")}${hoja(220, 100, -40, "#e05a12")}${hoja(30, 200, 10, "#d9a21b")}${hoja(232, 40, 60, "#d9a21b")}`,
      brote: ["#ff9a2e", "#d9661b"]
    },
    mama: {
      frente: `${corazon(214, 72, .7, "#ff7aa8")}`,
      encima: `${flor(134, 30, 1.4, "#ff9ad5")}`
    },
    sanjuan: {
      sombrero: `
        <ellipse cx="130" cy="88" rx="104" ry="18" fill="#e8c46a" stroke="#6b4a10" stroke-width="5"/>
        <path d="M84 86 C 84 48,176 48,176 86 Z" fill="#f2d27e" stroke="#6b4a10" stroke-width="5" stroke-linejoin="round"/>
        <rect x="86" y="72" width="88" height="10" fill="#b3122e"/>`,
      frente: `
        <g transform="translate(2 178)"><path d="M0 22 C 0 0,44 0,44 22 C 44 44,0 44,0 22 Z" fill="#3c8a1e" stroke="#123d0a" stroke-width="3.5"/>
          <path d="M22 2 L 22 42 M2 22 L 42 22" stroke="#c9a46a" stroke-width="3"/><path d="M22 2 C 28 -8,36 -6,34 2" fill="#3c8a1e" stroke="#123d0a" stroke-width="3"/></g>`
    },
    patrias: {
      sombrero: `
        <path d="M74 98 C 70 50,190 50,186 98 Z" fill="#e0242f" stroke="#5a0a0f" stroke-width="5" stroke-linejoin="round"/>
        <path d="M76 74 L 184 74 M74 88 L 186 88" stroke="#fff" stroke-width="7"/>
        <path d="M74 96 L 64 124 L 82 120 Z M186 96 L 196 124 L 178 120 Z" fill="#e0242f" stroke="#5a0a0f" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="66" cy="128" r="6" fill="#fff"/><circle cx="194" cy="128" r="6" fill="#fff"/>`,
      frente: `
        <g transform="translate(64 206)"><circle r="14" fill="#e0242f" stroke="#5a0a0f" stroke-width="3"/><circle r="8" fill="#fff"/><circle r="3.5" fill="#e0242f"/></g>
        <g transform="translate(212 150)"><rect x="0" y="0" width="4" height="70" fill="#8a6a3a"/>
          <rect x="4" y="2" width="16" height="30" fill="#e0242f"/><rect x="20" y="2" width="16" height="30" fill="#fff"/><rect x="36" y="2" width="16" height="30" fill="#e0242f"/>
          <rect x="4" y="2" width="48" height="30" fill="none" stroke="#5a0a0f" stroke-width="2.5"/></g>`
    },
    cumple: {
      sombrero: `<g transform="rotate(-18 92 70)"><path d="M70 92 L 92 20 L 114 92 Z" fill="#a77bff" stroke="#3a1a7a" stroke-width="5" stroke-linejoin="round"/>
          <path d="M80 62 L 104 62 M76 78 L 108 78" stroke="#ffd23f" stroke-width="6"/><circle cx="92" cy="18" r="9" fill="#ff7a59" stroke="#7a2a10" stroke-width="3"/></g>`,
      frente: `${confeti}`
    },
    primavera: {
      encima: `${flor(78, 80, 1, "#ff9ad5")}${flor(104, 66, 1, "#ffd23f")}${flor(158, 66, 1, "#a77bff")}${flor(184, 80, 1, "#ff7a59")}`
    },
    morado: {
      frente: `
        <path d="M44 196 C 90 214,170 214,216 196 L 214 214 C 170 232,90 232,46 214 Z" fill="#7b3fe4" stroke="#2c0f66" stroke-width="4" stroke-linejoin="round"/>
        <path d="M184 210 L 196 246 L 214 240 Z" fill="#7b3fe4" stroke="#2c0f66" stroke-width="4" stroke-linejoin="round"/>
        <g transform="translate(4 160)"><rect x="0" y="0" width="44" height="30" rx="4" fill="#f5c54a" stroke="#7a5200" stroke-width="3"/>
          <path d="M0 10 L 44 10 M0 20 L 44 20" stroke="#7a5200" stroke-width="2"/><circle cx="8" cy="5" r="2.2" fill="#ff4f86"/><circle cx="20" cy="4" r="2.2" fill="#39ff88"/><circle cx="32" cy="6" r="2.2" fill="#a77bff"/><circle cx="38" cy="3" r="2.2" fill="#2f6bff"/></g>`,
      encima: `<path d="M128 52 C 116 40,108 50,124 56 C 108 62,116 72,128 60 C 140 72,148 62,132 56 C 148 50,140 40,128 52 Z" fill="#7b3fe4" stroke="#2c0f66" stroke-width="3"/>`
    }
  };

  function svg({ animo = "feliz", traje = null, extra = "", color = "verde", estilos = [] } = {}) {
    const C = COLORES[color] || COLORES.verde;
    const k = ++n, g = "bg" + k, ir = "ir" + k, lf = "lf" + k, lf2 = "lg" + k;
    const t = (traje && TRAJES[traje]) || {};
    const [c1, c2] = t.brote ? [t.brote[0], t.brote[1]] : [`url(#${lf})`, `url(#${lf2})`];
    return `<svg viewBox="-12 -10 284 270" xmlns="http://www.w3.org/2000/svg" class="brotty-svg">
      <defs>
        <radialGradient id="${g}" cx="40%" cy="30%" r="75%"><stop offset="0" stop-color="${C.g[0]}"/><stop offset=".55" stop-color="${C.g[1]}"/><stop offset="1" stop-color="${C.g[2]}"/></radialGradient>
        <radialGradient id="${ir}" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="${C.i[0]}"/><stop offset="1" stop-color="${C.i[1]}"/></radialGradient>
        <linearGradient id="${lf}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b6ff6a"/><stop offset="1" stop-color="#2fae1d"/></linearGradient>
        ${estilosDefs(k)}
        <linearGradient id="${lf2}" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6ff6a"/><stop offset="1" stop-color="#2fae1d"/></linearGradient>
      </defs>
      ${t.atras || ""}${cuerpo(g, C.o)}${cara(animo, ir)}${estilosSVG(estilos.filter((e) => e !== "gorrita"), traje, C.o, k)}${t.frente || ""}${estilos.includes("gorrita") ? estilosSVG(["gorrita"], traje, C.o, k) : (t.sombrero || "")}${brote(c1, c2)}${t.encima || ""}${extra}
    </svg>`;
  }

  const torta = `<g transform="translate(96 196)"><rect x="0" y="16" width="68" height="34" rx="8" fill="#ff9ad5" stroke="#7a2048" stroke-width="4"/>
     <path d="M0 26 Q 11 34 22 26 Q 34 34 46 26 Q 57 34 68 26" stroke="#fff" stroke-width="5" fill="none"/>
     <rect x="31" y="0" width="6" height="18" fill="#ffd23f" stroke="#7a5200" stroke-width="2"/><path d="M34 -10 C 40 -2,38 2,34 2 C 30 2,28 -2,34 -10 Z" fill="#ff7a59"/></g>`;

  window.Brotty = { svg, trajeDeHoy, torta, TRAJES: Object.keys(TRAJES), COLORES, ESTILOS };
})();
