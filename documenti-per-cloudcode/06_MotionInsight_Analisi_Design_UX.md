# PROMPT PERFETTO PER CLAUDE CODE
## Copia e incolla TUTTO questo su Claude Code

---

## 🎯 ISTRUZIONI IMPORTANTI PRIMA DI INIZIARE

1. **Apri Claude Code** (https://claude.com/claude-code)
2. **Allega il tuo progetto React** (se chiede dove lavorare)
3. **Copia TUTTO il testo sotto** come un UNICO messaggio
4. **Incolla in Claude Code**
5. **Aspetta il lavoro** - non interrompere mid-task

---

## 📋 TESTO DA COPIARE E INCOLLARE IN CLAUDE CODE

```
Ciao! Devo implementare miglioramenti su Motion Insight, la mia fitness app React.

IMPORTANTE: NON CAMBIARE design/colori/font - mantieni ESATTAMENTE come è adesso.

OBIETTIVO: Completare MVP maturo e pronto al lancio in 4 settimane.

Ho preparato una roadmap tecnica dettagliata. Seguila ESATTAMENTE come scritto.

## TASK DA IMPLEMENTARE - SETTIMANA 1 (Top Priority)

### TASK 1: RESPONSIVE DESIGN MOBILE (8 ore)
Stato: Il sito NON è responsive, griglia a 6 colonne illeggibile su mobile

Cosa fare ESATTAMENTE:
1. Creare file: `/src/styles/responsive.css`

2. Aggiungere media queries:

@media (max-width: 768px) {
  /* Grid: 6 colonne → 2 colonne su tablet */
  [style*="grid-template-columns: repeat(6"]  {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  /* Sidebar: fisso su desktop → drawer/burger su mobile */
  [style*="display:grid;grid-template-columns:248px"] {
    display: none; /* Nascondi su mobile, mostra hamburger button */
  }
  
  /* Hamburger button: hidden su desktop, visible su mobile */
  .hamburger-btn {
    display: block;
  }
  
  /* Padding/margin: più generoso su mobile */
  body, div {
    padding: 16px !important;
  }
  
  /* Tabella admin: scrollable orizzontalmente su mobile */
  table {
    display: flex;
    overflow-x: auto;
    min-width: 100%;
  }
}

@media (max-width: 480px) {
  /* Font size aumentato per leggibilità */
  body { font-size: 16px !important; }
  
  /* Tutto single column */
  [style*="grid-template-columns"] {
    grid-template-columns: 1fr !important;
  }
}

3. Hamburger menu button - aggiungi HTML:
<button class="hamburger-btn" onclick="toggleSidebar()" style="display:none;position:fixed;top:12px;left:12px;z-index:1001;background:#C8F751;color:#0A0F1C;border:none;padding:8px 12px;border-radius:6px;font-weight:700;cursor:pointer;">☰</button>

4. Sidebar drawer - modifica style:
<div id="sidebar" style="position:fixed;left:-248px;top:0;width:248px;height:100vh;background:#0C1220;border-right:1px solid rgba(255,255,255,.08);padding:24px 16px;z-index:1000;transition:left 0.3s ease;">
  <!-- contenuto sidebar qui -->
</div>

5. Toggle function - aggiungi JavaScript:
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isOpen = sidebar.style.left === '0px';
  sidebar.style.left = isOpen ? '-248px' : '0px';
}

Testing checklist:
- [ ] Apri DevTools → Responsive mode → 375px width
- [ ] Griglia dashboard diventa 2 colonne
- [ ] Hamburger button visibile
- [ ] Click hamburger apre/chiude sidebar
- [ ] Zero horizontal scrolling
- [ ] Tabella admin scrollable orizzontalmente
- [ ] Touch targets >= 44px
- [ ] Testato su 375px, 768px, 1024px

---

### TASK 2: TOAST NOTIFICATION SYSTEM (4 ore)
Stato: Nessun feedback post-azione (utente non sa se è andato ok)

Cosa fare ESATTAMENTE:

1. Creare file: `/src/components/Toast.js`

class ToastNotification {
  static show(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const bgColor = type === 'success' ? '#0A0F1C' : type === 'error' ? '#2a1215' : '#1B2540';
    const borderColor = type === 'success' ? '#C8F751' : type === 'error' ? '#FF5A6E' : '#FFB547';
    const textColor = '#ECF1F8';
    
    toast.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:16px;">${this.getIcon(type)}</span>
        <span style="font-size:14px;color:${textColor};">${message}</span>
      </div>
    `;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      border-radius: 8px;
      padding: 14px 16px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  static getIcon(type) {
    return type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  }
  
  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error'); }
  static warning(msg) { this.show(msg, 'warning'); }
}

