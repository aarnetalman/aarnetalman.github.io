// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = target.offsetTop - navHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Navigation scroll effect
window.addEventListener('scroll', function () {
  const nav = document.getElementById('nav');
  if (window.scrollY > 100) {
    nav.classList.add('nav-scrolled');
  } else {
    nav.classList.remove('nav-scrolled');
  }
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', function () {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  document.querySelectorAll('.fade-in').forEach(el => {
    el.classList.add('animate');
    observer.observe(el);
  });
});

const canvas = document.getElementById("particles-canvas");
const ctx = canvas.getContext("2d");

let width = canvas.width = window.innerWidth;
let height = canvas.height = document.querySelector('.hero').offsetHeight;

window.addEventListener("resize", () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = document.querySelector('.hero').offsetHeight;
});

// Config
const NODE_COUNT = width < 768 ? 50 : 90;
const CONNECTIONS_PER_NODE = 4;
const CONNECT_DISTANCE = width < 768 ? 100 : 180;
const ACTIVATION_DURATION = 60;
const MAX_ACTIVE_FIRINGS = 20;

const nodes = [];
const firings = [];
const formulas = [
  "S → [NP] VP", "VP → [V] NP", "NP → [DT] N",
  "NP → [ADJ] N", "S/NP → [NP] VP/NP", "VP/NP → [V] PP",
  "S → WH S/NP", "NP → DET LINK(RC)", "S → [NP] VP LINK(ADV)",
  "NP → [NP] CONJ NP", "VP → [VP] CONJ VP"
];

const formulaSprites = Array.from({ length: 14 }).map(() => ({
  text: formulas[Math.floor(Math.random() * formulas.length)],
  x: Math.random() * width,
  y: Math.random() * height,
  speed: 0.2 + Math.random() * 0.2,
  opacity: 0.04 + Math.random() * 0.07,
  fontSize: width < 768 ? 10 + Math.random() * 3 : 14 + Math.random() * 4,
  angle: (Math.random() - 0.5) * 0.2,
  activated: 0
}));

for (let i = 0; i < NODE_COUNT; i++) {
  nodes.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: Math.random() * 2 + 1.5,
    activated: 0
  });
}

// Utilities
function activateNode(node) {
  node.activated = ACTIVATION_DURATION;
}

function activateFormula(formula) {
  formula.activated = ACTIVATION_DURATION;
}

function triggerFiring(from, to) {
  if (firings.length >= MAX_ACTIVE_FIRINGS) return;
  firings.push({
    x1: from.x,
    y1: from.y,
    x2: to.x,
    y2: to.y,
    opacity: 1.0,
    lifetime: 0
  });
  activateNode(from);
  activateNode(to);
}

// Drawing
function drawConnections() {
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const nearest = nodes
      .map((b, j) => ({ node: b, dist: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter((_, j) => j !== i)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, CONNECTIONS_PER_NODE);

    for (const { node: b, dist } of nearest) {
      ctx.beginPath();
      const opacity = 1 - dist / CONNECT_DISTANCE;
      ctx.strokeStyle = `rgba(167,139,250,${opacity})`;
      ctx.lineWidth = a.activated > 0 || b.activated > 0 ? 1 : 0.5;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      if (dist < 15 && Math.random() < 0.01) {
        triggerFiring(a, b);
      }
    }
  }
}

function drawFormulas() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let f of formulaSprites) {
    const pulse = f.activated > 0 ? 1.0 : f.opacity;
    const color = f.activated > 0 ? "#ffffff" : "#a78bfa";

    ctx.font = `${f.fontSize}px JetBrains Mono, monospace`;
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    ctx.shadowColor = color;
    ctx.shadowBlur = f.activated > 0 ? 6 : 0;

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.fillText(f.text, 0, 0);
    ctx.restore();

    f.y -= f.speed;
    if (f.y < -20) {
      f.y = height + 20;
      f.x = Math.random() * width;
      f.text = formulas[Math.floor(Math.random() * formulas.length)];
    }

    if (f.activated > 0) f.activated--;
  }
  ctx.restore();
}

function drawFirings() {
  for (let i = firings.length - 1; i >= 0; i--) {
    const f = firings[i];
    const progress = f.lifetime / 30;
    const opacity = Math.max(0, 0.4 - progress);
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1.5 - progress;
    ctx.moveTo(f.x1, f.y1);
    ctx.lineTo(f.x2, f.y2);
    ctx.stroke();
    f.lifetime++;
    if (f.lifetime > 30) firings.splice(i, 1);
  }
}

// Collision detection
function checkFormulaNodeCollisions() {
  for (const f of formulaSprites) {
    for (const n of nodes) {
      const dx = f.x - n.x;
      const dy = f.y - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20 && f.activated === 0 && n.activated === 0 && Math.random() < 0.005) {
        activateFormula(f);
        activateNode(n);
      }
    }
  }
}

// Animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  drawConnections();
  drawFormulas();
  drawFirings();
  checkFormulaNodeCollisions();

  for (let n of nodes) {
    ctx.beginPath();
    ctx.fillStyle = n.activated > 0 ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.9)";
    ctx.shadowBlur = n.activated > 0 ? 6 : 0;
    ctx.shadowColor = "#a78bfa";
    ctx.arc(n.x, n.y, n.radius + (n.activated > 0 ? 1.5 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    n.x += n.vx;
    n.y += n.vy;

    if (n.x < 0 || n.x > width) n.vx *= -1;
    if (n.y < 0 || n.y > height) n.vy *= -1;

    if (n.activated > 0) n.activated--;
  }

  requestAnimationFrame(animate);
}

animate();

