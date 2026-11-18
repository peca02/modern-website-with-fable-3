# Mountain & Valley: tehnologije i identitet sajta

Dva cilja ovog fajla:

1. Da objasni koje tehnologije sajt koristi i na koji način, kao recept za buduće sajtove ovog nivoa.
2. Da opiše šta je ovaj sajt po konceptu i izgledu, da se sledeći ne napravi sličan.

Tačne verzije paketa su u `CLAUDE.md` i `package.json`. Ovaj fajl je namerno na srpskom
(izuzetak od pravila da je sve u repozitorijumu na engleskom) jer ga čita vlasnik.

Stanje: napisano posle faze 6 (doterivanje). Sajt je po `PROMPT.md` završen.

## 1. Glavna ideja arhitekture

Sajt je jedna stranica sa dva sloja koja se ne mešaju:

- **DOM sloj** nosi sav stvarni sadržaj (naslovi, tekst, koraci, klizač, navigacija, kontakt).
  Renderuje ga server kao običan semantički HTML, pa je čitljiv i bez JavaScripta, WebGL-a i
  animacija.
- **WebGL sloj** je jedan fiksiran, providan canvas iza DOM-a. Čisto je dekorativan
  (`aria-hidden`) i prikazuje jednu neprekidnu 3D scenu: jedan list papira koji se savija dok
  korisnik skroluje.

Dva sloja povezuje jedan deljeni objekat (`lib/store.ts`). GSAP i DOM kontrole u njega upisuju
položaj u priči, pokazivač, vrednost klizača i trenutak bacanja aviona, a 3D scena ga čita u
svakom frejmu. Veza ide i u drugom smeru: scena u `store.anchors` upisuje ekranske koordinate
tačaka na svodu, a u `store.sheet` stvarne dimenzije lista, pa DOM elementi mogu da ih prate i
ispisuju. Nema React state-a po frejmu i nema ponovnih renderovanja pri skrolu. To je
najvažniji obrazac celog projekta.

Položaj u priči (`store.story`) je jedan broj: indeks poglavlja + napredak unutar njega
(0 do 5). Sva scena je čista funkcija tog broja, vremena, pokazivača i kontrola.

## 2. Tehnologije i kako su korišćene

### Next.js (App Router) i React

- **Uloga:** okvir aplikacije, statički render, fontovi, metadata.
- **Ovde:** jedna ruta (`app/page.tsx`), sve je statički prerenderovano. Pet poglavlja su
  serverske komponente (`components/chapters/`) nad zajedničkim `components/Chapter.tsx`;
  klijentske komponente su male i dodaju samo pokret i interakciju. Uključen je React Compiler.
- **Obrazac vredan ponavljanja:** sve što dira `three` živi u `scene/` i učitava se kroz
  `next/dynamic` sa `ssr: false` (`components/SceneLoader.tsx`), pa 3D kod nije u početnom
  paketu i tekst se vidi odmah.
- **Dodatno:** OG slika i ikona se generišu u kodu (`app/opengraph-image.tsx`, `app/icon.tsx`)
  iz istih modela savijanja kao rezervni crtež (`lib/drawing.ts`). OG slika je složena u
  fontu Anybody, koji se pri build-u preuzima kao statička instanca; ako preuzimanje ne uspe,
  koristi se podrazumevani font i build ne puca.

### TypeScript (strict) i ESLint

- **Uloga:** hvatanje grešaka pre pokretanja.
- **Ovde:** bez `any` i bez gašenja pravila. Lint sadrži pravila React Compilera, koja
  zabranjuju menjanje memoizovanih vrednosti; zato se uniforme shadera pišu kroz metode
  instance materijala (`scene/PaperMaterial.ts`).

### Tailwind CSS 4

- **Uloga:** stilovi kroz dizajn tokene.
- **Ovde:** sve boje, veličine fonta, razmaci slova i krive animacije su CSS promenljive u
  `app/globals.css` (`@theme`). Podrazumevana Tailwind paleta je isključena, pa komponenta
  ne može da upotrebi boju van palete. Boje za scenu su preslikane u `lib/palette.ts`.
