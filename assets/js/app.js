import { api } from "./services/apiClient.js";
import { breadcrumbs } from "./components/breadcrumbs.js";

const $ = (s)=>document.querySelector(s);
const qs = new URLSearchParams(location.search);

function guard(){
  if(!api.isLoggedIn()){
    window.location.href = "../index.html";
    return false;
  }
  return true;
}

// Theme Toggle
function initTheme(){
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme){
  const btn = $("#themeToggle");
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function setShell(){
  initTheme();
  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  
  const u = api.me();
  if($("#userLabel")) $("#userLabel").textContent = u?.name || "Member";
  if($("#logoutBtn")) $("#logoutBtn").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });
  if($("#logoutBtn2")) $("#logoutBtn2").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });

  // nav active
  const page = document.body.dataset.page;
  const map = {
    dashboard:"dashboard", termine:"termine", forum:"forum",
    "forum-category":"forum", "forum-thread":"forum",
    messages:"nachrichten", compose:"nachrichten",
    members:"mitglieder", member:"mitglieder",
    profile:"einstellungen", settings:"einstellungen",
    admin:"admin"
  };
  const active = map[page];
  document.querySelectorAll("[data-nav]").forEach(a=>a.classList.toggle("active", a.dataset.nav===active));
  if(api.isAdmin() && $("#adminLink")) $("#adminLink").style.display="";
}

function fmtDate(ev){ return `${ev.date} ${ev.time}`; }

function parseTags(str){
  return (str||"").split(",").map(s=>s.trim()).filter(Boolean)
    .filter((v,i,a)=>a.indexOf(v)===i);
}

/* ========== DASHBOARD ========== */
function renderDashboard(){
  const u = api.me();
  const events = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

  // next booked
  const nextBooked = events.find(e => api.getParticipants(e.id).some(p=>p.email.toLowerCase()===u.email.toLowerCase()));
  $("#cardNext").innerHTML = `
    <div class="kpiTitle">Nächster Termin</div>
    ${nextBooked ? `
      <div class="kpiBody"><b>${nextBooked.title}</b><br/>${fmtDate(nextBooked)} · ${nextBooked.location}</div>
      <div style="margin-top:10px"><a class="btn primary" href="termine.html">Zu Terminen</a></div>
    ` : `
      <div class="kpiBody">Noch keine Buchung. Buche deinen nächsten Innovationsabend.</div>
      <div style="margin-top:10px"><a class="btn primary" href="termine.html">Termine ansehen</a></div>
    `}
  `;

  // saved preview (MVP: derive from favorites or saved toggle - we used saved toggle in api.saveEvent)
  $("#cardSaved").innerHTML = `
    <div class="kpiTitle">Gespeichert</div>
    <div class="kpiBody">Speichere interessante Termine direkt in der Terminliste.</div>
    <div style="margin-top:10px"><a class="btn" href="termine.html">Öffnen</a></div>
  `;

  // recommendations
  const recs = api.recommendContacts();
  $("#cardRecs").innerHTML = `
    <div class="kpiTitle">Empfohlene Kontakte</div>
    <div class="kpiBody">
      ${recs.length ? recs.slice(0,5).map(p=>`<div style="margin-bottom:8px"><b>${p.name}</b><br/><span class="small">${p.headline||"—"}</span></div>`).join("") : `Noch keine Empfehlungen – ergänze Skills/Interessen im Profil.`}
    </div>
    <div style="margin-top:10px"><a class="btn" href="mitglieder.html">Mitglieder</a></div>
  `;

  // favorites
  const favs = api.getFavorites();
  $("#cardFavs").innerHTML = `
    <div class="kpiTitle">Favoriten ⭐</div>
    <div class="kpiBody">${favs.length ? `${favs.length} gespeichert.` : `Noch keine Favoriten gesetzt.`}</div>
    <div style="margin-top:10px"><span class="badge">Privat</span></div>
  `;

  // notifications
  const n = api.listNotifications().slice(0,6);
  $("#cardNotifs").innerHTML = `
    <div style="font-weight:900">Benachrichtigungen</div>
    <div class="hr"></div>
    ${n.length ? n.map(x=>`<div class="listItem">
      <div><b>${x.title}</b><div class="small">${x.message||""}</div></div>
      <span class="badge ${x.read?"":"blue"}">${x.read?"gelesen":"neu"}</span>
    </div>`).join("") : `<div class="p">Keine neuen Hinweise.</div>`}
  `;

  // activity
  const acts = api.listActivity().slice(0,8);
  $("#cardActivity").innerHTML = `
    <div style="font-weight:900">Meine Aktivitäten</div>
    <div class="hr"></div>
    ${acts.length ? acts.map(a=>`<div class="listItem">
      <div><b>${a.type}</b><div class="small">${a.referenceType} · ${a.referenceId}</div></div>
      <span class="badge">${new Date(a.createdAt).toLocaleString()}</span>
    </div>`).join("") : `<div class="p">Noch keine Aktivitäten.</div>`}
  `;
}

