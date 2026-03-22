// Statische Daten der Landing Page
// Kein localStorage, kein API-Layer – direkt im Quellcode.

export const members = [
  {
    name: "Lukas Gilbert",
    taetigkeit: "BIM Manager & Consultant",
    catchphrase: "Menschen vernetzen, die das Bauen verändern wollen",
    photo: "assets/user_img/LukasGilbert.webp",
    stichwoerter: ["BIM Implementierung", "Content-Entwicklung", "Automatisierung"],
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/lukas-gilbert-O427a5132/" }
    ]
  },
  {
    name: "Phil Deeg",
    taetigkeit: "Ingenieur, Facilitator, Problem Solver",
    catchphrase: "Freude verbreiten durch sinnvolle Projekte, die zu einer positiven Zukunft beitragen",
    photo: "assets/user_img/PhilippDeeg.webp",
    stichwoerter: ["Computational Design und Nachhaltigkeit"],
    links: []
  },
  {
    name: "Lukas Schmölzl",
    taetigkeit: "Super-Duper-Servicekraft",
    catchphrase: "IT & BIM sind für die Baustelle da",
    photo: "assets/user_img/LukasSchmölzl.webp",
    stichwoerter: ["BIM-Entwicklung", "Systemadmininistration", "undBauen"],
    links: [
      { label: "LinkedIn", url: "https://linkedin.com/in/lukas-schmölzl/" },
      { label: "Website", url: "https://Schmölzl.de/" }
    ]
  },
  {
    name: "Johannes Steidle",
    taetigkeit: "Product Owner",
    catchphrase: "Digitale Prozesse, die man einfach nutzt.",
    photo: "assets/user_img/JohannesSteidle.webp",
    stichwoerter: ["Revit User", "Prozessdesign", "Produktdenken"],
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/johannes-steidle-9799b3280/" }
    ]
  },
  {
    name: "David Klinkner",
    taetigkeit: "Freier Ingenieur & Berater",
    catchphrase: "rethink structures in real estate.",
    photo: "assets/user_img/DavidKlinkner.webp",
    stichwoerter: ["Nachhaltige Tragwerkslösungen", "Arbeits- & Prozesskultur", "Kollaboration"],
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/klnknr" },
      { label: "Website", url: "https://www.klinco.de" }
    ]
  },
  {
    name: "Luk Vermeulen",
    taetigkeit: "Produktdenker für digitale Innovationen",
    catchphrase: "Der digitale workspace für dein Planungsprojekt.",
    photo: "assets/user_img/LukVermeulen.webp",
    stichwoerter: ["Produktentwicklung", "Softwareentwicklung", "AEC Innovationen"],
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/luk-vermeulen/" }
    ]
  },
  {
    name: "Tarick Chahade",
    taetigkeit: "Ingenieur, Wissenschaftler & Entwickler",
    catchphrase: "Digital Workflows. Real Difference.",
    photo: "assets/user_img/TarickChahade.webp",
    stichwoerter: ["AEC workflows", "automated building design", "product development"],
    links: []
  },
  {
    name: "Moses Pöhls",
    taetigkeit: "BIM-Koordinator, Architekt, Softwareentwickler",
    catchphrase: "BIM ist eine offene, vernetzte Arbeitsmethode und nicht Revit.",
    photo: "assets/user_img/MosesPöhls.webp",
    stichwoerter: ["BIM4B", "Drohnen", "Punktwolken", "Robotik", "Digitale Workflows", "Innovation am Bau"],
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/moses-pöhls-738164146/" }
    ]
  },
  {
    name: "David Bjelland",
    taetigkeit: "Ingenieur, BIM-Planung und Bauphysik",
    catchphrase: "",
    photo: "assets/user_img/DavidBjelland.webp",
    stichwoerter: ["BIM", "BEM", "PED", "Energetische Sanierung", "Bauphysik"],
    links: []
  },
  {
    name: "Mara Ruhland",
    taetigkeit: "BIM Managerin / Planungskoordinatorin",
    catchphrase: "Simplifying BIM, Connecting Teams",
    photo: "assets/user_img/MaraRuhland.webp",
    stichwoerter: ["Softwareadministration", "Schulung & Training", "Richtlinien", "Digitalisierungsstrategie", "BIM-Implementierung"],
    links: [
      { label: "Website", url: "https://mara-bim.de" }
    ]
  },
  {
    name: "Alex Schlachter",
    taetigkeit: "BIM Manager",
    catchphrase: "",
    photo: "assets/user_img/AlexSchlachter.webp",
    stichwoerter: ["Automatisierung", "BIM für die Baustelle", "Datenmanagement & Visualisierung", "Software-Entwicklung"],
    links: []
  },
  {
    name: "Carinoa Campos",
    taetigkeit: "BIM Koordinatorin",
    catchphrase: "",
    photo: "assets/user_img/CarinoaCampos.webp",
    stichwoerter: ["Workflow-Management", "Modellprüfung", "integrale Projektkoordination"],
    links: []
  },
  {
    name: "Celina Stiehl",
    taetigkeit: "BIM-Gesamtkoordination",
    catchphrase: "BIM-Prozesse müssen praxisnah und nutzerorientiert sein.",
    photo: "assets/user_img/CelinaStiehl.webp",
    stichwoerter: ["Workflow-Management", "Modellprüfung", "integrale Projektkoordination"],
    links: []
  },
  {
    name: "Nikolai Davydov",
    taetigkeit: "Software Developer (C#)",
    catchphrase: "",
    photo: "assets/user_img/NikolaiDavydov.webp",
    stichwoerter: ["BIM", "Automatisierung", "Revit Addins Developer"],
    links: []
  },
  {
    name: "Vsevolod Chugreev",
    taetigkeit: "Software Developer",
    catchphrase: "",
    photo: "assets/user_img/VsevolodChugreev.webp",
    stichwoerter: ["Design automation"],
    links: []
  },
  {
    name: "Felix Quecke",
    taetigkeit: "BIM Koordination",
    catchphrase: "Do the small things well",
    photo: "assets/user_img/FelixQuecke.webp",
    stichwoerter: ["Koordination", "Entwicklung", "Support"],
    links: []
  },
  {
    name: "Stefan Limmer",
    taetigkeit: "Beratungsingenieur, Bauphysiker",
    catchphrase: "",
    photo: "assets/user_img/StefanLimmer.webp",
    stichwoerter: ["Bauphysik", "Simulation", "Energiekonzeption", "Workflows", "Problemlösung"],
    links: []
  }
];