- **Obrasci vredni ponavljanja:**
  - složene tipografske klase (`type-hero`, `type-display`, `type-title`, `type-body`,
    `type-label`) koje odjednom postavljaju font, veličinu, prored, razmak slova i osu širine;
  - fluidne veličine sa `clamp()`, ograničene i visinom ekrana (`svh`), pa nema posebnih
    veličina po breakpointu;
  - jedna mreža stranice (`page-grid`: 4 kolone na telefonu, 12 od tableta);
  - sopstvene varijante za stanje umesto pravila u `@layer base`: `wide:` / `narrow:`
    (raspored po obliku ekrana), `pinned:`, `loaded:`, `scene-live:`, `scene-off:`, `fine:` /
    `coarse:` (miš ili prst), `motion-full:` / `motion-reduced:`, `facts-tags:` (uz ugrađenu `noscript:`);
  - boja stranice je jedna fiksna pozadina (`--backdrop`) koju menja skrol; poglavlja boje
    sopstvenu pozadinu samo bez JavaScripta;
  - `halo`, oreol u boji stranice iza tekućeg teksta preko scene (naslovi ga nemaju, jer se
    razmaže na belom listu);
  - `touch-target`, nevidljiva zona od 44 px za prst oko malih kontrola, bez promene izgleda.

### three.js i React Three Fiber

- **Uloga:** 3D render (WebGL + GLSL), React omotač.
- **Ovde:** jedan `<Canvas>` (`scene/Stage.tsx`), proziran i `flat` (bez tone mappinga), pa
  su boje tokena tačne. Sve je proceduralno: nema modela, tekstura ni slika.
- **Delovi scene:**
  - **Modeli savijanja (`lib/fold/`, bez `three` uvoza):** sve je zatvorena formula, bez
    opšteg solvera i bez detekcije sudara.
    - `miura.ts`: Miura-ori iz jednog parametra (ugao savijanja);
    - `yoshimura.ts`: Yoshimura svod, svaki red temena na mnogouglu, `R = b / (2 sin(φ/2))`,
      a redovi se primiču tako da svaka dijagonala zadrži ravnu dužinu;
    - `sequence.ts`: niz prostih savijanja (sve s jedne strane prave rotira oko nje) za
      polovine, četvrtine i avion; slojevi se prate i malo razmiču, pa ne trepere.
  - **Isti model na CPU i GPU:** temena se računaju na procesoru i svaki frejm šalju na
    grafičku (`scene/SheetGeometry.ts`). List ima malo temena, pa je to jeftino, a DOM
    etikete čitaju iste brojeve kao slika. Ovo je namerno odstupanje od recepta sa
    generisanim GLSL konstantama.
  - **Papir (`scene/PaperMaterial.ts`):** sopstveni shader. Dve strane u dve boje (lice je
    papirno belo, poleđina nosi boju sledeće stranice, `scene/stock.ts`), mat svetlo sa malo
    „obavijanja", svetlo koje prolazi kroz papir i tamni sa svakim slojem, vlakna papira iz
    formule, i tragovi pregiba: pregibi trenutnog uzorka ostaju kad se list ispravi, a
    pregibi ranijih uzoraka ostaju kao bledi duhovi. Sve to se računa iz režije, nikad iz
    istorije skrola. U 4. poglavlju list se osvetljava od pozadi, pa slojevi postaju stepeni
    tona.
  - **Senke:** jedna mapa senki na dva gornja nivoa kvaliteta; na nižim je to meka alfa mrlja
    ispod lista (`scene/ContactMaterial.ts`). Senka pada na nevidljivu ravan stranice
    (`scene/Page.tsx`): stranica je sto gledan odozgo, a list lebdi iznad njega.
  - **Poze:** poza je niz pokretača savijanja, nikad položaji temena. Uzorak se menja samo
    dok je list ravan ili okrenut ivicom ka kameri (usred okretanja), pa se smena ne vidi.
  - **Režija:** `scene/direction.ts` je lista kadrova: trake ključeva za pomeranje sočiva,
    udaljenost, nagib, rotaciju, okretanje lista, visinu, savijanje svakog uzorka, pozadinsko
    svetlo i let aviona, posebno za širok i za portretni ekran. `scene/Director.tsx` ih
    uzorkuje iz položaja u priči. Sav tajming scene je na jednom mestu. Fajl nema `three`
    uvoz, pa ga koriste i rezervni crtež i širina naslova.
- **Iz Drei-a:** samo `PerformanceMonitor`.

### Bez postprocessinga

- **Odluka:** nema WebGL prolaza posle rendera. Canvas je providan preko CSS boje stranice,
  uz MSAA za oštre ivice faseta.
