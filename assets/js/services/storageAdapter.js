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
  cmsPubs: "cms:publications"
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
  // Admin Seed (du kannst die Mail später ändern)
  users.push({ id:uid("u"), name:"Admin", email:"admin@undbauen.local", password:"adminadmin", role:"admin", status:"active" });
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
      capacity:40,
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
      format:"Panel",
      visibility:"public",
      descriptionPublic:"Diskussion & Austausch – öffentlich nur Vorschau.",
      descriptionMember:"Member-Details: Leitfragen, Miro-Link, Diskussionsstruktur.",
      capacity:60,
      tags:["IFC","Standards","OpenBIM"],
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
  setJSON(K.forumThreads, []);
}

function seedCMSIfEmpty(){
  const u = getJSON(K.cmsUpdates, []);
  if(!u.length){
    setJSON(K.cmsUpdates, [
      { id:uid("upd"), month:"2026-01", title:"Monatsupdate Januar 2026", intro:"Was im Netzwerk passiert ist – Teaser.", highlights:["Rückblick Januar","Nächste Themen","Call for topics"], memberBody:"Member-Text: ausführlicher Rückblick, Links, Ressourcen.", status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO() }
    ]);
  }
  const p = getJSON(K.cmsPubs, []);
  if(!p.length){
    setJSON(K.cmsPubs, [
      { id:uid("pub"), title:"AEC Automation Patterns", abstract:"Kurzabstract (public).", tags:["Automation","AEC"], memberBody:"Member-Body: Volltext / Ressourcen.", downloadUrl:"", status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO() }
    ]);
  }
}

function ensureSeeds(){
  seedUsersIfEmpty();
  seedExampleMembers(); // Beispiel-Mitglieder hinzufügen
  seedEventsIfEmpty();
  seedForumIfEmpty();
  seedCMSIfEmpty();
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

function login(email, password){
  ensureSeeds();
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === (email||"").toLowerCase());
  if(!user) return { ok:false, error:"Account nicht gefunden." };
  if(user.status === "blocked") return { ok:false, error:"Account gesperrt." };
  if(user.password !== password) return { ok:false, error:"Passwort falsch." };

  seedProfileIfMissing(user);
  setSession({ userId:user.id, email:user.email, role:user.role, createdAt:nowISO() });
  return { ok:true };
}

function register(name, email, password){
  ensureSeeds();
  if(!name || name.trim().length < 2) return { ok:false, error:"Bitte Namen angeben." };
  if(!email || !email.includes("@")) return { ok:false, error:"Bitte gültige E-Mail angeben." };
  if(!password || password.length < 8) return { ok:false, error:"Passwort min. 8 Zeichen." };

  const users = getUsers();
  if(users.some(u => u.email.toLowerCase() === email.toLowerCase())){
    return { ok:false, error:"E-Mail ist bereits registriert." };
  }
  const user = { id:uid("u"), name:name.trim(), email:email.trim(), password, role:"member", status:"active" };
  users.push(user);
  saveUsers(users);
  seedProfileIfMissing(user);
  setSession({ userId:user.id, email:user.email, role:user.role, createdAt:nowISO() });
  return { ok:true };
}

function logout(){ clearSession(); return { ok:true }; }

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
  const u = me();
  if(!u) return { ok:false, error:"Not logged in" };
  const key = K.profilesPrefix + u.email.toLowerCase();
  const prof = getJSON(key, null);
  if(!prof) return { ok:false, error:"Profil nicht gefunden." };

  const bio = (payload.bio ?? prof.bio ?? "");
  if(bio.length > 500) return { ok:false, error:"Bio max 500 Zeichen." };

  const next = {
    ...prof,
    ...payload,
    privacy: { ...prof.privacy, ...(payload.privacy||{}) },
    links: { ...prof.links, ...(payload.links||{}) },
    updatedAt: nowISO()
  };
  setJSON(key, next);
  // sync: name im users array (optional)
  return { ok:true, profile: next };
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
  if(!u) return { ok:false, error:"Not logged in" };
  if(u.status === "blocked") return { ok:false, error:"Account gesperrt." };

  const ev = getEvent(eventId);
  if(!ev) return { ok:false, error:"Event nicht gefunden." };

  const current = getParticipants(eventId);
  if(current.some(p => p.userId === u.id)) return { ok:true };

  if(bookingsCount(eventId) >= ev.capacity){
    return { ok:false, error:"Ausgebucht." };
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

  return { ok:true };
}

