// Localised UI strings. English is the fallback; Italian is also provided.

export interface Strings {
  title: string;
  audio: string;
  volume: string;
  microphoneVolume: string;
  audioOutput: string;
  microphoneInput: string;
  audioDevicesUnavailable: string;
  display: string;
  brightness: string;
  hdr: string;
  hdrUnavailable: string;
  hdrConfirmTitle: string;
  hdrConfirmBody: string;
  resolution: string;
  refreshRate: string;
  adaptingUi: string;
  tdp: string;
  tdpLimit: string;
  lossless: string;
  losslessLaunch: string;
  losslessScaling: string;
  losslessFrameGen: string;
  losslessMultiplier: string;
  losslessHotkeyHint: string;
  losslessApplyNote: string;
  off: string;
  amd: string;
  amdBuildNeeded: string;
  amdRsr: string;
  amdRsrHint: string;
  amdRsrSharpness: string;
  amdAfmf: string;
  amdAfmfHint: string;
  amdAntilag: string;
  amdAntilagHint: string;
  amdChill: string;
  amdChillHint: string;
  amdChillMin: string;
  amdChillMax: string;
  amdSharpening: string;
  amdSharpeningHint: string;
  amdSharpeningValue: string;
  advanced: string;
  agentLabel: string;
  agentRunning: string;
  agentStopped: string;
  startAgent: string;
  stopAgent: string;
  agentHint: string;
  ok: string;
  cancel: string;
  notConnected: string;
}

const amdEn = {
  amd: "AMD Radeon",
  amdBuildNeeded: "Radeon helper missing. If it does not appear, reinstall the plugin (it ships pre-built).",
  amdRsr: "Radeon Super Resolution",
  amdRsrHint: "Runs the game at a lower resolution and upscales it sharply — more FPS in almost any game.",
  amdRsrSharpness: "RSR sharpness",
  amdAfmf: "Fluid Motion Frames (AFMF)",
  amdAfmfHint: "Inserts AI-generated frames between real ones — smoother motion, with a little added lag.",
  amdAntilag: "Anti-Lag",
  amdAntilagHint: "Shortens the delay between your input and the screen — controls feel snappier.",
  amdChill: "Radeon Chill",
  amdChillHint: "Lowers FPS when you are idle to save power and heat, raising them when the action resumes.",
  amdChillMin: "Chill min FPS",
  amdChillMax: "Chill max FPS",
  amdSharpening: "Image Sharpening",
  amdSharpeningHint: "A light filter that makes details crisper, at no performance cost.",
  amdSharpeningValue: "Sharpening amount",
};

const amdIt = {
  amd: "AMD Radeon",
  amdBuildNeeded: "Helper Radeon mancante. Se non compare, reinstalla il plugin (viene fornito gi\u00e0 compilato).",
  amdRsr: "Radeon Super Resolution",
  amdRsrHint: "Esegue il gioco a risoluzione più bassa e lo ingrandisce restando nitido — più FPS quasi ovunque.",
  amdRsrSharpness: "Nitidezza RSR",
  amdAfmf: "Fluid Motion Frames (AFMF)",
  amdAfmfHint: "Inserisce fotogrammi generati tra quelli reali — più fluido, con un filo di ritardo.",
  amdAntilag: "Anti-Lag",
  amdAntilagHint: "Accorcia il ritardo tra il tuo comando e lo schermo — i controlli sembrano più immediati.",
  amdChill: "Radeon Chill",
  amdChillHint: "Abbassa gli FPS quando sei fermo per consumare e scaldare meno, e li rialza quando riprende l'azione.",
  amdChillMin: "Chill FPS min",
  amdChillMax: "Chill FPS max",
  amdSharpening: "Nitidezza immagine",
  amdSharpeningHint: "Un filtro leggero che rende i dettagli più definiti, senza costi di prestazioni.",
  amdSharpeningValue: "Intensità nitidezza",
};

const en: Strings = {
  title: "Quick Settings",
  audio: "Audio",
  volume: "Device volume",
  microphoneVolume: "Microphone volume",
  audioOutput: "Audio output",
  microphoneInput: "Microphone input",
  audioDevicesUnavailable: "Audio devices unavailable",
  display: "Display",
  brightness: "Brightness",
  hdr: "HDR",
  hdrUnavailable: "Could not toggle HDR",
  hdrConfirmTitle: "Keep HDR change?",
  hdrConfirmBody:
    "If the image looks correct, press OK. Otherwise the HDR toggle will be reverted automatically in",
  resolution: "Resolution",
  refreshRate: "Refresh rate",
  adaptingUi: "Adapting the interface to the new resolution…",
  tdp: "TDP (AMD)",
  tdpLimit: "Power limit",
  lossless: "Lossless Scaling",
  losslessLaunch: "Launch Lossless Scaling",
  losslessScaling: "Scaling",
  losslessFrameGen: "Frame generation",
  losslessMultiplier: "Frame gen multiplier",
  losslessHotkeyHint: "Scaling hotkey:",
  losslessApplyNote: "Changing frame generation restarts Lossless Scaling.",
  off: "Off",
  ...amdEn,
  advanced: "Advanced",
  agentLabel: "Quick Settings agent",
  agentRunning: "Running",
  agentStopped: "Stopped",
  startAgent: "Start agent",
  stopAgent: "Stop agent",
  agentHint: "Stop the agent before uninstalling or updating the plugin. It only runs in Big Picture.",
  ok: "OK",
  cancel: "Cancel",
  notConnected: "Quick Settings agent is not connected",
};

const it: Strings = {
  title: "Quick Settings",
  audio: "Audio",
  volume: "Volume dispositivo",
  microphoneVolume: "Volume microfono",
  audioOutput: "Uscita audio",
  microphoneInput: "Ingresso microfono",
  audioDevicesUnavailable: "Dispositivi audio non disponibili",
  display: "Schermo",
  brightness: "Luminosità",
  hdr: "HDR",
  hdrUnavailable: "Impossibile attivare/disattivare HDR",
  hdrConfirmTitle: "Mantenere la modifica HDR?",
  hdrConfirmBody:
    "Se l'immagine è corretta, premi OK. Altrimenti l'HDR verrà ripristinato automaticamente tra",
  resolution: "Risoluzione",
  refreshRate: "Frequenza di aggiornamento",
  adaptingUi: "Adatto l'interfaccia alla nuova risoluzione…",
  tdp: "TDP (AMD)",
  tdpLimit: "Limite di potenza",
  lossless: "Lossless Scaling",
  losslessLaunch: "Avvia Lossless Scaling",
  losslessScaling: "Scaling",
  losslessFrameGen: "Generazione fotogrammi",
  losslessMultiplier: "Moltiplicatore generazione",
  losslessHotkeyHint: "Scorciatoia scaling:",
  losslessApplyNote: "Cambiare la generazione fotogrammi riavvia Lossless Scaling.",
  off: "Off",
  ...amdIt,
  advanced: "Avanzate",
  agentLabel: "Agent Quick Settings",
  agentRunning: "In esecuzione",
  agentStopped: "Fermo",
  startAgent: "Avvia agent",
  stopAgent: "Ferma agent",
  agentHint: "Ferma l'agent prima di disinstallare o aggiornare il plugin. Si avvia solo in Big Picture.",
  ok: "OK",
  cancel: "Annulla",
  notConnected: "Agent Quick Settings non collegato",
};

const strings: Record<string, Strings> = { en, it };

export function t(): Strings {
  const language = navigator.language.split("-")[0];
  return strings[language] ?? strings.en;
}