/* ========== EVENTS ========== */
function renderEvents(){
  const wrap = $("#eventsGrid");
  const u = api.me();
  const events = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));

  const isBooked = (ev)=> api.getParticipants(ev.id).some(p=>p.email.toLowerCase()===u.email.toLowerCase());
  wrap.innerHTML = events.map(ev=>{
    const count = api.bookingsCount(ev.id);
    const full = count >= ev.capacity;
    return `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div>
            <div style="font-weight:900">${ev.title}</div>
            <div class="metaLine" style="margin-top:6px">
              <span>📅 ${ev.date}</span><span>⏰ ${ev.time}</span>
              <span class="badge">${ev.location}</span>
            </div>
            <div class="chips" style="margin-top:10px">${(ev.tags||[]).slice(0,6).map(t=>`<span class="chip">${t}</span>`).join("")}</div>
          </div>
          <span class="badge blue">${ev.format}</span>
        </div>
        <div class="hr"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" data-book="${ev.id}" ${full||isBooked(ev)?"disabled":""}>${isBooked(ev)?"Gebucht":(full?"Ausgebucht":"Buchen")}</button>
          <button class="btn" data-save="${ev.id}">Speichern</button>
          <button class="btn" data-ics="${ev.id}">ICS</button>
          <button class="btn" data-open="${ev.id}">Details</button>
        </div>
        <div class="small" style="margin-top:10px">Teilnehmer: ${count}/${ev.capacity}</div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-book]").forEach(b=>b.addEventListener("click", ()=>{
    const id = b.dataset.book;
    const res = api.bookEvent(id);
    if(!res.ok) alert(res.error);
    renderEvents();
  }));
  wrap.querySelectorAll("[data-save]").forEach(b=>b.addEventListener("click", ()=>{
    api.saveEvent(b.dataset.save);
    b.textContent = "Gespeichert ✓";
  }));
  wrap.querySelectorAll("[data-ics]").forEach(b=>b.addEventListener("click", ()=>api.exportICSForEvent(b.dataset.ics)));
  wrap.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click", ()=>openEventModal(b.dataset.open)));

  $("#exportBooked").addEventListener("click", ()=>api.exportICSForBooked());

  // modal wiring
  $("#evClose").addEventListener("click", ()=>$("#evOverlay").style.display="none");
  $("#evOverlay").addEventListener("click",(e)=>{ if(e.target.id==="evOverlay") $("#evOverlay").style.display="none"; });
}

function openEventModal(eventId){
  const ev = api.getEvent(eventId);
  if(!ev) return;
  const threadId = api.ensureEventThread(eventId);
  const parts = api.getParticipants(eventId).slice(0,12);
  $("#evTitle").textContent = ev.title;
  $("#evBody").innerHTML = `
    <div class="metaLine">
      <span class="badge blue">${ev.format}</span>
      <span class="badge">📅 ${ev.date}</span>
      <span class="badge">⏰ ${ev.time}</span>
      <span class="badge">${ev.location}</span>
    </div>
    <div class="hr"></div>
    <div class="p">${ev.descriptionMember || ""}</div>
    <div class="hr"></div>
    <div style="font-weight:900">Teilnehmer (Preview)</div>
    <div class="small">Nur sichtbar für eingeloggte Nutzer (MVP). Später: nur für gebuchte.</div>
    <div style="margin-top:10px">
      ${parts.length ? parts.map(p=>`<div class="listItem"><div><b>${p.email}</b></div><span class="badge">participant</span></div>`).join("") : `<div class="p">Noch keine Teilnehmer.</div>`}
    </div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      <a class="btn primary" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>
      <button class="btn" onclick="navigator.clipboard.writeText(location.href)">Link kopieren</button>
    </div>
  `;
  $("#evOverlay").style.display="flex";
}

/* ========== FORUM ========== */
function renderForum(){
  const cats = api.listForumCategories();
  $("#catGrid").innerHTML = cats.map(c=>`
    <a class="card" href="forum-kategorie.html?cat=${encodeURIComponent(c.id)}" style="padding:16px">
      <div style="font-weight:900">${c.title}</div>
      <p class="p" style="margin-top:6px">${c.desc}</p>
    </a>
  `).join("");
}

function renderForumCategory(){
  const catId = qs.get("cat") || "cat_general";
  const cat = api.listForumCategories().find(c=>c.id===catId);
  $("#catTitle").textContent = cat?.title || "Kategorie";
  $("#catDesc").textContent = cat?.desc || "";

  const threads = api.getForumThreads()
    .filter(t=>t.categoryId===catId && !t.archived)
    .sort((a,b)=>{
      if(!!b.pinned !== !!a.pinned) return (b.pinned?1:0)-(a.pinned?1:0);
      return (b.lastActivityAt||"").localeCompare(a.lastActivityAt||"") * -1;
    });

  $("#threadList").innerHTML = threads.length ? threads.map(t=>`
    <div class="listItem">
      <div>
        <div style="font-weight:900">${t.title} ${t.type==="event"?`<span class="badge blue">Event</span>`:""}</div>
        <div class="small">Replies: ${t.replyCount||0} · Last: ${new Date(t.lastActivityAt).toLocaleString()}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        ${t.pinned?`<span class="badge">pinned</span>`:""}
        ${t.locked?`<span class="badge warn">locked</span>`:""}
        <a class="btn" href="forum-thread.html?thread=${encodeURIComponent(t.id)}">Öffnen</a>
      </div>
    </div>
  `).join("") : `<div class="p" style="padding:14px">Keine Threads.</div>`;

  // new thread modal
  const open = ()=>$("#thrOverlay").style.display="flex";
  const close = ()=>$("#thrOverlay").style.display="none";
  $("#newThreadBtn").addEventListener("click", open);
  $("#thrClose").addEventListener("click", close);
  $("#thrOverlay").addEventListener("click",(e)=>{ if(e.target.id==="thrOverlay") close(); });

  $("#thrCreate").addEventListener("click", ()=>{
    $("#thrErr").textContent = "";
    const title = $("#thrTitle").value.trim();
    const body = $("#thrBody").value.trim();
    if(!title || !body){ $("#thrErr").textContent="Titel und Text erforderlich."; return; }
    const res = api.createForumThread(catId, title, body);
    if(!res.ok){ $("#thrErr").textContent = res.error; return; }
    window.location.href = `forum-thread.html?thread=${encodeURIComponent(res.threadId)}`;
  });
}

function renderForumThread(){
  const threadId = qs.get("thread");
  const t = api.getForumThread(threadId);
  if(!t){ $("#threadTitle").textContent="Nicht gefunden"; $("#postsWrap").innerHTML="<div class='p'>Thread existiert nicht.</div>"; return; }

  $("#threadTitle").textContent = t.title;
  $("#threadMeta").innerHTML = `
    <span class="badge">${t.categoryId}</span>
    ${t.type==="event"?`<span class="badge blue">Event</span>`:""}
    ${t.pinned?`<span class="badge">pinned</span>`:""}
    ${t.locked?`<span class="badge warn">locked</span>`:""}
  `;

  const posts = api.getForumPosts(threadId);
  $("#postsWrap").innerHTML = posts.map(p=>`
    <div class="msgBlock">
      <div class="msgMeta">
        <span><b>${p.authorEmail}</b> · ${p.type}</span>
        <span>${new Date(p.createdAt).toLocaleString()}</span>
      </div>
      <div class="p">${(p.deleted? "Beitrag wurde entfernt." : (p.body||"")).replace(/\n/g,"<br/>")}</div>
    </div>
  `).join("");

  const u = api.me();
  if(api.isAdmin()){
    $("#adminThreadTools").style.display="flex";
    $("#pinBtn").textContent = t.pinned ? "Unpin" : "Pin";
    $("#lockBtn").textContent = t.locked ? "Unlock" : "Lock";

    $("#pinBtn").onclick = ()=>{ api.adminPinThread(threadId, !t.pinned); location.reload(); };
    $("#lockBtn").onclick = ()=>{ api.adminLockThread(threadId, !t.locked); location.reload(); };
    $("#delBtn").onclick = ()=>{ if(confirm("Thread wirklich löschen (soft)?")){ api.adminDeleteThread(threadId); window.location.href="forum.html"; } };
  }

  $("#replyBtn").addEventListener("click", ()=>{
    $("#replyErr").textContent="";
    const body = $("#replyBody").value.trim();
    if(!body){ $("#replyErr").textContent="Text fehlt."; return; }
    const res = api.replyForumThread(threadId, body);
    if(!res.ok){ $("#replyErr").textContent = res.error; return; }
    location.reload();
  });

  if(t.locked){
    $("#replyBody").disabled = true;
    $("#replyBtn").disabled = true;
    $("#replyErr").textContent = "Thread ist geschlossen.";
  }
}

/* ========== MESSAGES ========== */
function renderMessages(){
  const u = api.me();
  let tab = "inbox";
  let activeThread = qs.get("thread") || null;

  const renderThreadList = ()=>{
    const q = ($("#msgSearch").value||"").toLowerCase().trim();
    const threads = api.getThreads(u.email)
      .filter(t => !q || (t.otherEmail+t.subject+t.lastSnippet).toLowerCase().includes(q))
      .sort((a,b)=> (b.lastMessageAt||"").localeCompare(a.lastMessageAt||""));

    $("#threadList").innerHTML = (tab==="inbox")
      ? threads.map(t=>`
        <div class="threadItem ${t.id===activeThread?"active":""}" data-thread="${t.id}">
          <div class="threadTop">
            <div class="threadName">${t.otherEmail}</div>
            <div class="badge ${t.unreadCount? "blue":""}">${t.unreadCount? `${t.unreadCount} neu`:""}</div>
          </div>
          <div class="threadSnippet"><b>${t.subject||"—"}</b><br/>${t.lastSnippet||""}</div>
        </div>
      `).join("")
      : api.listSystemMessages().map(m=>`
        <div class="threadItem" data-system="${m.id}">
          <div class="threadTop">
            <div class="threadName">SYSTEM</div>
            <div class="badge ${m.read?"":"blue"}">${m.read?"":"neu"}</div>
          </div>
          <div class="threadSnippet"><b>${m.title}</b><br/>${(m.body||"").slice(0,90)}</div>
        </div>
      `).join("");

    $("#threadList").querySelectorAll("[data-thread]").forEach(el=>{
      el.addEventListener("click", ()=>{
        activeThread = el.dataset.thread;
        api.markThreadRead(activeThread);
        openThread(activeThread);
        renderThreadList();
      });
    });

    $("#threadList").querySelectorAll("[data-system]").forEach(el=>{
      el.addEventListener("click", ()=>{
        openSystem(el.dataset.system);
      });
    });
  };

  const openThread = (threadId)=>{
    const msgs = api.getMessages(threadId);
    const right = $("#rightPane");
    right.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
        <div style="font-weight:900">Unterhaltung</div>
        <a class="btn" href="neue-nachricht.html">Neue</a>
      </div>
      <div class="hr"></div>
      <div id="msgList"></div>
      <div class="hr"></div>
      <label class="label">Antwort</label>
      <textarea class="textarea" id="replyMsg"></textarea>
      <div class="err" id="msgErr"></div>
      <div style="margin-top:10px">
        <button class="btn primary" id="sendReply">Senden</button>
      </div>
    `;
    right.querySelector("#msgList").innerHTML = msgs.map(m=>`
      <div class="msgBlock">
        <div class="msgMeta">
          <span><b>${m.from===u.email?"Du":m.from}</b> → ${m.to===u.email?"Du":m.to}</span>
          <span>${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <div class="p">${(m.body||"").replace(/\n/g,"<br/>")}</div>
      </div>
    `).join("");

    right.querySelector("#sendReply").addEventListener("click", ()=>{
      const body = right.querySelector("#replyMsg").value.trim();
      if(!body){ right.querySelector("#msgErr").textContent="Text fehlt."; return; }
      const other = api.getThreads(u.email).find(t=>t.id===threadId)?.otherEmail;
      api.sendMessage({ to: other, subject: "Re: " + (api.getThreads(u.email).find(t=>t.id===threadId)?.subject||""), body });
      location.href = `nachrichten.html?thread=${encodeURIComponent(threadId)}`;
    });
  };

  const openSystem = (id)=>{
    const msg = api.listSystemMessages().find(x=>x.id===id);
    if(!msg) return;
    $("#rightPane").innerHTML = `
      <div style="font-weight:900">Systemnachricht</div>
      <div class="hr"></div>
      <div class="msgBlock">
        <div class="msgMeta"><span><b>${msg.title}</b></span><span>${new Date(msg.createdAt).toLocaleString()}</span></div>
        <div class="p">${(msg.body||"").replace(/\n/g,"<br/>")}</div>
      </div>
    `;
  };

  document.querySelectorAll("[data-msgtab]").forEach(t=>{
    t.addEventListener("click", ()=>{
      document.querySelectorAll("[data-msgtab]").forEach(x=>x.classList.toggle("active", x===t));
      tab = t.dataset.msgtab;
      $("#rightPane").innerHTML = `<div class="p">Wähle links eine Unterhaltung oder Systemnachricht.</div>`;
      renderThreadList();
    });
  });
  $("#msgSearch").addEventListener("input", renderThreadList);

  renderThreadList();
  if(activeThread){ api.markThreadRead(activeThread); openThread(activeThread); }
}

