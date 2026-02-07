/* 
 * storageAdapter: MVP "Backend" über localStorage
 * Frontpage-Version: Nur Public-Funktionen
 * 
 * Diese Version enthält nur die Funktionen, die für die öffentliche Frontpage benötigt werden.
 * Alle Member/Backoffice-Funktionen wurden entfernt.
 */

// ========== STORAGE KEYS ==========
const K = {
  users: "users",
  session: "session",
  profilesPrefix: "profile:",
  events: "events",
  cmsUpdates: "cms:updates",
  cmsPubs: "cms:publications"
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function nowISO() { 
  return new Date().toISOString(); 
}

/**
 * Generate unique ID
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function uid(prefix = "id") { 
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; 
}

/**
 * Get JSON from localStorage
 * @param {string} key - Storage key
 * @param {*} fallback - Fallback value
 * @returns {*} Parsed JSON or fallback
 */
function getJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/**
 * Set JSON in localStorage
 * @param {string} key - Storage key
 * @param {*} val - Value to store
 */
function setJSON(key, val) { 
  localStorage.setItem(key, JSON.stringify(val)); 
}

// ========== SEED FUNCTIONS ==========

/**
 * Seed admin user if users array is empty
 */
function seedUsersIfEmpty() {
  const users = getJSON(K.users, []);
  if (users.length) return;
  
  // Admin Seed
  users.push({
    id: uid("u"),
    name: "Admin",
    email: "admin@undbauen.local",
    password: "adminadmin",
    role: "admin",
    status: "active"
  });
  
  setJSON(K.users, users);
}

/**
 * Seed example members for public display
 */
function seedExampleMembers() {
  const users = getJSON(K.users, []);
  const exampleMembers = [
    {
      name: "Dr. Sarah Müller",
      email: "sarah.mueller@example.com",
      password: "demo1234",
      headline: "BIM-Expertin & Digitalisierung im Bauwesen",
      location: "Berlin",
      bio: "Architektin mit Fokus auf digitale Transformation im Bauwesen. Spezialisiert auf BIM-Workflows und interdisziplinäre Kollaboration.",
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
      bio: "Bauingenieur mit Expertise in Kreislaufwirtschaft und nachhaltigen Materialien.",
      skills: ["Nachhaltigkeit", "Kreislaufwirtschaft", "LCA", "Materialforschung"],
      interests: ["Cradle-to-Cradle", "Recycling", "CO2-Reduktion"],
      offer: "Nachhaltigkeitsberatung, Materialanalysen, Zertifizierungen",
      lookingFor: "Best Practices für zirkuläres Bauen",
      linkedin: "https://linkedin.com/in/michael-schneider-nachhaltigkeit",
      website: ""
    },
    {
      name: "Lisa Weber",
      email: "lisa.weber@example.com",
      password: "demo1234",
      headline: "Projektmanagerin für digitale Bauprozesse",
      location: "Hamburg",
      bio: "Projektmanagerin mit Fokus auf agile Methoden und digitale Kollaboration im Bauwesen.",
      skills: ["Projektmanagement", "Agile Methoden", "Kollaboration"],
      interests: ["Neue Arbeitswelten", "Team-Dynamik", "Prozessoptimierung"],
      offer: "Workshops, Moderation, Prozessberatung",
      lookingFor: "Erfahrungen mit agilen Methoden im Bauwesen",
      linkedin: "https://linkedin.com/in/lisa-weber-pm",
      website: "https://lisa-weber-consulting.de"
    }
  ];
  
  // Add example members if they don't exist
  for (const member of exampleMembers) {
    const exists = users.some(u => u.email.toLowerCase() === member.email.toLowerCase());
    if (!exists) {
      const user = {
        id: uid("u"),
        name: member.name,
        email: member.email,
        password: member.password,
        role: "member",
        status: "active"
      };
      users.push(user);
      
      // Create profile
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

/**
 * Seed events if empty
 */
function seedEventsIfEmpty() {
  const events = getJSON(K.events, []);
  if (events.length) return;
  
  const seeded = [
    {
      id: "evt_2026_01_12",
      title: "Innovationsabend: AEC Design Workflow Automation",
      date: "2026-01-12",
      time: "18:00",
      durationMinutes: 90,
      location: "Digital (Teams)",
      format: "Innovationsabend",
      visibility: "public",
      descriptionPublic: "Kurzinfo ohne Details. Einloggen, um zu buchen und Details zu sehen.",
      capacity: 20,
      tags: ["AEC", "Automation", "BIM"],
      createdBy: "seed",
      status: "scheduled"
    },
    {
      id: "evt_2026_02_09",
      title: "Panel: Offene Standards & Interoperabilität",
      date: "2026-02-09",
      time: "18:00",
      durationMinutes: 90,
      location: "Digital (Teams)",
      format: "Workshop",
      visibility: "public",
      descriptionPublic: "Diskussion & Austausch – öffentlich nur Vorschau.",
      capacity: 10,
      tags: ["IFC", "Standards", "OpenBIM"],
      createdBy: "seed",
      status: "scheduled"
    },
    {
      id: "evt_2026_03_15",
      title: "Innovationsabend: Nachhaltiges Bauen & Circular Economy",
      date: "2026-03-15",
      time: "18:00",
      durationMinutes: 90,
      location: "Digital (Teams)",
      format: "Innovationsabend",
      visibility: "public",
      descriptionPublic: "Austausch zu nachhaltigen Baukonzepten und zirkulären Wirtschaftsmodellen im Bauwesen.",
      capacity: 20,
      tags: ["Nachhaltigkeit", "Circular Economy", "Green Building"],
      createdBy: "seed",
      status: "scheduled"
    }
  ];
  
  setJSON(K.events, seeded);
}

/**
 * Seed CMS updates if empty
 */
function seedCMSIfEmpty() {
  const updates = getJSON(K.cmsUpdates, []);
  if (updates.length) return;
  
  setJSON(K.cmsUpdates, [
    {
      id: uid("upd"),
      title: "Willkommen bei …undbauen",
      intro: "Erste Schritte im Netzwerk",
      highlights: ["Netzwerk", "Events", "Forum"],
      createdAt: nowISO(),
      date: new Date().toISOString()
    }
  ]);
}

/**
 * Seed CMS publications if empty
 */
function seedCMSPublicationsIfEmpty() {
  const pubs = getJSON(K.cmsPubs, []);
  if (pubs.length) return;
  
  setJSON(K.cmsPubs, [
    {
      id: uid("pub"),
      title: "Erste Publikation",
      intro: "Willkommen zu unserer ersten Publikation",
      createdAt: nowISO(),
      date: new Date().toISOString()
    }
  ]);
}

/**
 * Ensure all seeds are created
 */
function ensureSeeds() {
  seedUsersIfEmpty();
  seedExampleMembers();
  seedEventsIfEmpty();
  seedCMSIfEmpty();
  seedCMSPublicationsIfEmpty();
}

// ========== AUTH FUNCTIONS ==========

/**
 * Get users array
 * @returns {Array} Users array
 */
function getUsers() {
  ensureSeeds();
  return getJSON(K.users, []);
}

/**
 * Save users array
 * @param {Array} users - Users array
 */
function saveUsers(users) {
  setJSON(K.users, users);
}

/**
 * Get current session
 * @returns {Object|null} Session object or null
 */
function getSession() {
  return getJSON(K.session, null);
}

/**
 * Set session
 * @param {Object} sess - Session object
 */
function setSession(sess) {
  setJSON(K.session, sess);
}

/**
 * Clear session
 */
function clearSession() {
  localStorage.removeItem(K.session);
}

/**
 * Get current user
 * @returns {Object|null} Current user or null
 */
function me() {
  const sess = getSession();
  if (!sess || !sess.email) return null;
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === sess.email.toLowerCase()) || null;
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
function isLoggedIn() {
  return !!me();
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Result object
 */
function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user || user.password !== password) {
    return { success: false, error: "Ungültige E-Mail oder Passwort." };
  }
  
  if (user.status === "blocked") {
    return { success: false, error: "Account gesperrt." };
  }
  
  setSession({ email: user.email, loggedInAt: nowISO() });
  return { success: true, user };
}

/**
 * Register new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Result object
 */
function register(name, email, password) {
  const users = getUsers();
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "E-Mail bereits registriert." };
  }
  
  if (password.length < 8) {
    return { success: false, error: "Passwort muss mindestens 8 Zeichen lang sein." };
  }
  
  const user = {
    id: uid("u"),
    name,
    email,
    password,
    role: "member",
    status: "active"
  };
  
  users.push(user);
  saveUsers(users);
  
  setSession({ email: user.email, loggedInAt: nowISO() });
  return { success: true, user };
}

/**
 * Logout user
 * @returns {Object} Result object
 */
function logout() {
  clearSession();
  return { success: true };
}

// ========== PROFILE FUNCTIONS ==========

/**
 * Get profile by email
 * @param {string} email - User email
 * @returns {Object|null} Profile or null
 */
function getProfileByEmail(email) {
  const key = K.profilesPrefix + email.toLowerCase();
  return getJSON(key, null);
}

/**
 * Get public profile by email (only visible profiles)
 * @param {string} email - User email
 * @returns {Object|null} Profile or null
 */
function getProfileByEmailPublic(email) {
  const profile = getProfileByEmail(email);
  if (!profile || !profile.privacy?.visibleInDirectory) return null;
  return profile;
}

/**
 * List members (public version - only visible profiles)
 * @param {string} query - Search query
 * @returns {Array} Array of profiles
 */
function listMembersPublic(query = "") {
  ensureSeeds();
  const users = getUsers();
  const q = (query || "").toLowerCase().trim();
  const out = [];
  
  for (const us of users) {
    const p = getProfileByEmail(us.email);
    if (!p) continue;
    
    const visible = p.privacy?.visibleInDirectory;
    if (!visible) continue; // Nur sichtbare Profile
    
    if (q) {
      const hay = [
        p.name, p.headline, p.bio,
        ...(p.skills || []), ...(p.interests || [])
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) continue;
    }
    
    out.push(p);
  }
  
  return out;
}

// ========== EVENT FUNCTIONS ==========

/**
 * List all events
 * @returns {Array} Array of events
 */
function listEvents() {
  ensureSeeds();
  return getJSON(K.events, []).filter(e => !e.deleted);
}

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @returns {Object|null} Event or null
 */
function getEvent(id) {
  return listEvents().find(e => e.id === id) || null;
}

// ========== CMS FUNCTIONS ==========

/**
 * List public updates
 * @returns {Array} Array of updates
 */
function listUpdatesPublic() {
  ensureSeeds();
  return getJSON(K.cmsUpdates, []);
}

/**
 * List public publications
 * @returns {Array} Array of publications
 */
function listPublicationsPublic() {
  ensureSeeds();
  return getJSON(K.cmsPubs, []);
}

// ========== EXPORT ==========

export const storageAdapter = {
  // Auth
  login,
  register,
  logout,
  me,
  isLoggedIn,
  
  // Profiles
  getProfileByEmail,
  getProfileByEmailPublic,
  listMembersPublic,
  
  // Events
  listEvents,
  getEvent,
  
  // CMS
  listUpdatesPublic,
  listPublicationsPublic
};

// Ensure seeds are created immediately on module load
ensureSeeds();
