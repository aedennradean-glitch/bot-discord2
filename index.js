"use strict";
// Ubah file cookies.txt (format Netscape, hasil ekspor ekstensi browser) jadi SATU baris
// untuk variable YT_COOKIE di Railway.
//
// Pakai (di komputer lu, bukan di Railway):
//   node cookie-to-line.js cookies.txt
// Hasil: dicetak ke layar dan disimpan ke cookie-line.txt
//
// PENTING: jangan upload cookies.txt / cookie-line.txt ke GitHub (repo lu Public).

const fs = require("node:fs");

const input = process.argv[2];
if (!input) {
  console.error("Cara pakai: node cookie-to-line.js cookies.txt");
  process.exit(1);
}

let raw;
try {
  raw = fs.readFileSync(input, "utf8");
} catch (error) {
  console.error(`Gagal membaca ${input}: ${error.message}`);
  process.exit(1);
}

const pairs = new Map();
for (let line of raw.split(/\r?\n/)) {
  line = line.trim();
  if (!line) continue;
  // Cookie HttpOnly diawali "#HttpOnly_"; baris komentar lain diawali "#".
  if (line.startsWith("#HttpOnly_")) line = line.slice("#HttpOnly_".length);
  else if (line.startsWith("#")) continue;

  const parts = line.split("\t");
  if (parts.length < 7) continue;
  const [domain, , , , , name, ...rest] = parts;
  const value = rest.join("\t");
  if (!/(^|\.)(youtube|google)\.com$/i.test(domain.replace(/^\./, ""))) continue;
  if (!name) continue;
  pairs.set(name, value); // kalau nama sama, yang terakhir menang
}

if (pairs.size === 0) {
  console.error("Tidak ada cookie youtube.com / google.com di file itu. Pastikan ekspor dari halaman youtube.com.");
  process.exit(1);
}

const line = [...pairs].map(([k, v]) => `${k}=${v}`).join("; ");
fs.writeFileSync("cookie-line.txt", line, "utf8");

console.log(`Berhasil: ${pairs.size} cookie diubah jadi satu baris (${line.length} karakter).`);
const hasAuth = ["SID", "HSID", "SAPISID", "__Secure-3PSID"].some((k) => pairs.has(k));
if (!hasAuth) console.warn("Peringatan: cookie login (SID/HSID/SAPISID) tidak ditemukan. Pastikan lu sudah login saat mengekspor.");
console.log("\nIsi baris ini ke variable YT_COOKIE di Railway:\n");
console.log(line);
