// Statische Termindaten der Landing Page
// Kein localStorage, kein API-Layer – direkt im Quellcode.

// Themen-Gruppen für den Abschnitt "Laufende Termine".
// Reihenfolge bestimmt die Anzeige; Termine werden je Thema gruppiert gezeigt.
export const themes = [
  { id: "innovationsabend",     title: "Innovationsabend",            format: "Innovationsabend" },
  {
    id: "workshop_din19650",
    title: "Praxis vs. DIN 19650",
    format: "Workshop",
    intro: "Eine neue Fassung der DIN-19650 ist in der Entwurfsphase. Wir diskutieren die Änderungen, wie sich diese auf die Praxis auswirken und wo die Norm am Alltag der Planung und Ausführung scheitert.",
    credits: [
      { role: "Organisation", name: "Lukas Gilbert" }
    ]
  },
  {
    id: "workshop_bauphysik",
    title: "BIM in der Bauphysik",
    format: "Workshop",
    image: "assets/gif/BlenderPluginStefangif.gif",
    intro: "Wir untersuchen, wie sich die Bauphysik modellbasiert in BIM-Prozesse integrieren lässt. Ein erster Meilenstein ist ein Proof of Concept für die Zusammenführung von IFC Spaces zu IFC Zones gemäß den Standards DIN EN 1283-1, VDI 6020, VDI 2078 und ASHRAE 140-202. Das Ganze ist eine Erweiterung für Blender auf Basis des Plugins Bonsai BIM.",
    credits: [
      { role: "GIF & Plugin", name: "David Bjelland" },
      { role: "Organisation", name: "Lukas Gilbert" }
    ]
  },
  {
    id: "workshop_koordination",
    title: "BIM Koordination",
    format: "Workshop",
    intro: "Austausch rund um die BIM-Koordination. Die Themen sind die Umsetzung der vom Bauherrn geforderten BIM-Anwendungsfälle, die Erstellung eines BIM-Abwicklungsplans (BAP) und Workflows zur BIM-Koordination. Wie können Mehrwerte ohne Mehraufwand generiert werden? Konkrete Ziele werden innerhalb des Workshops festgelegt.",
    credits: [
      { role: "Organisation", name: "Lukas Schmölzl" }
    ]
  }
];

// Ein Event = eine Termin-Kachel. Pro Thema werden mehrere Kacheln in einer Reihe gezeigt.
// Aktuell je 3 Platzhalter-Termine pro Thema – Datum/Uhrzeit/Notiz nach Bedarf anpassen.
export const events = [
  // Innovationsabend
  {
    id: "evt_innovationsabend_1",
    theme: "innovationsabend",
    title: "KI im Bauwesen",
    subtitle: "Impulse, Praxisbeispiele & Diskussion",
    date: "2026-07-06",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Innovationsabend",
    descriptionPublic: "Begrüßung & Netzwerk-Update (Status der Plattform & nächste Schritte)",
    tags: ["Innovationsabend", "BIM", "Praxis"]
  },
  {
    id: "evt_innovationsabend_2",
    theme: "innovationsabend",
    title: "Thema folgt",
    subtitle: "",
    date: "2026-08-03",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Innovationsabend",
    descriptionPublic: "Das Thema wird rechtzeitig bekannt gegeben.",
    tags: ["Innovationsabend"]
  },
  {
    id: "evt_innovationsabend_3",
    theme: "innovationsabend",
    title: "Thema folgt",
    subtitle: "",
    date: "2026-09-07",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Innovationsabend",
    descriptionPublic: "Das Thema wird rechtzeitig bekannt gegeben.",
    tags: ["Innovationsabend"]
  },

  // Workshop: Praxis vs. DIN 19650
  {
    id: "evt_din19650_1",
    theme: "workshop_din19650",
    title: "",
    subtitle: "",
    date: "2026-07-07",
    time: "20:30",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["DIN 19650", "CDE", "BIM", "Normen"]
  },
  {
    id: "evt_din19650_2",
    theme: "workshop_din19650",
    title: "",
    subtitle: "",
    date: "2026-07-21",
    time: "20:30",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["DIN 19650", "CDE", "BIM", "Normen"]
  },
  {
    id: "evt_din19650_3",
    theme: "workshop_din19650",
    title: "",
    subtitle: "",
    date: "2026-08-04",
    time: "20:30",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["DIN 19650", "CDE", "BIM", "Normen"]
  },

  // Workshop: BIM in der Bauphysik
  {
    id: "evt_bauphysik_1",
    theme: "workshop_bauphysik",
    title: "",
    subtitle: "",
    date: "2026-06-22",
    time: "18:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Bauphysik", "Modell"]
  },
  {
    id: "evt_bauphysik_2",
    theme: "workshop_bauphysik",
    title: "",
    subtitle: "",
    date: "2026-07-06",
    time: "18:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Bauphysik", "Modell"]
  },
  {
    id: "evt_bauphysik_3",
    theme: "workshop_bauphysik",
    title: "",
    subtitle: "",
    date: "2026-07-20",
    time: "18:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Bauphysik", "Modell"]
  },

  // Workshop: BIM Koordination
  {
    id: "evt_koordination_1",
    theme: "workshop_koordination",
    title: "",
    subtitle: "",
    date: "2026-07-14",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Koordination", "Modellprüfung"]
  },
  {
    id: "evt_koordination_2",
    theme: "workshop_koordination",
    title: "",
    subtitle: "",
    date: "2026-07-28",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Koordination", "Modellprüfung"]
  },
  {
    id: "evt_koordination_3",
    theme: "workshop_koordination",
    title: "",
    subtitle: "",
    date: "2026-08-11",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "",
    tags: ["BIM", "Koordination", "Modellprüfung"]
  }
];

export const updates = [];
