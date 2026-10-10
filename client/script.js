/* ========== Simple client-only "app" for Study Guru ========== */
/* Persistence: localStorage usage for uploaded notes metadata & parsed txt content.
   Notes structure: [{id,name,subject,type('txt'|'pdf'),content(optional for txt),size,uploadedAt}] */


   const API_BASE_URL =
   window.location.hostname === "localhost" ||
   window.location.hostname === "127.0.0.1"
     ? "http://localhost:3000"
     : "";
     async function apiRequest(endpoint, options = {}) {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        cache: "no-store",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {})
        }
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    }

const App = (function(){
  // DOM
  const continueStudyBtn = document.getElementById('continueStudyBtn');
  const homeLoginCard = document.getElementById('homeLoginCard');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const passwordToggle = document.getElementById("passwordToggle");
  const loginBtn = document.getElementById('loginBtn');
  const loginMessage = document.getElementById('loginMessage');
  const loggedOutState = document.getElementById("loggedOutState");
  const loggedInState = document.getElementById("loggedInState");
  const welcomeUserName = document.getElementById("welcomeUserName");
  const authNavLink = document.getElementById('authNavLink');
  const studyTimeValue = document.getElementById("studyTimeValue");
  const documentCountValue = document.getElementById("documentCountValue");
  const quizCountValue = document.getElementById("quizCountValue");
  const flashcardCountValue = document.getElementById("flashcardCountValue");
  const progressPercent = document.getElementById("progressPercent");
  const continueCourseTitle = document.getElementById("continueCourseTitle");
  const progressDescription = document.getElementById("progressDescription");
  const progressBar = document.getElementById("progressBar");
  const pages = document.querySelectorAll('.pages');
  const navLinks = document.querySelectorAll('.menu a');
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const pickFile = document.getElementById('pickFile');
  const subjectSelect = document.getElementById('subjectSelect');
  const createSubjectBtn = document.getElementById('createSubject');
  const notesContainer = document.getElementById('notesContainer');
  const notesKey = 'studyguru_notes_v1';
  const chatTabs = document.querySelectorAll('.tab');
  const messagesEl = document.getElementById('messages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatSubject = document.getElementById('chatSubject');
  const subjectChooser = document.getElementById('subjectChooser');
  const heroGetStarted = document.getElementById('heroGetStarted');
  const testMode = document.getElementById('testMode');
  const testSubject = document.getElementById('testSubject');
  const genTest = document.getElementById('genTest');
  const testArea = document.getElementById('testArea');
  const profileSubjects = document.getElementById('profileSubjects');

  const progressText = document.getElementById('progressText');
  const exportNotes = document.getElementById('exportNotes');
  const genKeywordsAll = document.getElementById('genKeywordsAll');
  const shortNotesAll = document.getElementById('shortNotesAll');
  const pickSubjectCreate = subjectSelect; // same element
  const toastEl = document.getElementById('toast');

  let state = {
    notes: loadNotes(),
    chatMode: 'global',
    subjects: new Set(),
  };

  // Init
  function init(){
    // derive subjects from notes + default list
    ['Computer','Science','Math','Other'].forEach(s => state.subjects.add(s));
    state.notes.forEach(n => state.subjects.add(n.subject));
    renderNav();
    gotoPage('home');
    bindEvents();
    renderNotesList();
    renderChatSubjects();
    renderTestSubjectOptions();
    renderProfileSubjects();
    updateProgress();
  }

  // ========== Storage ==========
  function loadNotes(){
    try{
      const raw = localStorage.getItem(notesKey);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveNotes(){
    localStorage.setItem(notesKey, JSON.stringify(state.notes));
  }

  // ========== Rendering ==========
  function renderNav(){
    navLinks.forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        const page = a.dataset.page;
        gotoPage(page);
      };
    });
  }

  function gotoPage(page) {
    navLinks.forEach(a =>
      a.classList.toggle("active", a.dataset.page === page)
    );

    document.querySelectorAll(".pages").forEach(p => {
      p.classList.add("hide");
    });

    const el = document.getElementById("page-" + page);

    if (el) {
      el.classList.remove("hide");
    }



    if (page === "chat") {
      chatInput.focus();
    }
  }

  function bindEvents(){

    loginBtn.addEventListener('click', handleLogin);
    // Open registration form
const showRegisterBtn = document.getElementById("showRegisterBtn");
const showLoginBtn = document.getElementById("showLoginBtn");
const loggedOutState = document.getElementById("loggedOutState");
const registerState = document.getElementById("registerState");
const registerBtn = document.getElementById("registerBtn");
const homeLogoutBtn = document.getElementById("homeLogoutBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const continueLearningBtn = document.getElementById("continueLearningBtn");
if (continueLearningBtn) {
  continueLearningBtn.addEventListener("click", () => {
    gotoPage("notes");
  });
}

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const loginMessage = document.getElementById("loginMessage");

    if (!email) {
      loginMessage.textContent = "Please enter your email first.";
      loginMessage.style.color = "red";
      document.getElementById("loginEmail").focus();
      return;
    }

    forgotPasswordBtn.disabled = true;
    forgotPasswordBtn.textContent = "Sending...";

    try {
      const response = await apiRequest("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      loginMessage.textContent =
        response.message || "If the account exists, password reset instructions will be sent.";
      loginMessage.style.color = "green";
    } catch (error) {
      loginMessage.textContent =
        error.message || "Unable to process the password reset request.";
      loginMessage.style.color = "red";
    } finally {
      forgotPasswordBtn.disabled = false;
      forgotPasswordBtn.textContent = "Forgot?";
    }
  });
}


if (homeLogoutBtn) {
  homeLogoutBtn.addEventListener("click", handleLogout);
}
if (registerBtn) {
  registerBtn.addEventListener("click", handleRegister);
}

if (showRegisterBtn) {
  showRegisterBtn.onclick = () => {
    loggedOutState.style.display = "none";
    registerState.style.display = "block";
  };
}

if (showLoginBtn) {
  showLoginBtn.onclick = () => {
    registerState.style.display = "none";
    loggedOutState.style.display = "block";
  };
}


if (continueStudyBtn) {
  continueStudyBtn.onclick = () => {
    const token = sessionStorage.getItem("accessToken");
    const user = sessionStorage.getItem("user");

    const isLoggedIn = Boolean(token && user);

    if (!isLoggedIn) {
      homeLoginCard?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      loginEmail?.focus();
      return;
    }

    gotoPage("notes");
  };
}


document.querySelectorAll("[data-password-target]").forEach((button) => {
  button.onclick = () => {
    const input = document.getElementById(
      button.dataset.passwordTarget
    );

    if (!input) return;

    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";

    button.textContent = showPassword ? "👁️" : "🙈";
    button.setAttribute(
      "aria-label",
      showPassword ? "Hide password" : "Show password"
    );
    button.setAttribute(
      "title",
      showPassword ? "Hide password" : "Show password"
    );
  };
});




    if (passwordToggle && loginPassword) {
      passwordToggle.onclick = () => {
        if (loginPassword.type === "password") {
          loginPassword.type = "text";

          passwordToggle.textContent = "👁️";
          passwordToggle.setAttribute("aria-label", "Hide password");
          passwordToggle.setAttribute("title", "Hide password");
        } else {
          loginPassword.type = "password";

          passwordToggle.textContent = "🙈";
          passwordToggle.setAttribute("aria-label", "Show password");
          passwordToggle.setAttribute("title", "Show password");
        }
      };
    }

    // Hero button -> notes page
    if (heroGetStarted) {
      heroGetStarted.onclick = () => gotoPage("notes");
    }

    // File pick
    pickFile.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      if(e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      fileInput.value = '';
    };

    // Drag & drop
    ['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, (e)=>{ e.preventDefault(); dropZone.classList.remove('dragover'); }));
    dropZone.addEventListener('drop', (e) => {
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if(f) handleFile(f);
    });

    // Create new subject
    createSubjectBtn.onclick = () => {
      const name = prompt('Enter new subject/folder name:');
      if(name){ state.subjects.add(name); renderChatSubjects(); renderTestSubjectOptions(); renderProfileSubjects(); showToast('Subject created: ' + name); }
    };

    // Chat tabs
    chatTabs.forEach(t => {
      t.onclick = () => {
        chatTabs.forEach(x => x.classList.toggle('active', x===t));
        state.chatMode = t.dataset.mode;
        subjectChooser.style.display = (state.chatMode==='subject') ? 'block' : 'none';
      };
    });

    // Send chat
    sendBtn.onclick = sendChat;
    chatInput.addEventListener('keydown', (e) => { if(e.key==='Enter') sendChat(); });

    // Test options
    testMode.addEventListener('change', () => {
      testSubject.style.display = testMode.value === 'single' ? 'inline-block' : 'none';
    });
    genTest.onclick = generateTest;

    // Export notes
    exportNotes.onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.notes, null, 2));
      const dl = document.createElement('a');
      dl.href = dataStr; dl.download = 'studyguru_notes.json';
      dl.click();
    };

    genKeywordsAll.onclick = () => {
      const k = generateKeywordsForAll();
      alert('Top keywords (combined):\n\n' + k.join(', '));
    };

    shortNotesAll.onclick = () => {
      const summary = generateShortNotesAll();
      showModal('Short Notes (All Subjects)', summary);
    };
  }

  // ========== File handling ==========
  function handleFile(file){
    const subject = subjectSelect.value || 'Other';
    const id = 'n_' + Date.now();
    const entry = { id, name:file.name, subject, type: file.name.toLowerCase().endsWith('.txt') ? 'txt' : 'pdf', size:file.size, uploadedAt: Date.now() };
    if(entry.type === 'txt'){
      const reader = new FileReader();
      reader.onload = (ev) => {
        entry.content = ev.target.result;
        state.notes.push(entry);
        state.subjects.add(subject);
        saveNotes(); renderNotesList(); renderChatSubjects(); renderTestSubjectOptions(); renderProfileSubjects(); updateProgress();
        showToast('TXT uploaded & parsed: ' + file.name);
      };
      reader.readAsText(file);
    } else {
      // PDF: we store metadata only (can't parse without libs)
      state.notes.push(entry);
      state.subjects.add(subject);
      saveNotes(); renderNotesList(); renderChatSubjects(); renderTestSubjectOptions(); renderProfileSubjects(); updateProgress();
      showToast('PDF uploaded (preview only): ' + file.name);
    }
  }

  function renderNotesList(){
    notesContainer.innerHTML = '';
    if(state.notes.length === 0){
      notesContainer.innerHTML = '<div style="color:var(--muted)">No notes yet. Upload TXT or PDF files to get started.</div>';
      return;
    }
    state.notes.slice().reverse().forEach(n => {
      const div = document.createElement('div');
      div.className='note-item';
      div.innerHTML = `
        <div style="display:flex;align-items:center;">
          <div class="subject-tag">${escapeHtml(n.subject)}</div>
          <div>
            <div style="font-weight:700">${escapeHtml(n.name)}</div>
            <div style="font-size:12px;color:var(--muted)">${n.type.toUpperCase()} • ${new Date(n.uploadedAt).toLocaleString()}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="smallbtn" data-id="${n.id}" data-action="keywords">Keywords</button>
          <button class="smallbtn" data-id="${n.id}" data-action="short" style="background:var(--accent-2)">Short</button>
          <button style="padding:6px 8px;border-radius:8px;background:#F3F4F6;border:0;color:#374151" data-id="${n.id}" data-action="delete">Delete</button>
        </div>
      `;
      notesContainer.appendChild(div);
      // attach buttons
      div.querySelector('[data-action="keywords"]').onclick = () => {
        const k = generateKeywords(n);
        showModal('Keywords — ' + n.name, k.join(', '));
      };
      div.querySelector('[data-action="short"]').onclick = () => {
        const s = makeShortNotes(n);
        showModal('Short Notes — ' + n.name, s);
      };
      div.querySelector('[data-action="delete"]').onclick = () => {
        if(confirm('Delete note: ' + n.name + '?')){
          state.notes = state.notes.filter(x => x.id !== n.id);
          saveNotes(); renderNotesList(); renderChatSubjects(); renderTestSubjectOptions(); renderProfileSubjects(); updateProgress();
          showToast('Deleted: ' + n.name);
        }
      };
    });
  }

  // ========== Chat: basic client-only "AI" behaviors ==========
  function renderChatSubjects(){
    // populate chatSubject select
    chatSubject.innerHTML = '';
    Array.from(state.subjects).sort().forEach(s => {
      const opt = document.createElement('option'); opt.value = s; opt.textContent = s;
      chatSubject.appendChild(opt);
    });
  }

  function sendChat(){
    const q = chatInput.value.trim();
    if(!q) return;

    // Append user's message
    appendMessage(q, 'user');
    chatInput.value = '';

    // Append a loader for AI's response
    appendMessage('...', 'ai', true);
    const loaderMsg = messagesEl.lastElementChild;

    // Determine the prompt based on chat mode
    let prompt;
    let mode;
    let notesContent = "";
    if (state.chatMode === "all") {

      notesContent = state.notes
          .filter(n => n.type === "txt" && n.content)
          .map(n => n.content)
          .join("\n\n");

      if (!notesContent) {
          if (loaderMsg) loaderMsg.remove();
          appendMessage("No TXT notes found. Upload TXT files first.", "ai");
          return;
      }

      prompt = q;
      mode = "notes";
  }else if (state.chatMode === "subject") {

    const subj = chatSubject.value;

    notesContent = state.notes
        .filter(n => n.subject === subj && n.type === "txt" && n.content)
        .map(n => n.content)
        .join("\n\n");

    if (!notesContent) {
        if (loaderMsg) loaderMsg.remove();
        appendMessage(`No TXT notes found for "${subj}".`, "ai");
        return;
    }

    prompt = q;
    mode = "notes";
}else { // global mode
        prompt = q;
        mode = 'global';
    }

    // Send the prompt to the backend server


    apiRequest("/api/v1/chat", {
      method: "POST",
      body: JSON.stringify({
          prompt,
          mode,
          notesContent
      })
  })
  .then(data => {
      if (loaderMsg) loaderMsg.remove();

      if (data.success) {
          appendMessage(data.data.reply, "ai");
      } else {
          appendMessage(
              data.message || "Sorry, something went wrong.",
              "ai"
          );
      }

      messagesEl.scrollTop = messagesEl.scrollHeight;
  })
  .catch(error => {
      if (loaderMsg) loaderMsg.remove();

      console.error("Chat error:", error);

      appendMessage(
          error.message || "Sorry, an error occurred while connecting to the server.",
          "ai"
      );
  });
}

  function appendMessage(text, who='ai', isLoader=false){
    const d = document.createElement('div');
    d.className = 'msg ' + (who==='user' ? 'user' : 'ai');
    d.innerHTML = isLoader ? '<span class="loader"></span> Generating...' : escapeHtml(text).replace(/\n/g,'<br/>');
    messagesEl.appendChild(d);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ========== Notes utilities: keywords & short notes ==========
  function tokenize(text){
    return text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>2 && !stopwords[w]);
  }
  const stopwords = {
    'the':1,'and':1,'for':1,'with':1,'that':1,'this':1,'from':1,'your':1,'are':1,'using':1,'use':1,'also':1,'have':1,'which':1,'such':1,'into':1,'there':1
  };

  function generateKeywords(note){
    if(note.type !== 'txt' || !note.content) return ['(no parsable text)'];
    const tok = tokenize(note.content);
    const freq = {};
    tok.forEach(w => freq[w] = (freq[w]||0)+1);
    const arr = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
    return arr.slice(0,12);
  }

  function generateKeywordsForAll(){
    const pool = state.notes.filter(n=>n.type==='txt' && n.content).map(n=>n.content).join(' ');
    if(!pool) return ['(no parsable txt notes)'];
    const tok = tokenize(pool);
    const freq = {};
    tok.forEach(w => freq[w] = (freq[w]||0)+1);
    const arr = Object.keys(freq).sort((a,b)=>freq[b]-freq[a]);
    return arr.slice(0,18);
  }

  function makeShortNotes(note){
    if(note.type !== 'txt' || !note.content) return '(no parsable text in this note)';
    // create a summary of top 4 sentences by heuristic (sentence length + keyword hits)
    const sents = note.content.split(/[.?!]\s+/).map(s=>s.trim()).filter(Boolean);
    const keywords = generateKeywords(note);
    const scored = sents.map(s=>{
      const score = keywords.reduce((acc,k)=> acc + (s.toLowerCase().includes(k) ? 2 : 0), 0) + Math.min(4, s.length/60);
      return {s,score};
    }).sort((a,b)=>b.score-a.score);
    return scored.slice(0,5).map(x=>x.s).join('.\n\n') + '.';
  }

  function generateShortNotesAll(){
    const pool = state.notes.filter(n=>n.type==='txt' && n.content).map(n=>n.content).join('\n\n');
    if(!pool) return '(no parsable txt notes)';
    return makeShortTextSummary(pool, 8);
  }

  function makeShortTextSummary(text, maxSentences=6){
    const sents = text.split(/[.?!]\s+/).map(s=>s.trim()).filter(Boolean);
    if(sents.length <= maxSentences) return sents.join('.\n\n') + '.';
    // score sentences by word frequency
    const tok = tokenize(text);
    const freq = {};
    tok.forEach(w => freq[w] = (freq[w]||0)+1);
    const scored = sents.map(s => {
      const words = tokenize(s);
      const score = words.reduce((a,w)=>a+(freq[w]||0),0) / Math.max(1, Math.sqrt(s.length));
      return {s,score};
    }).sort((a,b)=>b.score-a.score);
    return scored.slice(0,maxSentences).map(x=>x.s).join('.\n\n') + '.';
  }

  // ========== Test generator (simple MCQ from sentences) ==========
  function renderTestSubjectOptions(){
    testSubject.innerHTML = '';
    const subjectsArr = Array.from(state.subjects).sort();
    subjectsArr.forEach(s => {
      const o = document.createElement('option'); o.value = s; o.textContent = s;
      testSubject.appendChild(o);
    });
    // show/hide depending on mode
    testSubject.style.display = testMode.value==='single' ? 'inline-block' : 'none';
  }

  function generateTest(){
    testArea.innerHTML = '';
    const mode = testMode.value;
    const qtype = document.getElementById('qType').value;
    let poolNotes = state.notes.filter(n => n.type === 'txt' && n.content);
    if(mode === 'single'){
      const subj = testSubject.value;
      poolNotes = poolNotes.filter(n => n.subject === subj);
    }
    if(poolNotes.length === 0){
      testArea.innerHTML = '<div style="color:var(--muted)">No TXT notes available for selected mode. Upload TXT notes to create tests.</div>';
      return;
    }
    // create simple questions by taking sentences and making fill-in-the-blank
    const sentences = [];
    poolNotes.forEach(n => {
      const sents = n.content.split(/[.?!]\s+/).map(s=>s.trim()).filter(Boolean);
      sents.forEach(s => { if(s.split(' ').length > 5) sentences.push({text:s,source:n.subject}); });
    });
    if(sentences.length === 0){
      testArea.innerHTML = '<div style="color:var(--muted)">Not enough sentence data to generate questions.</div>';
      return;
    }
    // build 5 questions
    const qcount = Math.min(7, Math.floor(sentences.length/1));
    const selected = shuffleArray(sentences).slice(0,qcount);
    const form = document.createElement('div');
    form.innerHTML = `<div style="margin-bottom:12px">Generated ${qcount} question(s). Answer and submit to see score.</div>`;
    const qforms = [];
    selected.forEach((sObj, idx) => {
      const qDiv = document.createElement('div');
      qDiv.className = 'question';
      if(qtype === 'mcq'){
        // pick a candidate keyword to remove
        const words = sObj.text.split(/\s+/).filter(w => w.length>4);
        const key = words[Math.floor(Math.random()*words.length)];
        const blanked = sObj.text.replace(new RegExp('\\b'+escapeRegExp(key)+'\\b','i'),'_____');
        // fake options: include correct + 3 distractors from keywords pool
        const poolKeys = generateKeywordsForAll();
        const opts = [key];
        // pick distractors
        while(opts.length < 4){
          const cand = poolKeys[Math.floor(Math.random()*poolKeys.length)];
          if(cand && opts.indexOf(cand) === -1) opts.push(cand);
          if(poolKeys.length < 4) break;
        }
        const shuffledOpts = shuffleArray(opts);
        let optionsHTML = '<div class="choices">';
        shuffledOpts.forEach((op,i) => {
          optionsHTML += `<label class="choice"><input type="radio" name="q${idx}" value="${escapeHtml(op)}"> ${escapeHtml(op)}</label>`;
        });
        optionsHTML += '</div>';
        qDiv.innerHTML = `<div style="font-weight:700">Q${idx+1}. ${escapeHtml(blanked)}</div>${optionsHTML}`;
        qforms.push({type:'mcq',answer:key});
      } else {
        // short answer: ask to summarize or answer the sentence topic
        qDiv.innerHTML = `<div style="font-weight:700">Q${idx+1}. In one sentence, explain: "${escapeHtml(sObj.text.slice(0,120))}..."</div><textarea name="q${idx}" rows="3" style="width:100%;margin-top:8px;padding:8px;border-radius:8px;border:1px solid #E6E9EE"></textarea>`;
        qforms.push({type:'short',answer: sObj.text});
      }
      form.appendChild(qDiv);
    });
    const submit = document.createElement('button'); submit.className='smallbtn'; submit.textContent='Submit Test';
    submit.onclick = () => {
      // grade
      let score = 0; let total = qforms.length;
      qforms.forEach((qf, i) => {
        if(qf.type === 'mcq'){
          const sel = form.querySelector(`input[name=q${i}]:checked`);
          if(sel && sel.value && sel.value.toLowerCase() === (qf.answer||'').toLowerCase()) score++;
        } else {
          const val = (form.querySelector(`textarea[name=q${i}]`) || {}).value || '';
          // naive grading: if val shares a keyword with answer
          const key = tokenize(qf.answer).slice(0,3);
          const tok = tokenize(val).slice(0,10);
          if(key.some(k=>tok.includes(k))) score++;
        }
      });
      const percent = Math.round((score/total)*100);
      testArea.innerHTML = `<div style="font-weight:800">Result: ${score}/${total} (${percent}%)</div><div style="margin-top:8px;color:var(--muted)">This is a client-side generated test. For adaptive assessments, connect a backend.</div>`;
      updateProgressAfterTest(percent);
    };
    form.appendChild(submit);
    testArea.appendChild(form);
  }

  function updateProgressAfterTest(percent){
    // naive progress: average previous percent and new percent
    const prev = parseInt(progressBar.style.width || 0);
    const newp = Math.min(100, Math.round(((prev || 0) + percent) / 2));
    progressBar.style.width = newp + '%';
    progressText.textContent = newp + '% complete';
    showToast('Test completed — ' + percent + '% score');
  }

  // ========== Profile rendering ==========
  function renderProfileSubjects(){
    profileSubjects.innerHTML = '';
    const subjArr = Array.from(state.subjects).sort();
    subjArr.forEach(s => {
      const notesFor = state.notes.filter(n => n.subject === s);
      const div = document.createElement('div');
      div.style.display='flex';div.style.alignItems='center';div.style.justifyContent='space-between';div.style.padding='8px';div.style.borderBottom='1px solid #F3F4F6';
      div.innerHTML = `<div><div style="font-weight:700">${escapeHtml(s)}</div><div style="font-size:12px;color:var(--muted)">${notesFor.length} note(s)</div></div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="smallbtn" data-sub="${escapeHtml(s)}" data-act="keywords">Keywords</button>
          <button class="smallbtn" style="background:var(--accent-2)" data-sub="${escapeHtml(s)}" data-act="short">Short</button>
        </div>`;
      profileSubjects.appendChild(div);
      div.querySelector('[data-act="keywords"]').onclick = () => {
        // combine notes of subject and show keywords
        const content = state.notes.filter(n=>n.subject===s && n.type==='txt' && n.content).map(n=>n.content).join(' ');
        if(!content) return showToast('No parsable txt notes for ' + s);
        const tmpNote = {content};
        showModal('Keywords — ' + s, generateKeywordsForAllFromText(content).join(', '));
      };
      div.querySelector('[data-act="short"]').onclick = () => {
        const content = state.notes.filter(n=>n.subject===s && n.type==='txt' && n.content).map(n=>n.content).join(' ');
        if(!content) return showToast('No parsable txt notes for ' + s);
        showModal('Short Notes — ' + s, makeShortTextSummary(content, 6));
      };
    });
  }

  function generateKeywordsForAllFromText(text){
    const tok = tokenize(text);
    const freq = {};
    tok.forEach(w => freq[w] = (freq[w]||0)+1);
    return Object.keys(freq).sort((a,b)=>freq[b]-freq[a]).slice(0,12);
  }


