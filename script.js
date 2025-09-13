/* ========== Simple client-only "app" for Study Guru ========== */
/* Persistence: localStorage usage for uploaded notes metadata & parsed txt content.
   Notes structure: [{id,name,subject,type('txt'|'pdf'),content(optional for txt),size,uploadedAt}] */

   const App = (function(){
    // DOM
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
    const progressBar = document.getElementById('progressBar');
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
  
    function gotoPage(page){
      // toggle active nav
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.page === page));
      // hide all pages and show target
      document.querySelectorAll('.pages').forEach(p => p.classList.add('hide'));
      const el = document.getElementById('page-' + page);
      if(el) el.classList.remove('hide');
      // small helpers
      if(page === 'notes'){ /* focus upload area */ }
      if(page === 'chat'){ chatInput.focus(); }
    }
  
    function bindEvents(){
      // Hero button -> notes page
      heroGetStarted.onclick = () => gotoPage('notes');
  
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
      appendMessage(q,'user');
      chatInput.value = '';
      // simulate AI generation with loader
      appendMessage('...', 'ai', true);
      const loaderMsg = messagesEl.lastElementChild;
      // Determine mode
      const mode = state.chatMode;
      setTimeout(() => {
        // remove loader
        if(loaderMsg) loaderMsg.remove();
        let answer = '';
        if(mode === 'global'){
          answer = generateGlobalAnswer(q);
        } else if(mode === 'all'){
          answer = generateFromNotes(q, null);
        } else {
          const subj = chatSubject.value;
          answer = generateFromNotes(q, subj);
        }
        appendMessage(answer, 'ai');
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }, 800 + Math.random()*800);
    }
  
    function appendMessage(text, who='ai', isLoader=false){
      const d = document.createElement('div');
      d.className = 'msg ' + (who==='user' ? 'user' : 'ai');
      d.innerHTML = isLoader ? '<span class="loader"></span> Generating...' : escapeHtml(text).replace(/\n/g,'<br/>');
      messagesEl.appendChild(d);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
  
    // Basic global answer (placeholder simulation)
    function generateGlobalAnswer(q){
      return `Global answer (simulated):\n\nQ: ${q}\n\nLejend, this is a simulated global explanation — connect a backend to use real APIs. Meanwhile, try switching to "All Notes" or "Subject Specific" mode to answer from your uploaded notes.`;
    }
  
    // Generate answer using uploaded notes (very simple heuristics)
    function generateFromNotes(q, subject=null){
      // Gather text from relevant notes
      const pool = state.notes.filter(n => n.type === 'txt' && (subject === null || n.subject === subject));
      if(pool.length === 0) return `No TXT notes found${subject ? ' for subject ' + subject : ''}. Upload TXT files to enable notes-powered answers.`;
      // naive search: find sentences containing any keyword from query
      const qWords = q.toLowerCase().split(/\W+/).filter(Boolean);
      let matches = [];
      pool.forEach(n => {
        const sents = n.content.split(/[.?!]\s+/).map(s => s.trim()).filter(Boolean);
        sents.forEach(s => {
          const lw = s.toLowerCase();
          if(qWords.some(w => lw.includes(w))) matches.push({text:s,source:n.name});
        });
      });
      // if found, return combined
      if(matches.length){
        const top = matches.slice(0,4).map(m => `• ${m.text} (${m.source})`).join('\n\n');
        return `Found relevant points from your notes:\n\n${top}\n\n(Use "Make Short Notes" or "Generate Keywords" for summaries)`;
      }
      // fallback: summary from pooled text
      const combined = pool.map(p=>p.content).join('\n\n');
      const short = makeShortTextSummary(combined, 4);
      return `Couldn't find exact sentence. Here's a short summary from your notes:\n\n${short}`;
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
  
    function updateProgress(){
      // simple progress: percent = min(100, notes_count * 10)
      const pct = Math.min(100, state.notes.length * 10);
      progressBar.style.width = pct + '%';
      progressText.textContent = pct + '% complete';
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