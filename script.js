/* ===== CONFIGURACIÓN (editar solo acá) ===== */
const CONFIG = {
  fecha: "December 19, 2026 22:00:00",        // sábado 19 de diciembre, 22:00
  youtubeId: "BDwEyfgClF4",                   // código del video de YouTube de la canción. Vacío = no aparece el reproductor
  inicio: 0,                                  // segundo desde el que suena la canción (15 = salta los primeros 15 segundos)
  whatsapp: "5493815476047",                  // 54 + 9 + número
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Barrio+Julio+Abraham+Alderetes+Tucum%C3%A1n",   // PENDIENTE: reemplazar por el link exacto de Google Maps. Vacío = no aparece el botón
  alias: "",                                  // PENDIENTE: alias de Iara. Vacío = no aparece la sección de regalos
  cvu: "",                                    // CVU o CBU. Vacío = no aparece esa fila
  titular: "",                                // nombre del titular de la cuenta
  confirmarAntes: "Confirmar antes del 14 de diciembre",   // Vacío = no aparece
  mensajeWa: "Hola! Confirmo mi asistencia a los XV de Iara"
};

const $ = id => document.getElementById(id);

/* ===== Secciones opcionales: aparecen solo si hay dato en CONFIG ===== */
const show = (...ids) => ids.forEach(i => $(i).classList.remove('hidden'));
$('wa-btn').href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.mensajeWa)}`;
if (CONFIG.mapsUrl) { $('maps-btn').href = CONFIG.mapsUrl; show('maps-btn'); }
if (CONFIG.alias || CONFIG.cvu) {
  $('alias').textContent = CONFIG.alias;
  $('cvu').textContent = CONFIG.cvu;
  $('gift-title').textContent = CONFIG.titular;
  if (!CONFIG.alias) $('row-alias').classList.add('hidden');
  if (!CONFIG.cvu) $('row-cvu').classList.add('hidden');
  show('gift-section', 'gift-respiro');
}
if (CONFIG.confirmarAntes) { $('confirm-note').textContent = CONFIG.confirmarAntes; show('confirm-note'); }
if (!CONFIG.youtubeId) $('player').classList.add('hidden');   // sin canción no hay reproductor

/* ===== Música (YouTube oculto + reproductor propio) ===== */
let yt, ticker, ready = false, wantPlay = false;
const playBtn = $('btn-play'), bar = $('progress');

if (CONFIG.youtubeId) {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = () => {
  yt = new YT.Player('yt-player', {
    height: '1', width: '1', videoId: CONFIG.youtubeId,
    playerVars: { playsinline: 1, controls: 0, start: CONFIG.inicio },
    events: {
      onReady: () => { ready = true; if (wantPlay) yt.playVideo(); },
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED && $('btn-repeat').classList.contains('on')) { yt.seekTo(CONFIG.inicio, true); yt.playVideo(); return; }   // al terminar, vuelve a empezar
        const playing = e.data === YT.PlayerState.PLAYING;
        playBtn.classList.toggle('playing', playing);
        clearInterval(ticker);
        if (playing) ticker = setInterval(() => {
          bar.value = Math.max(0, (yt.getCurrentTime() - CONFIG.inicio) / span() * 100) || 0;
        }, 500);
      }
    }
  });
};
const isPlaying = () => ready && yt.getPlayerState() === 1;
/* La barra muestra solo la parte que suena: empieza vacía en el segundo 'inicio' y se llena hasta el final de la canción */
const span = () => Math.max(1, yt.getDuration() - CONFIG.inicio);
let userPaused = false, needResume = false;     // userPaused: pausó a propósito
playBtn.onclick = () => { if (!ready) return; if (isPlaying()) { userPaused = true; yt.pauseVideo(); } else { userPaused = false; yt.playVideo(); } };
bar.oninput = () => ready && yt.seekTo(CONFIG.inicio + span() * bar.value / 100, true);
$('btn-prev').onclick = $('btn-next').onclick = () => { if (!ready) return; userPaused = false; yt.seekTo(CONFIG.inicio, true); yt.playVideo(); };
$('btn-repeat').onclick = e => e.currentTarget.classList.toggle('on');
$('btn-shuffle').onclick = e => e.currentTarget.classList.toggle('on');
$('yt-player').style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px';

/* ===== Abrir sobre: tocar el sello -> se rompe, se abre la solapa, sube la carta, entra la invitación ===== */
$('open-btn').addEventListener('click', function () {
  const env = $('envelope'), screen = $('welcome-screen');
  if (env.classList.contains('open')) return;      // evita doble toque
  env.classList.add('open');
  screen.classList.add('opening');
  wantPlay = true; if (ready) yt.playVideo();      // la música arranca con el toque
  setTimeout(() => {
    screen.style.opacity = '0';
    setTimeout(() => {
      screen.classList.add('hidden');
      $('main-content').classList.remove('hidden');
      fitStory();
      window.scrollTo(0, 0);
    }, 600);
  }, 2900);                                         // tiempo que dura la animación del sobre
});

/* ===== Cuenta regresiva ===== */
const eventDate = new Date(CONFIG.fecha).getTime();
const pad = n => String(n).padStart(2, '0');
const tick = () => {
  const d = eventDate - Date.now();
  if (d < 0) { clearInterval(timer); $('countdown').textContent = '¡Llegó el gran día!'; return; }
  $('days').textContent = pad(Math.floor(d / 864e5));
  $('hours').textContent = pad(Math.floor(d % 864e5 / 36e5));
  $('minutes').textContent = pad(Math.floor(d % 36e5 / 6e4));
  $('seconds').textContent = pad(Math.floor(d % 6e4 / 1e3));
};
const timer = setInterval(tick, 1000);
tick();

/* ===== Ventana de regalo + copiar alias / CVU ===== */
const modal = $('gift-modal');
const openGift = () => { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
const closeGift = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };
$('open-gift').onclick = openGift;
$('close-gift').onclick = closeGift;
modal.addEventListener('click', e => { if (e.target === modal) closeGift(); });   // tocar afuera cierra
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGift(); });

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.onclick = async () => {
    const txt = $(btn.dataset.copy).textContent.trim();
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      const t = document.createElement('textarea');
      t.value = txt; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch { }
      t.remove();
    }
    btn.textContent = '¡Copiado!';
    setTimeout(() => btn.textContent = btn.dataset.label, 2000);
  };
});

/* ===== Fotos con marco polaroid: se les quita el fondo blanco =====
   Las fotos con marco de Canva (data-framed) vienen con un rectángulo blanco alrededor.
   Antes se usaba "multiply" para hacerlo desaparecer, y eso volvía todo transparente
   (se veía una foto a través de la otra). Ahora se borra ese blanco de verdad (solo el
   que está AFUERA del marco, empezando desde los bordes) y la foto queda 100% opaca. */
function cutout(src, img) {
  try {
    const w = src.naturalWidth, h = src.naturalHeight;
    if (!w || !h) return false;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, w, h), p = d.data;

    const isBg = k => p[k + 3] < 10 || (p[k] > 236 && p[k + 1] > 236 && p[k + 2] > 236);
    const outside = new Uint8Array(w * h);          // 1 = fondo exterior
    const stack = [];
    const seed = (px, py) => { const i = py * w + px; if (!outside[i] && isBg(i * 4)) { outside[i] = 1; stack.push(i); } };
    for (let i = 0; i < w; i++) { seed(i, 0); seed(i, h - 1); }
    for (let j = 0; j < h; j++) { seed(0, j); seed(w - 1, j); }
    while (stack.length) {
      const i = stack.pop(), px = i % w, py = (i - px) / w;
      if (px > 0) seed(px - 1, py);
      if (px < w - 1) seed(px + 1, py);
      if (py > 0) seed(px, py - 1);
      if (py < h - 1) seed(px, py + 1);
    }

    // 1) el fondo exterior pasa a transparente
    for (let i = 0; i < outside.length; i++) if (outside[i]) p[i * 4 + 3] = 0;

    // 2) suaviza el borde: los píxeles clarito pegados al fondo borrado se vuelven semitransparentes
    //    (así no queda un halo blanco ni bordes "escalonados")
    const edge = [];
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const i = py * w + px;
      if (outside[i]) continue;
      if ((px > 0 && outside[i - 1]) || (px < w - 1 && outside[i + 1]) || (py > 0 && outside[i - w]) || (py < h - 1 && outside[i + w])) edge.push(i);
    }
    edge.forEach(i => {
      const k = i * 4, m = Math.min(p[k], p[k + 1], p[k + 2]);
      if (m > 140) p[k + 3] = Math.max(0, Math.round(255 * (1 - (m - 140) / 96)));
    });

    x.putImageData(d, 0, 0);
    img.src = c.toDataURL('image/png');
    img.classList.add('cutout');
    return true;
  } catch (err) {
    console.warn('No se pudo recortar el fondo de la foto', err);   // pasa si se abre el archivo directo (file://); en GitHub funciona
    return false;
  }
}

/* ===== Fotos: busca automáticamente el archivo correcto =====
   Prueba: foto3.png, "foto 3.png", foto_3.png, .jpg, .jpeg, .webp (y mayúsculas).
   Las que tienen data-framed (marco de Canva) reciben la clase "framed" y se les recorta el fondo. */
const V = '1';
const NAMES = n => [`foto${n}`, `foto ${n}`, `foto_${n}`];
const EXTS = ['png', 'jpg', 'jpeg', 'webp', 'PNG', 'JPG', 'JPEG'];

function candidates(n) {
  const list = [];
  NAMES(n).forEach(name => EXTS.forEach(ext => list.push(encodeURI(`${name}.${ext}`) + '?v=' + V)));
  return list;
}

function loadPhoto(img) {
  const list = candidates(img.dataset.foto);
  const framed = img.hasAttribute('data-framed');
  let i = 0;
  const next = () => {
    if (i >= list.length) { console.warn('No se encontró la foto', img.dataset.foto); return; }
    const probe = new Image();
    const url = list[i++];
    probe.onload = () => {
      if (framed) {
        img.classList.add('framed');
        if (!cutout(probe, img)) img.src = url;   // si no se puede recortar, queda la foto original
      } else {
        img.src = url;
      }
    };
    probe.onerror = next;
    probe.src = url;
  };
  next();
}

document.querySelectorAll('img[data-foto]').forEach(loadPhoto);

/* ===== Texto de la historia: mismo alto que las dos fotos =====
   Ajusta el tamaño de letra hasta que el texto empiece a la altura de la 1ª foto
   y termine a la altura de la 2ª (en cualquier celular). */
function fitStory() {
  const t = document.querySelector('.story-text');
  const box = document.querySelector('.story-photos');
  if (!t || !box || !box.offsetHeight) return;      // todavía oculto o sin cargar
  const target = box.offsetHeight * 0.96;
  let lo = 11, hi = 28;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    t.style.fontSize = mid + 'px';
    if (t.scrollHeight > target) hi = mid; else lo = mid;
  }
  t.style.fontSize = lo + 'px';
}
document.querySelectorAll('.story-photos img').forEach(i => i.addEventListener('load', fitStory));
window.addEventListener('resize', fitStory);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStory);

/* ===== Al volver de Google Maps u otra app, la música sigue sola ===== */
function resumeMusic() {
  if (!ready || !wantPlay || userPaused || isPlaying()) return;
  yt.playVideo(); needResume = true;              // si el celular lo bloquea, se reanuda con el próximo toque
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(resumeMusic, 300); });
window.addEventListener('pageshow', () => setTimeout(resumeMusic, 300));
document.addEventListener('touchend', e => {
  if (!needResume || e.target.closest('.controls')) return;
  needResume = false;
  if (!userPaused && !isPlaying()) yt.playVideo();
}, { passive: true });

/* ===== El ícono del calendario se anima una sola vez: se reinicia al llegar a verlo ===== */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.target.getAttribute('src')) { const im = e.target; im.src = im.src.split('?')[0] + '?t=' + Date.now(); }
  }), { threshold: 0.6 });
  document.querySelectorAll('img[data-replay]').forEach(i => io.observe(i));
}

/* ===== Íconos animados: busca el archivo con o sin "_1" en el nombre (icono-camara_1.gif o icono-camara.gif) ===== */
document.querySelectorAll('img[data-icon]').forEach(img => {
  const n = img.dataset.icon, list = [`${n}_1.gif`, `${n}.gif`, `${n}_1.GIF`, `${n}.GIF`];
  let i = 0;
  const next = () => {
    if (i >= list.length) { console.warn('No se encontró el ícono', n); return; }
    const p = new Image(), u = list[i++] + '?v=1';
    p.onload = () => { img.src = u; };
    p.onerror = next;
    p.src = u;
  };
  next();
});