function updateProgress() {
  // Do not update the Home dashboard while logged out.
  const isLoggedIn = Boolean(
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("user")
  );

  if (!isLoggedIn) {
    if (progressPercent) progressPercent.textContent = "0%";
    if (progressBar) progressBar.style.width = "0%";
    return;
  }

  // Keep legacy notes progress separate from Home dashboard.
  // Home progress is managed by loadDashboardData().
}


  async function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
      loginMessage.textContent = "Please enter email and password.";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {
      const data = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password
        })
      });

      sessionStorage.setItem("accessToken", data.data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.data.user));

      updateHomeAuthState();

      await loadDashboardData();



      loginMessage.textContent = "Login successful.";
      loginMessage.style.color = "green";

      console.log("Logged in user:", data.data.user);

    } catch (error) {
      loginMessage.textContent = error.message;
      loginMessage.style.color = "red";
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  }


async function handleRegister() {
  const fullName = document.getElementById("registerFullName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("registerConfirmPassword").value;
  const registerBtn = document.getElementById("registerBtn");
  const registerMessage = document.getElementById("registerMessage");

  if (!fullName || !email || !password || !confirmPassword) {
    registerMessage.textContent = "Please fill in all fields.";
    registerMessage.style.color = "red";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.textContent = "Passwords do not match.";
    registerMessage.style.color = "red";
    return;
  }

  registerBtn.disabled = true;
  registerBtn.textContent = "Creating account...";
  registerMessage.textContent = "";

  try {
    const response = await apiRequest("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password })
    });

    registerMessage.textContent =
      response.message || "Account created successfully.";
    registerMessage.style.color = "green";

    // Switch back to Login after successful registration.
    document.getElementById("registerState").style.display = "none";
    document.getElementById("loggedOutState").style.display = "block";

    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";

    document.getElementById("loginMessage").textContent =
      "Account created. Please sign in.";
    document.getElementById("loginMessage").style.color = "green";

  } catch (error) {
    registerMessage.textContent =
      error.message || "Unable to create your account.";
    registerMessage.style.color = "red";
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = "Create account";
  }
}