- **Zašto je vredno ponavljanja:** nema šava između scene i stranice, boja stranice se menja
  samo u CSS-u, a slab uređaj ne plaća efekte.

### GSAP (ScrollTrigger, ScrollSmoother, SplitText) i `@gsap/react`

- **Uloga:** sve DOM animacije i skrol.
- **Ovde:**
  - `lib/gsap.ts` registruje pluginove jednom i definiše motion jezik: krive `crease` (brz
    početak, tvrdo zaustavljanje), `spring` (tvrdo zaustavljanje sa malim prebačajem) i `flat`
    (linearna, za skrolom vođene vrednosti), trajanja `snap` 0,25 s, `fold` 0,6 s i
    `turn` 1,1 s;
  - ScrollSmoother daje glatki skrol; fiksirani slojevi (canvas, zaglavlje, tagovi, kursor)
    stoje van njegovog omotača;
  - ScrollTrigger pinuje svih pet poglavlja (`components/ScrollRig.tsx`, dužine u
    `lib/beats.ts`) i upisuje položaj u priči u store;
  - SplitText otvara tekst red po red na šarki: svaki red se rasklapa od gornje ivice i
    sklapa se isto kad poglavlje odlazi (`components/Reveals.tsx`);
  - `gsap.matchMedia()` daje mirnu varijantu za `prefers-reduced-motion` i za ekrane niže od
    600 px: bez pinova, glatkog skrola i šarki, a svako poglavlje pokazuje svoju zadržanu pozu.
- **Obrasci vredni ponavljanja:**
  - poglavlje je običan vertikalni tok u HTML-u, a klijentska komponenta postavi
    `data-pinned` kad je pokret dozvoljen; varijanta `pinned:` pretvara tok u jedan ekran;
  - brojevi koje dele oba sloja (dužine pinova, zadržane poze, prozor tagova) stoje u
    `lib/beats.ts`;
  - sajt sam vraća položaj posle osvežavanja, tek kad pinovi postoje;
  - pin i poglavlje koje ga sadrži počinju na istom mestu, pa pin nosi `refreshPriority: 1`,
    inače se poglavlje meri bez prostora pina;
  - ScrollSmoother skroluje do fokusiranog elementa po njegovom mestu pre pinovanja; zato
    mete linkova u zaglavlju (`tabindex="-1"`) skroluje `JumpLink` sam.

### Web Audio API

- **Uloga:** zvuk bez audio fajlova.
- **Ovde:** `lib/audio.ts`: papir je filtrirani šum. Tihi ton sobe po poglavlju, šuštanje koje
  prati brzinu skrola i savijanje, i kratak pojasno filtriran prasak za pregib (klizač,
  prekidač zvuka). Kontekst se pravi tek na prvi klik i suspenduje se kad je zvuk isključen
  ili je kartica skrivena.

### React Icons, next/font

- Ikone isključivo iz `react-icons` (samo zvučnik na prekidaču zvuka). Fontovi kroz
  `next/font` (bez spoljnih CSS-ova); jedini izuzetak je OG slika, jer `next/og` ne može da
  koristi `next/font`.

### Playwright (samo za razvoj)

- **Uloga:** provera izgleda i toka bez pravog browsera, uvek nad produkcionim build-om
  (`scripts/serve.sh`).
- **Ovde:**
  - `scripts/flow.mjs checks`: 25 provera ponašanja (preloader, tastatura, klizač, zvuk,
    preklapanje stranice, tagovi, izgubljen kontekst, osvežavanje usred stranice, zaglavljeno
    učitavanje, smanjeno kretanje, bez JavaScripta, bez WebGL-a, telefon sa dodirom);
  - `scripts/flow.mjs layout`: na 10 veličina ekrana proverava da tekst staje u svoj ekran,
    da naslovi ne izlaze iz margina i da stranica nikad ne skroluje u stranu;
  - `scripts/flow.mjs shots`, `shots.mjs`, `fallback.mjs`, `intro.mjs`, `cursor.mjs` za
    snimke, i `sheet.mjs` koji slaže više snimaka u jednu sliku.
- **Pouka:** u oblaku scena radi na procesoru, oko jedan kadar u sekundi, a i GSAP vreme
  teče sporo. Skripte čekaju stanje (atribut na `<html>`) ili da skrol stane, nikad fiksno
  vreme.

## 3. Obrasci koji čine razliku

