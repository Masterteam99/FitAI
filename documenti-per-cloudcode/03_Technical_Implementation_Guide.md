# MOTION INSIGHT - TECHNICAL IMPLEMENTATION GUIDE
## Da passare a Claude Code per completamento MVP

**Versione:** v1.0  
**Data:** Agosto 2026  
**Obiettivo:** Raggiungere MVP maturo + testing completo + pronto al lancio  
**Stile Design:** MANTENERE esattamente come è (colori, font, layout già perfetti)

---

## 🎯 PREMESSA IMPORTANTE

Il design visuale e lo stile dell'app sono **già ottimi e devono rimanere uguali**. Questo documento si focalizza **SOLO su**:
- ✅ Completamento funzionalità non implementate
- ✅ Responsive design/mobile support
- ✅ Validation e error handling
- ✅ UX feedback (toast, loading state, ecc.)
- ✅ Testing e deployment

**NON fare:** Cambiar colori, font, spacing, layout strutturale

---

## 📋 TASK DI IMPLEMENTAZIONE - ORDINE DI PRIORITÀ

### PRIORITÀ 1: CRITICO PER MVP (Settimana 1-2)

#### 1.1 - RESPONSIVE DESIGN / MOBILE SUPPORT
**Stato attuale:** Layout desktop fisso, illeggibile su mobile  
**Implementazione tecnica richiesta:**

```javascript
// Aggiungere media queries CSS
// File: /styles/responsive.css

@media (max-width: 768px) {
  // Dashboard cards
  [style*="grid-template-columns: repeat(6"]
    grid-template-columns: repeat(2, 1fr) !important;
  
  // Admin table - diventa scrollable orizzontale
  table {
    display: flex;
    overflow-x: auto;
    min-width: 100%;
  }
  
  // Sidebar diventa burger menu o drawer
  [style*="display:grid;grid-template-columns:248px"]
    display: flex !important;
    flex-direction: column !important;
    position: fixed;
    left: -248px;
    top: 0;
    width: 248px;
    height: 100vh;
    z-index: 1000;
    transition: left 0.3s ease;
  
  // Hamburger button visible
  .hamburger-btn { display: block; }
}

@media (max-width: 480px) {
  // Font sizes più grandi
  body { font-size: 16px !important; }
  
  // Padding generoso
  padding: 12px !important;
  margin: 12px !important;
  
  // Single column per tutto
  grid-template-columns: 1fr !important;
}
```

**Testing checklist:**
- [ ] Testare su viewport 375px (iPhone SE)
- [ ] Testare su 768px (iPad)
- [ ] Testare on 1024px (desktop small)
- [ ] Verificare che nessun testo è tagliato
- [ ] Verificare che touch targets sono >= 44px

**Task code:** `IMPL-1.1-RESPONSIVE`

---

#### 1.2 - SISTEMA NOTIFICHE (Toast/Alerts)
**Stato attuale:** Nessun feedback post-azione  
**Implementazione tecnica richiesta:**

```javascript
// Creare componente Toast
// File: /components/Toast.js

class ToastNotification {
  static show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        ${this.getIcon(type)}
        <span style="font-size:14px;color:#ECF1F8;">${message}</span>
      </div>
    `;
    
    // Styling
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#0A0F1C' : '#2a1215'};
      border: 1px solid ${type === 'success' ? '#C8F751' : '#FF5A6E'};
      border-radius: 8px;
      padding: 14px 16px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }
  
  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error'); }
  static warning(msg) { this.show(msg, 'warning'); }
}

// Utilizzo in admin:
// ToastNotification.success('✅ Utente reso admin');
```

**Dove usarla:**
- Click su "Rendi admin" → `ToastNotification.success('Utente reso admin')`
- Click su "Premium 30g" → `ToastNotification.success('30 giorni premium assegnati')`
- Salva nuovo esercizio → `ToastNotification.success('Esercizio salvato')`
- Errore form → `ToastNotification.error('Compilare tutti i campi')`

**Testing:**
- [ ] Toast appear in 300ms
- [ ] Toast disappear automatically after 3s
- [ ] Multiple toast stack vertically
- [ ] Click on toast dismisses it

**Task code:** `IMPL-1.2-TOAST-SYSTEM`

---

#### 1.3 - FORM VALIDATION (Admin - Nuovo esercizio)
**Stato attuale:** Zero validazione  
**Implementazione tecnica richiesta:**

```javascript
// File: /admin/ExerciseForm.js

