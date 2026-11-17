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
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Let the browser set multipart boundaries for FormData.
  if (isFormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers
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
  // Login Required Modal
const loginRequiredModal = document.getElementById("loginRequiredModal");
const loginRequiredBtn = document.getElementById("loginRequiredBtn");
const loginRequiredCancel = document.getElementById("loginRequiredCancel");
const loginRequiredClose = document.getElementById("loginRequiredClose");

function closeLoginRequiredModal() {
  if (loginRequiredModal) {
    loginRequiredModal.hidden = true;
  }
}
function showLoginRequiredModal() {
  if (loginRequiredModal) {
    loginRequiredModal.hidden = false;
  }
}

if (loginRequiredBtn) {
  loginRequiredBtn.addEventListener("click", () => {
    closeLoginRequiredModal();

    gotoPage("home");

    registerState.style.display = "none";
    loggedOutState.style.display = "block";

    homeLoginCard?.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    setTimeout(() => loginEmail?.focus(), 300);
  });
}

loginRequiredCancel?.addEventListener("click", closeLoginRequiredModal);
loginRequiredClose?.addEventListener("click", closeLoginRequiredModal);

loginRequiredModal?.addEventListener("click", (event) => {
  if (event.target === loginRequiredModal) {
    closeLoginRequiredModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && loginRequiredModal && !loginRequiredModal.hidden) {
    closeLoginRequiredModal();
  }
});
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
  const manageSubjectsBtn = document.getElementById('manageSubjects');
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
  
    // Study Tools
    const studyToolsDocumentSelect = document.getElementById(
      "studyToolsDocumentSelect"
    );

    const studyToolsResult = document.getElementById("studyToolsResult");
    let studyToolsRequestPending = false;
let studyToolsScrollPending = false;

    const studyToolButtons = document.querySelectorAll(
      "[data-study-tool]"
    );

  const progressText = document.getElementById('progressText');
  const exportNotes = document.getElementById('exportNotes');
  const genKeywordsAll = document.getElementById('genKeywordsAll');
  const shortNotesAll = document.getElementById('shortNotesAll');
  const pickSubjectCreate = subjectSelect; // same element
  const toastEl = document.getElementById('toast');

  function getSubjectsKey() {
    try {
      const user = JSON.parse(
        sessionStorage.getItem("user") || "null"
      );
  
      const userId = user?._id || user?.id || user?.email;
  
      return userId
        ? `studyguru_subjects_${encodeURIComponent(userId)}`
        : null;
    } catch {
      return null;
    }
  }
  
  function loadSubjects() {
    const key = getSubjectsKey();
    if (!key) return [];
  
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Failed to load subjects:", error);
      return [];
    }
  }
  
  function saveSubjects() {
    const key = getSubjectsKey();
    if (!key) return;
  
    localStorage.setItem(
      key,
      JSON.stringify([...state.subjects])
    );
  }
  let activeUploadController = null;

  let state = {
    notes: loadNotes(),
    chatMode: 'global',
    subjects: new Set(),
    serverSubjects: new Set(),
    studyToolDocuments: [],
  };

  // Init

function init() {
  
// Restore private Notes data only for authenticated users.
const isLoggedIn = Boolean(
  sessionStorage.getItem("accessToken") &&
  sessionStorage.getItem("user")
);

if (!isLoggedIn) {
  state.notes = [];
  state.subjects = new Set();
  state.serverSubjects.clear();

  // Remove unscoped browser caches to prevent account data leakage.
  localStorage.removeItem(notesKey);
  
} else {
  [
    "Computer",
    "Science",
    "Math",
    "Other",
    ...loadSubjects()
  ].forEach(subject => state.subjects.add(subject));

  state.notes.forEach(note => {
    if (note.subject) state.subjects.add(note.subject);
  });
}

  renderNav();
  bindEvents();
  renderUploadSubjectOptions();
  renderNotesList();
  renderChatSubjects();
  renderTestSubjectOptions();
  renderProfileSubjects();

    // Restore authentication UI after page reload
updateHomeAuthState();

// Reload server documents when a valid login session exists.
if (
  sessionStorage.getItem("accessToken") &&
  sessionStorage.getItem("user")
) {
  loadServerDocuments();
} else {
  state.studyToolDocuments = [];
  renderStudyToolsDocumentOptions();
}

updateProgress();

const savedPage = sessionStorage.getItem("currentPage") || "home";

gotoPage(savedPage);
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
    const previousPage = sessionStorage.getItem("currentPage");

if (
  previousPage === "study-tools" &&
  page !== "study-tools" &&
  studyToolsRequestPending
) {
  studyToolsScrollPending = true;
}
    sessionStorage.setItem("currentPage", page);



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
    // Scroll to Study Tools content when returning to the page.
if (page === "study-tools" && studyToolsScrollPending) {
  studyToolsScrollPending = false;

  scrollToStudyToolsResult();
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

  // Home feature cards -> navigate to their target pages
  document.querySelectorAll(".feature-card[data-page-target]").forEach((card) => {
    card.addEventListener("click", () => {
      const targetPage = card.dataset.pageTarget;
      gotoPage(targetPage);
    });
  });


document.querySelectorAll(".chat-suggestion").forEach(button => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;
    if (!prompt) return;

    chatInput.value = prompt;
    chatInput.focus();
  });
});

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

    // File pick — authentication protected