function updateHomeAuthState() {
  const token = sessionStorage.getItem("accessToken");
  const userData = sessionStorage.getItem("user");

  const isLoggedIn = Boolean(token && userData);

  if (isLoggedIn) {
    let user = {};

    try {
      user = JSON.parse(userData);
    } catch (error) {
      console.error("Invalid stored user data:", error);
    }

    loggedOutState.style.display = "none";
    loggedInState.style.display = "block";

    if (welcomeUserName) {
      welcomeUserName.textContent =
        `Welcome back, ${user.fullName || "Student"} 👋`;
    }

    // Load real analytics only after login.
    loadDashboardData();
    return;
  }

  // Logged-out state
  loggedOutState.style.display = "block";
  loggedInState.style.display = "none";

  if (progressPercent) progressPercent.textContent = "0%";
  if (progressBar) progressBar.style.width = "0%";

  if (continueCourseTitle) {
    continueCourseTitle.textContent = "Sign in to track your progress";
  }

  if (progressDescription) {
    progressDescription.textContent =
      "Your study time, documents, quizzes and flashcards will appear here.";
  }

  if (continueStudyBtn) {
    continueStudyBtn.textContent = "Sign in to view progress →";
  }

  if (studyTimeValue) studyTimeValue.textContent = "0h 0m";
  if (documentCountValue) documentCountValue.textContent = "0";
  if (quizCountValue) quizCountValue.textContent = "0";
  if (flashcardCountValue) flashcardCountValue.textContent = "0";
}


  async function handleLogout() {
    try {
      await apiRequest("/api/v1/auth/logout", {
        method: "POST"
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("user");
      updateHomeAuthState();

      if (authNavLink) {
        authNavLink.textContent = "Login";
        authNavLink.dataset.page = "auth";
      }

      if (loginEmail) loginEmail.value = "";
      if (loginPassword) loginPassword.value = "";
      if (loginMessage) {
        loginMessage.textContent = "Logged out successfully.";
        loginMessage.style.color = "green";
      }

      console.log("User logged out");
    }
  }


async function loadDashboardData() {
  if (
    !sessionStorage.getItem("accessToken") ||
    !sessionStorage.getItem("user")
  ) {
    return;
  }

  try {
    const response = await apiRequest("/api/v1/analytics");
    const analytics = response.data;

    // Update dashboard statistics
    if (documentCountValue) {
      documentCountValue.textContent = analytics.totalDocuments ?? 0;
    }

    if (quizCountValue) {
      quizCountValue.textContent = analytics.completedQuizzes ?? 0;
    }

    if (flashcardCountValue) {
      flashcardCountValue.textContent = analytics.totalFlashcards ?? 0;
    }

    if (studyTimeValue) {
      const totalSeconds = Number(analytics.totalStudyTime) || 0;
      const totalMinutes = Math.floor(totalSeconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      studyTimeValue.textContent = `${hours}h ${minutes}m`;
    }

    const weeklyGoalSeconds = 5 * 60 * 60;

const weeklySeconds = Number(analytics.weeklyStudyTime) || 0;

const weeklyProgress = Math.min(
  100,
  Math.round((weeklySeconds / weeklyGoalSeconds) * 100)
);

if (progressPercent) {
  progressPercent.textContent = `${weeklyProgress}%`;
}

if (progressBar) {
  progressBar.style.width = `${weeklyProgress}%`;
}

if (continueCourseTitle) {
  continueCourseTitle.textContent = "Your weekly study goal";
}

if (progressDescription) {
  progressDescription.textContent =
    "Build a consistent study habit, one session at a time.";
}

if (continueStudyBtn) {
  continueStudyBtn.textContent = "Continue studying →";
}


  } catch (error) {
    console.error("Dashboard analytics error:", error);
  }
}


  // ========== Utilities ==========
  function showToast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(()=> toastEl.classList.remove('show'), 3000);
  }

  function showModal(title, body){
    // simple modal using window.open
    const w = window.open('', '_blank', 'width=600,height=600,scrollbars=yes');
    w.document.title = title;
    const style = `<style>body{font-family:Inter,Arial;padding:18px;color:#0F172A;}h2{font-family:Inter;margin-top:0}pre{white-space:pre-wrap;background:#F8FAFC;padding:12px;border-radius:8px;border:1px solid #EEF2FF}</style>`;
    w.document.body.innerHTML = `<h2>${escapeHtml(title)}</h2><pre>${escapeHtml(body)}</pre>`;
    w.document.head.innerHTML = style;
  }

  function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
  function shuffleArray(a){ return a.sort(()=>Math.random()-0.5); }
  function escapeRegExp(string) { return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Quick simple global keywords grader used in tests
  function generateKeywordsForAll(){
    const pool = state.notes.filter(n=>n.type==='txt' && n.content).map(n=>n.content).join(' ');
    if(!pool) return [];
    return generateKeywordsForAllFromText(pool);
  }

  return { init };
})();

// Start app
App.init();