class ExerciseFormValidator {
  static validate(data) {
    const errors = {};
    
    // Nome validazione
    if (!data.nome || data.nome.trim().length === 0) {
      errors.nome = 'Nome esercizio richiesto';
    } else if (data.nome.length < 3) {
      errors.nome = 'Minimo 3 caratteri';
    } else if (data.nome.length > 50) {
      errors.nome = 'Massimo 50 caratteri';
    }
    
    // Gruppo muscolare
    if (!data.gruppo || data.gruppo.trim().length === 0) {
      errors.gruppo = 'Seleziona un gruppo muscolare';
    }
    
    // Descrizione
    if (!data.descrizione || data.descrizione.trim().length === 0) {
      errors.descrizione = 'Descrizione richiesta';
    } else if (data.descrizione.length > 500) {
      errors.descrizione = 'Massimo 500 caratteri';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }
  
  static renderErrors(errors, formElement) {
    // Pulisci errori precedenti
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Mostra nuovi errori
    Object.entries(errors).forEach(([field, message]) => {
      const input = formElement.querySelector(`[name="${field}"]`);
      if (input) {
        input.style.borderColor = '#FF5A6E';
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = `<span style="color:#FF5A6E;font-size:12px;">${message}</span>`;
        input.parentNode.appendChild(errorEl);
      }
    });
  }
}

// Nel form HTML, aggiungi event listener:
document.querySelector('.save-exercise-btn').addEventListener('click', function(e) {
  e.preventDefault();
  
  const formData = {
    nome: document.querySelector('[name="nome"]').value,
    gruppo: document.querySelector('[name="gruppo"]').value,
    descrizione: document.querySelector('[name="descrizione"]').value,
  };
  
  const { isValid, errors } = ExerciseFormValidator.validate(formData);
  
  if (!isValid) {
    ExerciseFormValidator.renderErrors(errors, form);
    ToastNotification.error('Correggi gli errori nel form');
    return;
  }
  
  // Procedi con salvataggio
  this.disabled = true;
  this.innerHTML = 'Salvataggio...';
  
  saveExercise(formData)
    .then(() => {
      ToastNotification.success('✅ Esercizio salvato');
      // Reset form
      form.reset();
      // Torna a lista esercizi
      switchAdminView('exercises');
    })
    .catch(err => {
      ToastNotification.error('❌ Errore nel salvataggio');
      console.error(err);
    })
    .finally(() => {
      this.disabled = false;
      this.innerHTML = 'Salva esercizio';
    });
});
```

**Campi da validare:**
- [ ] Nome esercizio: required, 3-50 char
- [ ] Gruppo muscolare: required, select da lista predefinita
- [ ] Descrizione: required, max 500 char

**Testing:**
- [ ] Submit con form vuoto → mostra errori
- [ ] Submit con nome troppo corto → errore specifico
- [ ] Submit valido → success toast + redirect

**Task code:** `IMPL-1.3-FORM-VALIDATION`

---

#### 1.4 - LOADING STATES E DISABLING
**Stato attuale:** Pulsanti sempre attivi, no visual feedback  
**Implementazione tecnica richiesta:**

```javascript
// File: /utils/ButtonStates.js

class ButtonStateManager {
  static setLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        <span class="spinner"></span>
        Caricamento...
      </span>
    `;
  }
  
  static setSuccess(button) {
    button.innerHTML = '✅ Fatto!';
    button.style.backgroundColor = '#C8F751';
    button.style.color = '#0A0F1C';
    setTimeout(() => this.reset(button), 2000);
  }
  
  static reset(button) {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText;
    button.style.backgroundColor = '';
    button.style.color = '';
  }
}

// CSS per spinner
const spinnerCSS = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(200,247,81,.3);
    border-top-color: #C8F751;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
`;

// Utilizzo:
// ButtonStateManager.setLoading(saveBtn);
// await saveExercise(data);
// ButtonStateManager.setSuccess(saveBtn);
```

**Dove applicare:**
- [ ] Button "Salva esercizio"
- [ ] Button "Rendi admin"
- [ ] Button "Premium 30g"
- [ ] Qualsiasi azione asincrona

**Task code:** `IMPL-1.4-LOADING-STATES`

---

#### 1.5 - PROFILO UTENTE COMPLETO
**Stato attuale:** Solo avatar + nome + piano  
**Implementazione tecnica richiesta:**

```javascript
// File: /user/ProfilePage.js

class UserProfile {
  constructor(userData) {
    this.user = userData;
  }
  