/* ========== COMPOSE ========== */
function renderCompose(){
  const u = api.me();
  const list = api.listMembers("");
  const toParam = qs.get("to") || "";
  $("#toSelect").innerHTML = list
    .filter(p=>p.email.toLowerCase() !== u.email.toLowerCase())
    .filter(p=>p.privacy?.allowDM)
    .map(p=>`<option value="${p.email}" ${p.email===toParam?"selected":""}>${p.name} (${p.email})</option>`)
    .join("");
  $("#sendBtn").addEventListener("click", ()=>{
    $("#sendErr").textContent="";
    const to = $("#toSelect").value;
    const subject = $("#subj").value.trim();
    const body = $("#body").value.trim();
    if(!to){ $("#sendErr").textContent="Empfänger fehlt."; return; }
    if(!body){ $("#sendErr").textContent="Nachricht fehlt."; return; }
    const res = api.sendMessage({ to, subject, body });
    if(!res.ok){ $("#sendErr").textContent=res.error; return; }
    window.location.href = `nachrichten.html?thread=${encodeURIComponent(res.threadId)}`;
  });
}

/* ========== MEMBERS DIRECTORY ========== */
function renderMembers(){
  const render = ()=>{
    const q = ($("#memSearch").value||"").trim();
    const members = api.listMembers(q);
    $("#memGrid").innerHTML = members.map(p=>`
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:900">${p.name}</div>
            <div class="small">${p.headline||"—"}</div>
          </div>
          <button class="btn" data-fav-user="${p.userId}">⭐</button>
        </div>
        <div class="chips" style="margin-top:10px">${(p.skills||[]).slice(0,4).map(s=>`<span class="chip">${s}</span>`).join("")}</div>
        <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn primary" href="member.html?email=${encodeURIComponent(p.email)}">Profil</a>
          ${p.privacy?.allowDM ? `<a class="btn" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht</a>`:""}
        </div>
      </div>
    `).join("");
    $("#memGrid").querySelectorAll("[data-fav-user]").forEach(b=>{
      b.addEventListener("click", ()=>{ api.toggleFavorite("user", b.dataset.favUser); b.textContent="⭐✓"; });
    });
  };
  $("#memSearch").addEventListener("input", render);
  render();
}

