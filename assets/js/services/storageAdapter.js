/*  storageAdapter: MVP "Backend" über localStorage
    - sauberer API-Layer, UI greift NICHT direkt auf localStorage zu.
*/

const K = {
  users: "users",
  session: "session",
  profilesPrefix: "profile:",
  events: "events",
  bookingsPrefix: "bookings:",
  savedPrefix: "savedEvents:",
  participationPrefix: "participation:",
  forumThreads: "forum:threads",
  forumPostsPrefix: "forum:posts:",
  msgThreadsPrefix: "threads:",
  msgMessagesPrefix: "messages:",
  systemPrefix: "system:",
  notificationsPrefix: "notifications:",
  favoritesPrefix: "favorites:",
  activityPrefix: "activity:",
  cmsUpdates: "cms:updates",
  cmsPubs: "cms:publications",
  resources: "resources",
  knowledge: "knowledge",
  auditLog: "auditLog"
};

function nowISO(){ return new Date().toISOString(); }
function uid(prefix="id"){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }

function getJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    return JSON.parse(raw);
  }catch{ return fallback; }
}
function setJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function seedUsersIfEmpty(){
  const users = getJSON(K.users, []);
  if(users.length) return;
  // Admin Seed
  users.push({ id:uid("u"), name:"Admin", email:"admin@undbauen.local", password:"adminadmin", role:"admin", status:"active" });
  // Moderator Seed
  users.push({ id:uid("u"), name:"Moderator", email:"moderator@undbauen.local", password:"moderator123", role:"moderator", status:"active" });
  // Editor Seed
  users.push({ id:uid("u"), name:"Editor", email:"editor@undbauen.local", password:"editor123", role:"editor", status:"active" });
  setJSON(K.users, users);
}

function seedExampleMembers(){
  const users = getJSON(K.users, []);
  const exampleMembers = [
    {
      name: "Dr. Sarah Müller",
      email: "sarah.mueller@example.com",
      password: "demo1234",
      headline: "BIM-Expertin & Digitalisierung im Bauwesen",
      location: "Berlin",
      bio: "Architektin mit Fokus auf digitale Transformation im Bauwesen. Spezialisiert auf BIM-Workflows und interdisziplinäre Kollaboration. Leidenschaft für nachhaltige Bauprozesse und innovative Technologien.",
      skills: ["BIM", "Revit", "IFC", "Digitalisierung"],
      interests: ["Nachhaltigkeit", "KI im Bauwesen", "OpenBIM"],
      offer: "BIM-Schulungen, Workflow-Optimierung, Projektberatung",
      lookingFor: "Austausch zu OpenBIM-Standards, Erfahrungen mit KI-Tools",
      linkedin: "https://linkedin.com/in/sarah-mueller-bim",
      website: "https://sarah-mueller-arch.de"
    },
    {
      name: "Michael Schneider",
      email: "michael.schneider@example.com",
      password: "demo1234",
      headline: "Ingenieur für nachhaltiges Bauen",
      location: "München",
      bio: "Bauingenieur mit Expertise in Kreislaufwirtschaft und nachhaltigen Materialien. Entwickelt innovative Konzepte für ressourcenschonendes Bauen und zirkuläre Wertschöpfungsketten.",
      skills: ["Nachhaltigkeit", "Kreislaufwirtschaft", "LCA", "Materialforschung"],
      interests: ["Cradle-to-Cradle", "Recycling", "CO2-Reduktion"],
      offer: "Nachhaltigkeitsberatung, Materialanalysen, Zertifizierungen",
      lookingFor: "Best Practices für zirkuläres Bauen, Materialdatenbanken",
      linkedin: "https://linkedin.com/in/michael-schneider-nachhaltigkeit",
      website: ""
    },
    {
      name: "Lisa Weber",
      email: "lisa.weber@example.com",
      password: "demo1234",
      headline: "Projektmanagerin für digitale Bauprozesse",
      location: "Hamburg",
      bio: "Projektmanagerin mit Fokus auf agile Methoden und digitale Kollaboration im Bauwesen. Erfahrene Moderatorin für interdisziplinäre Teams und Change-Management in der AEC-Branche.",
      skills: ["Projektmanagement", "Agile Methoden", "Kollaboration", "Change Management"],
      interests: ["Neue Arbeitswelten", "Team-Dynamik", "Prozessoptimierung"],
      offer: "Workshops, Moderation, Prozessberatung",
      lookingFor: "Erfahrungen mit agilen Methoden im Bauwesen",
      linkedin: "https://linkedin.com/in/lisa-weber-pm",
      website: "https://lisa-weber-consulting.de"
    },
    {
      name: "Thomas Fischer",
      email: "thomas.fischer@example.com",
      password: "demo1234",
      headline: "Software-Entwickler für AEC-Lösungen",
      location: "Stuttgart",
      bio: "Software-Entwickler spezialisiert auf AEC-Tools und Automatisierung. Entwickelt Plugins für Revit, ArchiCAD und andere BIM-Software. Open-Source-Enthusiast.",
      skills: ["Python", "C#", "Revit API", "IFC", "Automation"],
      interests: ["Open Source", "Workflow-Automation", "API-Entwicklung"],
      offer: "Custom-Tools, Plugin-Entwicklung, Automatisierung",
      lookingFor: "Kollaboration bei Open-Source-Projekten",
      linkedin: "https://linkedin.com/in/thomas-fischer-dev",
      website: "https://github.com/thomas-fischer"
    },
    {
      name: "Anna Hoffmann",
      email: "anna.hoffmann@example.com",
      password: "demo1234",
      headline: "Stadtplanerin & Smart City Expertin",
      location: "Frankfurt",
      bio: "Stadtplanerin mit Expertise in Smart City-Konzepten und digitaler Stadtentwicklung. Fokus auf partizipative Planungsprozesse und datengetriebene Entscheidungen.",
      skills: ["Stadtplanung", "Smart City", "GIS", "Partizipation"],
      interests: ["Zukunft der Stadt", "Datenanalyse", "Bürgerbeteiligung"],
      offer: "Stadtentwicklungskonzepte, Workshops, Beratung",
      lookingFor: "Best Practices für Smart City-Projekte",
      linkedin: "https://linkedin.com/in/anna-hoffmann-stadtplanung",
      website: ""
    },
    {
      name: "Dr. Robert Klein",
      email: "robert.klein@example.com",
      password: "demo1234",
      headline: "Forscher für KI im Bauwesen",
      location: "Dresden",
      bio: "Wissenschaftler und Forscher im Bereich Künstliche Intelligenz für das Bauwesen. Entwickelt ML-Modelle für Bauprozesse, Materialoptimierung und Vorhersagemodelle.",
      skills: ["KI", "Machine Learning", "Datenanalyse", "Forschung"],
      interests: ["KI-Anwendungen", "Predictive Analytics", "Innovation"],
      offer: "Forschungs-Kollaboration, Datenanalyse, ML-Modelle",
      lookingFor: "Datenquellen, Forschungsprojekte, Anwendungsfälle",
      linkedin: "https://linkedin.com/in/robert-klein-ki",
      website: "https://robert-klein-research.de"
    },
    {
      name: "Julia Becker",
      email: "julia.becker@example.com",
      password: "demo1234",
      headline: "Bauphysikerin & Energieberaterin",
      location: "Köln",
      bio: "Bauphysikerin spezialisiert auf Energieeffizienz und Gebäudeoptimierung. Expertin für Gebäudeenergiegesetz (GEG) und nachhaltige Gebäudetechnik.",
      skills: ["Bauphysik", "Energieberatung", "GEG", "Gebäudetechnik"],
      interests: ["Energieeffizienz", "Gebäudesanierung", "Nachhaltigkeit"],
      offer: "Energieberatung, GEG-Zertifizierung, Sanierungskonzepte",
      lookingFor: "Innovative Gebäudetechnik, Best Practices",
      linkedin: "https://linkedin.com/in/julia-becker-energie",
      website: ""
    },
    {
      name: "Markus Wagner",
      email: "markus.wagner@example.com",
      password: "demo1234",
      headline: "Bauunternehmer & Digitalisierungs-Pionier",
      location: "Nürnberg",
      bio: "Bauunternehmer mit Fokus auf digitale Baustellen und innovative Bauprozesse. Setzt Drohnen, IoT-Sensoren und digitale Tools für effizientere Baustellen ein.",
      skills: ["Bauleitung", "Digitalisierung", "IoT", "Drohnen", "Baustellen-Management"],
      interests: ["Digitale Baustelle", "IoT", "Effizienz", "Innovation"],
      offer: "Baustellen-Digitalisierung, IoT-Integration, Beratung",
      lookingFor: "Erfahrungen mit digitalen Baustellen-Tools",
      linkedin: "https://linkedin.com/in/markus-wagner-bau",
      website: ""
    }
  ];
  
  // Füge Beispiel-Mitglieder hinzu, falls sie noch nicht existieren
  for(const member of exampleMembers){
    const exists = users.some(u => u.email.toLowerCase() === member.email.toLowerCase());
    if(!exists){
      const user = {
        id: uid("u"),
        name: member.name,
        email: member.email,
        password: member.password,
        role: "member",
        status: "active"
      };
      users.push(user);
      
      // Erstelle vollständiges Profil
      const profileKey = K.profilesPrefix + member.email.toLowerCase();
      setJSON(profileKey, {
        userId: user.id,
        name: member.name,
        email: member.email,
        headline: member.headline,
        location: member.location,
        bio: member.bio,
        skills: member.skills,
        interests: member.interests,
        offer: member.offer,
        lookingFor: member.lookingFor,
        links: {
          linkedin: member.linkedin,
          website: member.website
        },
        privacy: {
          visibleInDirectory: true,
          allowDM: true
        },
        completed: true,
        updatedAt: nowISO()
      });
    }
  }
  
  setJSON(K.users, users);
}