- **Adaptivni kvalitet:** četiri nivoa (`lib/quality.ts`: DPR, MSAA, veličina mape senki)
  biraju se po uređaju (jezgra, memorija, prst ili miš, veličina ekrana) i spuštaju ako
  frame rate padne. Telefon dobija isti sajt bez mape senki.
- **Preloader vezan za stvarno učitavanje:** `lib/loadClock.ts` prati faze (fontovi, kod
  scene, kontekst, shaderi, prvi kadar). Preloader je sam list: ekran u papirno beloj boji sa
  fazama kao koracima uputstva („Step 0. Unwrap"). Kad pusti, 3D list je iza njega u istoj
  boji i bez reza se povlači u prvo poglavlje. Zaglavljeno učitavanje se samo oslobađa.
- **Otpornost:** bez WebGL-a, bez JavaScripta ili dok je kontekst izgubljen, svako poglavlje
  pokazuje svoju zadržanu pozu kao ravne SVG fasete, projektovane iz istih modela i
  osvetljene istim svetlom (`components/SheetDrawing.tsx`).
- **Kadriranje po obliku ekrana:** kamera pomera list pomeranjem sočiva, a ne okretanjem: u
  stranu na širokom ekranu (tekst levo, list desno, pa obrnuto, i list menja stranu dok
  poglavlje odlazi), ispod teksta na portretnom. Na portretnom se meri dokle tekst svakog
  poglavlja seže, pa se list pomera i smanjuje u preostali prostor; na kockastijim širokim
  ekranima kamera se odmiče.
- **DOM koji prati 3D:** papirni tagovi stoje uz teme, podnožje i otvor svoda, preko
  `store.anchors`, i guraju se od teksta i jedan od drugog. Gde nema mesta, iste činjenice
  stoje kao statičan red tagova.
- **Pravi DOM element upravlja scenom:** `<input type="range">` pakuje Miura list; ista
  vrednost menja oblik, širinu naslova (osa `wdth`), zvuk pregiba i očitavanje dimenzija
  izračunato iz modela.
- **Širina naslova prati list:** naslov svakog poglavlja ide od `wdth` 70 (ravan list) do 50
  (presavijen), iz iste vrednosti savijanja koju scena prikazuje
  (`components/HeadlineWidth.tsx`).
- **Mali fiksni slojevi:** kursor savijenog ugla (samo za miš) i preklapanje stranice
  (`clip-path`) koštaju samo svoj mali sloj, ne ceo ekran.
- **Sadržaj na jednom mestu:** sav tekst u `lib/content.ts`, boje u `app/globals.css` i
  `lib/palette.ts`, pravila izgleda u `docs/ART_DIRECTION.md`.

## 4. Recept za sledeći sajt ovog tipa

1. Izaberi nišu koja daje jedan jak centralni 3D subjekat sa više stanja.
2. Napiši art direkciju i motion jezik pre koda (paleta, fontovi, vizuelni potpis).
3. Postavi temelj: tokeni, store, skrol, canvas, nivoi kvaliteta.
4. Napravi scenu i režiju kamere sa privremenim DOM-om; prvo jedno stanje do kraja, pa ostala.
5. Dodaj poglavlja kao semantički HTML, pa pokret preko njih.
6. Tek onda preloader, kursor, zvuk, rezervni crtež.
7. Na kraju telefon (više visina, ne samo širina), smanjeno kretanje i dodir, pa provera na
   pravim uređajima.

Pouke sa ovog sajta:

- Glavni tehnički rizik teme biraj tako da ima zatvorenu formulu. Ovde je to bila matematika
  savijanja: samo prosta savijanja i jednoparametarske teselacije.
- Sve što zavisi od skrola neka bude čista funkcija položaja, uključujući „pamćenje"
  (tragovi pregiba su tekući maksimum trake, ne istorija).
- Kadriranje i raspored teksta se rade zajedno od početka; na portretu neka list čita gde se
  tekst završava.
- Pinovan ekran ima donju granicu visine: ispod nje (ovde 600 px) bolje je ne pinovati.

Radi po fazama, jedna faza po sesiji, sa kratkim `docs/SESSION_SUMMARY.md` za primopredaju.

## 5. Identitet ovog sajta: šta sledeći ne sme da ponovi

### Koncept

- **Niša:** origami i papirni inženjering: fiktivni studio koji projektuje šeme pregiba za
  konstrukcije koje putuju ravne, a na mestu se otvaraju u strukturu (skloništa, solarni
  paneli, ambalaža).
- **Brend:** Mountain & Valley (skraćeno M&V), „a folding office". Ime su dva osnovna
  pregiba (planinski i dolinski). Piše se velikim početnim slovima, nikad samo velikim
  slovima. Namerno lomi formulu prethodna dva brenda (kratka, retka jednosložna imenica).
- **Priča:** ništa se ne dodaje i ništa se ne oduzima; struktura nastaje samo od pregiba.
  Papir pamti: pregib, jednom napravljen, ostaje.
- **Poglavlja:** Start Flat, Pack Small, Stand Up, Stay Creased, Let Go (ravan list prelazi
  u plitak Miura reljef; pakuje se u blok veličine knjige i otvara; okreće se i diže u
  Yoshimura svod; rasklapa se sa sećanjem na pregibe, savija na pola i na četvrtine i
  osvetljava od pozadi; pet stakato pregiba u papirni avion koji odleti).
- **Glas teksta:** uputstvo za savijanje: drugo lice, imperativ, kratki koraci, suv humor,
  konkretno, nikad prodajno. Na primer: „Take one sheet. Do not cut it. Do not glue it. We
  will know." Numerisani koraci su ovde iskreni, jer savijanje zaista jeste niz.

### Vizuelni identitet

- **Vizuelni potpis:** ravni, fasete i mat boja. Pregib se vidi kao promena tona preko ravni,
  nikad kao tanka linija. Dve strane lista u dve boje, meke stvarne senke, svetlo kroz papir.
  Bez sjaja, odsjaja, ogledala i tankih linija kao motiva. DOM oblici su pune ravne površine
  oštrih uglova; savijeni ugao je jedini ukras.
- **Paleta:** stranica je list obojenog kartona. Svako poglavlje ima svoj zasićen srednji ton:
  fern `#4fbe8a`, mustard `#e3b23c`, rosa `#ee9fb6`, pulp `#b9b2a4`, lilac `#b99ae6`. Nema
  crne: tekst je boja stranice odštampana tamnije (npr. `#072315` na fern), uz kontrast 7:1 ili
  bolji. Lice lista je papirno belo `#f6f1e4`, a poleđina nosi boju sledeće stranice.
- **Tipografija:** Anybody (promenljive ose širine 50–150 i težine) za naslove, natpis i
  sitne oznake: naslovi visoki i sabijeni kao nabori (`wdth` 50–70, teški), oznake široke
  (`wdth` 125, srednje težine). Literata (optička veličina) za tekući tekst, kao štampano
  uputstvo. Bez monospace fonta i bez oznaka velikim slovima.
- **Centralni objekat:** jedan list papira koji se savija kroz pet stanja (Miura-ori, paket,
  Yoshimura svod, polovine i četvrtine, papirni avion).
- **Pokret:** oštar, na šarki. Pregib počinje brzo, staje odlučno i vrati se nekoliko
  stepeni. Nizovi su stakato: pregib, pauza, pregib. Tekst se otvara na šarki od gornje
  ivice, ne diže se iz maske.
- **Potpisni momenti:** preloader je list; klizač koji pakuje list i sabija naslov; papirni
  tagovi uz svod; kursor savijenog ugla koji se rasklopi preko linka; boja stranice se menja
  kao dijagonalni pregib preko ekrana; pet pregiba u avion, koji kontakt dugme baci sa
  stranice i vrati.
- **Zvuk:** papir, ne muzika: šum, šuštanje, pregib.

### Prethodni sajtovi, da se ni oni ne ponove

- **SKEIN:** fuzija i stelarator, skoro crna stranica, narandžasto-crveni akcenat, užarene
  niti i hairline linije, hairline serif, rečnik tkanja, postprocessing (bloom i ostalo).
- **TARN:** ferofluid, svetla hladna porcelanska stranica, ultramarin akcenat, ogledalno crna
  kap (raymarching) i zrnca polja, Archivo i Instrument Sans, viskozan pokret, tekst iz maske,
  kursor-kap.

Sledeći sajt treba da se razlikuje od sva tri u svemu navedenom: druga niša i priča, drugi
centralni objekat, drugi ton stranice i paleta, drugi fontovi, drugi vizuelni potpis, pokret
i glas teksta. Tehnologije i obrasci iz odeljaka 1 do 4 mogu da ostanu isti.