/* ========== MEMBER PROFILE ========== */
function renderMember(){
  const email = qs.get("email");
  const u = api.me();
  const p = api.getProfileByEmail(email);
  if(!p){ $("#memberCard").innerHTML = `<div class="p">Profil nicht verfügbar.</div>`; return; }

  const isMe = email.toLowerCase() === u.email.toLowerCase();
  const common = commonTags(api.getProfileByEmail(u.email), p);

  $("#memberCard").innerHTML = `
    <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">
      <div>
        <div class="h2" style="margin:0">${p.name}</div>
        <div class="p">${p.headline||"—"}</div>
        <div class="metaLine" style="margin-top:10px">
          ${p.location?`<span class="badge">${p.location}</span>`:""}
          ${common.length?`<span class="badge blue">Gemeinsam: ${common.slice(0,3).join(", ")}</span>`:""}
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn" id="favBtn">⭐ Favorit</button>
        ${isMe ? `<a class="btn primary" href="profil.html">Bearbeiten</a>` : (p.privacy?.allowDM ? `<a class="btn primary" href="neue-nachricht.html?to=${encodeURIComponent(p.email)}">Nachricht senden</a>`:"")}
      </div>
    </div>
    <div class="hr"></div>
    <div class="grid grid-2">
      <div>
        <div style="font-weight:900">Bio</div>
        <p class="p" style="margin-top:8px">${(p.bio||"").replace(/\n/g,"<br/>") || "—"}</p>
      </div>
      <div>
        <div style="font-weight:900">Skills</div>
        <div class="chips" style="margin-top:8px">${(p.skills||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
        <div style="font-weight:900; margin-top:12px">Interessen</div>
        <div class="chips" style="margin-top:8px">${(p.interests||[]).map(s=>`<span class="chip">${s}</span>`).join("") || "—"}</div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="grid grid-2">
      <div>
        <div style="font-weight:900">Biete</div>
        <p class="p" style="margin-top:8px">${(p.offer||"—").replace(/\n/g,"<br/>")}</p>
      </div>
      <div>
        <div style="font-weight:900">Suche</div>
        <p class="p" style="margin-top:8px">${(p.lookingFor||"—").replace(/\n/g,"<br/>")}</p>
      </div>
    </div>
  `;
  $("#favBtn").addEventListener("click", ()=>{ api.toggleFavorite("user", p.userId); $("#favBtn").textContent="⭐ Favorit ✓"; });
}

