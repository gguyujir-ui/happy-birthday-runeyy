# Kado Virtual 🤍

Website ucapan ulang tahun interaktif — amplop yang dibuka, surat, lalu menu
"Pilih Kejutannya" (Journey / Moment / Playlist / Wish / Ramalan), lengkap dengan
animasi, musik, dan hiasan-hiasan kecil (bunga, hati, planet, catatan musik).

## Struktur file

```
kado-virtual/
├── index.html      ← semua halaman (envelope, letter, menu, journey, moment, playlist, wish, game)
├── style.css       ← semua gaya visual & animasi
├── script.js       ← navigasi antar halaman, buka amplop/lilin, kuis, confetti
└── assets/         ← foto-foto (ganti dengan fotomu sendiri)
```

## Mode Landscape Otomatis

Situs ini didesain landscape (kayak video), jadi begitu dibuka di HP yang
posisinya tegak (portrait), seluruh tampilan otomatis diputar 90° biar
langsung landscape tanpa perlu diputar manual — persis kayak referensi
yang kamu kasih. Kalau HP-nya memang sudah dimiringkan (landscape asli),
tampil normal apa adanya.

Catatan teknis kecil: ini pakai trik CSS (bukan API khusus yang belum
tentu didukung semua browser), jadi kalau ada halaman yang isinya lebih
panjang dari layar, tetap bisa di-scroll — cuma arah gesernya jadi
menyamping (bukan naik-turun) karena efek putarannya. Ini keterbatasan
wajar dari trik ini, bukan bug.

## Maskot Penggiring

Ada karakter kecil (blob pink imut) yang selalu nongol di pojok kanan
bawah di semua halaman, dengan gelembung kata yang otomatis berubah
sesuai halaman yang lagi dibuka — kasih semacam petunjuk/semangat ke
penerima kado. Dia juga ikut heboh (mantul) di momen spesial: setelah
wish terkirim, dan pas hasil Ramalan muncul.

Mau ganti kata-katanya? Buka `script.js`, cari `mascotHints` untuk ubah
petunjuk per halaman, atau `cheerMascot(...)` untuk ubah reaksi di
momen spesial.

## Halaman Wish Terkunci Sampai Terkirim

Begitu penerima masuk ke halaman Wish, tombol "‹ Back" otomatis berubah
jadi "🔒 Tulis dulu" dan terkunci — nggak bisa balik ke menu sebelum dia
benar-benar menulis & mengirim permintaannya. Kalau dia coba tekan
"Tiup Lilin" tanpa menulis apa-apa, kolom tulisannya akan bergoyang
lembut plus muncul pesan "tulis dulu ya" — belum bisa lanjut. Begitu
sudah menulis & mengirim, kuncinya otomatis terbuka.

## Kalau situsnya kelihatan "nyangkut" di versi lama

Kadang setelah upload file baru ke GitHub, tampilannya masih kelihatan
seperti versi lama — ini biasanya karena **file CSS/JS-nya ke-cache**
(disimpan sementara) di server hosting (Vercel/GitHub Pages) atau di
browser HP-nya sendiri, bukan karena upload-nya gagal.

Cara paling ampuh mengatasinya:
1. Buka `index.html`, cari baris `style.css?v=2` dan `script.js?v=2`,
   naikkan angkanya (jadi `?v=3`, dst) tiap kali habis update file CSS
   atau JS. Ini memaksa browser mengambil file yang benar-benar baru,
   bukan yang tersimpan di cache.
2. Kalau masih belum berubah juga, coba buka situsnya di jendela
   Incognito/Penyamaran, atau hapus cache browser HP-mu.
3. File `vercel.json` yang disertakan di sini juga sudah mengatur
   supaya Vercel tidak menyimpan cache `style.css`/`script.js` terlalu
   lama.

## Cara personalisasi (paling penting)

1. **Ganti foto** — timpa file di folder `assets/` dengan fotomu, pakai nama
   file yang sama persis (mis. `photo-1.jpg` untuk foto hati, `photo-2.jpg`
   untuk polaroid, `photo-3.jpg`/`photo-p1.jpg`/`photo-p2.jpg` untuk photo
   strip di halaman pembuka, `gallery-1.jpg` dst untuk Journey), atau
   ubah `src="assets/..."` di `index.html` ke nama file barumu.
2. **Ganti nama & pesan** — buka `index.html`, cari teks seperti
   `Freya Anindya` dan paragraf ucapan, ganti dengan nama dan kata-katamu
   sendiri.
3. **Ganti musik** — di bagian *Moment* (`<audio id="bgAudio">`), tambahkan:
   ```html
   <source src="assets/song.mp3" type="audio/mpeg">
   ```
   lalu taruh file mp3-mu di folder `assets/`.
4. **Ganti video di Playlist** — cari `VIDEO_ID` / link
   `youtube.com/embed/...` di `index.html`, ganti dengan ID video YouTube
   pilihanmu (ambil dari URL video, bagian setelah `v=`).
5. **Ganti pesan Wish** — cari teks "Permintaanmu sudah terkirim..." di
   bagian `page-wish` pada `index.html`, ganti sesuai kata-katamu.
6. **Ganti soal Ramalan** — buka `script.js`, cari `quizQuestions` untuk
   ganti teks pertanyaan & 4 pilihannya, atau `personalityTypes` untuk
   ganti judul/isi hasil ramalannya. Urutan pilihan (A/B/C/D) di semua
   soal harus tetap konsisten mewakili tipe yang sama — cek komentar di
   atas array-nya.
7. **Aktifkan kirim Wish & hasil Ramalan ke email** — lihat bagian "Setup
   kirim ke email" di bawah, wajib dilakukan kalau mau fitur ini jalan.