2. Creare file: `/src/styles/toast.css`

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

.toast {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

3. Importa in main app:
import { ToastNotification } from './components/Toast';
import './styles/toast.css';

4. Usa ovunque serve:
// Dopo azione riuscita
ToastNotification.success('✅ Esercizio salvato');

// Dopo errore
ToastNotification.error('❌ Errore nel salvataggio');

// Warning
ToastNotification.warning('⚠️ Campo richiesto');

Testing checklist:
- [ ] ToastNotification.success('Test') → appare in 300ms
- [ ] Toast auto-scompare dopo 3s
- [ ] Toast posizionato top-right
- [ ] Multiple toast stackano verticalmente
- [ ] Click su toast lo rimuove (opzionale)
- [ ] Testato su mobile (responsive position)

---

### TASK 3: FORM VALIDATION - NUOVO ESERCIZIO (6 ore)
Stato: Form accetta qualsiasi input, nessuna validazione

Cosa fare ESATTAMENTE:

1. Creare file: `/src/utils/FormValidator.js`

class ExerciseFormValidator {
  static validate(data) {
    const errors = {};
    
    // Nome validazione
    if (!data.nome || data.nome.trim().length === 0) {
      errors.nome = 'Nome esercizio richiesto';
    } else if (data.nome.trim().length < 3) {
      errors.nome = 'Minimo 3 caratteri';
    } else if (data.nome.trim().length > 50) {
      errors.nome = 'Massimo 50 caratteri';
    }
    
    // Gruppo muscolare
    if (!data.gruppo || data.gruppo.trim().length === 0) {
      errors.gruppo = 'Seleziona un gruppo muscolare';
    }
    
    // Descrizione
    if (!data.descrizione || data.descrizione.trim().length === 0) {
      errors.descrizione = 'Descrizione richiesta';
    } else if (data.descrizione.trim().length > 500) {
      errors.descrizione = 'Massimo 500 caratteri';
    }
    
    return { 
      isValid: Object.keys(errors).length === 0, 
      errors 
    };
  }
  
  static renderErrors(errors, formElement) {
    // Rimuovi errori precedenti
    formElement.querySelectorAll('.error-message').forEach(el => el.remove());
    formElement.querySelectorAll('[style*="border-color"]').forEach(el => {
      el.style.borderColor = 'rgba(255,255,255,.12)';
    });
    
    // Mostra nuovi errori
    Object.entries(errors).forEach(([field, message]) => {
      const input = formElement.querySelector(`[name="${field}"]`);
      if (input) {
        // Evidenzia input rosso
        input.style.borderColor = '#FF5A6E';
        input.style.borderWidth = '1px';
        
        // Aggiungi messaggio errore
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.style.cssText = 'color:#FF5A6E;font-size:12px;margin-top:4px;';
        errorEl.textContent = message;
        input.parentNode.appendChild(errorEl);
      }
    });
  }
}

2. Modifica admin form - Nuovo esercizio:

Dove è il button "Salva esercizio", aggiungi questo:

const form = document.querySelector('form'); // o seleziona il form specifico

document.querySelector('.save-exercise-btn').addEventListener('click', function(e) {
  e.preventDefault();
  
  // Raccogli dati
  const formData = {
    nome: document.querySelector('input[placeholder="es. Squat"]')?.value || '',
    gruppo: document.querySelector('input[placeholder="es. Quadricipiti"]')?.value || '',
    descrizione: document.querySelector('textarea')?.value || '',
  };
  
  // Valida
  const { isValid, errors } = ExerciseFormValidator.validate(formData);
  
  if (!isValid) {
    ExerciseFormValidator.renderErrors(errors, form);
    ToastNotification.error('❌ Correggi gli errori nel form');
    return;
  }
  
  // Procedi con salvataggio
  ButtonStateManager.setLoading(this); // vedi TASK 4
  
  // Simula API call (sostituire con vero endpoint)
  fetch('/api/admin/exercises', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  .then(res => {
    if (!res.ok) throw new Error('Errore salvataggio');
    return res.json();
  })
  .then(data => {
    ButtonStateManager.setSuccess(this);
    ToastNotification.success('✅ Esercizio salvato');
    
    // Reset form
    form.reset();
    
    // Torna a lista esercizi dopo 1s
    setTimeout(() => {
      // switchToExercisesList() o similar navigation
    }, 1000);
  })
  .catch(err => {
    ButtonStateManager.reset(this);
    ToastNotification.error('❌ Errore nel salvataggio');
    console.error(err);
  });
});

Testing checklist:
- [ ] Clicca Save con form vuoto → errori mostrati
- [ ] Nome troppo corto → errore specifico
- [ ] Descrizione > 500 char → errore specifico
- [ ] Correggi errore → bordo torna normale
- [ ] Form valido → salva senza errori
- [ ] Post-save → success toast

---

### TASK 4: LOADING STATES E BUTTON FEEDBACK (4 ore)
Stato: Button non ha feedback, utente non sa se sta caricando

Cosa fare ESATTAMENTE:

1. Creare file: `/src/utils/ButtonStateManager.js`

class ButtonStateManager {
  static setLoading(button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
    
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
    button.disabled = false;
    
    setTimeout(() => this.reset(button), 2000);
  }
  
  static reset(button) {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || 'Salva';
    button.style.backgroundColor = '';
    button.style.color = '';
    button.style.opacity = '';
    button.style.cursor = '';
  }
}

2. Creare file: `/src/styles/spinner.css`

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(200, 247, 81, 0.3);
  border-top-color: #C8F751;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

3. Importa:
import { ButtonStateManager } from './utils/ButtonStateManager';
import './styles/spinner.css';

4. Usa con TASK 3 (vedi codice sopra nella sezione "Procedi con salvataggio")

Testing checklist:
- [ ] Click button → spinner appare
- [ ] Button disabilitato durante caricamento
- [ ] Text cambia a "Caricamento..."
- [ ] Dopo successo → "✅ Fatto!"
- [ ] 2 secondi dopo → reset a testo originale
- [ ] Nessun double-click possibile

---

### TASK 5: USER PROFILE PAGE - COMPLETO (8 ore)
Stato: Profilo mostra solo avatar+nome+piano, mancano tutto il resto

Cosa fare ESATTAMENTE:

1. Creare file: `/src/user/ProfilePage.js`

class UserProfile {
  constructor(userData) {
    this.user = userData; // { id, name, email, plan, totalWorkouts, totalHours, streak, exerciseCount }
  }
  
  render() {
    return `
      <div style="max-width:600px;margin:0 auto;">
        <!-- Header Profilo -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="width:80px;height:80px;border-radius:999px;background:#C8F751;color:#0A0F1C;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:700;margin:0 auto 16px;font-family:'Space Grotesk',sans-serif;">
            ${this.user.name.charAt(0).toUpperCase()}
          </div>
          <h1 style="font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;margin:0 0 4px;color:#ECF1F8;">${this.user.name}</h1>
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
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#C8F751;">${this.user.totalWorkouts || 0}</div>
              <div style="font-size:11px;color:#94A3B8;">Allenamenti</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#4FD1C5;">${this.user.totalHours || 0}h</div>
              <div style="font-size:11px;color:#94A3B8;">Ore totali</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#C8F751;">${this.user.streak || 0}🔥</div>
              <div style="font-size:11px;color:#94A3B8;">Streak giorni</div>
            </div>
            <div style="background:#0C1220;border-radius:8px;padding:12px;text-align:center;">
              <div style="font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#FFB547;">${this.user.exerciseCount || 0}</div>
              <div style="font-size:11px;color:#94A3B8;">Esercizi unici</div>
            </div>
          </div>
        </div>
        
        <!-- Impostazioni Account -->
        <div style="background:#121A2B;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:24px;margin-bottom:24px;">
          <h3 style="font-size:14px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;margin:0 0 16px;">Impostazioni</h3>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <button onclick="alert('TODO: Implementare change email')" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;font-size:14px;">
              ✉️ Cambia Email
            </button>
            <button onclick="alert('TODO: Implementare change password')" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;font-size:14px;">
              🔒 Cambia Password
            </button>
            <button onclick="alert('TODO: Implementare notification settings')" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;font-size:14px;">
              🔔 Notifiche
            </button>
            <button onclick="alert('TODO: Implementare privacy settings')" style="text-align:left;background:transparent;border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;color:#ECF1F8;cursor:pointer;font-size:14px;">
              🛡️ Privacy
            </button>
          </div>
        </div>
        
        <!-- Premium CTA (solo se FREE) -->
        ${this.user.plan === 'FREE' ? `
          <div style="background:linear-gradient(135deg, #C8F751 0%, #4FD1C5 100%);border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
            <h3 style="font-size:16px;font-weight:700;color:#0A0F1C;margin:0 0 8px;">Sblocca Premium</h3>
            <p style="font-size:14px;color:#0A0F1C;margin:0 0 16px;">Video analisi illimitati, AI personalizzata, community esclusiva</p>
            <button style="background:#0A0F1C;color:#C8F751;border:none;border-radius:8px;padding:12px 24px;font-weight:600;cursor:pointer;font-size:14px;">
              Scopri i piani
            </button>
          </div>
        ` : ''}
        
        <!-- Logout Button -->
        <button onclick="logout()" style="width:100%;background:transparent;border:2px solid #FF5A6E;border-radius:8px;padding:12px;color:#FF5A6E;font-weight:600;cursor:pointer;font-size:14px;">
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

// Funzione logout
function logout() {
  if (confirm('Sei sicuro di voler uscire?')) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/'; // Redirect a home
    ToastNotification.success('Logged out');
  }
}

2. Nel tuo app, quando clicca su "Profilo", mostra:

// Simula caricamento dati utente (sostituire con API call)
const userData = {
  id: '123',
  name: 'Marco',
  email: 'marco@example.com',
  plan: 'PREMIUM',
  totalWorkouts: 47,
  totalHours: 23,
  streak: 12,
  exerciseCount: 18
};

const profile = new UserProfile(userData);
const container = document.getElementById('app-content'); // o dove vuoi renderizzare
container.innerHTML = profile.render();

Testing checklist:
- [ ] Avatar mostra prima lettera nome (maiuscola)
- [ ] Nome, email, piano mostrati
- [ ] Stats caricate dal database (4 numbers)
- [ ] Button impostazioni clickabili
- [ ] Premium CTA visibile se user FREE, nascosto se PREMIUM
- [ ] Logout rimuove token e redirect a home
- [ ] Responsive su mobile (single column)

---

## DOPO AVER COMPLETATO TOP 5 TASK:

Una volta finiti questi 5 task, avrai:
- ✅ App completamente responsive (mobile, tablet, desktop)
- ✅ UX feedback system (toast notifications)
- ✅ Form validation working
- ✅ Loading states eleganti
- ✅ User profile completo con logout

A questo punto:
1. Testa l'app end-to-end
2. Riporta qualsiasi bug trovato
3. Procedi con TASK 6-10 secondo la Technical Implementation Guide

## ISTRUZIONI GENERALI:

1. Implementa ESATTAMENTE come scritto (copia-incolla codice)
2. Testa ogni task PRIMA di passare al prossimo
3. Usa ToastNotification per feedback visivo
4. Usa ButtonStateManager per loading states
5. Mantieni TUTTI i colori, font, design esattamente come è
6. Se trovi problemi, riporta ESATTAMENTE che cosa non funziona

## COMINCIAMO!

Quale task vuoi implementare PRIMA?
1. TASK 1: Responsive Design
2. TASK 2: Toast System
3. TASK 3: Form Validation
4. TASK 4: Loading States
5. TASK 5: User Profile

Oppure digli semplicemente: "Implementa TUTTI i top 5 task in questo ordine"

Buona fortuna! 🚀
```

---

## 🎯 FINE DEL PROMPT

Questo è il testo perfetto da passare a Claude Code!

