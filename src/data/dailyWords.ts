export interface DailyWord {
  word: string
  definition: string
  example: string
}

export const DAILY_WORDS: DailyWord[] = [
  { word: 'ABSURD', definition: 'Orimlig, förnuftsvidrig, löjligt orimlig.', example: 'Det vore absurt att påstå att solen kretsar runt jorden.' },
  { word: 'ADEKVAL', definition: 'Tillräcklig, lämplig, passande för ändamålet.', example: 'Hon hade inte adekvat utbildning för tjänsten.' },
  { word: 'AMBIVALENT', definition: 'Ha motstridiga känslor eller åsikter inför något.', example: 'Han kände sig ambivalent inför beslutet att flytta utomlands.' },
  { word: 'ANALOG', definition: 'Jämförbar, likartad; motsats till digital.', example: 'Det finns en analog situation i historien.' },
  { word: 'AXIOM', definition: 'Självklar grundsats som inte behöver bevisas.', example: 'Det är ett axiom att helheten är större än delen.' },
  { word: 'BASAL', definition: 'Grundläggande, fundamental, elementär.', example: 'Basala kunskaper i matematik är nödvändiga.' },
  { word: 'BILATERAL', definition: 'Ömsesidig, som berör eller involverar två parter.', example: 'Länderna ingick ett bilateralt handelsavtal.' },
  { word: 'CYKLISK', definition: 'Återkommande i regelbundna intervaller, periodisk.', example: 'Ekonomin har ett cykliskt mönster med uppgång och nedgång.' },
  { word: 'DEDUKTION', definition: 'Slutledning från det allmänna till det enskilda.', example: 'Genom deduktion kom detektiven fram till vem som begått brottet.' },
  { word: 'DIFFUS', definition: 'Otydlig, suddig, spridd utan tydlig koncentration.', example: 'Smärtan var diffus och svår att lokalisera.' },
  { word: 'DOGMATISK', definition: 'Okritiskt fasthållande vid en lära eller tro.', example: 'Han hade en dogmatisk syn på religionen.' },
  { word: 'EKVIVALENT', definition: 'Likvärdig, ha samma värde eller funktion.', example: 'En kilometer är ekvivalent med tusen meter.' },
  { word: 'EMINENT', definition: 'Framstående, utmärkt, av hög rang eller förmåga.', example: 'Hon var en eminent forskare inom sitt område.' },
  { word: 'EMPIRISK', definition: 'Baserad på erfarenhet och observation snarare än teori.', example: 'Vetenskapen kräver empiriska bevis.' },
  { word: 'EXPLICIT', definition: 'Tydligt uttalad, klar och otvetydig.', example: 'Han gav explicita instruktioner om hur uppgiften skulle lösas.' },
  { word: 'FREKVENT', definition: 'Ofta förekommande, talrik, vanlig.', example: 'Flygbolaget erbjuder frekventa avgångar till Stockholm.' },
  { word: 'GENERISK', definition: 'Allmän, icke-specifik, gemensam för en hel grupp.', example: 'Generiska läkemedel är billigare alternativ till märkespreparat.' },
  { word: 'HIERARKI', definition: 'Rangordning, system av grader eller nivåer.', example: 'Företagets hierarki bestämmer vem som fattar beslut.' },
  { word: 'HYPOTES', definition: 'Antagande som ännu inte bevisats, arbetsteori.', example: 'Forskarna ställde upp en hypotes och testade den experimentellt.' },
  { word: 'IMPLICERA', definition: 'Antyda, innebära utan att säga direkt.', example: 'Hans tystnad implicerade att han höll med.' },
  { word: 'INDUKTION', definition: 'Slutledning från det enskilda till det allmänna.', example: 'Utifrån observationerna drog hon slutsatser genom induktion.' },
  { word: 'INERT', definition: 'Trög, passiv, obenägen att reagera eller förändras.', example: 'Ädelgaser är kemiskt inerta och reagerar inte med andra ämnen.' },
  { word: 'KAUSAL', definition: 'Orsaks- och verkningsmässig, som handlar om orsaker.', example: 'Det finns ett kausalt samband mellan rökning och cancer.' },
  { word: 'KOHERENT', definition: 'Sammanhängande, logiskt konsekvent, enhetlig.', example: 'Argumentet var koherent och svårt att motbevisa.' },
  { word: 'LATENT', definition: 'Dold, inaktiv men potentiellt existerande.', example: 'Viruset kan förbli latent i kroppen i flera år.' },
  { word: 'MANIFEST', definition: 'Uppenbar, tydligt synlig, uttalad.', example: 'Sjukdomens symptom blev manifesta efter en vecka.' },
  { word: 'NOMINELL', definition: 'Till namnet, i teorin men inte i praktiken.', example: 'Han var nominell ledare men saknade verklig makt.' },
  { word: 'PARADOX', definition: 'Till synes självmotsägande påstående som ändå kan vara sant.', example: 'Det är en paradox att ju mer vi vet, desto mer inser vi vad vi inte vet.' },
  { word: 'PREVALENT', definition: 'Utbredd, vanligt förekommande i en befolkning.', example: 'Diabetes är prevalent i industriländerna.' },
  { word: 'REDUNDANT', definition: 'Överflödig, onödig, mer än vad som krävs.', example: 'Texten innehöll redundant information som förvirrade läsaren.' },
]

export function getTodaysWord(): DailyWord {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return DAILY_WORDS[dayOfYear % DAILY_WORDS.length]
}
