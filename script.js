// =========================================================
// Kado Virtual — script.js
// =========================================================

// ---------------------------------------------------------
// KONFIGURASI EMAILJS — supaya permintaan di halaman Wish
// terkirim otomatis ke emailmu. Cara dapetin nilai-nilai ini
// ada di README.md bagian "Setup kirim Wish ke email".
// ---------------------------------------------------------
const EMAILJS_PUBLIC_KEY  = 'PASTE_PUBLIC_KEY_DI_SINI';
const EMAILJS_SERVICE_ID  = 'PASTE_SERVICE_ID_DI_SINI';
const EMAILJS_TEMPLATE_ID = 'PASTE_TEMPLATE_ID_DI_SINI';

const emailjsReady =
  typeof emailjs !== 'undefined' &&
  ![EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID].some(v => v.startsWith('PASTE_'));

if (emailjsReady){
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Page navigation (smooth crossfade, not an abrupt cut) ---------- */
  const pages = Array.from(document.querySelectorAll('.page'));
  const globalBackBtn = document.getElementById('globalBackBtn');
  const pagesWithBack = ['journey', 'moment', 'playlist', 'wish', 'game'];

  function goTo(name){
    const current = pages.find(p => !p.hidden);
    const next = pages.find(p => p.dataset.page === name);
    if (!next || current === next) return;

    if (current){
      current.classList.add('page-leaving');
      window.setTimeout(() => {
        current.hidden = true;
        current.classList.remove('page-leaving');
        next.hidden = false;
        next.classList.remove('page-anim');
        void next.offsetWidth; // reflow, biar animasi masuknya keputer ulang
        next.classList.add('page-anim');
      }, 200);
    } else {
      next.hidden = false;
      next.classList.add('page-anim');
    }

    // Reset scroll setiap ganti halaman. Di mode landscape-otomatis,
    // yang benar-benar bisa di-scroll itu #rotateFrame (bukan window),
    // jadi keduanya perlu direset supaya halaman baru selalu mulai dari atas.
    window.scrollTo(0, 0);
    const rf = document.getElementById('rotateFrame');
    if (rf) { rf.scrollTop = 0; rf.scrollLeft = 0; }
    if (history.replaceState) history.replaceState(null, '', '#' + name);
    if (globalBackBtn) globalBackBtn.hidden = !pagesWithBack.includes(name);
    if (typeof updateMascot === 'function') updateMascot(name);
    if (typeof updateWishLock === 'function') updateWishLock(name);
  }

  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => goTo(el.dataset.goto));
  });

  /* ---------- Maskot penggiring ---------- */
  const mascot = document.getElementById('mascot');
  const mascotBubble = document.getElementById('mascotBubble');
  const mascotHints = {
    cover: 'Hai! Yuk buka amplopnya 💌',
    letter: 'Coba tekan tulisannya di bawah~ 👉',
    menu: 'Mau buka yang mana dulu nih?',
    journey: 'Ini nih momen-momen kalian 📸',
    moment: 'Baca pelan-pelan ya~ 🥹',
    playlist: 'Sambil dengerin lagu ini yuk 🎶',
    wish: 'Tulis dulu permintaanmu, baru boleh tiup lilinnya 🕯️',
    game: 'Yuk coba tebak-tebak ramalannya 🔮'
  };
  function updateMascot(name){
    if (!mascotBubble) return;
    mascotBubble.textContent = mascotHints[name] || '';
    mascotBubble.style.animation = 'none';
    void mascotBubble.offsetWidth;
    mascotBubble.style.animation = '';
    if (mascot){
      mascot.classList.remove('is-excited');
      void mascot.offsetWidth;
      mascot.classList.add('is-excited');
    }
  }
  updateMascot('cover');

  /* Buat maskot ikut heboh di momen-momen khusus (bukan cuma ganti halaman) */
  function cheerMascot(text){
    if (!mascotBubble) return;
    mascotBubble.textContent = text;
    mascotBubble.style.animation = 'none';
    void mascotBubble.offsetWidth;
    mascotBubble.style.animation = '';
    if (mascot){
      mascot.classList.remove('is-excited');
      void mascot.offsetWidth;
      mascot.classList.add('is-excited');
    }
  }

  /* First time opening the surprise menu deserves a little sky show */
  const openMenuBtn = document.getElementById('openMenuBtn');
  if (openMenuBtn){
    openMenuBtn.addEventListener('click', () => {
      setTimeout(() => { fireworksShow(6); burstConfetti(); }, 200);
    });
  }

  /* ---------- Envelope open ---------- */
  const envelopeBtn = document.getElementById('envelopeBtn');
  if (envelopeBtn){
    envelopeBtn.addEventListener('click', () => {
      envelopeBtn.classList.add('is-open');
      fireworksShow(4);
      burstConfetti();
      attemptRealLandscapeLock(); // enhancement kalau browser-nya support
      setTimeout(() => goTo('letter'), 650);
    });
  }

  /* Percobaan mengunci orientasi layar sungguhan (bukan trik CSS) —
     hanya berhasil di sebagian browser (biasanya Chrome Android dalam
     mode fullscreen). Kalau gagal/tidak didukung, trik CSS auto-rotate
     di style.css tetap jalan sebagai cadangan, jadi aman diabaikan. */
  function attemptRealLandscapeLock(){
    try {
      const el = document.documentElement;
      const request = el.requestFullscreen || el.webkitRequestFullscreen;
      if (request){
        request.call(el).then(() => {
          if (screen.orientation && screen.orientation.lock){
            screen.orientation.lock('landscape').catch(() => {});
          }
        }).catch(() => {});
      } else if (screen.orientation && screen.orientation.lock){
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) { /* diamkan saja, fallback CSS yang jalan */ }
  }

  /* ---------- Music player (Moment page) ---------- */
  const playBtn = document.getElementById('playBtn');
  const bgAudio = document.getElementById('bgAudio');
  const vinyl = document.getElementById('vinyl');

  if (playBtn && bgAudio){
    playBtn.addEventListener('click', () => {
      if (bgAudio.paused){
        bgAudio.play().catch(() => { /* no source added yet — that's fine */ });
        playBtn.textContent = '❚❚';
        vinyl.classList.add('spin');
      } else {
        bgAudio.pause();
        playBtn.textContent = '▶';
        vinyl.classList.remove('spin');
      }
    });
  }

  /* ---------- Wish page: blow the candles + send wish by email ---------- */
  const cake = document.getElementById('cake');
  const blowBtn = document.getElementById('blowBtn');
  const wishInput = document.getElementById('wishInput');
  const wishStatus = document.getElementById('wishStatus');
  const wishReveal = document.getElementById('wishReveal');
  const wishBackBtn = document.getElementById('globalBackBtn');

  function updateWishLock(name){
    if (!wishBackBtn) return;
    if (name !== 'wish') return;
    const alreadySent = cake && cake.classList.contains('is-blown');
    wishBackBtn.disabled = !alreadySent;
    wishBackBtn.textContent = alreadySent ? '‹ Back' : '🔒 Tulis dulu';
  }

  if (blowBtn){
    blowBtn.addEventListener('click', () => {
      if (cake.classList.contains('is-blown')) return;

      const wishText = (wishInput && wishInput.value.trim()) || '';

      if (!wishText){
        // Belum nulis apa-apa — kasih nudge lembut, jangan biarkan lanjut.
        wishInput.classList.remove('shake');
        void wishInput.offsetWidth;
        wishInput.classList.add('shake');
        wishInput.focus();
        wishStatus.hidden = false;
        wishStatus.classList.add('is-nudge');
        wishStatus.textContent = 'Tulis dulu permintaanmu ya, baru bisa ditiup lilinnya 🥺';
        return;
      }

      wishStatus.classList.remove('is-nudge');
      wishStatus.hidden = true;
      cake.classList.add('is-blown');
      blowBtn.classList.add('is-hidden');
      updateWishLock('wish'); // sekarang boleh Back
      setTimeout(() => { wishReveal.hidden = false; }, 300);
      burstConfetti();
      fireworksShow(6);
      cheerMascot('Yeay, wish-nya udah terbang ke bintang! ✨');

      if (!emailjsReady){
        // Belum di-setup — lihat README.md bagian "Setup kirim Wish ke email".
        console.warn('EmailJS belum dikonfigurasi. Wish belum terkirim ke email.');
        return;
      }

      wishStatus.hidden = false;
      wishStatus.textContent = 'Mengirim permintaanmu...';

      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        message: wishText,
        source: 'Wish',
        sent_at: new Date().toLocaleString('id-ID')
      }).then(() => {
        wishStatus.textContent = 'Permintaanmu berhasil terkirim 🤍';
      }).catch(() => {
        wishStatus.textContent = 'Permintaanmu tersimpan, tapi gagal terkirim ke email.';
      });
    });
  }

  /* ---------- Ramalan page: birthday personality quiz (no right/wrong) ---------- */
  // Ganti pertanyaan/pilihan sesuka hati. Yang penting: urutan pilihan
  // (A/B/C/D) tetap konsisten mewakili tipe yang sama di semua soal
  // (lihat array `personalityTypes` di bawah, urutannya harus sama).
  const personalityTypes = [
    {
      key: 'sosial',
      title: 'Si Kupu-Kupu Sosial 🦋',
      note: 'Tahun ini kamu bakal dikelilingi tawa dan orang-orang baik. Energimu itu magnet buat circle-circle seru — teruslah jadi cahaya di setiap ruangan yang kamu masuki ✨'
    },
    {
      key: 'petualang',
      title: 'Si Petualang 🌍',
      note: 'Tahun ini penuh cerita baru buat kamu! Beranilah coba hal-hal yang belum pernah kamu lakuin, karena versi terbaik kamu ada di luar zona nyaman 🚀'
    },
    {
      key: 'tenang',
      title: 'Si Pemimpi Tenang 🌙',
      note: 'Tahun ini saatnya kamu lebih baik-baik sama diri sendiri. Semoga hari-harimu dipenuhi ketenangan, dan semua yang kamu impikan diam-diam pelan-pelan jadi nyata 🤍'
    },
    {
      key: 'sayang',
      title: 'Si Penyayang Sejati 💞',
      note: 'Tahun ini bakal makin hangat karena orang-orang di sekitarmu makin sayang kamu. Kamu itu rumah buat banyak orang — semoga kamu juga selalu dapet kehangatan yang sama balik 🏡'
    }
  ];

  const quizQuestions = [
    {
      q: 'Kalau ulang tahunmu tahun ini adalah sebuah lagu, iramanya kayak apa?',
      options: [
        '🎉 Upbeat, bikin semua orang ikut goyang',
        '🧭 Nada petualangan, penuh kejutan',
        '🌙 Slow, healing, syahdu',
        '💌 Manis, related sama satu orang spesial'
      ]
    },
    {
      q: 'Kalau tahun ini kamu jadi karakter utama sebuah film, ceritanya soal…',
      options: [
        '🎊 Ngumpulin party crew paling seru sejagat',
        '🗺️ Explore dunia yang belum pernah disentuh',
        '🍃 Belajar pelan-pelan buat lebih damai sama diri sendiri',
        '🏡 Nemuin arti "rumah" lewat orang-orang tersayang'
      ]
    },
    {
      q: 'Satu skill baru yang pengen kamu unlock tahun ini?',
      options: [
        '😄 Jago bikin siapa aja langsung akrab',
        '🎢 Berani ambil risiko & lompat ke hal baru',
        '🧘 Lebih tenang, nggak gampang overthinking',
        '💞 Lebih ekspresif nunjukin sayang ke orang terdekat'
      ]
    },
    {
      q: 'Kalau ada "soundtrack tahun ini" buat kamu, judulnya…',
      options: [
        '"Party Sampai Pagi"',
        '"Jalan yang Belum Pernah Kulewati"',
        '"Napas Panjang, Pelan-Pelan"',
        '"Untukmu, Selalu"'
      ]
    },
    {
      q: 'Kado terbaik yang kamu harap datang tahun ini (selain kado ini, hehe)?',
      options: [
        '🎈 Lebih banyak circle & cerita seru bareng teman',
        '✈️ Satu petualangan besar yang bikin deg-degan',
        '🕊️ Ketenangan & waktu buat diri sendiri',
        '🤍 Lebih banyak waktu sama orang-orang tersayang'
      ]
    }
  ];

  const quizCard = document.getElementById('quizCard');
  const quizProgress = document.getElementById('quizProgress');
  const quizResult = document.getElementById('quizResult');
  const quizScoreText = document.getElementById('quizScoreText');
  const quizScoreNote = document.getElementById('quizScoreNote');
  const quizRestart = document.getElementById('quizRestart');

  let quizIndex = 0;
  let typeTally = [0, 0, 0, 0]; // sejajar urutan dengan personalityTypes
  let quizAnswers = []; // dikumpulin buat dikirim ke email nanti

  function renderQuestion(){
    if (!quizCard) return;
    quizResult.hidden = true;
    quizCard.hidden = false;
    quizProgress.parentElement.hidden = false;

    const item = quizQuestions[quizIndex];
    quizProgress.textContent = `Soal ${quizIndex + 1}/${quizQuestions.length}`;

    quizCard.classList.remove('quiz-anim');
    void quizCard.offsetWidth; // reflow supaya animasinya keputer ulang tiap soal
    quizCard.classList.add('quiz-anim');

    quizCard.innerHTML = '';
    const qEl = document.createElement('p');
    qEl.className = 'quiz-question';
    qEl.textContent = item.q;
    quizCard.appendChild(qEl);

    const optsWrap = document.createElement('div');
    optsWrap.className = 'quiz-options';

    item.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        Array.from(optsWrap.children).forEach(b => b.disabled = true);
        btn.classList.add('is-selected');
        typeTally[i]++;
        quizAnswers.push({ q: item.q, a: opt });

        setTimeout(() => {
          quizIndex++;
          if (quizIndex < quizQuestions.length){
            renderQuestion();
          } else {
            showResult();
          }
        }, 500);
      });
      optsWrap.appendChild(btn);
    });

    quizCard.appendChild(optsWrap);
  }

  function showResult(){
    quizCard.hidden = true;
    quizProgress.parentElement.hidden = true;
    quizResult.hidden = false;

    const topScore = Math.max(...typeTally);
    const topIndexes = typeTally
      .map((v, i) => (v === topScore ? i : -1))
      .filter(i => i !== -1);
    const winnerIndex = topIndexes[Math.floor(Math.random() * topIndexes.length)]; // tie? pilih acak
    const result = personalityTypes[winnerIndex];

    quizScoreText.textContent = result.title;
    quizScoreNote.textContent = result.note;

    burstConfetti();
    fireworksShow(6);
    cheerMascot(`Taraa~ kamu itu ${result.title}!`);
    sendQuizResultByEmail(result, quizAnswers);
  }

  function sendQuizResultByEmail(result, answers){
    if (!emailjsReady) {
      console.warn('EmailJS belum dikonfigurasi. Hasil Ramalan belum terkirim ke email.');
      return;
    }
    const answerLines = answers
      .map((a, i) => `${i + 1}. ${a.q}\n   Jawaban: ${a.a}`)
      .join('\n\n');
    const summary =
      `Hasil Ramalan: ${result.title}\n\n` +
      `Jawaban-jawabannya:\n${answerLines}`;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      message: summary,
      source: 'Ramalan',
      sent_at: new Date().toLocaleString('id-ID')
    }).catch(() => {
      console.warn('Gagal mengirim hasil Ramalan ke email.');
    });
  }

  if (quizRestart){
    quizRestart.addEventListener('click', () => {
      quizIndex = 0;
      typeTally = [0, 0, 0, 0];
      quizAnswers = [];
      renderQuestion();
    });
  }

  if (quizCard){
    renderQuestion();
  }

  /* ---------- Floating background decorations ---------- */
  const floaters = document.getElementById('floaters');
  const floatSymbols = ['💖','✨','🌸','💫','🩷'];
  if (floaters){
    for (let i = 0; i < 14; i++){
      const s = document.createElement('span');
      s.textContent = floatSymbols[i % floatSymbols.length];
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = (12 + Math.random() * 16) + 'px';
      s.style.animationDuration = (10 + Math.random() * 12) + 's';
      s.style.animationDelay = (Math.random() * 12) + 's';
      floaters.appendChild(s);
    }
  }

  /* ---------- Confetti + Fireworks (shared canvas) ---------- */
  const canvas = document.getElementById('confetti');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let confettiParticles = [];
  let rockets = [];
  let sparks = [];
  let rafId = null;

  function resizeCanvas(){
    if (!canvas) return;
    // pakai ukuran layout sendiri (bukan window.innerWidth/Height) supaya
    // tetap presisi walau seluruh halaman lagi diputar mode landscape
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function ensureLoop(){
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function burstConfetti(){
    if (!ctx) return;
    const colors = ['#ff2e93', '#eab654', '#fff8f0', '#c81d4f', '#7fdcff', '#ff9ecb', '#b98cff'];
    const cx = canvas.width / 2;

    for (let i = 0; i < 140; i++){
      confettiParticles.push({
        x: cx + (Math.random() - 0.5) * 90,
        y: canvas.height * 0.5,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 13 - 4,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        life: 0,
        maxLife: 100 + Math.random() * 40
      });
    }
    ensureLoop();
  }

  // A firework = a rocket that climbs then bursts into a ring of sparks
  // (plus a second inner ring + a quick "crackle" pop for extra drama).
  const fireworkPalettes = [
    ['#ff6ec7', '#ffd1e8', '#eab654'],
    ['#7fdcff', '#ffffff', '#eab654'],
    ['#ff2e93', '#fff2c2', '#c81d4f'],
    ['#eab654', '#fff8f0', '#ff9ecb'],
    ['#b98cff', '#ffe1f5', '#7fdcff'],
    ['#ff5252', '#ffe27a', '#ffffff']
  ];

  function spawnRocket(targetX, targetY, big){
    const palette = fireworkPalettes[Math.floor(Math.random() * fireworkPalettes.length)];
    rockets.push({
      x: targetX + (Math.random() - 0.5) * 26,
      y: canvas.height + 10,
      targetY,
      vy: -(10 + Math.random() * 3),
      trail: [],
      palette,
      big
    });
    ensureLoop();
  }

  function explode(x, y, palette, big){
    const ringCount = big ? 70 : 54;
    for (let i = 0; i < ringCount; i++){
      const angle = (Math.PI * 2 * i) / ringCount + Math.random() * 0.15;
      const speed = (big ? 2.6 : 2) + Math.random() * (big ? 4.2 : 3.4);
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 1.6 + Math.random() * 2,
        life: 0,
        maxLife: 55 + Math.random() * 35,
        twinkle: Math.random() < 0.35
      });
    }
    // cincin kedua di dalam, warnanya beda dikit — biar keliatan berlapis
    const innerCount = Math.floor(ringCount * 0.5);
    for (let i = 0; i < innerCount; i++){
      const angle = (Math.PI * 2 * i) / innerCount + Math.random() * 0.3;
      const speed = 1 + Math.random() * 1.6;
      sparks.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#fff8f0',
        size: 1 + Math.random() * 1.3,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        twinkle: true
      });
    }
    // "crackle" — beberapa percikan meledak lagi kecil-kecil sesaat kemudian
    if (big || Math.random() < 0.6){
      setTimeout(() => {
        for (let c = 0; c < 3; c++){
          const cx = x + (Math.random() - 0.5) * 40;
          const cy = y + (Math.random() - 0.5) * 40;
          for (let i = 0; i < 12; i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = .8 + Math.random() * 1.6;
            sparks.push({
              x: cx, y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: palette[Math.floor(Math.random() * palette.length)],
              size: 1 + Math.random(),
              life: 0,
              maxLife: 24 + Math.random() * 16,
              twinkle: true
            });
          }
        }
      }, 160 + Math.random() * 120);
    }
  }

  function fireworksShow(count){
    for (let i = 0; i < count; i++){
      setTimeout(() => {
        const x = canvas.width * (0.18 + Math.random() * 0.64);
        const y = canvas.height * (0.15 + Math.random() * 0.28);
        const big = i === 0 || Math.random() < 0.3;
        spawnRocket(x, y, big);
      }, i * 260 + Math.random() * 180);
    }
  }

  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* confetti (falling paper pieces) */
    confettiParticles.forEach(p => {
      p.vy += 0.25;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    confettiParticles = confettiParticles.filter(p => p.life < p.maxLife);

    /* rockets climbing to their burst point */
    rockets.forEach(r => {
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 6) r.trail.shift();
      r.y += r.vy;

      ctx.save();
      ctx.globalAlpha = .95;
      ctx.strokeStyle = r.palette[0];
      ctx.shadowColor = r.palette[0];
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      r.trail.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y));
      ctx.lineTo(r.x, r.y);
      ctx.stroke();
      ctx.restore();

      if (r.y <= r.targetY){
        explode(r.x, r.y, r.palette, r.big);
        r.done = true;
      }
    });
    rockets = rockets.filter(r => !r.done);

    /* sparks (the firework burst itself) */
    sparks.forEach(s => {
      s.vy += 0.045; // gentle gravity
      s.vx *= 0.985;
      s.vy *= 0.985;
      s.x += s.vx;
      s.y += s.vy;
      s.life++;

      const alpha = Math.max(0, 1 - s.life / s.maxLife);
      const twinkleMul = s.twinkle ? (0.5 + Math.abs(Math.sin(s.life * 0.9))) : 1;
      ctx.save();
      ctx.globalAlpha = alpha * twinkleMul;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = s.twinkle ? 12 : 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    sparks = sparks.filter(s => s.life < s.maxLife);

    if (confettiParticles.length || rockets.length || sparks.length){
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  /* ---------- Tap / click sparkle, anywhere on the page ---------- */
  const tapSymbols = ['✨', '💖', '⭐', '💫'];
  let lastTap = 0;
  document.addEventListener('pointerdown', (e) => {
    const now = Date.now();
    if (now - lastTap < 90) return; // avoid double-firing on quick multi-touch
    lastTap = now;

    const s = document.createElement('span');
    s.className = 'tap-spark';
    s.textContent = tapSymbols[Math.floor(Math.random() * tapSymbols.length)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  });

  /* ---------- Restore page from URL hash on load ---------- */
  const startHash = window.location.hash.replace('#', '');
  const validPages = pages.map(p => p.dataset.page);
  if (startHash && validPages.includes(startHash)){
    goTo(startHash);
  }
});
