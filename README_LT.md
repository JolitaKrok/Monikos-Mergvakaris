# Monikos Jaunikio Atranka — Vercel + Firebase

Tai paprasta balsavimo svetainė mergvakariui.

## Kas padaryta

- Dalyvė įveda vardą.
- Jeigu vardas jau panaudotas, rodo: **Toks vardas užimtas**.
- Jeigu vardas yra **Monika**, jos balsas skaičiuojamas **x2**.
- 17 kandidatų.
- Balsavimas: **❌ Netinkamas** arba **✅ Tinkamas**.
- Admin ekranas su QR kodu.
- Rezultatų ekranas rodo visas 17 vietų.
- TOP 3 paryškinti.
- Reveal rodo originalų merginos vardą.

## Nuotraukos

Įkelk 17 kandidatų nuotraukų į:

`public/candidates/`

Failų pavadinimai turi būti:

```txt
01.jpg
02.jpg
03.jpg
04.jpg
05.jpg
06.jpg
07.jpg
08.jpg
09.jpg
10.jpg
11.jpg
12.jpg
13.jpg
14.jpg
15.jpg
16.jpg
17.jpg
```

Geriausia naudoti nuotraukas **be įrašytų lentelių**, nes tekstą uždeda pati svetainė.

## Firebase

Firestore turi būti įjungtas.

Testavimo taisyklės yra faile:

`FIRESTORE_RULES_TEST.txt`

Po vakarėlio geriau uždėti taisykles iš:

`FIRESTORE_RULES_AFTER_PARTY.txt`

## Admin PIN

Numatytasis PIN:

```txt
2601
```

Jį galima pakeisti Vercel aplinkos kintamajame:

```txt
NEXT_PUBLIC_ADMIN_PIN=2601
```

## Kaip paleisti lokaliai

Reikia Node.js.

```bash
npm install
npm run dev
```

Tada atidaryk:

```txt
http://localhost:3000
```

## Puslapiai

```txt
/          Dalyvės balsavimas
/admin     Admin ekranas su QR kodu ir rezultatais
/results   Didelio ekrano rezultatų puslapis
```

## Kaip paleisti Vercel

1. Susikurk GitHub repo.
2. Įkelk visus šio projekto failus.
3. Eik į Vercel.
4. Spausk **Add New Project**.
5. Pasirink GitHub repo.
6. Spausk **Deploy**.
7. Po deploy gausi nuorodą, pvz. `https://monikos-jaunikio-atranka.vercel.app`.
8. Dideliame ekrane atsidaryk `/admin`, prisijunk PIN `2601` ir rodyk QR kodą.

## Svarbu dėl raudono Firebase įspėjimo

Firebase rodo įspėjimą, nes testavimo taisyklės leidžia viešą skaitymą ir rašymą.
Mergvakario MVP tai tinka testavimui, bet po vakarėlio pakeisk taisykles į uždaras iš `FIRESTORE_RULES_AFTER_PARTY.txt`.
