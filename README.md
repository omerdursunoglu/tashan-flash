# Tokat Taşhan (Voyvoda Hanı, 1631) — 3D Mimari WebGL Simülasyonu

> 1631 yılında Tokat'ta inşa edilen tarihi **Taşhan (Voyvoda Hanı)** yapısına odaklanan, birinci şahıs (First-Person) gezilebilir, yüksek detaylı ve mimari doğrulukta bir 3D WebGL (Three.js + Vite) simülasyonu.

🌐 **Canlı Deneyim (GitHub Pages):** [https://omerdursunoglu.github.io/tashan-flash/](https://omerdursunoglu.github.io/tashan-flash/)

---

## 🏛️ Mimari Özellikler ve Boyutlar

- **Tipoloji:** İki katlı, açık dikdörtgen avlulu, revaklı klasik Osmanlı şehir içi hanı.
- **Dış Çevre Duvarları:** 80.80 m (K-G) × 52.60 m (D-B) masif kesme taş & moloz dolgu.
- **Açık Avlu:** 53.60 m × 28.20 m, Arnavut kaldırımı döşemeli zemin.
- **Revaklar:** Uzun cephelerde 14'er, kısa cephelerde 7'şer açıklıklı çift merkezli sivri Osmanlı kemerleri (Ground floor +4.60m, 1st floor +8.80m).
- **Tonozlar:** Beşik tonozlu tavanlar, derin taş söveli ahşap kepenkli dükkân cepheleri.
- **Merdiven:** Zemin kattan 2. kat revak sahanlığına tırmanan masif kesme taş merdiven ve korkuluklar.
- **Çatı:** Geniş ahşap saçaklı, alaturka (mission) kiremit kırma çatı.
- **Avlu Donatıları:** Sekizgen taş havuz/şadırvan, çınar ağaçları, ahşap masa-tabureler ve dövme demir revak fenerleri.

---

## 🎮 Kontroller ve Gezinme

| Tuş | Eylem |
| :--- | :--- |
| **Sol Tık** | Birinci Şahıs (Pointer Lock) kamerasını kilitler |
| **Fare Sürükleme** | Kilit açıldığında serbest bakış |
| **W / A / S / D** | İleri, Geri, Sola, Sağa yürüme |
| **Shift** | Hızlı adım / Koşu (10.5 m/s) |
| **Boşluk (Space)** | Zıplama (veya Serbest Uçuşta yükselme) |
| **V Tuşu** | 🕊️ **Serbest Uçuş (Noclip / Fly Mode)** — Çarpışmasız serbest uçuş |
| **1 – 5 Tuşları** | Hazır mimari seyir açılarına anında geçiş |
| **ESC** | Fare kilidini serbest bırak |

---

## 🛠️ Teknoloji Yığını

- **Three.js** (v0.187) — 3D sahne grafiği, PBR materyaller, procedural mimari geometri
- **Vite** — Hızlı modern modül derleyici
- **three-mesh-bvh** — Hızlandırılmış BVH çarpışma ve zemin yüksekliği takibi
- **n8ao & postprocessing** — Gerçek zamanlı Ortam Karartması (Ambient Occlusion) & ACESFilmic ton eşleme
- **Poly Haven CC0 PBR** — Kesme taş, tuğla, Arnavut kaldırımı, alaturka kiremit, ahşap ve kireç sıva dokuları + 1K HDRI gökyüzü

---

## 💻 Yerel Geliştirme (Local Development)

```bash
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Üretim için derle
npm run build

# Derlemeyi önizle
npm run preview
```
