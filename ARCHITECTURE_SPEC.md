# MİMARİ VE TEKNİK ŞARTNAME: TOKAT TAŞHAN (VOYVODA HANI - 1631)

## 1. Genel Tanım ve Tarihsel Bağlam
- **Yapı Adı:** Tokat Taşhan (Voyvoda Hanı)
- **İnşa Tarihi:** 1626 – 1632 (17. Yüzyıl Klasik Osmanlı Dönemi)
- **Konum:** Tokat kent merkezi, Gaziosmanpaşa Bulvarı
- **Tipoloji:** İki katlı, açık dikdörtgen avlulu, revaklı şehir içi ticaret ve konaklama hanı.
- **Mimari Karakter:** Kesme kireçtaşı ve tuğla almaşık duvar örgüsü, sivri/basık Osmanlı kemerleri, beşik ve çapraz tonozlu revak tavanları, derin taş söveli dükkân cepheleri, alaturka kiremit kaplı kırma çatı ve geniş ahşap saçaklar.

---

## 2. Metrik Boyutlar ve Ölçek Planı

### 2.1 Ana Dış Ölçüler
| Eleman | Metrik Değer | Açıklama |
| :--- | :--- | :--- |
| **Toplam Dış Uzunluk (K-G)** | 80.80 m | Dış çevre duvarları |
| **Toplam Dış Genişlik (D-B)** | 52.60 m | Dış çevre duvarları |
| **Dış Duvar Kalınlığı** | 1.10 m | Masif kesme taş & moloz dolgu |

### 2.2 Avlu ve Revak Ölçüleri
| Eleman | Metrik Değer | Açıklama |
| :--- | :--- | :--- |
| **Açık Avlu Uzunluğu (K-G)** | 53.60 m | Sütun iç yüzeyleri arası |
| **Açık Avlu Genişliği (D-B)** | 28.20 m | Sütun iç yüzeyleri arası |
| **Revak Koridor Derinliği** | 3.20 m | Kemer sütunundan dükkân cephesine |
| **Modüler Kemer Açıklığı (Bay Span)** | 3.80 m | İki sütun/ayak aksı arası |
| **Kemer Açıklık Adedi (Uzun Kenar)** | 14 Açıklık | Kuzey ve Güney cepheler |
| **Kemer Açıklık Adedi (Kısa Kenar)** | 7 Açıklık (Portal aksı dahil) | Doğu ve Batı cepheler |

### 2.3 Kat ve Yükseklik Seviyeleri
| Eleman | Metrik Değer | Açıklama |
| :--- | :--- | :--- |
| **Zemin Kat Zemin Kotu** | ±0.00 m | Avlu döşeme seviyesi |
| **Zemin Kat Kemer Üzengi Seviyesi** | +2.80 m | Sütun başlığı üstü |
| **Zemin Kat Kemer Tepe (Kilit Taşı)**| +4.10 m | Sivri kemer tepe noktası |
| **1. Kat Döşeme Üst Kotu** | +4.60 m | Üst kat revak yürüme platformu |
| **1. Kat Kemer Üzengi Seviyesi** | +7.20 m | Üst kat sütun başlığı |
| **1. Kat Kemer Tepe Seviyesi** | +8.40 m | Üst kat kemer tepe noktası |
| **Saçak Altı Kotu** | +8.80 m | Ahşap saçak ve payandalar |
| **Çatı Mahya Kotu** | +11.60 m | Kırma çatı kiremit mahya sırtı |
| **Göz Hizası (FP Kamerası)** | +1.70 m | Yürüyüş kamerası referansı |

### 2.4 Dükkân ve Mekân Ölçüleri
| Eleman | Metrik Değer | Açıklama |
| :--- | :--- | :--- |
| **Dükkân Genişliği** | 3.60 m | Revak aksına denk gelen ön cephe |
| **Dükkân Derinliği** | 5.00 m | Revak arkasındaki tonozlu oda |
| **Kapı Boşluğu** | 1.10 m x 2.20 m | Kemerli taş söveli masif ahşap kapı |
| **Pencere / Kepenk Boşluğu** | 1.00 m x 1.60 m | Demir parmaklıklı taş söveli niş |
| **Dükkân Duvar Girintisi (Recess)** | 0.45 m | Gerçek 3D söve derinliği |

### 2.5 Taçkapı (Giriş Portali) ve Merdivenler
| Eleman | Metrik Değer | Açıklama |
| :--- | :--- | :--- |
| **Taçkapı Dış Genişlik** | 7.60 m | 2 modül genişliğinde anıtsal portal |
| **Taçkapı Yükseklik** | 7.80 m | Kademeli mukarnas/söve profili |
| **Giriş Eyvan/Koridor Uzunluğu** | 6.10 m | Beşik tonozlu avlu geçiş koridoru |
| **Taş Merdiven Rıht Yüksekliği** | 0.17 m | Rahat tırmanış rıhtı |
| **Taş Merdiven Basamak Genişliği** | 0.32 m | Masif kesme taş basamak |
| **Merdiven Kolu Genişliği** | 1.40 m | Giriş koridoru yanından üst kata çıkan kollar |
| **Korkuluk Yüksekliği** | 0.95 m | Masif taş harpuşta + ferforje/ahşap babalar |

---

## 3. Modüler Mimari Parça Kütüphanesi (`src/architecture/`)