  render() {
    return `
      <div style="max-width:600px;">
        <!-- Header profilo -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="width:80px;height:80px;border-radius:999px;background:#C8F751;color:#0A0F1C;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 16px;">
            ${this.user.name.charAt(0)}
          </div>
          <h1 style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin:0 0 4px;">${this.user.name}</h1>
          <span style="display:inline-block;background:${this.getPlanColor()};color:#0A0F1C;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;margin:0 0 16px;">
            ${this.user.plan}
          </span>
          <p style="font-size:14px;color:#94A3B8;margin:0;">${this.user.email}</p>
        </div>
        
        <!-- Statistiche -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;">Statistiche</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#C8F751;">${this.user.totalWorkouts}</div>
              <div style="font-size:11px;color:#94A3B8;">Allenamenti</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#4FD1C5;">${this.user.totalHours}h</div>
              <div style="font-size:11px;color:#94A3B8;">Ore totali</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#C8F751;;">${this.user.streak}🔥</div>
              <div style="font-size:11px;color:#94A3B8;">Streak giorni</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#FFB547;">${this.user.exerciseCount}</div>
              <div style="font-size:11px;color:#94A3B8;">Esercizi unici</div>
            </div>
          </div>
        </div>
        
        <!-- Impostazioni account -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;">Impostazioni</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="profile-btn" onclick="showChangeEmail()" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;">
              ✉️ Cambia Email
            </button>
            <button class="profile-btn" onclick="showChangePassword()" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;">
              🔒 Cambia Password
            </button>
            <button class="profile-btn" onclick="showNotificationSettings()" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;">
              🔔 Notifiche
            </button>
            <button class="profile-btn" onclick="showPrivacySettings()" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;">
              🛡️ Privacy
            </button>
          </div>
        </div>
        
        <!-- Premium upgrade (se free) -->
        ${this.user.plan === 'FREE' ? `
          <div style="background:linear-gradient(135deg, #C8F751 0%, #4FD1C5 100%);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <h3 style="font-size:16px;font-weight:700;color:#0A0F1C;margin:0 0 8px;">Sblocca Premium</h3>
            <p style="font-size:14px;color:#0A0F1C;margin:0 0 16px;">Video analisi illimitati, AI personalizzata, community esclusiva</p>
            <button style="background:#0A0F1C;color:#C8F751;border:none;border-radius:8px;padding:12px 24px;font-weight:600;cursor:pointer;">
              Scopri i piani
            </button>
          </div>
        ` : ''}
        
        <!-- Logout -->
        <button onclick="logout()" style="width:100%;background:transparent;border:2px solid #FF5A6E;border-radius:8px;padding:12px;color:#FF5A6E;font-weight:600;cursor:pointer;">
          🚪 Esci dall'account
        </button>
      </div>
    `;
  }
  