function saveEvent(eventId){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const ids = getSavedIds(u.email);
  const has = ids.includes(eventId);
  const next = has ? ids.filter(x=>x!==eventId) : [...ids, eventId];
  setSavedIds(u.email, next);
  addActivity(u.id, { type: has ? "unfavorite" : "favorite", referenceType:"event_saved", referenceId:eventId });
  return { ok:true, saved: !has };
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
  if(!ev) return { ok:false, error:"Event nicht gefunden" };
  const ics = generateICSForEvent(ev);
  downloadText(`${eventId}.ics`, ics);
  return { ok:true };
}
function exportICSForBooked(){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const ids = getBookedIds(u.email);
  const evs = ids.map(getEvent).filter(Boolean);
  const blocks = evs.map(generateICSForEvent);
  downloadText(`undbauen-booked.ics`, blocks.join("\r\n"));
  return { ok:true };
}

/* ========== FORUM ========== */
function listForumCategories(){
  return [
    { id:"cat_general", title:"Allgemeine Diskussion", desc:"Ideen, Fragen, Austausch" },
    { id:"cat_projects", title:"Projekte & Praxis", desc:"Use Cases, Erfahrungen, Workflows" },
    { id:"cat_questions", title:"Fragen an die Community", desc:"Konkrete Fragen, schnelle Hilfe" },
    { id:"cat_events", title:"Events & Rückblicke", desc:"Diskussion zu Terminen, Learnings, Materialien" }
  ];
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
    pinned:false,
    locked:false,
    archived:false,
    deleted:false
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
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const threads = getForumThreads();
  const threadId = uid("thr");
  const t = {
    id:threadId, categoryId, type:"general", eventId:null,
    title:title.trim(), createdBy:u.email, createdAt:nowISO(),
    lastActivityAt:nowISO(), replyCount:0,
    pinned:false, locked:false, archived:false, deleted:false
  };
  threads.push(t);
  saveForumThreads(threads);

  saveForumPosts(threadId, [{
    id:uid("post"), threadId, type:"op", authorEmail:u.email,
    body: body.trim(), createdAt: nowISO(), deleted:false
  }]);

  addActivity(u.id, { type:"thread_created", referenceType:"thread", referenceId: threadId });
  return { ok:true, threadId };
}

function replyForumThread(threadId, body){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const t = getForumThread(threadId);
  if(!t) return { ok:false, error:"Thread nicht gefunden" };
  if(t.locked) return { ok:false, error:"Thread ist geschlossen." };

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
  return { ok:true };
}