1. **`ArchBay.js` (Kemer & Sütun Modülü):**
   - Ayaklar: 0.65m x 0.65m kare kesitli, pahlı kaide (plinth), gövde ve kademeli silmeli başlık (capital).
   - Kemer Kemeri: `THREE.Shape` + `ExtrudeGeometry` ile çift merkezli sivri Osmanlı kemeri, 0.45m derinlik, dışa taşan kilit taşı (keystone) ve taş söve silmesi.
   - Spandrel Duvarı: Kemer köşelerini üst döşemeye bağlayan almaşık taş-tuğla dolgu.

2. **`VaultCeiling.js` (Tonoz Tavan Sistemi):**
   - Beşik/Çapraz tonoz geometrisi.
   - Her revak açıklığı üzerine oturan 3.8m x 3.2m boyutunda kemerli kubbe/tonoz eğrisi.
   - Kireç sıva ve tuğla kaburga detayları.

3. **`ShopFacade.js` (Dükkân Cephesi):**
   - 0.45m derinlikte duvara gömülü taş kemerli kapı sövesi.
   - Koyu eskitilmiş ahşap kanatlı kapı (metal çivili ve kollu).
   - Kemerli pencere nişi, ferforje parmaklıklar (wrought iron grilles) ve ahşap kepenkler.

4. **`StoneStairs.js` (Taş Merdiven Sistemi):**
   - Zemin kattan (+0.00m) üst kat revak sahanlığına (+4.60m) çıkan 27 basamaklı masif taş merdivenler.
   - Merdiven altı kemerli tonoz desteği ve korkuluklar.
   - BVH rampası/çarpışma geometrisi ile kesintisiz tırmanış.

5. **`MainPortal.js` (Anıtsal Taçkapı):**
   - Batı cephesindeki anıtsal giriş portali.
   - Yüksek sivri kemerli eyvan, silmeli taş çerçeve, kitabelik ve beşik tonozlu geçiş koridoru.

6. **`RoofSystem.js` (Kırma Çatı ve Saçak Sistemi):**
   - 4 yöne eğimli kırma çatı (18 derece eğim).
   - Dışa 0.90m taşan ahşap saçak ve konsol payandalar (`timber corbels`).
   - Binlerce alaturka (mission/barrel) kiremit için `InstancedMesh` optimizasyonu.

7. **`CourtyardProps.js` (Avlu Donatıları):**
   - Sekizgen mermer/kesme taş havuz ve fıskiye (merkezde).
   - Taş bordürlü yeşil tarhlar, gölgelik çınar/ıhlamur ağaçları (katmanlı alfa yapraklar).
   - Çay bahçesi masif ahşap masa ve iskemleleri.
   - Revak kemerlerinden sarkan dövme demir zincirli cam fenerler.

---

## 4. PBR Malzeme ve Doku Eşleme Matrisi

| Malzeme Kimliği | Kullanıldığı Yer | Poly Haven Dokusu | PBR Kanalları | UV Tekrarı (World Scale) |
| :--- | :--- | :--- | :--- | :--- |
| `mat_stone_wall` | Dış duvarlar, sütunlar, kemerler | `castle_wall_slates` / `stone_wall` | Diffuse, Normal, Rough, AO | 1m = 1.0 UV |
| `mat_brick_stripes` | Almaşık hatıllar, kemer içi | `red_brick_plaster` / `brick_wall` | Diffuse, Normal, Rough, AO | 1m = 1.2 UV |
| `mat_cobblestone` | Avlu zemini, revak geçişleri | `cobblestone_floor` / `flagstone` | Diffuse, Normal, Rough, AO | 1m = 0.8 UV |
| `mat_roof_tiles` | Kırma çatı kiremitleri | `roof_tiles_terracotta` | Diffuse, Normal, Rough, AO | Modül başına özel UV |
| `mat_aged_wood` | Kapılar, kepenkler, saçaklar | `wood_planks_grey` / `rough_wood` | Diffuse, Normal, Rough, AO | 1m = 1.5 UV |
| `mat_vault_plaster` | Tonoz tavan içleri | `plaster_grey` / `fine_plaster` | Diffuse, Normal, Rough, AO | 1m = 0.5 UV |
| `mat_wrought_iron` | Fenerler, korkuluklar, parmaklık | `metal_plate` / Prosedürel PBR | Rough metalik koyu demir | - |

---

## 5. Aydınlatma, Post-Processing ve Performans Bütçesi
- **Güneş Işığı:** `THREE.DirectionalLight` (Golden Hour / Warm Daylight, 4096x4096 PCFSoftShadowMap, cascaded-like bounds).
- **Ambiyans / IBL:** Poly Haven 2K HDR dış mekân gökyüzü (`lilienstein` veya benzeri açık sıcak gökyüzü).
- **Post-Processing:** `EffectComposer` + `N8AOPass` (yüksek kaliteli ekran uzayı ortam örtümlemesi) + `ToneMappingEffect` (ACESFilmic) + hafif Bloom.
- **Gece / Fener Modu:** Her 2 revak modülünde bir sıcak sarı fener PointLight (2700K) + emissive alev/cam mesh.
- **Hedef FPS:** Masaüstü modern tarayıcılarda 60 FPS (Draw call < 80, instancing sayesinde).