function openFilePicker() {
  const isLoggedIn = Boolean(
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("user")
  );

  if (!isLoggedIn) {
    showLoginRequiredModal();
    return;
  }

  fileInput.click();
}

pickFile.onclick = openFilePicker;

document.getElementById("notesChooseFile")?.addEventListener(
  "click",
  openFilePicker
);

fileInput.onchange = (e) => {
  if (e.target.files && e.target.files[0]) {
    handleFile(e.target.files[0]);
  }

  fileInput.value = "";
};


    // Notes search and subject filter
    const notesSearch = document.getElementById("notesSearch");
    const notesSubjectFilter = document.getElementById("notesSubjectFilter");

    notesSearch?.addEventListener("input", () => {
      renderNotesList();
    });

    notesSubjectFilter?.addEventListener("change", () => {
      renderNotesList();
    });



    // Drag & drop
    ['dragenter','dragover'].forEach(ev => dropZone.addEventListener(ev, (e)=>{ e.preventDefault(); dropZone.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(ev => dropZone.addEventListener(ev, (e)=>{ e.preventDefault(); dropZone.classList.remove('dragover'); }));
    dropZone.addEventListener('drop', (e) => {
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if(f) handleFile(f);
    });


    // Create new subject
    createSubjectBtn.onclick = () => {
      if (
        !sessionStorage.getItem("accessToken") ||
        !sessionStorage.getItem("user")
      ) {
        showLoginRequiredModal();
        return;
      }
    
      const name = prompt("Enter new subject/folder name:");
      if (!name) return;

      const subject = name.trim();
      if (!subject) return;

      const existing = [...state.subjects].find(
        item => item.toLowerCase() === subject.toLowerCase()
      );

      if (existing) {
        showToast("Subject already exists: " + existing);
        return;
      }

      state.subjects.add(subject);
      saveSubjects();

      renderUploadSubjectOptions();
      renderNotesList();
      renderChatSubjects();
      renderTestSubjectOptions();
      renderProfileSubjects();

      showToast("Subject created: " + subject);
    };

    // Manage and delete custom folders
manageSubjectsBtn.onclick = async () => {
  if (
    !sessionStorage.getItem("accessToken") ||
    !sessionStorage.getItem("user")
  ) {
    showLoginRequiredModal();
    return;
  }

  const defaultSubjects = [
    "Computer",
    "Science",
    "Math",
    "Other"
  ];

  const customSubjects = [...state.subjects]
    .filter(subject => !defaultSubjects.includes(subject))
    .sort((a, b) => a.localeCompare(b));

  if (customSubjects.length === 0) {
    showToast("No custom folders available to delete.");
    return;
  }

  const folderList = customSubjects
    .map((subject, index) => `${index + 1}. ${subject}`)
    .join("\n");

  const choice = prompt(
    `Select a custom folder to delete:\n\n${folderList}\n\nEnter folder number:`
  );

  if (choice === null) return;

  const selectedIndex = Number(choice) - 1;

  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= customSubjects.length
  ) {
    showToast("Invalid folder selection.");
    return;
  }

  const folder = customSubjects[selectedIndex];

  const documents = state.studyToolDocuments.filter(
    doc => doc.subject === folder
  );

  let destination = null;

  if (documents.length > 0) {
    const availableSubjects = [...state.subjects]
      .filter(subject => subject !== folder)
      .sort((a, b) => a.localeCompare(b));

    if (availableSubjects.length === 0) {
      showToast("Create another folder before deleting this folder.");
      return;
    }

    const destinationList = availableSubjects
      .map((subject, index) => `${index + 1}. ${subject}`)
      .join("\n");

    const destinationChoice = prompt(
      `This folder contains ${documents.length} document(s).\n\nMove them to:\n\n${destinationList}\n\nEnter destination folder number:`
    );

    if (destinationChoice === null) return;

    const destinationIndex = Number(destinationChoice) - 1;

    if (
      !Number.isInteger(destinationIndex) ||
      destinationIndex < 0 ||
      destinationIndex >= availableSubjects.length
    ) {
      showToast("Invalid destination selection.");
      return;
    }

    destination = availableSubjects[destinationIndex];
  }

  const confirmed = confirm(
    documents.length > 0
      ? `Delete "${folder}" and move ${documents.length} document(s) to "${destination}"?`
      : `Delete the folder "${folder}"?`
  );

  if (!confirmed) return;

  try {
    for (const doc of documents) {
      await apiRequest(`/api/v1/documents/${doc._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          subject: destination
        })
      });
    }

    state.subjects.delete(folder);
    saveSubjects();

    await loadServerDocuments();

    renderUploadSubjectOptions();
    renderNotesList();
    renderChatSubjects();
    renderTestSubjectOptions();
    renderProfileSubjects();

    showToast(`Folder "${folder}" deleted successfully.`);
  } catch (error) {
    console.error("Folder deletion error:", error);

    await loadServerDocuments();

    showToast(
      "Folder could not be fully deleted. Please check your documents."
    );
  }
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
function handleChatSend() {
  const isLoggedIn = Boolean(
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("user")
  );

  if (!isLoggedIn) {
    const loginModal = document.getElementById("loginRequiredModal");
  
    if (loginModal) {
      loginModal.hidden = false;
    }
  
    return;
  }

  sendChat();
}

sendBtn.onclick = handleChatSend;

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChatSend();
  }
});

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

    // Study Tools: document selection and generation
    if (studyToolsDocumentSelect) {
      studyToolsDocumentSelect.addEventListener("change", () => {
        const hasDocument = Boolean(studyToolsDocumentSelect.value);

        studyToolButtons.forEach((button) => {
          button.disabled = false;
        });

        if (studyToolsResult) {
          studyToolsResult.innerHTML = `
            <div class="study-tools-result-icon" aria-hidden="true">✦</div>
            <div>
              <span class="study-tools-label">YOUR WORKSPACE</span>
              <h3>${hasDocument ? "Ready to study" : "Choose a document"}</h3>
              <p>${
                hasDocument
                  ? "Choose a study tool to generate or view saved material."
                  : "Select an uploaded document to get started."
              }</p>
            </div>
          `;
        }
      });
    }

    if (studyToolsDocumentSelect) {
      studyToolsDocumentSelect.addEventListener("input", () => {
        // Button remains clickable.
        // Login and document validation happen in the click handler.
        studyToolButtons.forEach((button) => {
          button.disabled = false;
        });
      });
    }

    studyToolButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const documentId = studyToolsDocumentSelect?.value;
        const selectedTool = button.dataset.studyTool;

        // Check login first.
        const isLoggedIn = Boolean(
          sessionStorage.getItem("accessToken") &&
          sessionStorage.getItem("user")
        );

        if (!isLoggedIn) {
          showLoginRequiredModal();
          return;
        }

        // Then check document selection.
        if (!documentId || !selectedTool) {
          showToast("Please select a document first.");
          return;
        }

        const resourceMap = {
          summary: "summary",
          quiz: "quiz",
          flashcards: "flashcards",
          "short-notes": "notes",
        };

        const resource = resourceMap[selectedTool];

        if (!resource) {
          showToast("Unsupported study tool.");
          return;
        }

        await generateStudyToolResource(documentId, resource, false);
      });
    });

  }

  // ========== File handling ==========

async function handleFile(file) {
  if (!file) return;

  const token = sessionStorage.getItem("accessToken");
  const uploadController = new AbortController();
activeUploadController = uploadController;

  if (!token) {
    showLoginRequiredModal();
    return;
  }

  const subject = subjectSelect.value || "Other";
  const title = file.name.replace(/\.[^/.]+$/, "").trim().slice(0, 100);

  if (title.length < 2) {
    showToast("File name must contain at least 2 characters.");
    return;
  }

  const formData = new FormData();
  formData.append("document", file);
  formData.append("subject", subject);
  formData.append("title", title);

  try {
    showToast("Uploading and processing: " + file.name);

    const response = await apiRequest("/api/v1/documents/upload", {
      method: "POST",
      body: formData,
      signal: uploadController.signal
    });
    
    // Ignore responses belonging to an old login session.
    if (
      uploadController.signal.aborted ||
      sessionStorage.getItem("accessToken") !== token ||
      !sessionStorage.getItem("user")
    ) {
      return;
    }

    const uploadedDocument = response.data;
    console.log("[UPLOAD] Selected subject:", subject);
console.log("[UPLOAD] Saved subject:", uploadedDocument.subject);

    const extension = file.name.split(".").pop().toLowerCase();

    const entry = {
      id: uploadedDocument._id,
      name: uploadedDocument.originalFileName || file.name,
      subject,
      type: extension,
      size: file.size,
      uploadedAt: Date.now(),
      documentId: uploadedDocument._id
    };

    if (["txt", "md", "csv"].includes(extension)) {
      entry.content = await file.text();
    }

    state.notes.push(entry);
    state.subjects.add(subject);
    state.serverSubjects.add(uploadedDocument.subject || subject);
    const uploadedDocumentExists = state.studyToolDocuments.some(
      (doc) => String(doc._id) === String(uploadedDocument._id)
    );

    if (!uploadedDocumentExists) {
      state.studyToolDocuments.push(uploadedDocument);
    }

    renderStudyToolsDocumentOptions();

    if (studyToolsDocumentSelect) {
      studyToolsDocumentSelect.value = String(uploadedDocument._id);
      studyToolsDocumentSelect.dispatchEvent(new Event("change"));
    }

    saveNotes();
    renderNotesList();
    renderChatSubjects();
    renderTestSubjectOptions();
    renderProfileSubjects();
    updateProgress();

    const documentCount = document.getElementById("notesDocumentCount");
const subjectCount = document.getElementById("notesSubjectCount");

if (documentCount) {
  documentCount.textContent = state.notes.length;
}

const isLoggedIn = Boolean(
  sessionStorage.getItem("accessToken") &&
  sessionStorage.getItem("user")
);

if (subjectCount) {
  subjectCount.textContent = isLoggedIn
    ? state.subjects.size
    : 0;
}

    showToast("Document uploaded successfully: " + entry.name);
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Upload cancelled during logout.");
      return;
    }
  
    console.error("Document upload error:", error);
    showToast(error.message || "Document upload failed.");
  } finally {
    if (activeUploadController === uploadController) {
      activeUploadController = null;
    }
  }
}


function renderUploadSubjectOptions() {
  const subjectSelect = document.getElementById("subjectSelect");
  if (!subjectSelect) return;
  const isLoggedIn = Boolean(
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("user")
  );
  
  if (!isLoggedIn) {
    subjectSelect.replaceChildren();
    subjectSelect.disabled = true;
  
    
  
    return;
  }
  
  subjectSelect.disabled = false;
  
  

  const previousValue = subjectSelect.value;

  const subjects = [...new Set([
    ...Array.from(state.subjects || []),
    ...state.notes.map(note => note.subject).filter(Boolean)
  ])].sort((a, b) => a.localeCompare(b));

  subjectSelect.replaceChildren();

  subjects.forEach(subject => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectSelect.appendChild(option);
  });

  subjectSelect.value = subjects.includes(previousValue)
    ? previousValue
    : (subjects.includes("Other") ? "Other" : subjects[0] || "");
}




function renderNotesList() {
  const container = document.getElementById("notesContainer");
  if (!container) return;

  const searchInput = document.getElementById("notesSearch");
  const subjectFilter = document.getElementById("notesSubjectFilter");

  const searchTerm = (searchInput?.value || "").trim().toLowerCase();
  const selectedSubject = subjectFilter?.value || "all";

  // Update dashboard statistics
  const documentCount = document.getElementById("notesDocumentCount");
  const subjectCount = document.getElementById("notesSubjectCount");

  if (documentCount) {
    documentCount.textContent = state.notes.length;
  }

  if (subjectCount) {
    const isLoggedIn = Boolean(
      sessionStorage.getItem("accessToken") &&
      sessionStorage.getItem("user")
    );
  
    subjectCount.textContent = isLoggedIn
      ? state.subjects.size
      : 0;
  }

  // Keep subject filter options synchronized
  if (subjectFilter) {
    const previousValue = subjectFilter.value || "all";
    const subjects = [...new Set([
      ...Array.from(state.subjects || []),
      ...state.notes.map(note => note.subject).filter(Boolean)
    ])].sort((a, b) => a.localeCompare(b));



    subjectFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All subjects";
    subjectFilter.appendChild(allOption);

    subjects.forEach(subject => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      subjectFilter.appendChild(option);
    });

    subjectFilter.value = subjects.includes(previousValue)
      ? previousValue
      : "all";
  }

  const activeSubject = subjectFilter?.value || "all";

  // Search and filter documents
  const filteredNotes = state.notes
    .filter(note => {
      const matchesSearch = [
        note.name,
        note.subject,
        note.type
      ].some(value =>
        String(value || "").toLowerCase().includes(searchTerm)
      );

      const matchesSubject =
        activeSubject === "all" || note.subject === activeSubject;

      return matchesSearch && matchesSubject;
    })
    .slice()
    .reverse();

  container.replaceChildren();

  if (filteredNotes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "notes-empty-state";

    const icon = document.createElement("div");
    icon.className = "notes-empty-icon";
    icon.textContent = "▤";

    const heading = document.createElement("h4");
    const message = document.createElement("p");

    if (state.notes.length === 0) {
      heading.textContent = "Your library starts here";
      message.textContent =
        "Upload your first document to keep your study materials together.";
    } else {
      heading.textContent = "No matching documents";
      message.textContent =
        "Try another search term or select a different subject.";
    }

    empty.append(icon, heading, message);
    container.appendChild(empty);
    return;
  }

  filteredNotes.forEach(note => {
    const card = document.createElement("article");
    card.className = "note-item";

    const main = document.createElement("div");
    main.className = "note-card-main";

    const fileIcon = document.createElement("div");
    fileIcon.className =
      "note-file-icon " +
      (note.type === "pdf" ? "pdf" : "txt");
    fileIcon.textContent = note.type === "pdf" ? "PDF" : "TXT";

    const details = document.createElement("div");
    details.className = "note-card-details";

    const title = document.createElement("h4");
    title.className = "note-card-title";
    title.textContent = note.name;

    title.title = note.name;

    const meta = document.createElement("p");
    meta.className = "note-card-meta";

    const uploadedAt = note.uploadedAt
      ? new Date(note.uploadedAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric"
        })
      : "Date unavailable";

    const sizeText = Number.isFinite(note.size)
      ? note.size < 1024 * 1024
        ? `${Math.max(1, Math.round(note.size / 1024))} KB`
        : `${(note.size / (1024 * 1024)).toFixed(1)} MB`
      : "";

    meta.textContent = [
      note.type.toUpperCase(),
      sizeText,
      uploadedAt
    ].filter(Boolean).join(" · ");

    const subject = document.createElement("span");
    subject.className = "subject-tag";
    subject.textContent = note.subject || "Other";

    details.append(title, meta, subject);
    main.append(fileIcon, details);

    const actions = document.createElement("div");
    actions.className = "note-card-actions";

    

    

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "notes-action-btn notes-delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", async () => {
      if (!sessionStorage.getItem("accessToken")) {
        showLoginRequiredModal();
        return;
      }
    
      if (!confirm(`Permanently delete "${note.name}"?`)) return;
    
      const documentId = note.documentId || note.id;
    
      try {
        if (!documentId) {
          throw new Error("Document ID is missing.");
        }
    
        await apiRequest(`/api/v1/documents/${documentId}`, {
          method: "DELETE"
        });
    
        state.notes = state.notes.filter(
          item => String(item.documentId || item.id) !== String(documentId)
        );
    
        state.studyToolDocuments = state.studyToolDocuments.filter(
          doc => String(doc._id) !== String(documentId)
        );
    
        state.serverSubjects = new Set(
          state.studyToolDocuments
            .map(doc => doc.subject || "Other")
            .filter(Boolean)
        );
    
        saveNotes();
    
        renderStudyToolsDocumentOptions();
        renderUploadSubjectOptions();
        renderNotesList();
        renderChatSubjects();
        renderTestSubjectOptions();
        renderProfileSubjects();
        updateProgress();
    
        showToast("Document permanently deleted: " + note.name);
    
      } catch (error) {
        console.error("Document deletion error:", error);
        showToast(error.message || "Failed to delete document.");
      }
    });

    actions.append(deleteBtn);
    card.append(main, actions);
    container.appendChild(card);
  });
}


async function loadServerDocuments() {
  if (!sessionStorage.getItem("accessToken")) return;

  try {
    const response = await apiRequest("/api/v1/documents");
    const documents = response.data || [];
    state.studyToolDocuments = documents;
    renderStudyToolsDocumentOptions();

    state.serverSubjects = new Set(
      documents
        .map((doc) => doc.subject || "Other")
        .filter(Boolean)
    );

    const existingNotes = new Map(
      state.notes.map((note) => [
        String(note.documentId || note.id || ""),
        note,
      ])
    );

    const serverNotes = documents.map((doc) => {
      const id = String(doc._id);
      const existing = existingNotes.get(id);

      return {
        ...existing,
        id,
        documentId: id,
        name: doc.originalFileName || doc.title || "Uploaded document",
        subject: doc.subject || "Other",
        type: (doc.fileType || doc.originalFileName || doc.title || "")
          .split(".")
          .pop()
          .toLowerCase(),
        size: doc.fileSize ?? existing?.size ?? 0,
        uploadedAt: doc.createdAt
          ? new Date(doc.createdAt).getTime()
          : existing?.uploadedAt ?? Date.now(),
      };
    });

    const serverIds = new Set(serverNotes.map((note) => note.documentId));

    state.notes = [
      ...serverNotes,
      ...state.notes.filter(
        (note) => !serverIds.has(String(note.documentId || note.id || ""))
      ),
    ];

    for (const subject of state.serverSubjects) {
      state.subjects.add(subject);
    }

    saveNotes();
    renderNotesList();
    renderChatSubjects();
    renderTestSubjectOptions();
    renderProfileSubjects();
    updateProgress();
  } catch (error) {
    console.error("Server documents sync error:", error);
  }
}


function renderStudyToolsDocumentOptions() {
  if (!studyToolsDocumentSelect) return;

  const isLoggedIn = Boolean(
    sessionStorage.getItem("accessToken") &&
    sessionStorage.getItem("user")
  );

  const previousValue = studyToolsDocumentSelect.value;

  studyToolsDocumentSelect.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a document...";
  studyToolsDocumentSelect.appendChild(placeholder);

  // Never show existing documents to logged-out users.
  if (!isLoggedIn) {
    studyToolButtons.forEach((button) => {
      button.disabled = false;
    });
    return;
  }

  state.studyToolDocuments.forEach((doc) => {
    const option = document.createElement("option");
    option.value = String(doc._id);
    option.textContent =
      doc.originalFileName || doc.title || "Uploaded document";

    studyToolsDocumentSelect.appendChild(option);
  });

  const hasPreviousSelection = state.studyToolDocuments.some(
    (doc) => String(doc._id) === previousValue
  );

  studyToolsDocumentSelect.value = hasPreviousSelection
    ? previousValue
    : "";

  const hasDocument = Boolean(studyToolsDocumentSelect.value);

  studyToolButtons.forEach((button) => {
    button.disabled = false;
  });
}



function renderStudyToolResult(resource, result, cached, documentId) {
  if (!studyToolsResult) return;

  const resourceTitles = {
    summary: "Summary",
    notes: "Short Notes",
    quiz: "Quiz",
    flashcards: "Flashcards",
  };

  const container = document.createElement("div");
  const label = document.createElement("span");
  label.className = "study-tools-label";
  label.textContent = cached ? "SAVED STUDY MATERIAL" : "GENERATED STUDY MATERIAL";

  const heading = document.createElement("h3");
  heading.textContent = resourceTitles[resource] || "Study Material";

  const content = document.createElement("div");
  content.className = "study-tools-output";

  const addText = (parent, tag, text) => {
    const element = document.createElement(tag);
    element.textContent = String(text ?? "");
    parent.appendChild(element);
    return element;
  };

  if (typeof result === "string") {
    const text = document.createElement("div");
    text.className = "study-tools-markdown";

    if (window.marked && window.DOMPurify) {
      const markdownHtml = window.marked.parse(result);

      text.innerHTML = window.DOMPurify.sanitize(markdownHtml);
    } else {
      // Safe fallback if libraries are unavailable.
      text.textContent = result;
      text.style.whiteSpace = "pre-wrap";
    }

    content.appendChild(text);
  }else if (resource === "quiz" && Array.isArray(result)) {
    result.forEach((question, index) => {
      const item = document.createElement("article");
      item.className = "study-tool-output-item";

      addText(item, "h4", `${index + 1}. ${question.question}`);

      if (Array.isArray(question.options)) {
        const options = document.createElement("ol");
        options.type = "A";

        question.options.forEach((option) => {
          addText(options, "li", option);
        });

        item.appendChild(options);
      }

      if (question.correctAnswer != null || question.explanation) {
        const answerPanel = document.createElement("div");
        answerPanel.className = "study-tool-answer-panel";
        answerPanel.hidden = true;

        if (question.correctAnswer != null) {
          const answer = document.createElement("p");
          answer.className = "study-tool-correct-answer";
          answer.textContent = `Correct Answer: ${question.correctAnswer}`;
          answerPanel.appendChild(answer);
        }

        if (question.explanation) {
          const explanation = document.createElement("p");
          explanation.className = "study-tool-explanation";
          explanation.textContent = `Explanation: ${question.explanation}`;
          answerPanel.appendChild(explanation);
        }

        const revealButton = document.createElement("button");
        revealButton.type = "button";
        revealButton.className = "smallbtn study-tool-reveal-button";
        revealButton.textContent = "Reveal Answer";

        revealButton.addEventListener("click", () => {
          answerPanel.hidden = !answerPanel.hidden;

          revealButton.textContent = answerPanel.hidden
            ? "Reveal Answer"
            : "Hide Answer";
        });

        item.append(revealButton, answerPanel);
      }

      content.appendChild(item);
    });

  } else if (resource === "flashcards" && Array.isArray(result)) {
    const cards = result
      .filter(card => card && card.question != null && card.answer != null)
      .map(card => ({
        question: String(card.question),
        answer: String(card.answer),
        status: null
      }));

    if (!cards.length) {
      addText(content, "p", "No flashcards are available for this document.");
    } else {
      let currentIndex = 0;
      let isFlipped = false;

      const session = document.createElement("div");
      session.className = "flashcard-session";

      const topBar = document.createElement("div");
      topBar.className = "flashcard-topbar";

      const category = document.createElement("span");
      category.className = "flashcard-category";
      category.textContent = "ACTIVE RECALL";

      const counter = document.createElement("span");
      counter.className = "flashcard-counter";

      topBar.append(category, counter);

      const progressTrack = document.createElement("div");
      progressTrack.className = "flashcard-progress-track";

      const progressFill = document.createElement("div");
      progressFill.className = "flashcard-progress-fill";
      progressTrack.appendChild(progressFill);


const stage = document.createElement("div");
stage.className = "flashcard-stage";

const cardFace = document.createElement("button");
cardFace.type = "button";
cardFace.className = "flashcard-face";
cardFace.setAttribute("aria-label", "Reveal flashcard answer");

const cardInner = document.createElement("span");
cardInner.className = "flashcard-inner";

const frontFace = document.createElement("span");
frontFace.className = "flashcard-side flashcard-front";

const frontLabel = document.createElement("span");
frontLabel.className = "flashcard-face-label";
frontLabel.textContent = "QUESTION · FRONT";

const frontText = document.createElement("span");
frontText.className = "flashcard-face-text";

const frontHint = document.createElement("span");
frontHint.className = "flashcard-face-hint";
frontHint.textContent = "Tap to reveal answer";

frontFace.append(frontLabel, frontText, frontHint);

const backFace = document.createElement("span");
backFace.className = "flashcard-side flashcard-back";

const backLabel = document.createElement("span");
backLabel.className = "flashcard-face-label";
backLabel.textContent = "ANSWER · BACK";

const backText = document.createElement("span");
backText.className = "flashcard-face-text";

const backHint = document.createElement("span");
backHint.className = "flashcard-face-hint";
backHint.textContent = "How well did you remember?";

backFace.append(backLabel, backText, backHint);

cardInner.append(frontFace, backFace);
cardFace.appendChild(cardInner);
stage.appendChild(cardFace);


      const ratingArea = document.createElement("div");
      ratingArea.className = "flashcard-rating";
      ratingArea.hidden = true;

      const ratingTitle = document.createElement("p");
      ratingTitle.className = "flashcard-rating-title";
      ratingTitle.textContent = "How well did you remember?";

      const ratingActions = document.createElement("div");
      ratingActions.className = "flashcard-rating-actions";

      const practiceButton = document.createElement("button");
      practiceButton.type = "button";
      practiceButton.className = "flashcard-rate-button needs-practice";
      practiceButton.textContent = "↻ Need Practice";

      const knowButton = document.createElement("button");
      knowButton.type = "button";
      knowButton.className = "flashcard-rate-button know-it";
      knowButton.textContent = "✓ Know It";

      ratingActions.append(practiceButton, knowButton);
      ratingArea.append(ratingTitle, ratingActions);

      const navigation = document.createElement("div");
      navigation.className = "flashcard-navigation";

      const previousButton = document.createElement("button");
      previousButton.type = "button";
      previousButton.className = "flashcard-nav-button";
      previousButton.textContent = "← Previous";

      const shuffleButton = document.createElement("button");
      shuffleButton.type = "button";
      shuffleButton.className = "flashcard-nav-button flashcard-shuffle";
      shuffleButton.textContent = "⇄ Shuffle";

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "flashcard-nav-button";
      nextButton.textContent = "Next →";

      navigation.append(previousButton, shuffleButton, nextButton);

      const summary = document.createElement("div");
      summary.className = "flashcard-session-summary";

      session.append(
        topBar,
        progressTrack,
        stage,
        ratingArea,
        navigation,
        summary
      );

      content.appendChild(session);


function updateFlashcard() {
  const card = cards[currentIndex];

  isFlipped = false;
  stage.classList.remove("is-flipped");
  ratingArea.hidden = true;

  frontText.textContent = card.question;
  backText.textContent = card.answer;

  cardFace.setAttribute("aria-label", "Reveal flashcard answer");

  counter.textContent = `${currentIndex + 1} / ${cards.length}`;

  progressFill.style.width =
    `${((currentIndex + 1) / cards.length) * 100}%`;

  previousButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === cards.length - 1;

  const known = cards.filter(item => item.status === "known").length;
  const practice = cards.filter(item => item.status === "practice").length;

  summary.textContent =
    `✓ ${known} remembered   ·   ↻ ${practice} to practice`;
}



function flipFlashcard() {
  isFlipped = !isFlipped;

  stage.classList.toggle("is-flipped", isFlipped);

  cardFace.setAttribute(
    "aria-label",
    isFlipped ? "Show question" : "Reveal answer"
  );

  ratingArea.hidden = !isFlipped;
}



      function markCard(status) {
        cards[currentIndex].status = status;

        if (currentIndex < cards.length - 1) {
          currentIndex++;
          updateFlashcard();
        } else {
          updateFlashcard();
          summary.textContent =
            `Session complete · ${cards.filter(item => item.status === "known").length} remembered · ${cards.filter(item => item.status === "practice").length} to practice`;
        }
      }

      cardFace.addEventListener("click", flipFlashcard);

      previousButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateFlashcard();
        }
      });

      nextButton.addEventListener("click", () => {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
          updateFlashcard();
        }
      });

      practiceButton.addEventListener("click", () => markCard("practice"));
      knowButton.addEventListener("click", () => markCard("known"));

      shuffleButton.addEventListener("click", () => {
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        currentIndex = 0;
        updateFlashcard();
      });

      updateFlashcard();
    }

  } else {
    content.textContent = JSON.stringify(result, null, 2);
    content.style.whiteSpace = "pre-wrap";
  }

  const regenerateButton = document.createElement("button");
  regenerateButton.type = "button";
  regenerateButton.className = "smallbtn study-tool-button";
  regenerateButton.textContent = "Regenerate";
  regenerateButton.addEventListener("click", () => {
    generateStudyToolResource(documentId, resource, true);
  });

  container.append(label, heading, content, regenerateButton);
  studyToolsResult.replaceChildren(container);
}
function scrollToStudyToolsResult() {
  if (!studyToolsResult) return;

  // Double requestAnimationFrame ensure karta hai ki DOM ki height aur layout 
  // fully calculate ho chuke hain, jisse bina kisi jhatke ke smooth scroll ho.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetPosition =
        studyToolsResult.getBoundingClientRect().top +
        window.scrollY -
        24;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      window.scrollTo({
        top: Math.min(
          Math.max(0, targetPosition),
          maxScroll
        ),
        behavior: "smooth"
      });
    });
  });
}

async function generateStudyToolResource(documentId, resource, regenerate = false) {
  if (!documentId || !resource) return;

  if (
    !sessionStorage.getItem("accessToken") ||
    !sessionStorage.getItem("user")
  ) {
    showLoginRequiredModal();
    return;
  }

  const buttons = [...studyToolButtons];
  studyToolsRequestPending = true;

  buttons.forEach((button) => {
    button.disabled = true;
  });

  if (studyToolsResult) {
    const loading = document.createElement("div");
    loading.className = "study-tools-output";

    const message = document.createElement("p");
    message.textContent = regenerate
      ? "Regenerating your study material..."
      : "Loading saved material or generating a new resource...";

      loading.appendChild(message);
      studyToolsResult.replaceChildren(loading);
      
      // Scroll to loading message when Study Tools is currently visible.
      if (sessionStorage.getItem("currentPage") === "study-tools") {
        scrollToStudyToolsResult();
      } else {
        studyToolsScrollPending = true;
      }
  }

  try {
    const response = await apiRequest(
      `/api/v1/documents/${encodeURIComponent(documentId)}/study-tools/${resource}`,
      {
        method: "POST",
        body: JSON.stringify({ regenerate }),
      }
    );

    const payload = response.data;

    if (!payload || payload.result == null) {
      throw new Error("The server returned an empty study resource.");
    }

    renderStudyToolResult(
      resource,
      payload.result,
      Boolean(payload.cached),
      documentId
    );

    // Scroll sirf tabhi hoga jab final content successfully render ho chuka ho.
    if (sessionStorage.getItem("currentPage") === "study-tools") {
      scrollToStudyToolsResult();
    } else {
      studyToolsScrollPending = true;
    }

  } catch (error) {
    console.error("Study Tool request failed:", error);

    if (studyToolsResult) {
      const errorContainer = document.createElement("div");
      errorContainer.className = "study-tools-output";

      const errorHeading = document.createElement("h3");
      errorHeading.textContent = "Unable to load study material";

      const errorMessage = document.createElement("p");
      errorMessage.setAttribute("role", "alert");
      errorMessage.textContent =
        error.message || "Unable to generate this resource. Please try again.";

      errorContainer.append(errorHeading, errorMessage);
      studyToolsResult.replaceChildren(errorContainer);

      if (sessionStorage.getItem("currentPage") === "study-tools") {
        scrollToStudyToolsResult();
      } else {
        studyToolsScrollPending = true;
      }
    } else {
      showToast(error.message || "Unable to generate this resource.");
    }
  } finally {
    studyToolsRequestPending = false;

    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}



  // ========== Chat: basic client-only "AI" behaviors ==========


function renderChatSubjects() {
  chatSubject.innerHTML = "";

  const subjects = sessionStorage.getItem("accessToken")
    ? Array.from(new Set([
        ...state.serverSubjects,
        ...state.subjects
      ]))
    : Array.from(state.subjects);

  subjects.sort().forEach(subject => {
    const opt = document.createElement("option");
    opt.value = subject;
    opt.textContent = subject;
    chatSubject.appendChild(opt);
  });
}




function sendChat() {
  const q = chatInput.value.trim();
  if (!q) return;

  const selectedMode = state.chatMode || "global";
  const payload = { prompt: q, mode: "global" };

  if (selectedMode === "all") {
    payload.mode = "all";
  } else if (selectedMode === "subject") {
    const subject = chatSubject.value;

    if (!subject) {
      appendMessage("Please select a subject first.", "ai");
      return;
    }

    payload.mode = "subject";
    payload.subject = subject;
  }

  appendMessage(q, "user");
  chatInput.value = "";

  appendMessage("...", "ai", true);
  const loaderMsg = messagesEl.lastElementChild;

  apiRequest("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((data) => {
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
    .catch((error) => {
      if (loaderMsg) loaderMsg.remove();

      console.error("Chat error:", error);
      appendMessage(
        error.message || "Sorry, an error occurred while connecting to the server.",
        "ai"
      );
    });
}


function renderAIResponse(text) {
  const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let paragraph = [];
  let listItems = [];
  let listType = "";
  let codeLines = [];
  let inCodeBlock = false;

  const inlineFormat = (line) => {
    let html = escapeHtml(line);

    // Inline code first, so its contents are not formatted as Markdown.
    const codeParts = html.split(/(`[^`\n]+`)/g);
    html = codeParts.map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${part.slice(1, -1)}</code>`;
      }

      return part
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    }).join("");

    return html;
  };

  const flushParagraph = () => {
    if (!paragraph.length) return;

    output.push(
      `<p>${paragraph.map(inlineFormat).join("<br>")}</p>`
    );
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;

    const tag = listType === "ordered" ? "ol" : "ul";
    output.push(
      `<${tag}>${listItems.map(item =>
        `<li>${inlineFormat(item)}</li>`
      ).join("")}</${tag}>`
    );

    listItems = [];
    listType = "";
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();

      if (inCodeBlock) {
        output.push(
          `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }

      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();

      const level = heading[1].length;
      output.push(
        `<h${level}>${inlineFormat(heading[2])}</h${level}>`
      );
      continue;
    }

    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);

    if (ordered || unordered) {
      flushParagraph();

      const nextType = ordered ? "ordered" : "unordered";

      if (listType && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      listItems.push((ordered || unordered)[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  if (inCodeBlock) {
    output.push(
      `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
    );
  }

  flushParagraph();
  flushList();

  return output.join("");
}

function appendMessage(text, who = "ai", isLoader = false) {
  const welcome = document.getElementById("chatWelcome");

  if (welcome) {
    welcome.remove();
  }

  const d = document.createElement("div");
  d.className = "msg " + (who === "user" ? "user" : "ai");

  if (isLoader) {
    d.innerHTML = '<span class="loader"></span> Generating...';
  } else if (who === "user") {
    // User input is always displayed as plain, escaped text.
    d.textContent = String(text ?? "");
  } else {
    d.innerHTML = renderAIResponse(text);
  }

  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return d;
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

// Restore this account's saved folders.
state.subjects = new Set([
  "Computer",
  "Science",
  "Math",
  "Other",
  ...loadSubjects()
]);

// Reload the account's server documents.
await loadServerDocuments();

renderUploadSubjectOptions();
renderNotesList();
renderChatSubjects();
renderTestSubjectOptions();
renderProfileSubjects();

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
  // Cancel any upload still running in the browser.
  if (activeUploadController) {
    activeUploadController.abort();
    activeUploadController = null;
  }

  try {
    await apiRequest("/api/v1/auth/logout", {
      method: "POST"
    });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("accessToken");
sessionStorage.removeItem("user");
sessionStorage.removeItem("currentPage");

// Clear private Study Tools documents after logout.
state.studyToolDocuments = [];

renderStudyToolsDocumentOptions();


// Clear the private Notes workspace on logout.
state.notes = [];
state.serverSubjects.clear();

state.subjects = new Set();
renderUploadSubjectOptions();
// Remove browser caches; server documents remain untouched.
localStorage.removeItem(notesKey);


// Refresh all dependent UI sections.
renderNotesList();
renderChatSubjects();
renderTestSubjectOptions();
renderProfileSubjects();
updateProgress();


// Reset the Study Tools workspace.
if (studyToolsResult) {
  studyToolsResult.innerHTML = `
    <div class="study-tools-result-icon" aria-hidden="true">✦</div>
    <div>
      <span class="study-tools-label">YOUR WORKSPACE</span>
      <h3>Choose a document</h3>
      <p>Sign in and select an uploaded document to get started.</p>
    </div>
  `;
}

updateHomeAuthState();
gotoPage("home");

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