## Setup kirim ke email

Dua halaman mengirim isinya otomatis ke emailmu lewat layanan gratis
[EmailJS](https://www.emailjs.com/) (dipakai template yang sama untuk
keduanya):

- **Wish** — begitu penerima menekan "Tiup Lilin & Kirim Permintaan",
  teks permintaannya terkirim.
- **Ramalan** — begitu hasil ramalannya muncul, jawaban dari kelima soal
  beserta tipe hasilnya ikut terkirim diam-diam.

Karena GitHub Pages cuma bisa menyajikan file statis (tanpa server), situs
sejenis ini memang butuh layanan pihak ketiga seperti ini untuk urusan
kirim-mengirim email.

Langkah setupnya (sekali saja, ±5 menit):

1. Buat akun gratis di [emailjs.com](https://www.emailjs.com/).
2. Di dashboard, buka **Email Services → Add New Service**, sambungkan ke
   email pribadimu (mis. Gmail), lalu catat **Service ID**-nya.
3. Buka **Email Templates → Create New Template**. Di bagian isi email,
   pakai variabel `{{source}}` (asalnya dari Wish atau Ramalan),
   `{{message}}` (isinya), dan `{{sent_at}}` (waktu kirim), contoh:
   ```
   Subject: Ada kiriman baru dari kado virtualmu 💌

   Dari halaman: {{source}}

   {{message}}

   Dikirim pada: {{sent_at}}
   ```
   Pastikan kolom **"To email"** di pengaturan template diisi alamat
   emailmu sendiri. Catat **Template ID**-nya.
4. Buka **Account → API Keys**, catat **Public Key**-nya.
5. Buka `script.js`, di baris paling atas, ganti tiga baris ini dengan
   nilai yang kamu catat tadi:
   ```js
   const EMAILJS_PUBLIC_KEY  = 'PASTE_PUBLIC_KEY_DI_SINI';
   const EMAILJS_SERVICE_ID  = 'PASTE_SERVICE_ID_DI_SINI';
   const EMAILJS_TEMPLATE_ID = 'PASTE_TEMPLATE_ID_DI_SINI';
   ```
6. Simpan, lalu commit & push lagi ke GitHub (atau upload ulang
   `script.js` kalau lewat HP).

Catatan: EmailJS versi gratis punya batas jumlah kirim per bulan (cek
halaman pricing mereka untuk angka terbarunya) — untuk kado virtual
personal seperti ini biasanya jauh lebih dari cukup. Kalau kamu belum
sempat setup, tombolnya tetap aman dipakai (lilin tetap padam, animasi
tetap jalan) — cuma bagian kirim emailnya yang belum aktif.

## Cara menjalankan di lokal

Cukup buka `index.html` langsung di browser. Untuk hasil terbaik (supaya
audio/video tidak diblokir browser), jalankan server lokal sederhana:

```bash
cd kado-virtual
python3 -m http.server 8000
```

lalu buka `http://localhost:8000`.

## Cara upload ke GitHub + GitHub Pages

1. Buat repository baru di GitHub, misalnya `kado-virtual`.
2. Di folder ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Kado virtual pertamaku"
   git branch -M main
   git remote add origin https://github.com/USERNAME/kado-virtual.git
   git push -u origin main
   ```
3. Di repo GitHub → **Settings → Pages** → pilih branch `main`, folder `/root`
   → **Save**.
4. Tunggu ±1 menit, website akan aktif di:
   `https://USERNAME.github.io/kado-virtual/`

## Struktur alur halaman

```
Cover (amplop)
   └─ tap ─▶ Letter (foto + ucapan singkat)
                └─ tombol "Buka Kejutannya" ─▶ Menu
                                                 ├─ Journey  (galeri foto polaroid)
                                                 ├─ Moment   (pesan personal + musik)
                                                 ├─ Playlist (video YouTube + foto)
                                                 ├─ Wish     (tiup lilin + tulis & kirim permintaan)
                                                 └─ Ramalan (kuis kepribadian ulang tahun, tanpa benar/salah)
```

Semua halaman "Back" kembali ke Menu.

## Catatan

- Font: **Dancing Script** (judul/nama, kesan tulisan tangan romantis) dan
  **Quicksand** (teks/tombol), keduanya dari Google Fonts.
- Semua dekorasi (hati, planet, paus, bunga, catatan musik) dibuat dari
  emoji + CSS, jadi ringan dan tidak butuh gambar tambahan.
- Foto di `assets/` saat ini masih placeholder — ganti dulu sebelum dikirim
  ke orang yang dituju 🙂
- Halaman **Ramalan** murni buat seru-seruan si penerima kado sendirian —
  tidak ada jawaban benar/salah, hasilnya selalu personal & positif,
  cocok untuk kado yang dibuka saat kalian tidak sedang bareng.

## Animasi interaktif

- **Sentuh layar di mana saja** → muncul kerlip kecil (✨💖⭐💫) di titik
  yang disentuh. Berlaku di semua halaman.
- **Kembang api sungguhan** (roket naik lalu meledak jadi percikan warna-warni,
  dengan lapisan ledakan ganda + efek "crackle" susulan biar makin meriah)
  muncul otomatis saat: amplop dibuka, pertama masuk ke menu "Pilih
  Kejutannya", lilin di halaman Wish ditiup, dan saat hasil Ramalan
  muncul.
- **Confetti** (kertas jatuh) tetap dipakai untuk momen yang lebih personal/
  dekat, seperti di halaman Wish dan hasil Ramalan.
- Mau menambah kembang api di tempat lain? Panggil saja
  `fireworksShow(jumlah)` di `script.js` pada event apa pun yang kamu mau.