function commonTags(a,b){
  const A = new Set([...(a?.skills||[]), ...(a?.interests||[])].map(x=>x.toLowerCase()));
  const out = [];
  for(const x of [...(b?.skills||[]), ...(b?.interests||[])]){
    if(A.has(x.toLowerCase())) out.push(x);
  }
  return [...new Set(out)];
}

/* ========== MY PROFILE ========== */
function renderProfileProgress(){
  const container = $("#profileProgress");
  if(!container) return;
  
  const u = api.me();
  const p = api.getProfileByEmail(u.email);
  
  // Checkliste der Profil-Felder
  const checks = [
    { key: 'name', label: 'Name', value: u?.name, field: null },
    { key: 'headline', label: 'Headline', value: p?.headline, field: 'pHeadline' },
    { key: 'bio', label: 'Bio', value: p?.bio, field: 'pBio' },
    { key: 'skills', label: 'Skills', value: p?.skills?.length > 0, field: 'pSkills' },
    { key: 'interests', label: 'Interessen', value: p?.interests?.length > 0, field: 'pInterests' },
    { key: 'avatar', label: 'Profilbild', value: false, field: null } // Placeholder, da aktuell keine Upload-Funktion
  ];
  
  const completed = checks.filter(c => c.value && c.value !== '').length;
  const total = checks.length;
  const percentage = Math.round((completed / total) * 100);
  
  const missingFields = checks.filter(c => !c.value || c.value === '').filter(c => c.field);
  
  container.innerHTML = `
    <div class="profile-progress-card">
      <div class="profile-progress-header">
        <h3 class="h3">Profil-Vollständigkeit</h3>
        <span class="profile-progress-percentage">${percentage}%</span>
      </div>
      <div class="profile-progress-bar">
        <div class="profile-progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="profile-progress-checklist">
        ${checks.map(c => `
          <div class="profile-progress-item ${c.value && c.value !== '' ? 'completed' : ''}">
            <span class="profile-progress-icon">${c.value && c.value !== '' ? '✓' : '○'}</span>
            <span class="profile-progress-label">${c.label}</span>
          </div>
        `).join('')}
      </div>
      ${missingFields.length > 0 ? `
        <div class="profile-progress-actions">
          <p class="small text-muted">Vervollständigen Sie Ihr Profil für bessere Sichtbarkeit im Netzwerk:</p>
          ${missingFields.map(f => `
            <button class="btn ghost small" onclick="document.getElementById('${f.field}')?.focus()">
              ${f.label} hinzufügen
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

function renderMyProfile(){
  const u = api.me();
  const p = api.getProfileByEmail(u.email);
  
  // Render profile progress
  renderProfileProgress();
  
  $("#pHeadline").value = p.headline||"";
  $("#pLoc").value = p.location||"";
  $("#pBio").value = p.bio||"";
  $("#pSkills").value = (p.skills||[]).join(", ");
  $("#pInterests").value = (p.interests||[]).join(", ");
  $("#pOffer").value = p.offer||"";
  $("#pSeek").value = p.lookingFor||"";
  $("#pLi").value = p.links?.linkedin||"";
  $("#pWeb").value = p.links?.website||"";
  $("#pVis").checked = !!p.privacy?.visibleInDirectory;
  $("#pDM").checked = !!p.privacy?.allowDM;

  $("#saveProfile").addEventListener("click", ()=>{
    $("#pErr").textContent=""; $("#pOk").textContent="";
    const res = api.updateMyProfile({
      headline: $("#pHeadline").value.trim(),
      location: $("#pLoc").value.trim(),
      bio: $("#pBio").value.trim(),
      skills: parseTags($("#pSkills").value),
      interests: parseTags($("#pInterests").value),
      offer: $("#pOffer").value.trim(),
      lookingFor: $("#pSeek").value.trim(),
      links: { linkedin: $("#pLi").value.trim(), website: $("#pWeb").value.trim() },
      privacy: { visibleInDirectory: $("#pVis").checked, allowDM: $("#pDM").checked },
      completed: true
    });
    if(!res.ok){ $("#pErr").textContent=res.error; return; }
    $("#pOk").textContent="Gespeichert ✅";
    // Update progress after save
    setTimeout(() => renderProfileProgress(), 100);
  });
}

/* ========== ADMIN ========== */
function renderAdmin(){
  if(!api.isAdmin()){ window.location.href="dashboard.html"; return; }

  let tab = "users";
  const setTab = (t)=>{
    tab=t;
    document.querySelectorAll("[data-admtab]").forEach(x=>x.classList.toggle("active", x.dataset.admtab===t));
    renderAdminPanels();
  };
  document.querySelectorAll("[data-admtab]").forEach(x=>x.addEventListener("click", ()=>setTab(x.dataset.admtab)));

  const open = ()=>$("#admEvOverlay").style.display="flex";
  const close = ()=>$("#admEvOverlay").style.display="none";
  $("#admEvClose").addEventListener("click", close);
  $("#admEvOverlay").addEventListener("click",(e)=>{ if(e.target.id==="admEvOverlay") close(); });

  function renderAdminPanels(){
    if(tab==="users"){
      const users = api.adminListUsers();
      $("#adminLeft").innerHTML = `
        <div style="font-weight:900">Mitglieder</div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            ${users.map(u=>`
              <tr>
                <td>${u.name}</td><td>${u.email}</td>
                <td>${u.role}</td><td>${u.status}</td>
                <td>
                  <button class="btn" data-role="${u.id}">Role</button>
                  <button class="btn danger" data-status="${u.id}">Block</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = `<div class="p">Tipp: Admin Seed ist <b>admin@undbauen.local</b>.</div>`;

      $("#adminLeft").querySelectorAll("[data-role]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const id = b.dataset.role;
          const u = users.find(x=>x.id===id);
          const next = u.role==="admin" ? "member" : "admin";
          if(confirm(`Rolle ändern zu ${next}?`)) api.adminSetUserRole(id, next), location.reload();
        });
      });
      $("#adminLeft").querySelectorAll("[data-status]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const id = b.dataset.status;
          if(confirm("User blocken?")) api.adminSetUserStatus(id, "blocked"), location.reload();
        });
      });
    }

    if(tab==="events"){
      const evs = api.listEvents().slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
      $("#adminLeft").innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Termine (CRUD)</div>
          <button class="btn primary" id="newEv">+ Neu</button>
        </div>
        <div class="hr"></div>
        <table class="table">
          <thead><tr><th>Titel</th><th>Datum</th><th>Cap</th><th>Buchungen</th><th>Aktion</th></tr></thead>
          <tbody>
            ${evs.map(e=>`
              <tr>
                <td>${e.title}</td><td>${e.date} ${e.time}</td><td>${e.capacity}</td><td>${api.bookingsCount(e.id)}</td>
                <td>
                  <button class="btn" data-edit="${e.id}">Edit</button>
                  <button class="btn danger" data-del="${e.id}">Del</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
      $("#adminRight").innerHTML = `<div class="p">Event-Thread wird beim Öffnen im Member-Modal automatisch erzeugt (MVP).</div>`;

      $("#newEv").addEventListener("click", ()=>{
        $("#admEvTitle").textContent="Neues Event";
        $("#admEvBody").innerHTML = evFormHTML({});
        open();
        wireEvForm(null);
      });
      $("#adminLeft").querySelectorAll("[data-edit]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const ev = api.getEvent(b.dataset.edit);
          $("#admEvTitle").textContent="Event bearbeiten";
          $("#admEvBody").innerHTML = evFormHTML(ev);
          open();
          wireEvForm(ev.id);
        });
      });
      $("#adminLeft").querySelectorAll("[data-del]").forEach(b=>{
        b.addEventListener("click", ()=>{
          if(confirm("Event löschen (soft)?")) api.adminDeleteEvent(b.dataset.del), location.reload();
        });
      });
    }

    if(tab==="content"){
      const ups = api.listUpdatesMember();
      const pubs = api.listPublicationsMember();
      $("#adminLeft").innerHTML = `
        <div style="font-weight:900">Monatsupdates</div>
        <div class="hr"></div>
        ${ups.map(u=>`
          <div class="listItem"><div><b>${u.title}</b><div class="small">${u.month}</div></div>
            <button class="btn danger" data-delupd="${u.id}">Del</button>
          </div>
        `).join("")}
        <div style="margin-top:12px"><button class="btn primary" id="addUpd">+ Update</button></div>
      `;
      $("#adminRight").innerHTML = `
        <div style="font-weight:900">Publikationen</div>
        <div class="hr"></div>
        ${pubs.map(p=>`
          <div class="listItem"><div><b>${p.title}</b><div class="small">${(p.tags||[]).join(", ")}</div></div>
            <button class="btn danger" data-delpub="${p.id}">Del</button>
          </div>
        `).join("")}
        <div style="margin-top:12px"><button class="btn primary" id="addPub">+ Publikation</button></div>
      `;

      $("#adminLeft").querySelectorAll("[data-delupd]").forEach(b=>b.addEventListener("click", ()=>{ if(confirm("Delete update?")) api.adminDeleteUpdate(b.dataset.delupd), location.reload(); }));
      $("#adminRight").querySelectorAll("[data-delpub]").forEach(b=>b.addEventListener("click", ()=>{ if(confirm("Delete pub?")) api.adminDeletePublication(b.dataset.delpub), location.reload(); }));

      $("#addUpd").addEventListener("click", ()=>{
        const month = prompt("Monat (YYYY-MM):","2026-02"); if(!month) return;
        const title = prompt("Titel:","Monatsupdate"); if(!title) return;
        api.adminCreateUpdate({ month, title, intro:"Teaser", highlights:["Highlight 1","Highlight 2"], memberBody:"Member-Text" });
        location.reload();
      });
      $("#addPub").addEventListener("click", ()=>{
        const title = prompt("Titel:","Publikation"); if(!title) return;
        api.adminCreatePublication({ title, abstract:"Abstract", tags:["Tag"], memberBody:"Member-Body", downloadUrl:"" });
        location.reload();
      });
    }
  }

  function evFormHTML(ev){
    return `
      <label class="label">Titel</label><input class="input" id="fTitle" value="${ev.title||""}"/>
      <div class="row" style="margin-top:10px">
        <div style="flex:1"><label class="label">Datum</label><input class="input" id="fDate" value="${ev.date||""}" placeholder="YYYY-MM-DD"/></div>
        <div style="flex:1"><label class="label">Zeit</label><input class="input" id="fTime" value="${ev.time||""}" placeholder="18:00"/></div>
      </div>
      <div class="row" style="margin-top:10px">
        <div style="flex:1"><label class="label">Dauer (Min)</label><input class="input" id="fDur" value="${ev.durationMinutes||90}"/></div>
        <div style="flex:1"><label class="label">Kapazität</label><input class="input" id="fCap" value="${ev.capacity||40}"/></div>
      </div>
      <label class="label" style="margin-top:10px">Location</label><input class="input" id="fLoc" value="${ev.location||""}"/>
      <label class="label" style="margin-top:10px">Format</label><input class="input" id="fFmt" value="${ev.format||"Innovationsabend"}"/>
      <label class="label" style="margin-top:10px">Tags (Komma)</label><input class="input" id="fTags" value="${(ev.tags||[]).join(", ")}"/>
      <label class="label" style="margin-top:10px">Public Desc</label><textarea class="textarea" id="fPub">${ev.descriptionPublic||""}</textarea>
      <label class="label" style="margin-top:10px">Member Desc</label><textarea class="textarea" id="fMem">${ev.descriptionMember||""}</textarea>
      <div class="err" id="fErr"></div>
      <div style="margin-top:12px"><button class="btn primary" id="fSave">Speichern</button></div>
    `;
  }

  function wireEvForm(id){
    $("#fSave").addEventListener("click", ()=>{
      $("#fErr").textContent="";
      const payload = {
        title: $("#fTitle").value.trim(),
        date: $("#fDate").value.trim(),
        time: $("#fTime").value.trim(),
        durationMinutes: Number($("#fDur").value||90),
        capacity: Number($("#fCap").value||40),
        location: $("#fLoc").value.trim(),
        format: $("#fFmt").value.trim(),
        tags: parseTags($("#fTags").value),
        descriptionPublic: $("#fPub").value.trim(),
        descriptionMember: $("#fMem").value.trim()
      };
      if(!payload.title || !payload.date || !payload.time){ $("#fErr").textContent="Titel/Datum/Zeit erforderlich."; return; }
      if(id) api.adminUpdateEvent(id, payload);
      else api.adminCreateEvent(payload);
      location.reload();
    });
  }

  renderAdminPanels();
}

/* ========== ROUTER ========== */
document.addEventListener("DOMContentLoaded", async ()=>{
  if(!guard()) return;
  setShell();
  
  // Initialize breadcrumbs
  breadcrumbs.init();
  
  // Lazy-load onboarding for new users
  const onboardingCompleted = localStorage.getItem('onboardingCompleted');
  if (onboardingCompleted !== 'true') {
    try {
      const { initOnboarding } = await import('./components/onboarding.js');
      initOnboarding();
    } catch (error) {
      console.warn('Onboarding konnte nicht geladen werden:', error);
    }
  }

  const page = document.body.dataset.page;
  switch(page){
    case "dashboard": renderDashboard(); break;
    case "termine": renderEvents(); break;
    case "forum": renderForum(); break;
    case "forum-category": renderForumCategory(); break;
    case "forum-thread": renderForumThread(); break;
    case "messages": renderMessages(); break;
    case "compose": renderCompose(); break;
    case "members": renderMembers(); break;
    case "member": renderMember(); break;
    case "profile": renderMyProfile(); break;
    case "settings": /* nothing more */ break;
    case "admin": renderAdmin(); break;
  }
});