/* Admin moderation */
function adminPinThread(threadId, pinned){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, pinned:!!pinned}) : t);
  saveForumThreads(threads);
  return { ok:true };
}
function adminLockThread(threadId, locked){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, locked:!!locked}) : t);
  saveForumThreads(threads);
  return { ok:true };
}
function adminDeleteThread(threadId){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const threads = getForumThreads().map(t => t.id===threadId ? ({...t, deleted:true}) : t);
  setJSON(K.forumThreads, threads);
  return { ok:true };
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

function sendMessage({to, subject="", body=""}){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  if(!to) return { ok:false, error:"Empfänger fehlt" };

  const threadId = ensureDMThread(u.email, to, subject);
  const msg = { id:uid("msg"), threadId, from:u.email, to, subject, body, createdAt: nowISO(), readBy:[u.email] };
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

  return { ok:true, threadId };
}

function markThreadRead(threadId){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const threads = getThreads(u.email).map(t => t.id===threadId ? ({...t, unreadCount:0}) : t);
  setThreads(u.email, threads);

  const msgs = getMessages(threadId).map(m=>{
    const rb = new Set(m.readBy||[]);
    rb.add(u.email);
    return {...m, readBy:[...rb]};
  });
  setMessages(threadId, msgs);
  return { ok:true };
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
  const u = me(); if(!u) return { ok:false };
  const key = K.notificationsPrefix + u.email.toLowerCase();
  const arr = getJSON(key, []).map(n => n.id===id ? ({...n, read:true}) : n);
  setJSON(key, arr);
  return { ok:true };
}

/* ========== FAVORITES + RECOMMENDATIONS + ACTIVITY ========== */
function getFavorites(){
  const u = me(); if(!u) return [];
  return getJSON(K.favoritesPrefix + u.id, []);
}
function toggleFavorite(targetType, targetId){
  const u = me(); if(!u) return { ok:false, error:"Not logged in" };
  const key = K.favoritesPrefix + u.id;
  const arr = getJSON(key, []);
  const exists = arr.some(f => f.targetType===targetType && f.targetId===targetId);
  const next = exists ? arr.filter(f=> !(f.targetType===targetType && f.targetId===targetId)) : [{ id:uid("fav"), userId:u.id, targetType, targetId, createdAt: nowISO() }, ...arr];
  setJSON(key, next);
  addActivity(u.id, { type: exists ? "favorite_removed":"favorited", referenceType: targetType, referenceId: targetId });
  return { ok:true, active: !exists };
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
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const users = getUsers().map(u => u.id===userId ? ({...u, role}) : u);
  saveUsers(users);
  return { ok:true };
}
function adminSetUserStatus(userId, status){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const users = getUsers().map(u => u.id===userId ? ({...u, status}) : u);
  saveUsers(users);
  return { ok:true };
}

function adminCreateEvent(payload){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const events = listEvents();
  const ev = { id:uid("evt"), eventThreadId:null, status:"scheduled", visibility:"public", createdBy: me().email, ...payload };
  events.push(ev);
  saveEvents(events);
  return { ok:true, id: ev.id };
}
function adminUpdateEvent(eventId, payload){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const events = listEvents().map(e => e.id===eventId ? ({...e, ...payload}) : e);
  saveEvents(events);
  return { ok:true };
}
function adminDeleteEvent(eventId){
  if(!isAdmin()) return { ok:false, error:"Not admin" };
  const events = listEvents().map(e => e.id===eventId ? ({...e, deleted:true}) : e);
  saveEvents(events);
  return { ok:true };
}

/* CMS */
function listUpdatesPublic(){
  const arr = getJSON(K.cmsUpdates, []);
  return arr.filter(x=>x.status==="published").slice(0,3);
}
function listPublicationsPublic(){
  const arr = getJSON(K.cmsPubs, []);
  return arr.filter(x=>x.status==="published").slice(0,6);
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
  if(!isAdmin()) return { ok:false };
  const arr = getJSON(K.cmsUpdates, []);
  arr.unshift({ id:uid("upd"), status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO(), ...payload });
  setJSON(K.cmsUpdates, arr);
  return { ok:true };
}
function adminDeleteUpdate(id){
  if(!isAdmin()) return { ok:false };
  const arr = getJSON(K.cmsUpdates, []).filter(x=>x.id!==id);
  setJSON(K.cmsUpdates, arr);
  return { ok:true };
}
function adminCreatePublication(payload){
  if(!isAdmin()) return { ok:false };
  const arr = getJSON(K.cmsPubs, []);
  arr.unshift({ id:uid("pub"), status:"published", visibility:"member", createdAt:nowISO(), updatedAt:nowISO(), ...payload });
  setJSON(K.cmsPubs, arr);
  return { ok:true };
}
function adminDeletePublication(id){
  if(!isAdmin()) return { ok:false };
  const arr = getJSON(K.cmsPubs, []).filter(x=>x.id!==id);
  setJSON(K.cmsPubs, arr);
  return { ok:true };
}

/* exported adapter */
export const storageAdapter = {
  // auth
  login, register, logout, me, isLoggedIn, isAdmin,

  // profiles
  getProfileByEmail, getProfileByEmailPublic, updateMyProfile, listMembers, listMembersPublic,

  // events
  listEvents, getEvent, bookEvent, saveEvent, bookingsCount,
  getParticipants, ensureEventThread,
  exportICSForEvent, exportICSForBooked,

  // forum
  listForumCategories, getForumThreads, getForumThread, getForumPosts,
  createForumThread, replyForumThread,
  adminPinThread, adminLockThread, adminDeleteThread,

  // messages
  getThreads, getMessages, sendMessage, markThreadRead, listSystemMessages,

  // notifications
  listNotifications, markNotificationRead,

  // favorites / activity / recommendations
  getFavorites, toggleFavorite, listActivity, recommendContacts,

  // admin
  adminListUsers, adminSetUserRole, adminSetUserStatus,
  adminCreateEvent, adminUpdateEvent, adminDeleteEvent,

  // cms
  listUpdatesPublic, listPublicationsPublic,
  listUpdatesMember, listPublicationsMember,
  adminCreateUpdate, adminDeleteUpdate,
  adminCreatePublication, adminDeletePublication
};


