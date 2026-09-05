// 1. Navegación
function cambiarSeccion(id) {
  if (id === 'inicio') {
    document.getElementById('inicio').classList.remove('hidden');
    document.getElementById('header-nav').classList.add('hidden');
    document.getElementById('contenido-principal').classList.add('hidden');
    return;
  }

  document.getElementById('inicio').classList.add('hidden');
  document.getElementById('header-nav').classList.remove('hidden');
  document.getElementById('contenido-principal').classList.remove('hidden');

  document.querySelectorAll('.seccion').forEach(seccion => {
    seccion.classList.remove('activa');
  });
  
  const seccionObjetivo = document.getElementById(id);
  if (seccionObjetivo) seccionObjetivo.classList.add('activa');
}

// 2. Lógica del Manga (Sin ruta assets/)
const paginasManga = [
  "pagina1.jpg",
  "pagina2.jpg",
  "pagina3.jpg",
  "pagina4.jpg"
];
let paginaActual = 0;

function moverManga(direccion) {
  paginaActual += direccion;
  if (paginaActual < 0) paginaActual = 0;
  if (paginaActual >= paginasManga.length) paginaActual = paginasManga.length - 1;
  const imgManga = document.getElementById('imagen-manga');
  if (imgManga) imgManga.src = paginasManga[paginaActual];
}

// 3. Modal / Popup para mensajes del Mapa
function abrirMensaje(texto) {
  document.getElementById('modal-texto').innerText = texto;
  document.getElementById('modal').classList.remove('hidden');
}

function cerrarMensaje() {
  document.getElementById('modal').classList.add('hidden');
}

// 4. JUEGO EN CANVAS
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const imgMario = document.getElementById('imgMario');
const imgTu = document.getElementById('imgTu');
const imgNovio = document.getElementById('imgNovio');

let mario = {
  x: 70,
  y: 250,
  ancho: 55,
  alto: 55,
  velocidadY: 0,
  fuerzaSalto: -14,
  saltando: false
};

let tuPoder = {
  x: 1000,
  y: 160,
  ancho: 45,
  alto: 45,
  activo: false
};

let besitos = [
  { x: 800, y: 180, alto: 25, ancho: 25 },
  { x: 1100, y: 120, alto: 25, ancho: 25 }
];

let puntos = 0;
const sueloY = 250;
let fondoX = 0;

let superPoderActivo = false;
let tiempoPoder = 0;

function saltar() {
  if (!mario.saltando) {
    mario.velocidadY = mario.fuerzaSalto;
    mario.saltando = true;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    saltar();
  }
});

if (canvas) {
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    saltar();
  });
  canvas.addEventListener('mousedown', saltar);
}

function dibujarElemento(img, x, y, ancho, alto, colorFallback) {
  if (img && img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, x, y, ancho, alto);
  } else {
    ctx.fillStyle = colorFallback;
    ctx.fillRect(x, y, ancho, alto);
  }
}

function dibujarFondo() {
  // Cielo
  ctx.fillStyle = superPoderActivo ? '#ffeaa7' : '#dfe6e9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Nubes
  fondoX -= 0.6;
  if (fondoX <= -250) fondoX = 0;

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 5; i++) {
    let nx = fondoX + i * 220;
    ctx.beginPath();
    ctx.arc(nx + 40, 60, 20, 0, Math.PI * 2);
    ctx.arc(nx + 70, 50, 30, 0, Math.PI * 2);
    ctx.arc(nx + 100, 60, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Suelo
  ctx.fillStyle = '#ff758c';
  ctx.fillRect(0, 305, canvas.width, 45);
  ctx.fillStyle = '#ff4757';
  ctx.fillRect(0, 305, canvas.width, 5);
}

function dibujarBesitoPixel(x, y) {
  ctx.fillStyle = '#ff3838';
  ctx.fillRect(x + 5, y + 0, 6, 6);
  ctx.fillRect(x + 15, y + 0, 6, 6);
  ctx.fillRect(x + 0, y + 6, 26, 8);
  ctx.fillRect(x + 3, y + 14, 20, 6);
  ctx.fillRect(x + 8, y + 20, 10, 6);
}

function actualizarJuego() {
  if (!ctx) return;

  dibujarFondo();

  mario.y += mario.velocidadY;
  mario.velocidadY += 0.7;

  if (mario.y >= sueloY) {
    mario.y = sueloY;
    mario.saltando = false;
  }

  if (superPoderActivo) {
    ctx.fillStyle = 'rgba(255, 234, 167, 0.7)';
    ctx.beginPath();
    ctx.arc(mario.x + 27, mario.y + 27, 42, 0, Math.PI * 2);
    ctx.fill();

    tiempoPoder--;
    if (tiempoPoder <= 0) {
      superPoderActivo = false;
      mario.fuerzaSalto = -14;
    }
  }

  dibujarElemento(imgMario, mario.x, mario.y, mario.ancho, mario.alto, '#ff4757');

  besitos.forEach((beso) => {
    beso.x -= superPoderActivo ? 8 : 5;
    dibujarBesitoPixel(beso.x, beso.y);

    if (beso.x < -30) {
      beso.x = 800 + Math.random() * 250;
      beso.y = 100 + Math.random() * 120;
    }

    if (
      mario.x < beso.x + 26 &&
      mario.x + mario.ancho > beso.x &&
      mario.y < beso.y + 26 &&
      mario.y + mario.alto > beso.y
    ) {
      puntos++;
      beso.x = 800 + Math.random() * 250;
      beso.y = 100 + Math.random() * 120;

      if (puntos % 7 === 0 && !tuPoder.activo) {
        tuPoder.activo = true;
        tuPoder.x = 850;
        tuPoder.y = 140;
      }
    }
  });

  if (tuPoder.activo) {
    tuPoder.x -= 4;

    ctx.fillStyle = '#ffeaa7';
    ctx.fillRect(tuPoder.x - 4, tuPoder.y - 4, tuPoder.ancho + 8, tuPoder.alto + 8);

    dibujarElemento(imgTu, tuPoder.x, tuPoder.y, tuPoder.ancho, tuPoder.alto, '#ff6b81');

    if (
      mario.x < tuPoder.x + tuPoder.ancho &&
      mario.x + mario.ancho > tuPoder.x &&
      mario.y < tuPoder.y + tuPoder.alto &&
      mario.y + mario.alto > tuPoder.y
    ) {
      tuPoder.activo = false;
      superPoderActivo = true;
      tiempoPoder = 320;
      mario.fuerzaSalto = -17;
      puntos += 5;
    }

    if (tuPoder.x < -50) {
      tuPoder.activo = false;
    }
  }

  ctx.fillStyle = '#5c3d46';
  ctx.font = '12px "Press Start 2P", sans-serif';
  ctx.fillText(`Besos: ${puntos}`, 20, 35);

  if (superPoderActivo) {
    ctx.fillStyle = '#d63031';
    ctx.fillText('¡SUPER PODER DE AMOR! 💖', 260, 35);
  }

  if (puntos >= 15) {
    ctx.fillStyle = '#ff4757';
    ctx.fillText('¡Eres el mejor! ❤️', 280, 70);
    dibujarElemento(imgNovio, 720, 245, 55, 55, '#70a1ff');
  }

  requestAnimationFrame(actualizarJuego);
}

window.onload = () => {
  actualizarJuego();
};