export const events = [
  {
    id: "evt_2026_03_30",
    title: "BIM in der Bauphysik – Anforderungen an das Bauphysikmodell",
    date: "2026-03-30",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "Vertiefung der Modellanforderungen und Integration in den BIM-Prozess.",
    tags: ["BIM", "Bauphysik", "Modell"]
  },
  {
    id: "evt_2026_04_07",
    title: "Transformation im Bauwesen – von BIM zum echten Mehrwert",
    date: "2026-04-07",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Innovationsabend",
    descriptionPublic: "",
    tags: ["BIM", "Transformation", "Innovation"]
  },
  {
    id: "test1",
    title: "DIN 19650 – Umsetzung & Anwendung in der Praxis",
    date: "",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "Gemeinsame Erarbeitung und Vertiefung der neuen Anforderungen.",
    tags: ["DIN 19650", "BIM", "Normen"]
  },
  {
    id: "test2",
    title: "DIN 19650 – Umsetzung & Anwendung in der Praxis",
    date: "",
    time: "19:00",
    durationMinutes: 90,
    location: "Digital (Teams)",
    format: "Workshop",
    descriptionPublic: "Gemeinsame Erarbeitung und Vertiefung der neuen Anforderungen.",
    tags: ["DIN 19650", "BIM", "Normen"]
  }
];

export const updates = [];