  getPlanColor() {
    const colors = {
      'FREE': '#94A3B8',
      'PREMIUM': '#C8F751',
      'ADMIN': '#4FD1C5'
    };
    return colors[this.user.plan] || '#94A3B8';
  }
}

// Funzioni per modal:
function showChangeEmail() {
  // Mostra modal con input email
}

function showChangePassword() {
  // Mostra modal con input password
}

function logout() {
  // Clear session
  // Redirect a home
  window.location.href = '/';
}
```

**Dati necessari da salvare:**
- userData.totalWorkouts (numero)
- userData.totalHours (numero)
- userData.streak (numero)
- userData.exerciseCount (numero)

**Task code:** `IMPL-1.5-USER-PROFILE`

---

### PRIORITÀ 2: IMPORTANTE PER MVP COMPLETO (Settimana 2-3)

#### 2.1 - SEZIONE ADMIN: ABBONAMENTI
**Stato attuale:** Placeholder  
**Implementazione tecnica richiesta:**

```javascript
// File: /admin/SubscriptionsView.js

class SubscriptionsView {
  render() {
    return `
      <div style="max-width:1000px;">
        <h1 style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;letter-spacing:-.02em;margin:0 0 24px;">Piani di Abbonamento</h1>
        
        <!-- Aggiungi nuovo piano -->
        <button onclick="showNewPlanModal()" style="background:#C8F751;color:#0A0F1C;border:none;border-radius:8px;padding:12px 24px;font-weight:600;margin-bottom:24px;cursor:pointer;">
          + Nuovo Piano
        </button>
        
        <!-- Grid piani -->
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:24px;">
          <!-- Ogni piano -->
          <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;margin:0;">Free</h3>
              <span style="background:#121A2B;color:#94A3B8;padding:4px 8px;border-radius:4px;font-size:11px;">0€/mese</span>
            </div>
            
            <div style="margin-bottom:16px;">
              <div style="font-size:24px;font-weight:700;color:#ECF1F8;margin-bottom:4px;">€0<span style="font-size:14px;color:#94A3B8;">/mese</span></div>
            </div>
            
            <!-- Features -->
            <ul style="list-style:none;padding:0;margin:0 0 16px;font-size:14px;color:#94A3B8;">
              <li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);">✓ 3 video/mese</li>
              <li style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);">✓ Libreria esercizi basica</li>
              <li style="padding:8px 0;">✗ AI analisi avanzata</li>
            </ul>
            
            <!-- Utenti su questo piano -->
            <div style="background:#0C1220;border-radius:8px;padding:12px;margin-bottom:12px;font-size:12px;">
              <span style="color:#94A3B8;">Utenti attuali: </span>
              <span style="color:#C8F751;font-weight:700;">35</span>
            </div>
            
            <!-- Revenue -->
            <div style="background:#0C1220;border-radius:8px;padding:12px;margin-bottom:12px;font-size:12px;">
              <span style="color:#94A3B8;">MRR: </span>
              <span style="color:#4FD1C5;font-weight:700;">€0</span>
            </div>
            
            <button onclick="editPlan('free')" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:10px;color:#ECF1F8;cursor:pointer;margin-bottom:8px;">
              Modifica
            </button>
            <button onclick="archivePlan('free')" style="width:100%;background:transparent;border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:10px;color:#94A3B8;cursor:pointer;">
              Archivia
            </button>
          </div>
          
          <!-- Ripeti per Premium -->
        </div>
        
        <!-- Tabella Revenue Trends -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;">Revenue Trend (Ultimi 6 mesi)</h3>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,.08);">
                <th style="text-align:left;padding:10px;color:#94A3B8;font-size:12px;font-weight:600;">Mese</th>
                <th style="text-align:right;padding:10px;color:#94A3B8;font-size:12px;font-weight:600;">MRR</th>
                <th style="text-align:right;padding:10px;color:#94A3B8;font-size:12px;font-weight:600;">Crescita</th>
              </tr>
            </thead>
            <tbody>
              <!-- Dati mensili -->
              <tr style="border-bottom:1px solid rgba(255,255,255,.06);">
                <td style="padding:10px;color:#ECF1F8;font-size:14px;">Marzo 2026</td>
                <td style="text-align:right;padding:10px;color:#C8F751;font-weight:700;">€2,450</td>
                <td style="text-align:right;padding:10px;color:#4FD1C5;">+12%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// Database schema per piani
const SubscriptionPlan = {
  id: 'free|premium|pro',
  name: 'Free|Premium|Pro',
  price: 0,
  billingCycle: 'monthly',
  features: [
    { name: 'video_limit', value: 3 },
    { name: 'ai_analysis', value: false },
    { name: 'community_access', value: false }
  ],
  activeUsers: 35,
  mrr: 0,
  status: 'active|archived'
};
```

**Funzioni necessarie:**
- [ ] GET /api/subscriptions (lista piani)
- [ ] POST /api/subscriptions (crea piano)
- [ ] PATCH /api/subscriptions/:id (modifica piano)
- [ ] GET /api/subscriptions/revenue-trend (dati revenue)

**Task code:** `IMPL-2.1-ADMIN-SUBSCRIPTIONS`

---

#### 2.2 - SEZIONE ADMIN: ESERCIZI (Lista completa)
**Stato attuale:** Solo form per creare, nessuna lista  
**Implementazione tecnica richiesta:**

```javascript
// File: /admin/ExercisesView.js

class ExercisesView {
  render() {
    return `
      <div style="max-width:1200px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
          <h1 style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin:0;">Esercizi</h1>
          <button onclick="switchToNewExercise()" style="background:#C8F751;color:#0A0F1C;border:none;border-radius:8px;padding:12px 24px;font-weight:600;cursor:pointer;">
            + Nuovo Esercizio
          </button>
        </div>
        
        <!-- Filtri e ricerca -->
        <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <input placeholder="Cerca esercizio..." id="searchExercises" style="flex:1;min-width:200px;background:#121A2B;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 14px;color:#ECF1F8;font-size:14px;">
          
          <select id="filterMuscle" style="background:#121A2B;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 14px;color:#ECF1F8;font-size:14px;">
            <option value="">Tutti i muscoli</option>
            <option value="gambe">Gambe</option>
            <option value="petto">Petto</option>
            <option value="spalla">Spalla</option>
            <option value="schiena">Schiena</option>
          </select>
          
          <select id="filterDifficulty" style="background:#121A2B;border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 14px;color:#ECF1F8;font-size:14px;">
            <option value="">Tutti i livelli</option>
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzato</option>
          </select>
        </div>
        
        <!-- Tabella esercizi -->
        <div style="border:1px solid rgba(255,255,255,.08);border-radius:12px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#1B2540;">
                <th style="text-align:left;padding:12px 16px;color:#94A3B8;font-size:12px;font-weight:600;">Esercizio</th>
                <th style="text-align:left;padding:12px 10px;color:#94A3B8;font-size:12px;font-weight:600;">Gruppo</th>
                <th style="text-align:left;padding:12px 10px;color:#94A3B8;font-size:12px;font-weight:600;">Difficoltà</th>
                <th style="text-align:center;padding:12px 10px;color:#94A3B8;font-size:12px;font-weight:600;">Utenti</th>
                <th style="text-align:right;padding:12px 16px;color:#94A3B8;font-size:12px;font-weight:600;">Azioni</th>
              </tr>
            </thead>
            <tbody id="exercisesTableBody">
              <!-- Dati inseriti dinamicamente -->
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div style="display:flex;justify-content:center;gap:10px;margin-top:24px;">
          <button style="padding:8px 12px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#94A3B8;border-radius:6px;cursor:pointer;">← Prev</button>
          <span style="display:flex;align-items:center;color:#94A3B8;">Pagina 1 di 5</span>
          <button style="padding:8px 12px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#94A3B8;border-radius:6px;cursor:pointer;">Next →</button>
        </div>
      </div>
    `;
  }
}

// Popolare tabella
function loadExercises(filters = {}) {
  const tbody = document.getElementById('exercisesTableBody');
  
  // API call
  fetch(`/api/admin/exercises?${new URLSearchParams(filters)}`)
    .then(r => r.json())
    .then(exercises => {
      tbody.innerHTML = exercises.map(ex => `
        <tr style="border-top:1px solid rgba(255,255,255,.06);">
          <td style="padding:12px 16px;color:#ECF1F8;font-weight:600;">${ex.name}</td>
          <td style="padding:12px 10px;color:#94A3B8;font-size:14px;">${ex.muscleGroup}</td>
          <td style="padding:12px 10px;">
            <span style="font-size:11px;font-weight:700;color:${this.getDifficultyColor(ex.difficulty)};border:1px solid ${this.getDifficultyColor(ex.difficulty)};border-radius:999px;padding:3px 9px;">
              ${ex.difficulty}
            </span>
          </td>
          <td style="padding:12px 10px;text-align:center;color:#C8F751;font-weight:700;">${ex.userCount}</td>
          <td style="padding:12px 16px;text-align:right;">
            <button onclick="editExercise('${ex.id}')" style="background:transparent;border:none;color:#4FD1C5;cursor:pointer;font-size:12px;margin-right:12px;">Modifica</button>
            <button onclick="deleteExercise('${ex.id}')" style="background:transparent;border:none;color:#FF5A6E;cursor:pointer;font-size:12px;">Elimina</button>
          </td>
        </tr>
      `).join('');
    });
}

// Listener per ricerca in tempo reale
document.getElementById('searchExercises').addEventListener('input', (e) => {
  loadExercises({ search: e.target.value });
});
```

**Funzioni API necessarie:**
- [ ] GET /api/admin/exercises (lista con paginazione)
- [ ] DELETE /api/admin/exercises/:id (elimina)
- [ ] GET /api/admin/exercises/stats (statistiche utilizzo)

**Task code:** `IMPL-2.2-ADMIN-EXERCISES-LIST`

---

#### 2.3 - ONBOARDING PRIMO ACCESSO
**Stato attuale:** Nessuno - utente atterra su dashboard  
**Implementazione tecnica richiesta:**

```javascript
// File: /components/FirstAccessTour.js

class FirstAccessTour {
  constructor(userId) {
    this.userId = userId;
    this.currentStep = 0;
    this.steps = [
      {
        title: 'Benvenuto in Motion Insight!',
        description: 'Ecco come funziona l\'app. Puoi saltare questo tour in qualsiasi momento.',
        target: null, // Full screen
        position: 'center'
      },
      {
        title: 'Registra una sessione',
        description: 'Clicca qui per avviare una sessione di allenamento. Motion Insight analizzerà il tuo video.',
        target: '.nav-allena',
        position: 'right'
      },
      {
        title: 'Visualizza i tuoi progressi',
        description: 'Scopri come stai migliorando nel tempo. Video score, kraft personali e trending.',
        target: '.nav-progressi',
        position: 'right'
      },
      {
        title: 'Piano nutrizionale',
        description: 'Ottieni un piano personalizzato in base ai tuoi obiettivi.',
        target: '.nav-nutrizione',
        position: 'right'
      },
      {
        title: 'Community',
        description: 'Connettiti con altri utenti, partecipa a sfide, celebra i successi.',
        target: '.nav-community',
        position: 'right'
      },
      {
        title: 'Perfetto!',
        description: 'Adesso sei pronto a iniziare. Buon allenamento!',
        target: null,
        position: 'center'
      }
    ];
  }
  
  render() {
    const step = this.steps[this.currentStep];
    
    let html = `
      <div class="tour-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9998;">
    `;
    
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        html += `
          <div class="tour-spotlight" style="position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;border:2px solid #C8F751;border-radius:8px;z-index:9999;"></div>
        `;
      }
    }
    
    html += `
      <div class="tour-tooltip" style="position:fixed;background:#121A2B;border:1px solid #C8F751;border-radius:12px;padding:24px;max-width:360px;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
        <h3 style="font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:#C8F751;margin:0 0 12px;">${step.title}</h3>
        <p style="font-size:14px;color:#ECF1F8;margin:0 0 16px;line-height:1.5;">${step.description}</p>
        
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;gap:4px;">
            ${this.steps.map((_, i) => `
              <div style="width:6px;height:6px;border-radius:50%;background:${i === this.currentStep ? '#C8F751' : 'rgba(200,247,81,.2)};"></div>
            `).join('')}
          </div>
          
          <div style="display:flex;gap:10px;">
            <button onclick="tour.skip()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#94A3B8;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;">Salta</button>
            ${this.currentStep < this.steps.length - 1 ? `
              <button onclick="tour.next()" style="background:#C8F751;color:#0A0F1C;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;font-weight:600;">Avanti →</button>
            ` : `
              <button onclick="tour.finish()" style="background:#C8F751;color:#0A0F1C;border:none;border-radius:6px;padding:8px 16px;cursor:pointer;font-size:12px;font-weight:600;">Inizia!</button>
            `}
          </div>
        </div>
      </div>
      </div>
    `;
    
    return html;
  }
  
  next() {
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this.show();
    } else {
      this.finish();
    }
  }
  
  skip() {
    this.finish();
  }
  
  finish() {
    // Salva che tour è stato completato
    localStorage.setItem(`tour_completed_${this.userId}`, 'true');
    document.querySelector('.tour-overlay').remove();
  }
  
  show() {
    const container = document.getElementById('tour-container');
    container.innerHTML = this.render();
  }
  
  static shouldShow(userId) {
    return !localStorage.getItem(`tour_completed_${userId}`);
  }
}

// Inizializzazione nell'app principale
if (FirstAccessTour.shouldShow(currentUserId)) {
  const tour = new FirstAccessTour(currentUserId);
  tour.show();
}
```

**Checklist:**
- [ ] Tour visita tutte le sezioni principali
- [ ] Possibilità di skiparlo
- [ ] Non mostra se già completato
- [ ] Frecce/spotlight per guidare visivo

**Task code:** `IMPL-2.3-FIRST-ACCESS-TOUR`

---

#### 2.4 - AUTENTICAZIONE E PERSISTENZA SESSIONE
**Stato attuale:** Non chiaro se implementato  
**Implementazione tecnica richiesta:**

```javascript
// File: /auth/AuthManager.js

class AuthManager {
  static async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      
      // Salva token
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userRole', data.user.role);
      
      return data.user;
    } catch (error) {
      ToastNotification.error('Email o password non corretti');
      throw error;
    }
  }
  
  static async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  }
  
  static isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
  
  static getToken() {
    return localStorage.getItem('authToken');
  }
  
  static getUserId() {
    return localStorage.getItem('userId');
  }
  
  static async refreshToken() {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('authToken', data.token);
      return data.token;
    } else {
      this.logout();
    }
  }
}

// Aggiungere header di autorizzazione a tutti i fetch
const originalFetch = window.fetch;
window.fetch = function(...args) {
  args[1] = args[1] || {};
  args[1].headers = args[1].headers || {};
  args[1].headers['Authorization'] = `Bearer ${AuthManager.getToken()}`;
  return originalFetch.apply(this, args);
};

// Middleware per proteggere route
function protectedRoute(fn) {
  return function(...args) {
    if (!AuthManager.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
    return fn.apply(this, args);
  };
}
```

**Funzioni API necessarie:**
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/refresh
- [ ] POST /api/auth/register (se supportato)

**Task code:** `IMPL-2.4-AUTHENTICATION`

---

### PRIORITÀ 3: POLISH E TESTING (Settimana 3-4)

#### 3.1 - UNIT TESTING E QA
**Cosa testare:**

```javascript
// File: /tests/ComponentTests.js

describe('Toast Notifications', () => {
  it('should display success toast', () => {
    ToastNotification.success('Test message');
    const toast = document.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain('Test message');
  });
  
  it('should auto-dismiss after 3 seconds', (done) => {
    ToastNotification.success('Test');
    setTimeout(() => {
      const toast = document.querySelector('.toast');
      expect(toast).toBeFalsy();
      done();
    }, 3100);
  });
});

describe('Form Validation', () => {
  it('should reject empty form', () => {
    const result = ExerciseFormValidator.validate({
      nome: '',
      gruppo: '',
      descrizione: ''
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBe(3);
  });
  
  it('should reject too short name', () => {
    const result = ExerciseFormValidator.validate({
      nome: 'ab',
      gruppo: 'gambe',
      descrizione: 'test'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.nome).toContain('Minimo 3');
  });
});

describe('Responsive Layout', () => {
  it('should be mobile friendly at 375px', () => {
    window.innerWidth = 375;
    const grid = document.querySelector('[style*="grid-template-columns: repeat"]');
    expect(getComputedStyle(grid).gridTemplateColumns).toBe('1fr'); // Mobile: 1 column
  });
  
  it('should be desktop friendly at 1024px', () => {
    window.innerWidth = 1024;
    const grid = document.querySelector('[style*="grid-template-columns: repeat"]');
    expect(getComputedStyle(grid).gridTemplateColumns).toMatch(/repeat/); // Desktop: multiple columns
  });
});
```

**Testing checklist:**
- [ ] Testare su Chrome, Firefox, Safari
- [ ] Testare su iPhone 12 (390x844)
- [ ] Testare su Android (412x892)
- [ ] Testare su iPad (768x1024)
- [ ] Performance: PageSpeed Insights > 80
- [ ] Accessibility: WCAG 2.1 AA compliance

**Task code:** `IMPL-3.1-TESTING-QA`

---

#### 3.2 - DEPLOYMENT E SETUP PRODUZIONE
**Checklist deployment:**

```bash
# 1. Build
npm run build
# Assicurarsi: no console.log, minificazione, source maps

# 2. Environment variables
# .env.production:
REACT_APP_API_URL=https://api.motioninsight.app
REACT_APP_ENVIRONMENT=production

# 3. Database migration
npm run migrate:prod
# Backup existing data

# 4. SSL Certificate
# Assicurarsi HTTPS su tutti gli endpoint

# 5. CDN Setup
# Servire static assets da CDN (Cloudflare)

# 6. Monitoring
# Setup Sentry per error tracking
# Setup Google Analytics / Mixpanel

# 7. Health check
curl https://motioninsight.app/api/health
# Response: { "status": "ok" }

# 8. Smoke tests
npm run test:smoke
```

**Server requirements:**
- Node.js 18+
- PostgreSQL 14+
- Redis (per caching/sessions)
- 2GB RAM minimum
- Uptime monitoring

**Task code:** `IMPL-3.2-DEPLOYMENT`

---

## 🧪 PIANO DI TESTING COMPLETO

### Testing Matrix

| Feature | Unit | Integration | E2E | Mobile | Browser |
|---------|------|-------------|-----|--------|---------|
| Auth | ✅ | ✅ | ✅ | ✅ | Chrome, FF, Safari |
| Form Validation | ✅ | ✅ | ✅ | ✅ | iOS, Android |
| Toast Notifications | ✅ | ✅ | ✅ | ✅ | All |
| Admin Dashboard | ✅ | ✅ | ✅ | ✅ | Desktop only |
| User Dashboard | ✅ | ✅ | ✅ | ✅ | All |
| Responsive Layout | - | - | ✅ | ✅ | All viewports |

### Accessibility Testing (WCAG 2.1 AA)

```
✅ Color contrast ratio >= 4.5:1 for text
✅ Touch targets >= 44x44px
✅ Keyboard navigation (Tab, Enter)
✅ Screen reader compatible (alt text, labels)
✅ Focus indicators visible
✅ No keyboard traps
```

### Performance Targets

```
✅ First Contentful Paint (FCP): < 2s
✅ Largest Contentful Paint (LCP): < 2.5s
✅ Cumulative Layout Shift (CLS): < 0.1
✅ Time to Interactive (TTI): < 3.8s
✅ Bundle size: < 200KB (gzipped)
```

---

## 📅 TIMELINE IMPLEMENTAZIONE

### Sprint 1 (Giorni 1-7)
- [ ] IMPL-1.1: Responsive Design
- [ ] IMPL-1.2: Toast System
- [ ] IMPL-1.3: Form Validation
- [ ] IMPL-1.4: Loading States

### Sprint 2 (Giorni 8-14)
- [ ] IMPL-1.5: User Profile
- [ ] IMPL-2.1: Admin Subscriptions
- [ ] IMPL-2.2: Admin Exercises List
- [ ] IMPL-2.4: Authentication

### Sprint 3 (Giorni 15-21)
- [ ] IMPL-2.3: First Access Tour
- [ ] Admin: Abbonamenti - COMPLETO
- [ ] Admin: Esercizi - COMPLETO
- [ ] Admin: Revisioni (skeleton)

### Sprint 4 (Giorni 22-28)
- [ ] IMPL-3.1: Testing QA
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] IMPL-3.2: Production deployment

---

## 🎯 DEFINIZIONE DI "PRONTO AL LANCIO"

L'app è pronta quando:

- ✅ **Tutte le funzionalità core** implementate e testate
  - Landing page funzionante
  - Auth (login/logout)
  - App area (dashboard, esercizi, profilo)
  - Admin area (utenti, esercizi completi)

- ✅ **Responsive design** funzionante su mobile/tablet/desktop

- ✅ **Performance** accettabile (PageSpeed > 80)

- ✅ **Zero critical bugs** riportati

- ✅ **HTTPS** e security hardening

- ✅ **Backup/Recovery plan** in place

- ✅ **Monitoring/Logging** setup (Sentry, analytics)

- ✅ **Onboarding tour** per utenti nuovi

- ✅ **Documentation** per admin e utenti

---

## 📞 NEXT STEPS

1. **Revedi questa lista con il team**
   - Assegna task a developers
   - Stima tempo per ogni task
   - Assegna priorità se necessario

2. **Setup environment**
   - Repository git
   - Staging server
   - Testing database

3. **Daily standups**
   - Quali task sono completati?
   - Quali blockers?
   - ETA per prossimo milestone?

4. **Beta testing**
   - Internal testing (team)
   - Beta users (30-50 persone)
   - Raccogliere feedback

5. **Soft launch**
   - Producti a numero limitato di utenti
   - Monitor per bug/issues
   - Graduale rollout

6. **Full launch**
   - Announce
   - Marketing push
   - Customer support readiness

---

**Documento preparato per:** Claude Code  
**Formato:** Technical Implementation Spec  
**Priorità:** ALTA - Implementare immediatamente  
**Feedback:** Contatta su qualsiasi dubbio su questa spec