function seedProfileIfMissing(user){
  const key = K.profilesPrefix + user.email.toLowerCase();
  if(localStorage.getItem(key)) return;
  setJSON(key, {
    userId: user.id,
    name: user.name,
    email: user.email,
    headline: "",
    location: "",
    bio: "",
    skills: [],
    interests: [],
    offer: "",
    lookingFor: "",
    links: { linkedin:"", website:"" },
    privacy: { visibleInDirectory:true, allowDM:true },
    completed: false,
    updatedAt: nowISO()
  });
}

function seedEventsIfEmpty(){
  const events = getJSON(K.events, []);
  if(events.length) return;
  const seeded = [
    {
      id:"evt_2026_01_12",
      title:"Innovationsabend: AEC Design Workflow Automation",
      date:"2026-01-12",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Innovationsabend",
      visibility:"public",
      descriptionPublic:"Kurzinfo ohne Details. Einloggen, um zu buchen und Details zu sehen.",
      descriptionMember:"Member-Details: Agenda, Speaker-Links, Vorabfragen, Materialien.",
      capacity:20,
      tags:["AEC","Automation","BIM"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    },
    {
      id:"evt_2026_02_09",
      title:"Panel: Offene Standards & Interoperabilität",
      date:"2026-02-09",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Workshop",
      visibility:"public",
      descriptionPublic:"Diskussion & Austausch – öffentlich nur Vorschau.",
      descriptionMember:"Member-Details: Leitfragen, Miro-Link, Diskussionsstruktur.",
      capacity:10,
      tags:["IFC","Standards","OpenBIM"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    },
    {
      id:"evt_2026_03_15",
      title:"Innovationsabend: Nachhaltiges Bauen & Circular Economy",
      date:"2026-03-15",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Innovationsabend",
      visibility:"public",
      descriptionPublic:"Austausch zu nachhaltigen Baukonzepten und zirkulären Wirtschaftsmodellen im Bauwesen.",
      descriptionMember:"Member-Details: Agenda, Speaker-Links, Vorabfragen, Materialien.",
      capacity:20,
      tags:["Nachhaltigkeit","Circular Economy","Green Building"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    },
    {
      id:"evt_2026_04_20",
      title:"Panel: Digitalisierung in der Bauausführung",
      date:"2026-04-20",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Workshop",
      visibility:"public",
      descriptionPublic:"Diskussion über digitale Tools und Prozesse auf der Baustelle.",
      descriptionMember:"Member-Details: Leitfragen, Miro-Link, Diskussionsstruktur.",
      capacity:10,
      tags:["Digitalisierung","Bauausführung","Construction Tech"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    },
    {
      id:"evt_2026_05_18",
      title:"Innovationsabend: KI-gestützte Planungsprozesse",
      date:"2026-05-18",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Innovationsabend",
      visibility:"public",
      descriptionPublic:"Erkundung von KI-Anwendungen in der Architektur- und Bauplanung.",
      descriptionMember:"Member-Details: Agenda, Speaker-Links, Vorabfragen, Materialien.",
      capacity:20,
      tags:["KI","Künstliche Intelligenz","Planung","Innovation"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    },
    {
      id:"evt_2026_06_22",
      title:"Panel: Nachhaltigkeit & Klimaneutrales Bauen",
      date:"2026-06-22",
      time:"18:00",
      durationMinutes:90,
      location:"Digital (Teams)",
      format:"Workshop",
      visibility:"public",
      descriptionPublic:"Diskussion über Strategien für klimaneutrales Bauen und nachhaltige Materialien.",
      descriptionMember:"Member-Details: Leitfragen, Miro-Link, Diskussionsstruktur.",
      capacity:55,
      tags:["Nachhaltigkeit","Klimaneutral","Green Building","Panel"],
      createdBy:"seed",
      status:"scheduled",
      eventThreadId:null
    }
  ];
  setJSON(K.events, seeded);
}

function seedForumIfEmpty(){
  const threads = getJSON(K.forumThreads, []);
  if(threads.length) return;
  
  // Seed example threads for each category
  const seeded = [
    {
      id: uid("thr"),
      categoryId: "cat_general",
      title: "Willkommen im Forum!",
      body: "Dies ist der erste Thread im Forum. Stelle Fragen, teile Ideen und tausche dich mit der Community aus!",
      createdBy: "admin@undbauen.local",
      createdAt: nowISO(),
      lastActivityAt: nowISO(),
      replyCount: 0,
      views: 0,
      pinned: true,
      locked: false,
      archived: false,
      tags: ["Willkommen", "Community"]
    },
    {
      id: uid("thr"),
      categoryId: "cat_projects",
      title: "BIM-Workflow Optimierung: Best Practices",
      body: "Teilt eure Erfahrungen mit BIM-Workflows. Welche Tools und Prozesse funktionieren am besten?",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      replyCount: 3,
      views: 45,
      pinned: false,
      locked: false,
      archived: false,
      tags: ["BIM", "Workflow", "Best Practices"]
    },
    {
      id: uid("thr"),
      categoryId: "cat_questions",
      title: "Wie implementiere ich IDS in meinem Projekt?",
      body: "Ich möchte IDS (Information Delivery Specification) in meinem aktuellen Projekt verwenden. Hat jemand Erfahrung damit?",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      replyCount: 2,
      views: 28,
      pinned: false,
      locked: false,
      archived: false,
      tags: ["IDS", "Frage", "Implementierung"]
    },
    {
      id: uid("thr"),
      categoryId: "cat_events",
      title: "Rückblick: Innovationsabend AEC Design Workflow",
      body: "Diskussion zum letzten Innovationsabend. Was waren eure Highlights? Welche Learnings nehmt ihr mit?",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      replyCount: 5,
      views: 67,
      pinned: false,
      locked: false,
      archived: false,
      tags: ["Event", "Rückblick", "Innovationsabend"]
    }
  ];
  
  setJSON(K.forumThreads, seeded);
}

function seedCMSIfEmpty(){
  const u = getJSON(K.cmsUpdates, []);
  if(!u.length){
    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    setJSON(K.cmsUpdates, [
      { 
        id:uid("upd"), 
        month:"2026-01", 
        title:"Monatsupdate Januar 2026", 
        intro:"Was im Netzwerk passiert ist – Teaser.", 
        highlights:["Rückblick Januar","Nächste Themen","Call for topics"], 
        memberBody:"Member-Text: ausführlicher Rückblick, Links, Ressourcen.", 
        status:"published", 
        visibility:"member", 
        date: nowISO(),
        createdAt:nowISO(), 
        updatedAt:nowISO() 
      },
      { 
        id:uid("upd"), 
        month:"2025-12", 
        title:"Monatsupdate Dezember 2025", 
        intro:"Rückblick auf das Jahr 2025 und Ausblick auf 2026.", 
        highlights:["Jahresrückblick","Neue Mitglieder","2026 Preview"], 
        memberBody:"Member-Text: ausführlicher Jahresrückblick.", 
        status:"published", 
        visibility:"member", 
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
        createdAt:new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(), 
        updatedAt:new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString() 
      },
      { 
        id:uid("upd"), 
        month:"2025-11", 
        title:"Monatsupdate November 2025", 
        intro:"Innovationsabende und Netzwerk-Aktivitäten im November.", 
        highlights:["Innovationsabend","Workshop","Netzwerk"], 
        memberBody:"Member-Text: Details zu den Veranstaltungen.", 
        status:"published", 
        visibility:"member", 
        date: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
        createdAt:new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(), 
        updatedAt:new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString() 
      }
    ]);
  }
  const p = getJSON(K.cmsPubs, []);
  if(!p.length){
    setJSON(K.cmsPubs, [
      { 
        id:uid("pub"), 
        title:"AEC Automation Patterns", 
        abstract:"Kurzabstract (public). Best Practices für die Automatisierung von AEC-Workflows.", 
        tags:["Automation","AEC","BIM"], 
        memberBody:"Member-Body: Volltext / Ressourcen.", 
        downloadUrl:"", 
        status:"published", 
        visibility:"member", 
        date: nowISO(),
        createdAt:nowISO(), 
        updatedAt:nowISO() 
      },
      { 
        id:uid("pub"), 
        title:"Nachhaltigkeit im Bauwesen", 
        abstract:"Strategien für nachhaltiges Bauen und Kreislaufwirtschaft in der Architektur.", 
        tags:["Nachhaltigkeit","Kreislaufwirtschaft","Architektur"], 
        memberBody:"Member-Body: Volltext.", 
        downloadUrl:"", 
        status:"published", 
        visibility:"member", 
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt:new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
        updatedAt:new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { 
        id:uid("pub"), 
        title:"Digitale Transformation im Bauwesen", 
        abstract:"Wie neue Technologien die Bauindustrie verändern.", 
        tags:["Digitalisierung","BIM","IoT"], 
        memberBody:"Member-Body: Volltext.", 
        downloadUrl:"", 
        status:"published", 
        visibility:"member", 
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt:new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), 
        updatedAt:new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { 
        id:uid("pub"), 
        title:"IDS Practice: Information Delivery Specification im Bauwesen", 
        abstract:"Praktische Anwendung von IDS für standardisierte Datenaustauschprozesse in BIM-Workflows.", 
        tags:["IDS","BIM","Standards","Interoperabilität"], 
        memberBody:"Member-Body: Volltext mit Best Practices, Code-Beispielen und Implementierungsleitfaden.", 
        downloadUrl:"", 
        status:"published", 
        visibility:"member", 
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt:new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), 
        updatedAt:new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() 
      },
      { 
        id:uid("pub"), 
        title:"Dynamo Optimization: Performance-Tuning für komplexe Workflows", 
        abstract:"Strategien zur Optimierung von Dynamo-Skripten für effiziente Automatisierung in Revit und anderen AEC-Tools.", 
        tags:["Dynamo","Optimization","Revit","Automation","Performance"], 
        memberBody:"Member-Body: Volltext mit Optimierungstechniken, Code-Beispielen und Performance-Benchmarks.", 
        downloadUrl:"", 
        status:"published", 
        visibility:"member", 
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt:new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
        updatedAt:new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() 
      }
    ]);
  }
}

function seedResourcesIfEmpty(){
  const resources = getJSON(K.resources, []);
  if(resources.length) return;
  setJSON(K.resources, [
    {
      id: uid("res"),
      title: "BIM Implementation Guide",
      description: "Umfassender Leitfaden zur Implementierung von BIM in Architektur- und Ingenieurbüros.",
      categoryId: "cat_guides",
      tags: ["BIM", "Implementation", "Guide"],
      fileUrl: "/assets/resources/bim-implementation-guide.pdf",
      fileType: "pdf",
      fileSize: 2457600,
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("res"),
      title: "Dynamo Script Library",
      description: "Sammlung von Dynamo-Skripten für häufige Automatisierungsaufgaben in Revit.",
      categoryId: "cat_scripts",
      tags: ["Dynamo", "Automation", "Revit", "Scripts"],
      fileUrl: "/assets/resources/dynamo-scripts.zip",
      fileType: "zip",
      fileSize: 1048576,
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("res"),
      title: "Sustainable Building Materials Database",
      description: "Datenbank nachhaltiger Baumaterialien mit Umweltbewertungen und Verfügbarkeit.",
      categoryId: "cat_databases",
      tags: ["Nachhaltigkeit", "Materialien", "Database"],
      fileUrl: "https://docs.google.com/spreadsheets/d/example",
      fileType: "link",
      fileSize: 0,
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("res"),
      title: "IFC Best Practices",
      description: "Best Practices für den Export und Import von IFC-Dateien in verschiedenen Softwarelösungen.",
      categoryId: "cat_guides",
      tags: ["IFC", "OpenBIM", "Interoperability"],
      fileUrl: "/assets/resources/ifc-best-practices.pdf",
      fileType: "pdf",
      fileSize: 3145728,
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("res"),
      title: "Presentation Template: Innovationsabend",
      description: "PowerPoint-Vorlage für Präsentationen bei …undbauen Innovationsabenden.",
      categoryId: "cat_templates",
      tags: ["Template", "Präsentation", "Branding"],
      fileUrl: "/assets/resources/presentation-template.pptx",
      fileType: "pptx",
      fileSize: 524288,
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
}

function seedKnowledgeIfEmpty(){
  const knowledge = getJSON(K.knowledge, []);
  if(knowledge.length) return;
  setJSON(K.knowledge, [
    {
      id: uid("know"),
      title: "Was ist BIM?",
      slug: "was-ist-bim",
      excerpt: "Building Information Modeling (BIM) ist eine Methode der vernetzten Planung, Ausführung und Bewirtschaftung von Gebäuden.",
      content: "<h2>Building Information Modeling (BIM)</h2><p>BIM ist mehr als nur 3D-Modellierung. Es ist eine Methode der vernetzten Planung, Ausführung und Bewirtschaftung von Gebäuden mit Hilfe von Software.</p><h3>Die 7 BIM-Dimensionen</h3><ul><li><strong>3D:</strong> Geometrie</li><li><strong>4D:</strong> Zeit/Ablauf</li><li><strong>5D:</strong> Kosten</li><li><strong>6D:</strong> Nachhaltigkeit</li><li><strong>7D:</strong> Facility Management</li></ul>",
      categoryId: "cat_basics",
      tags: ["BIM", "Grundlagen", "Methodik"],
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("know"),
      title: "IFC - Industry Foundation Classes",
      slug: "ifc-industry-foundation-classes",
      excerpt: "IFC ist ein offener Standard für den Austausch von BIM-Daten zwischen verschiedenen Softwareplattformen.",
      content: "<h2>Industry Foundation Classes (IFC)</h2><p>IFC ist ein offener, internationaler Standard (ISO 16739) für den Austausch von BIM-Daten. Er ermöglicht die Interoperabilität zwischen verschiedenen Softwareplattformen.</p><h3>Vorteile</h3><ul><li>Herstellerunabhängigkeit</li><li>Langzeitarchivierung</li><li>Durchgängiger Datenaustausch</li><li>Transparenz</li></ul><h3>IFC-Versionen</h3><p>Aktuell sind IFC 2x3 und IFC4 die am häufigsten verwendeten Versionen.</p>",
      categoryId: "cat_standards",
      tags: ["IFC", "OpenBIM", "Standards", "Interoperability"],
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("know"),
      title: "Dynamo für Revit",
      slug: "dynamo-fuer-revit",
      excerpt: "Dynamo ist eine visuelle Programmierumgebung für die Automatisierung von Workflows in Revit und anderen Autodesk-Produkten.",
      content: "<h2>Dynamo für Revit</h2><p>Dynamo ist eine Open-Source-Plattform für visuelle Programmierung, die eng mit Revit integriert ist.</p><h3>Anwendungsfälle</h3><ul><li>Parametrisches Design</li><li>Datenextraktion und -analyse</li><li>Automatisierung wiederkehrender Aufgaben</li><li>BIM-Modellprüfung</li><li>Generatives Design</li></ul><h3>Getting Started</h3><p>Dynamo ist in Revit bereits enthalten. Öffnen Sie es über die Registerkarte \"Verwalten\" → \"Dynamo\".</p>",
      categoryId: "cat_tools",
      tags: ["Dynamo", "Revit", "Automation", "Visual Programming"],
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: uid("know"),
      title: "Circular Economy im Bauwesen",
      slug: "circular-economy-im-bauwesen",
      excerpt: "Kreislaufwirtschaft im Bauwesen bedeutet, Gebäude und Materialien so zu gestalten, dass sie wiederverwendet, repariert oder recycelt werden können.",
      content: "<h2>Circular Economy im Bauwesen</h2><p>Die Kreislaufwirtschaft ist ein regeneratives System, in dem Ressourcenverbrauch und Abfälle, Emissionen und Energieverschwendung minimiert werden.</p><h3>Prinzipien</h3><ol><li><strong>Design for Disassembly:</strong> Gebäude für Rückbau konzipieren</li><li><strong>Materialpass:</strong> Dokumentation verbauter Materialien</li><li><strong>Urban Mining:</strong> Gebäude als Materialbank</li><li><strong>Lifecycle Thinking:</strong> Gesamter Lebenszyklus im Fokus</li></ol><h3>Vorteile</h3><ul><li>Ressourcenschonung</li><li>CO2-Reduktion</li><li>Wirtschaftlichkeit</li><li>Innovationspotenzial</li></ul>",
      categoryId: "cat_sustainability",
      tags: ["Nachhaltigkeit", "Circular Economy", "Kreislaufwirtschaft", "Ressourcen"],
      visibility: "member",
      status: "published",
      createdBy: "admin@undbauen.local",
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);
}

function seedAuditLogIfEmpty(){
  const auditLog = getJSON(K.auditLog, []);
  if(auditLog.length) return;
  setJSON(K.auditLog, [
    {
      id: uid("audit"),
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: "user.login",
      userId: "admin@undbauen.local",
      details: { method: "password", ip: "127.0.0.1" },
      severity: "info"
    },
    {
      id: uid("audit"),
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      action: "event.created",
      userId: "admin@undbauen.local",
      details: { eventId: "evt_2026_01_12", title: "Innovationsabend: AEC Design Workflow Automation" },
      severity: "info"
    },
    {
      id: uid("audit"),
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      action: "user.role.changed",
      userId: "admin@undbauen.local",
      details: { targetUser: "moderator@undbauen.local", oldRole: "member", newRole: "moderator" },
      severity: "warning"
    },
    {
      id: uid("audit"),
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: "content.published",
      userId: "editor@undbauen.local",
      details: { contentType: "publication", contentId: "pub_123", title: "AEC Automation Patterns" },
      severity: "info"
    },
    {
      id: uid("audit"),
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      action: "ticket.resolved",
      userId: "moderator@undbauen.local",
      details: { ticketId: "tkt_456", category: "technical" },
      severity: "info"
    }
  ]);
}

function ensureSeeds(){
  seedUsersIfEmpty();
  seedExampleMembers(); // Beispiel-Mitglieder hinzufügen
  seedEventsIfEmpty();
  seedForumIfEmpty();
  seedCMSIfEmpty();
  seedResourcesIfEmpty();
  seedKnowledgeIfEmpty();
  seedAuditLogIfEmpty();
}

/* ========== AUTH / SESSION ========== */
function getUsers(){ ensureSeeds(); return getJSON(K.users, []); }
function saveUsers(users){ setJSON(K.users, users); }

function getSession(){ return getJSON(K.session, null); }
function setSession(sess){ setJSON(K.session, sess); }
function clearSession(){ localStorage.removeItem(K.session); }

function me(){
  ensureSeeds();
  const s = getSession();
  if(!s) return null;
  const user = getUsers().find(u => u.id === s.userId);
  if(!user) return null;
  return { ...user };
}

function isLoggedIn(){ return !!me(); }
function isAdmin(){ const u = me(); return !!u && u.role === "admin"; }

function hasRole(role){
  const u = me();
  if(!u) return false;
  return u.role === role;
}

function hasAnyRole(roles){
  const u = me();
  if(!u) return false;
  if(!Array.isArray(roles)) return false;
  return roles.includes(u.role);
}

function login(email, password){
  ensureSeeds();
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === (email||"").toLowerCase());
  if(!user) return { success:false, error:"Account nicht gefunden." };
  if(user.status === "blocked") return { success:false, error:"Account gesperrt." };
  if(user.password !== password) return { success:false, error:"Passwort falsch." };

  seedProfileIfMissing(user);
  const token = `token_${uid()}`;
  setSession({ userId:user.id, email:user.email, role:user.role, token:token, createdAt:nowISO() });
  return { success:true, user: { id:user.id, name:user.name, email:user.email, role:user.role }, token:token };
}

function register(name, email, password){
  ensureSeeds();
  if(!name || name.trim().length < 2) return { success:false, error:"Bitte Namen angeben." };
  // Email-Validierung: muss @ enthalten und mit .de, .com, etc. enden
  if(!email || !email.includes("@")) return { success:false, error:"Bitte gültige E-Mail angeben." };
  const emailParts = email.split("@");
  if(emailParts.length !== 2 || !emailParts[1].includes(".")) return { success:false, error:"Bitte gültige E-Mail angeben." };
  if(!password || password.length < 8) return { success:false, error:"Passwort min. 8 Zeichen." };

  const users = getUsers();
  if(users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    return { success:false, error:"E-Mail ist bereits registriert." };
  }
  const user = { id:uid("u"), name:name.trim(), email:email.trim(), password, role:"member", status:"active" };
  users.push(user);
  saveUsers(users);
  seedProfileIfMissing(user);
  const token = `token_${uid()}`;
  setSession({ userId:user.id, email:user.email, role:user.role, token:token, createdAt:nowISO() });
  return { success:true, user: { id:user.id, name:user.name, email:user.email, role:user.role }, token:token };
}

function logout(){ clearSession(); return { success:true }; }

/* ========== PROFILES ========== */
function getProfileByEmail(email){
  ensureSeeds();
  if(!email) return null;
  const key = K.profilesPrefix + email.toLowerCase();
  const prof = getJSON(key, null);
  return prof;
}

// Public version - auch ohne Login
function getProfileByEmailPublic(email){
  ensureSeeds();
  if(!email) return null;
  const key = K.profilesPrefix + email.toLowerCase();
  const prof = getJSON(key, null);
  // Nur zurückgeben wenn sichtbar
  if(prof && prof.privacy?.visibleInDirectory){
    return prof;
  }
  return null;
}

function updateMyProfile(payload){
  // Ensure avatarType and avatarId are preserved
  const current = getProfileByEmail(me()?.email);
  if (current && !payload.avatarType) {
    payload.avatarType = current.avatarType || 'initials';
    payload.avatarId = current.avatarId || '';
  }
  const u = me();
  if(!u) return { success:false, error:"Not logged in" };
  const key = K.profilesPrefix + u.email.toLowerCase();
  const prof = getJSON(key, null);
  if(!prof) return { success:false, error:"Profil nicht gefunden." };

  const bio = (payload.bio ?? prof.bio ?? "");
  if(bio.length > 500) return { success:false, error:"Bio max 500 Zeichen." };

  const next = {
    ...prof,
    ...payload,
    privacy: { ...prof.privacy, ...(payload.privacy||{}) },
    links: { ...prof.links, ...(payload.links||{}) },
    updatedAt: nowISO()
  };
  setJSON(key, next);
  // sync: name im users array (optional)
  return { success:true, profile: next };
}

function listMembers(query=""){
  ensureSeeds();
  const u = me();
  const users = getUsers();
  const q = (query||"").toLowerCase().trim();
  const out = [];
  for(const us of users){
    const p = getProfileByEmail(us.email);
    if(!p) continue;
    const visible = p.privacy?.visibleInDirectory;
    // Wenn nicht eingeloggt: nur sichtbare Profile zeigen
    // Wenn eingeloggt: eigene Profile immer zeigen, andere nur wenn sichtbar
    if(!u){
      if(!visible) continue;
    } else {
      if(!visible && us.email.toLowerCase() !== u.email.toLowerCase()) continue;
    }
    if(q){
      const hay = [
        p.name, p.headline, p.bio,
        ...(p.skills||[]), ...(p.interests||[])
      ].join(" ").toLowerCase();
      if(!hay.includes(q)) continue;
    }
    out.push(p);
  }
  return out;
}

// Public function für nicht eingeloggte Nutzer
function listMembersPublic(query=""){
  ensureSeeds();
  const users = getUsers();
  const q = (query||"").toLowerCase().trim();
  const out = [];
  for(const us of users){
    const p = getProfileByEmail(us.email);
    if(!p) continue;
    const visible = p.privacy?.visibleInDirectory;
    if(!visible) continue; // Nur sichtbare Profile
    if(q){
      const hay = [
        p.name, p.headline, p.bio,
        ...(p.skills||[]), ...(p.interests||[])
      ].join(" ").toLowerCase();
      if(!hay.includes(q)) continue;
    }
    out.push(p);
  }
  return out;
}

/* ========== EVENTS + PARTICIPATION ========== */
function listEvents(){ ensureSeeds(); return getJSON(K.events, []).filter(e => !e.deleted); }
function getEvent(id){ return listEvents().find(e => e.id === id) || null; }
function saveEvents(events){ setJSON(K.events, events); }

function getBookedIds(email){ return getJSON(K.bookingsPrefix + email.toLowerCase(), []); }
function setBookedIds(email, ids){ setJSON(K.bookingsPrefix + email.toLowerCase(), ids); }

function getSavedIds(email){ return getJSON(K.savedPrefix + email.toLowerCase(), []); }
function setSavedIds(email, ids){ setJSON(K.savedPrefix + email.toLowerCase(), ids); }

function getParticipants(eventId){
  // participation keys: participation:<eventId> = array of {userId, email, role, createdAt}
  return getJSON(K.participationPrefix + eventId, []);
}
function setParticipants(eventId, arr){
  setJSON(K.participationPrefix + eventId, arr);
}
function bookingsCount(eventId){
  return getParticipants(eventId).length;
}

function addSystemMessage(email, msg){
  const key = K.systemPrefix + email.toLowerCase();
  const arr = getJSON(key, []);
  arr.unshift({ id:uid("sys"), read:false, createdAt: nowISO(), ...msg });
  setJSON(key, arr);
}
function addNotification(email, notif){
  const key = K.notificationsPrefix + email.toLowerCase();
  const arr = getJSON(key, []);
  arr.unshift({ id:uid("ntf"), read:false, createdAt: nowISO(), ...notif });
  setJSON(key, arr);
}

function addActivity(userId, act){
  const key = K.activityPrefix + userId;
  const arr = getJSON(key, []);
  arr.unshift({ id:uid("act"), createdAt: nowISO(), ...act });
  setJSON(key, arr);
}

function bookEvent(eventId){
  const u = me();
  if(!u) return { success:false, error:"Not logged in" };
  if(u.status === "blocked") return { success:false, error:"Account gesperrt." };

  const ev = getEvent(eventId);
  if(!ev) return { success:false, error:"Event nicht gefunden." };

  const current = getParticipants(eventId);
  if(current.some(p => p.userId === u.id)) return { success:true };

  if(bookingsCount(eventId) >= ev.capacity){
    return { success:false, error:"Ausgebucht." };
  }

  current.push({ userId:u.id, email:u.email, role:"participant", createdAt: nowISO() });
  setParticipants(eventId, current);

  // quick access list
  const ids = getBookedIds(u.email);
  if(!ids.includes(eventId)){ ids.push(eventId); setBookedIds(u.email, ids); }

  // system + notification + activity
  addSystemMessage(u.email, { type:"booking", title:"Buchung bestätigt", body:`Du bist gebucht: ${ev.title} (${ev.date} ${ev.time})` });
  addNotification(u.email, { type:"booking", title:"Termin gebucht", message: ev.title });
  addActivity(u.id, { type:"event_booked", referenceType:"event", referenceId:eventId });

  return { success:true };
}

function cancelBooking(eventId){
  const u = me();
  if(!u) return { success:false, error:"Not logged in" };

  const ev = getEvent(eventId);
  if(!ev) return { success:false, error:"Event nicht gefunden." };

  const current = getParticipants(eventId);
  const filtered = current.filter(p => p.userId !== u.id);
  
  if(filtered.length === current.length){
    return { success:false, error:"Du bist nicht für diesen Termin gebucht." };
  }

  setParticipants(eventId, filtered);

  // remove from quick access list
  const ids = getBookedIds(u.email);
  const filteredIds = ids.filter(id => id !== eventId);
  setBookedIds(u.email, filteredIds);

  // system + notification + activity
  addSystemMessage(u.email, { type:"booking_cancelled", title:"Buchung storniert", body:`Buchung storniert: ${ev.title} (${ev.date} ${ev.time})` });
  addNotification(u.email, { type:"booking_cancelled", title:"Termin storniert", message: ev.title });
  addActivity(u.id, { type:"event_cancelled", referenceType:"event", referenceId:eventId });

  return { success:true };
}

function saveEvent(eventId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const ids = getSavedIds(u.email);
  const has = ids.includes(eventId);
  const next = has ? ids.filter(x=>x!==eventId) : [...ids, eventId];
  setSavedIds(u.email, next);
  addActivity(u.id, { type: has ? "unfavorite" : "favorite", referenceType:"event_saved", referenceId:eventId });
  return { success:true, saved: !has };
}

/* ICS */
function pad(n){ return String(n).padStart(2,"0"); }
function toICSDate(dateStr, timeStr){
  // local time -> "YYYYMMDDTHHMM00"
  const [y,m,d] = dateStr.split("-").map(Number);
  const [hh,mm] = timeStr.split(":").map(Number);
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`;
}
function generateICSForEvent(ev){
  const dtStart = toICSDate(ev.date, ev.time);
  // naive end: add durationMinutes
  const start = new Date(`${ev.date}T${ev.time}:00`);
  const end = new Date(start.getTime() + (ev.durationMinutes||60)*60000);
  const endStr = `${end.getFullYear()}${pad(end.getMonth()+1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  const uidIcs = `${ev.id}@undbauen`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//undbauen//MVP//DE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uidIcs}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${endStr}`,
    `SUMMARY:${ev.title}`,
    `LOCATION:${ev.location||""}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}
function downloadText(filename, text){
  const blob = new Blob([text], {type:"text/plain"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
function exportICSForEvent(eventId){
  const ev = getEvent(eventId);
  if(!ev) return { success:false, error:"Event nicht gefunden" };
  const ics = generateICSForEvent(ev);
  downloadText(`${eventId}.ics`, ics);
  return { success:true };
}
function exportICSForBooked(){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const ids = getBookedIds(u.email);
  const evs = ids.map(getEvent).filter(Boolean);
  const blocks = evs.map(generateICSForEvent);
  downloadText(`undbauen-booked.ics`, blocks.join("\r\n"));
  return { success:true };
}

/* ========== FORUM ========== */
function listForumCategories(){
  const categories = [
    { id:"cat_general", title:"Allgemeine Diskussion", desc:"Ideen, Fragen, Austausch", icon:"💬" },
    { id:"cat_projects", title:"Projekte & Praxis", desc:"Use Cases, Erfahrungen, Workflows", icon:"🏗️" },
    { id:"cat_questions", title:"Fragen an die Community", desc:"Konkrete Fragen, schnelle Hilfe", icon:"❓" },
    { id:"cat_events", title:"Events & Rückblicke", desc:"Diskussion zu Terminen, Learnings, Materialien", icon:"📅" }
  ];
  
  // Erweitere Kategorien mit Statistiken
  const threads = getForumThreads();
  return categories.map(cat => {
    const catThreads = threads.filter(t => t.categoryId === cat.id && !t.deleted && !t.archived);
    const topicCount = catThreads.length;
    const lastThread = catThreads
      .sort((a, b) => (b.lastActivityAt || "").localeCompare(a.lastActivityAt || ""))[0];
    
    return {
      ...cat,
      topicCount,
      lastThread: lastThread ? {
        id: lastThread.id,
        title: lastThread.title,
        lastActivityAt: lastThread.lastActivityAt,
        author: lastThread.createdBy
      } : null
    };
  });
}
function getForumThreads(){ ensureSeeds(); return getJSON(K.forumThreads, []).filter(t => !t.deleted); }
function saveForumThreads(arr){ setJSON(K.forumThreads, arr); }
function getForumThread(threadId){ return getForumThreads().find(t=>t.id===threadId) || null; }

function getForumPosts(threadId){
  return getJSON(K.forumPostsPrefix + threadId, []).filter(p=>!p.hardDeleted);
}
function saveForumPosts(threadId, posts){
  setJSON(K.forumPostsPrefix + threadId, posts);
}

function ensureEventThread(eventId){
  const ev = getEvent(eventId);
  if(!ev) return null;

  if(ev.eventThreadId){
    const t = getForumThread(ev.eventThreadId);
    if(t) return t.id;
  }

  // create thread
  const threads = getForumThreads();
  const tId = uid("thr");
  const u = me();
  threads.push({
    id:tId,
    categoryId:"cat_events",
    type:"event",
    eventId,
    title:`Event: ${ev.title}`,
    createdBy: u ? u.email : "system",
    createdAt: nowISO(),
    lastActivityAt: nowISO(),
    replyCount:0,
    views:0,
    pinned:false,
    locked:false,
    archived:false,
    deleted:false,
    tags:[], likes:[], watchedBy:[]
  });
  saveForumThreads(threads);

  // OP post
  saveForumPosts(tId, [{
    id:uid("post"),
    threadId:tId,
    type:"op",
    authorEmail: u ? u.email : "system",
    body:`Diskussion zum Event **${ev.title}**.\n\n📅 ${ev.date} ${ev.time}\n📍 ${ev.location}\n\nSchreibe hier Fragen, Links und Learnings.`,
    createdAt: nowISO(),
    deleted:false
  }]);

  // link back to event
  const events = listEvents().map(e => e.id===eventId ? ({...e, eventThreadId:tId}) : e);
  saveEvents(events);

  return tId;
}

function createForumThread(categoryId, title, body){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const threads = getForumThreads();
  const threadId = uid("thr");
  const t = {
    id:threadId, categoryId, type:"general", eventId:null,
    title:title.trim(), createdBy:u.email, createdAt:nowISO(),
    lastActivityAt:nowISO(), replyCount:0, views:0,
    pinned:false, locked:false, archived:false, deleted:false,
    tags:[], likes:[], watchedBy:[]
  };
  threads.push(t);
  saveForumThreads(threads);

  saveForumPosts(threadId, [{
    id:uid("post"), threadId, type:"op", authorEmail:u.email,
    body: body.trim(), createdAt: nowISO(), deleted:false
  }]);

  addActivity(u.id, { type:"thread_created", referenceType:"thread", referenceId: threadId });
  return { success:true, threadId };
}

function replyForumThread(threadId, body){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const t = getForumThread(threadId);
  if(!t) return { success:false, error:"Thread nicht gefunden" };
  if(t.locked) return { success:false, error:"Thread ist geschlossen." };

  const posts = getForumPosts(threadId);
  posts.push({ id:uid("post"), threadId, type:"reply", authorEmail:u.email, body: body.trim(), createdAt: nowISO(), deleted:false });
  saveForumPosts(threadId, posts);

  const threads = getForumThreads().map(x => x.id===threadId ? ({...x, replyCount:(x.replyCount||0)+1, lastActivityAt: nowISO()}) : x);
  saveForumThreads(threads);

  addActivity(u.id, { type:"post_written", referenceType:"thread", referenceId: threadId });
  // notify owner
  if(t.createdBy && t.createdBy !== u.email){
    addNotification(t.createdBy, { type:"forum_reply", title:"Neue Antwort", message:`${u.name} hat geantwortet: ${t.title}` });
  }
  return { success:true };
}

/* Admin moderation */
function adminPinThread(threadId, pinned){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, pinned:!!pinned}) : t);
  saveForumThreads(threads);
  return { success:true };
}
function adminLockThread(threadId, locked){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, locked:!!locked}) : t);
  saveForumThreads(threads);
  return { success:true };
}
function adminDeleteThread(threadId){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, deleted:true}) : t);
  setJSON(K.forumThreads, threads);
  return { success:true };
}

function deleteForumPost(threadId, postId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const posts = getForumPosts(threadId);
  const post = posts.find(p => p.id === postId);
  if(!post) return { success:false, error:"Post nicht gefunden" };
  
  // Check if user is author or admin
  if(post.authorEmail.toLowerCase() !== u.email.toLowerCase() && !isAdmin()){
    return { success:false, error:"Nicht berechtigt" };
  }
  
  // Mark post as deleted
  const updatedPosts = posts.map(p => p.id === postId ? ({...p, deleted:true, deletedAt:nowISO(), deletedBy:u.email}) : p);
  saveForumPosts(threadId, updatedPosts);
  
  // Check if this was the last post (excluding deleted posts)
  const remainingPosts = updatedPosts.filter(p => !p.deleted);
  const isLastPost = remainingPosts.length === 0;
  
  return { success:true, isLastPost };
}

// Forum Interactions
function likeThread(threadId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const threads = getForumThreads();
  const thread = threads.find(t => t.id === threadId);
  if(!thread) return { success:false, error:"Thread nicht gefunden" };
  
  if(!thread.likes) thread.likes = [];
  const userEmail = u.email.toLowerCase();
  const index = thread.likes.indexOf(userEmail);
  
  if(index > -1){
    thread.likes.splice(index, 1);
  } else {
    thread.likes.push(userEmail);
  }
  
  const updatedThreads = threads.map(t => t.id === threadId ? thread : t);
  saveForumThreads(updatedThreads);
  return { success:true, liked: index === -1, likes: thread.likes.length };
}

function watchThread(threadId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const threads = getForumThreads();
  const thread = threads.find(t => t.id === threadId);
  if(!thread) return { success:false, error:"Thread nicht gefunden" };
  
  if(!thread.watchedBy) thread.watchedBy = [];
  const userEmail = u.email.toLowerCase();
  const index = thread.watchedBy.indexOf(userEmail);
  
  if(index > -1){
    thread.watchedBy.splice(index, 1);
  } else {
    thread.watchedBy.push(userEmail);
  }
  
  const updatedThreads = threads.map(t => t.id === threadId ? thread : t);
  saveForumThreads(updatedThreads);
  return { success:true, watching: index === -1 };
}

/* ========== MESSAGES ========== */
function getThreads(email){ return getJSON(K.msgThreadsPrefix + email.toLowerCase(), []); }
function setThreads(email, arr){ setJSON(K.msgThreadsPrefix + email.toLowerCase(), arr); }
function getMessages(threadId){ return getJSON(K.msgMessagesPrefix + threadId, []); }
function setMessages(threadId, arr){ setJSON(K.msgMessagesPrefix + threadId, arr); }

function ensureDMThread(emailA, emailB, subject=""){
  // deterministic id
  const a = emailA.toLowerCase(), b = emailB.toLowerCase();
  const key = [a,b].sort().join("|");
  const threadId = "dm_" + btoa(key).replace(/=+$/,"");
  // create summary for each side if missing
  const addSide = (owner, other) => {
    const threads = getThreads(owner);
    if(threads.some(t=>t.id===threadId)) return;
    threads.unshift({ id:threadId, otherEmail: other, subject, lastMessageAt: nowISO(), lastSnippet:"", unreadCount:0 });
    setThreads(owner, threads);
  };
  addSide(emailA, emailB);
  addSide(emailB, emailA);
  return threadId;
}

function sendMessage({to, subject="", body="", attachments=[]}){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  if(!to) return { success:false, error:"Empfänger fehlt" };

  const threadId = ensureDMThread(u.email, to, subject);
  const msg = { id:uid("msg"), threadId, from:u.email, to, subject, body, attachments: attachments || [], createdAt: nowISO(), readBy:[u.email] };
  const msgs = getMessages(threadId);
  msgs.push(msg);
  setMessages(threadId, msgs);

  // update summaries
  const upd = (owner, isReceiver) => {
    const threads = getThreads(owner).map(t=>{
      if(t.id!==threadId) return t;
      return {
        ...t,
        subject: subject || t.subject || "",
        lastMessageAt: msg.createdAt,
        lastSnippet: (body||"").slice(0, 120),
        unreadCount: isReceiver ? (t.unreadCount||0)+1 : 0
      };
    }).sort((a,b)=> (b.lastMessageAt||"").localeCompare(a.lastMessageAt||""));
    setThreads(owner, threads);
  };
  upd(u.email, false);
  upd(to, true);

  addNotification(to, { type:"message", title:"Neue Nachricht", message:`Von ${u.name}` });
  addActivity(u.id, { type:"message_sent", referenceType:"thread", referenceId: threadId });

  return { success:true, threadId };
}

function markThreadRead(threadId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const threads = getThreads(u.email).map(t => t.id===threadId ? ({...t, unreadCount:0}) : t);
  setThreads(u.email, threads);

  const msgs = getMessages(threadId).map(m=>{
    const rb = new Set(m.readBy||[]);
    rb.add(u.email);
    return {...m, readBy:[...rb]};
  });
  setMessages(threadId, msgs);
  return { success:true };
}

function listSystemMessages(){
  const u = me(); if(!u) return [];
  return getJSON(K.systemPrefix + u.email.toLowerCase(), []);
}

/* ========== NOTIFICATIONS ========== */
function listNotifications(){
  const u = me(); if(!u) return [];
  return getJSON(K.notificationsPrefix + u.email.toLowerCase(), []);
}
function markNotificationRead(id){
  const u = me(); if(!u) return { success:false };
  const key = K.notificationsPrefix + u.email.toLowerCase();
  const arr = getJSON(key, []).map(n => n.id===id ? ({...n, read:true}) : n);
  setJSON(key, arr);
  return { success:true };
}

/* ========== FAVORITES + RECOMMENDATIONS + ACTIVITY ========== */
function getFavorites(){
  const u = me(); if(!u) return [];
  return getJSON(K.favoritesPrefix + u.id, []);
}
function toggleFavorite(targetType, targetId){
  const u = me(); if(!u) return { success:false, error:"Not logged in" };
  const key = K.favoritesPrefix + u.id;
  const arr = getJSON(key, []);
  const exists = arr.some(f => f.targetType===targetType && f.targetId===targetId);
  const next = exists ? arr.filter(f=> !(f.targetType===targetType && f.targetId===targetId)) : [{ id:uid("fav"), userId:u.id, targetType, targetId, createdAt: nowISO() }, ...arr];
  setJSON(key, next);
  addActivity(u.id, { type: exists ? "favorite_removed":"favorited", referenceType: targetType, referenceId: targetId });
  return { success:true, active: !exists };
}
function listActivity(){
  const u = me(); if(!u) return [];
  return getJSON(K.activityPrefix + u.id, []);
}

function recommendContacts(){
  const u = me(); if(!u) return [];
  const myP = getProfileByEmail(u.email);
  if(!myP) return [];
  const mine = new Set([...(myP.interests||[]), ...(myP.skills||[])].map(x=>x.toLowerCase()));
  const members = listMembers("").filter(p => p.email.toLowerCase() !== u.email.toLowerCase());
  const scored = members.map(p=>{
    const set = new Set([...(p.interests||[]), ...(p.skills||[])].map(x=>x.toLowerCase()));
    let score = 0;
    for(const x of set) if(mine.has(x)) score++;
    // bonus: shared events
    const shared = sharedEventCount(u.email, p.email);
    score += shared * 2;
    return { p, score };
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  return scored.map(x=>x.p);
}
function sharedEventCount(emailA, emailB){
  const evs = listEvents();
  let c=0;
  for(const ev of evs){
    const part = getParticipants(ev.id).map(p=>p.email.toLowerCase());
    if(part.includes(emailA.toLowerCase()) && part.includes(emailB.toLowerCase())) c++;
  }
  return c;
}

/* ========== ADMIN (Users + Events + CMS) ========== */
function adminListUsers(){
  if(!isAdmin()) return [];
  return getUsers();
}
function adminSetUserRole(userId, role){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const users = getUsers().map(u => u.id===userId ? ({...u, role}) : u);
  saveUsers(users);
  return { success:true };
}
function adminSetUserStatus(userId, status){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const users = getUsers().map(u => u.id===userId ? ({...u, status}) : u);
  saveUsers(users);
  return { success:true };
}

function adminDeleteUser(userId){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const allUsers = getUsers();
  const user = allUsers.find(u => u.id === userId);
  if (user && user.email) {
    // Delete profile
    localStorage.removeItem(K.profilesPrefix + user.email.toLowerCase());
    // Delete system messages
    localStorage.removeItem(K.systemPrefix + user.email.toLowerCase());
    // Delete threads
    localStorage.removeItem(K.msgThreadsPrefix + user.email.toLowerCase());
  }
  const users = allUsers.filter(u => u.id !== userId);
  saveUsers(users);
  return { success:true };
}

function adminCreateEvent(payload){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const events = listEvents();
  const ev = { id:uid("evt"), eventThreadId:null, status:"scheduled", visibility:"public", createdBy: me().email, ...payload };
  events.push(ev);
  saveEvents(events);
  return { success:true, id: ev.id };
}
function adminUpdateEvent(eventId, payload){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const events = listEvents().map(e => e.id===eventId ? ({...e, ...payload}) : e);
  saveEvents(events);
  return { success:true };
}
function adminDeleteEvent(eventId){
  if(!isAdmin()) return { success:false, error:"Not admin" };
  const events = listEvents().map(e => e.id===eventId ? ({...e, deleted:true}) : e);
  saveEvents(events);
  return { success:true };
}

/* CMS */
function listUpdatesPublic(){
  ensureSeeds(); // Ensure seed data exists
  const arr = getJSON(K.cmsUpdates, []);
  return arr.filter(x=>x.status==="published");
}
function listPublicationsPublic(){
  ensureSeeds(); // Ensure seed data exists
  const arr = getJSON(K.cmsPubs, []);
  return arr.filter(x=>x.status==="published");
}
function listUpdatesMember(){
  if(!isLoggedIn()) return [];
  return getJSON(K.cmsUpdates, []).filter(x=>x.status==="published");
}
function listPublicationsMember(){
  if(!isLoggedIn()) return [];
  return getJSON(K.cmsPubs, []).filter(x=>x.status==="published");
}
function adminCreateUpdate(payload){
  if(!isAdmin()) return { success:false, error:"Keine Berechtigung." };
  // Prüfe ob für diesen Monat bereits ein Update existiert
  const arr = getJSON(K.cmsUpdates, []);
  const existing = arr.find(u => u.month === payload.month && u.status === "published");
  if(existing) {
    return { success:false, error:`Für ${payload.month} existiert bereits ein Monatsupdate. Pro Monat ist nur ein Update möglich.` };
  }
  arr.unshift({ id:uid("upd"), status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO(), ...payload });
  setJSON(K.cmsUpdates, arr);
  return { success:true };
}
function adminDeleteUpdate(id){
  if(!isAdmin()) return { success:false, error:"Keine Berechtigung" };
  
  // Lösche aus dem Standard-Speicher
  const arr = getJSON(K.cmsUpdates, []).filter(x=>x.id!==id);
  setJSON(K.cmsUpdates, arr);
  
  // Lösche auch aus direktem localStorage (falls vorhanden)
  try {
    const directUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
    const filteredDirect = directUpdates.filter(x => x.id !== id);
    localStorage.setItem("cms:updates", JSON.stringify(filteredDirect));
  } catch(e) {
    console.warn("Fehler beim Löschen aus direktem localStorage:", e);
  }
  
  return { success:true };
}
function adminCreatePublication(payload){
  if(!isAdmin()) return { success:false };
  const arr = getJSON(K.cmsPubs, []);
  arr.unshift({ id:uid("pub"), status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO(), ...payload });
  setJSON(K.cmsPubs, arr);
  return { success:true };
}
function adminDeletePublication(id){
  if(!isAdmin()) return { success:false };
  const arr = getJSON(K.cmsPubs, []).filter(x=>x.id!==id);
  setJSON(K.cmsPubs, arr);
  return { success:true };
}

// Alias for compatibility with httpAdapter
const getCurrentUser = me;

/* exported adapter */
export const storageAdapter = {
  // auth
  login, register, logout, me, getCurrentUser, isLoggedIn, isAdmin, hasRole, hasAnyRole,

  // profiles
  getProfileByEmail, getProfileByEmailPublic, updateMyProfile, listMembers, listMembersPublic,

  // events
  listEvents, getEvent, bookEvent, cancelBooking, saveEvent, bookingsCount,
  getParticipants, ensureEventThread,
  exportICSForEvent, exportICSForBooked,

  // forum
  listForumCategories, getForumThreads, saveForumThreads, getForumThread, getForumPosts,
  createForumThread, replyForumThread, deleteForumPost,
  likeThread, watchThread,
  adminPinThread, adminLockThread, adminDeleteThread,

  // messages
  getThreads, getMessages, sendMessage, markThreadRead, listSystemMessages,

  // notifications
  listNotifications, markNotificationRead,

  // favorites / activity / recommendations
  getFavorites, toggleFavorite, listActivity, recommendContacts,

  // admin
  adminListUsers, adminSetUserRole, adminSetUserStatus, adminDeleteUser,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent,

  // cms
  listUpdatesPublic, listPublicationsPublic,
  listUpdatesMember, listPublicationsMember,
  adminCreateUpdate, adminDeleteUpdate,
  adminCreatePublication, adminDeletePublication
};

// Ensure seeds are created immediately on module load
ensureSeeds();

