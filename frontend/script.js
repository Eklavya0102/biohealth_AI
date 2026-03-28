// Frontend logic for BioHealth AI Dashboard

document.addEventListener('DOMContentLoaded', () => {
  // Central modal state for all tools
  let isModalOpen = false;
  let activeTool = null;

  // Centralized handler to open tools
  function handleOpenTool(toolName) {
    console.log('Button clicked', toolName);
    activeTool = toolName;
    isModalOpen = true;
    // Render using existing tool rendering flow
    if (typeof openTool === 'function') {
      openTool(toolName);
    }
    // Ensure modal is visible
    const modal = document.getElementById('toolModal');
    if (modal) {
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
    }
  }
  // Theme initialization
  const storedTheme = localStorage.getItem('theme') || 'light';
  setTheme(storedTheme);

  const themeBtn = document.getElementById('themeSwitch');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-mode');
      const next = isDark ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // Animate card content on appear for new square cards
  const tops = document.querySelectorAll('.card-top');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
      }
    });
  }, { threshold: 0.3 });
  tops.forEach(t => observer.observe(t));

  // Modal logic
  const modal = document.getElementById('toolModal');
  const modalClose = modal.querySelector('.close');
  modalClose.addEventListener('click', () => closeModal());
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  // Attach open tool handlers (centralized)
  document.querySelectorAll('.open-tool').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Prevent Shuffle Tips button from triggering tool modal
      if (btn.id === 'shuffleTips') {
        return;
      }
      // Stop propagation to avoid parent card handlers
      e.stopPropagation();
      // Determine target and route through central handler
      const tool = btn.getAttribute('data-tool');
      handleOpenTool(tool);
    });
  });

  // Report Analyzer: add a dedicated branch in openTool (reintroducing)

  // Report Analyzer specific button handlers have been removed to revert to original behavior

  // Health Tips (dynamic)
  const HEALTH_TIPS_MASTER = [
    { text: 'Drink 8 cups of water daily', iconClass: 'fa-water' },
    { text: 'Eat more fruits & vegetables', iconClass: 'fa-apple-alt' },
    { text: 'Aim for 7-9 hours of sleep', iconClass: 'fa-bed' },
    { text: 'Move 30 minutes daily', iconClass: 'fa-walking' },
    { text: 'Limit processed sugars', iconClass: 'fa-leaf' },
    { text: 'Stay up-to-date with vaccines', iconClass: 'fa-bell' }
  ];

  function renderTips() {
    const body = document.getElementById('tipsBody');
    if (!body) return;
    // shuffle copy
    const pool = HEALTH_TIPS_MASTER.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = Math.min(6, pool.length);
    const selected = pool.slice(0, count);
    body.innerHTML = selected
      .map(t => `<div class="tip-item"><span class="tip-icon"><i class="fa-solid ${t.iconClass}"></i></span><span class="tip-text">${t.text}</span></div>`)
      .join('');
  }

  // Init visibility and content
  const tipsToggle = document.getElementById('tipsToggle');
  const tipsBody = document.getElementById('tipsBody');
  if (tipsToggle && tipsBody) {
    // Load saved preference
    const visible = localStorage.getItem('tips_visible');
    if (visible !== null) {
      tipsToggle.checked = visible === 'true';
    }
    tipsBody.style.display = tipsToggle.checked ? 'grid' : 'none';
    tipsToggle.addEventListener('change', () => {
      tipsBody.style.display = tipsToggle.checked ? 'grid' : 'none';
      localStorage.setItem('tips_visible', String(tipsToggle.checked));
    });
    // Shuffle on click
    const shuffleBtn = document.getElementById('shuffleTips');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        renderTips();
      });
    }
    // Initial render
    renderTips();
  }
});

function setTheme(theme) {
  const body = document.body;
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
  localStorage.setItem('theme', theme);
}

function openTool(tool) {
  const modal = document.getElementById('toolModal');
  const titleEl = document.getElementById('toolTitle');
  const bodyEl = document.getElementById('toolBody');
  const footerEl = document.getElementById('toolFooter');

  footerEl.innerHTML = '';
  if (tool === 'bmi') {
    titleEl.textContent = 'BMI Calculator';
    bodyEl.innerHTML = `
      <div class="row" style="gap:12px; align-items:center;">
        <div style="flex:1;">
          <label class="label">Height (cm)</label>
          <input id="bmiHeight" class="input" type="number" min="1" placeholder="e.g. 170">
        </div>
        <div style="flex:1;">
          <label class="label">Weight (kg)</label>
          <input id="bmiWeight" class="input" type="number" min="1" placeholder="e.g. 70">
        </div>
      </div>
      <button id="bmiCalculate" class="open-tool" style="margin-top:10px;">Calculate BMI</button>
      <div id="bmiResult" class="result" aria-live="polite" style="display:none;"></div>
    `;
    // Bind calculate
    setTimeout(() => {
      const calcBtn = document.getElementById('bmiCalculate');
      calcBtn.addEventListener('click', async () => {
        const h = parseFloat(document.getElementById('bmiHeight').value);
        const w = parseFloat(document.getElementById('bmiWeight').value);
        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
          alert('Please enter valid height and weight.');
          return;
        }
        try {
          const res = await fetch('/calculate-bmi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ height: h, weight: w })
          });
          const data = await res.json();
          const bmi = data.bmi;
          const cat = data.category;
          const s = data.suggestions || [];
          const html = `<div style="font-weight:600; font-size:1.05rem; margin-bottom:6px;">BMI: ${bmi} (${cat})</div>` +
                       `<div>Suggestions:</div><ul>${s.map(x => `<li>${x}</li>`).join('')}</ul>`;
          const out = document.getElementById('bmiResult');
          out.innerHTML = html;
          out.style.display = 'block';
        } catch (e) {
          alert('Error calculating BMI.');
        }
      });
    }, 0);
  } else if (tool === 'blood') {
    titleEl.textContent = 'Blood Compatibility';
    bodyEl.innerHTML = `
      <div class="row" style="gap:12px; align-items:center;">
        <div style="flex:1;">
          <label class="label">Donor Blood Group</label>
          <select id="donor" class="input">
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>
        <div style="flex:1;">
          <label class="label">Receiver Blood Group</label>
          <select id="receiver" class="input">
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>
      </div>
      <button id="checkBlood" class="open-tool" style="margin-top:10px;">Check Compatibility</button>
      <div id="bloodResult" class="result" aria-live="polite" style="display:none;"></div>
    `;
    setTimeout(() => {
      const btn = document.getElementById('checkBlood');
      btn.addEventListener('click', async () => {
        const donor = document.getElementById('donor').value;
        const receiver = document.getElementById('receiver').value;
        try {
          const res = await fetch('/check-blood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ donor, receiver })
          });
          const data = await res.json();
          const comp = data.compatible ? 'Compatible' : 'Not Compatible';
          const expl = data.explanation;
          const html = `<div style="font-weight:600;">${comp}</div><div>${expl}</div>`;
          const out = document.getElementById('bloodResult');
          out.innerHTML = html;
          out.style.display = 'block';
        } catch (e) {
          alert('Error checking compatibility.');
        }
      });
    }, 0);
  } else if (tool === 'disease') {
    titleEl.textContent = 'Disease Predictor (Symptoms)';
    const symptomsList = ['fever','cough','headache','fatigue','nausea','vomiting','sore throat','runny nose','chest pain','dizziness'];
    bodyEl.innerHTML = `
      <div class="row" style="flex-wrap: wrap; gap: 8px;">
        ${symptomsList.map(s => `
          <label style="display:flex; align-items:center; gap:6px; padding:6px 8px; border-radius:6px; background: rgba(0,0,0,0.04);">
            <input type="checkbox" value="${s}" /> ${s}
          </label>`).join('')}
      </div>
      <button id="predictDisease" class="open-tool" style="margin-top:10px;">Predict Disease</button>
      <div id="diseaseResult" class="result" aria-live="polite" style="display:none;">
        <div id="diseaseTitle" style="font-weight:700; margin-bottom:6px;"></div>
        <div id="diseaseContent"></div>
      </div>
      <div id="diseaseDisclaimer" class="result" style="display:none; margin-top:8px; font-size: 0.95rem; color: #d1d5db;">Note: This is NOT a medical diagnosis.</div>
    `;
    setTimeout(() => {
      const btn = document.getElementById('predictDisease');
      btn.addEventListener('click', async () => {
        const checks = Array.from(document.querySelectorAll('#toolBody input[type="checkbox"]'))
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        if (checks.length === 0) {
          alert('Please select at least one symptom.');
          return;
        }
        // Show loading spinner
        const body = document.getElementById('toolBody');
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        body.insertAdjacentElement('afterend', spinner);
        try {
          const res = await fetch('/predict-disease', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms: checks })
          });
          const data = await res.json();
          const disease = data.disease || 'Unknown';
          const medicines = data.medicines || [];
          const precautions = data.precautions || [];
          const tips = data.tips || [];
          const html = `
            <div style="font-weight:700; font-size:1.05rem; margin-bottom:6px;">Predicted: ${disease}</div>
            <div><strong>Medicines:</strong> ${medicines.join(', ')}</div>
            <div><strong>Precautions:</strong> ${precautions.join('; ')}</div>
            <div><strong>Things to Do:</strong> ${tips.join('; ')}</div>
          `;
          document.getElementById('diseaseTitle').textContent = disease;
          document.getElementById('diseaseContent').innerHTML = html;
          const disc = document.getElementById('diseaseDisclaimer');
          disc.style.display = 'block';
          const resDiv = document.getElementById('diseaseResult');
          resDiv.style.display = 'block';
        } catch (e) {
          alert('Error predicting disease.');
        } finally {
          if (typeof spinner.remove === 'function') spinner.remove();
        }
      });
    }, 0);
}

  // Blood Group Predictor tool (Genetics) - new tool (ABO+Rh)
  else if (tool === 'bloodgroup') {
    titleEl.textContent = 'Blood Group Predictor';
    // New inputs: ABO + Rh for both parents
    bodyEl.innerHTML = `
      <div class="row" style="gap:12px; justify-content:center;">
        <div style="min-width:160px; text-align:center;">
          <label class="label" for="bgpFatherABO">Father ABO</label>
          <select id="bgpFatherABO" class="input">
            <option>A</option><option>B</option><option>AB</option><option>O</option>
          </select>
        </div>
        <div style="min-width:120px; text-align:center;">
          <label class="label" for="bgpFatherRh">Father Rh</label>
          <select id="bgpFatherRh" class="input"><option>+</option><option>-</option></select>
        </div>
      </div>
      <div class="row" style="gap:12px; justify-content:center; margin-top:6px;">
        <div style="min-width:160px; text-align:center;">
          <label class="label" for="bgpMotherABO">Mother ABO</label>
          <select id="bgpMotherABO" class="input">
            <option>A</option><option>B</option><option>AB</option><option>O</option>
          </select>
        </div>
        <div style="min-width:120px; text-align:center;">
          <label class="label" for="bgpMotherRh">Mother Rh</label>
          <select id="bgpMotherRh" class="input"><option>+</option><option>-</option></select>
        </div>
      </div>
      <div style="text-align:center; margin-top:8px;">
        <button id="bgpPredict" class="open-tool" style="margin-top:6px;">Predict Blood Groups</button>
      </div>
      <div id="bgpResult" class="result" aria-live="polite" style="display:none; margin-top:8px;"></div>
      <div id="bgpExplanation" class="result" style="display:none; margin-top:6px; font-size:0.95rem; color:#d1d5db; text-align:left; padding:0 8px;"></div>
    `;
    setTimeout(() => {
      const btn = document.getElementById('bgpPredict');
      const fatherABO = document.getElementById('bgpFatherABO');
      const fatherRh = document.getElementById('bgpFatherRh');
      const motherABO = document.getElementById('bgpMotherABO');
      const motherRh = document.getElementById('bgpMotherRh');
      const res = document.getElementById('bgpResult');
      const expl = document.getElementById('bgpExplanation');
      btn.addEventListener('click', () => {
        const fABO = fatherABO.value;
        const fRh = fatherRh.value;
        const mABO = motherABO.value;
        const mRh = motherRh.value;
        const possible = predictBloodGroupsABORh(fABO, fRh, mABO, mRh);
        res.innerHTML = `<div style="font-weight:600; margin-bottom:6px;">Possible Child Blood Groups:</div><ul>${possible.map(x => `<li>${x}</li>`).join('')}</ul>`;
        res.style.display = 'block';
        expl.style.display = 'block';
      });
    }, 0);
  } 
  // Report Analyzer block removed to revert to original UI
  // Do not automatically show modal here; each tool branch handles its own UI and visibility.
}

function closeModal() {
  const modal = document.getElementById('toolModal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  // Reset content
  const body = document.getElementById('toolBody');
  if (body) body.innerHTML = '';
}
// Mendelian genetics helper: compute possible child ABO groups
function computeBloodGroupFromParents(fatherGroup, motherGroup) {
  // Legacy: ABO-only computation helper
  const geno = {
    'A': [['A','A'], ['A','O']],
    'B': [['B','B'], ['B','O']],
    'AB': [['A','B']],
    'O': [['O','O']]
  };
  const fGen = geno[fatherGroup] || [];
  const mGen = geno[motherGroup] || [];
  const results = new Set();
  for (const fg of fGen) {
    for (const mg of mGen) {
      for (const a of fg) {
        for (const b of mg) {
          const pair = [a,b].sort().join('');
          let ph = null;
          if (pair === 'AA' || pair === 'AO') ph = 'A';
          else if (pair === 'BB' || pair === 'BO') ph = 'B';
          else if (pair === 'AB') ph = 'AB';
          else if (pair === 'OO') ph = 'O';
          if (ph) results.add(ph);
        }
      }
    }
  }
  const order = ['A','B','AB','O'];
  return order.filter(x => results.has(x));
}

// ABO+Rh comprehensive predictor helpers
function ABOO(at) {
  // helper not used directly; kept for readability
  return at;
}
// Helper: derive ABO possible phenotypes from two parental ABO genotype alleles
function deriveABOFromAlleles(a, b) {
  // a and b are alleles like 'A','O','B'
  const set = new Set([a, b]);
  if (set.has('A') && set.has('B')) return 'AB';
  if (set.has('A')) return 'A';
  if (set.has('B')) return 'B';
  return 'O';
}

// ABO genotype options for each ABO phenotype
const ABO_GENOTYPES = {
  A: [['A','A'], ['A','O']],
  B: [['B','B'], ['B','O']],
  AB: [['A','B']],
  O: [['O','O']]
};

function deriveABOPossibilitiesFromABOandMother(fABO, mABO) {
  const res = new Set();
  const fGen = ABO_GENOTYPES[fABO] || [];
  const mGen = ABO_GENOTYPES[mABO] || [];
  for (const fg of fGen) {
    for (const mg of mGen) {
      // cross each allele from father with each allele from mother
      for (const fa of fg) {
        for (const ma of mg) {
          res.add(deriveABOFromAlleles(fa, ma));
        }
      }
    }
  }
  return Array.from(res);
}

function deriveRhFromPhenotypes(fp, mp) {
  // fp/mp are '+' or '-'
  const fatherGenotypes = (fp === '+') ? ['DD','Dd'] : ['dd'];
  const motherGenotypes = (mp === '+') ? ['DD','Dd'] : ['dd'];
  const results = new Set();
  fatherGenotypes.forEach(fg => {
    motherGenotypes.forEach(pg => {
      const fAlleles = fg.split('');
      const mAlleles = pg.split('');
      fAlleles.forEach(f => mAlleles.forEach(m => {
        const hasD = (f === 'D') || (m === 'D');
        results.add(hasD ? '+' : '-');
      }));
    });
  });
  return Array.from(results);
}

function predictBloodGroupsABORh(fABO, fRh, mABO, mRh) {
  const aboOut = new Set(deriveABOPossibilitiesFromABOandMother(fABO, mABO));
  const rhOut = new Set(deriveRhFromPhenotypes(fRh, mRh));
  const ABOOrder = ['A','B','AB','O'];
  const RhOrder = ['+','-'];
  const final = [];
  ABOOrder.forEach(abo => {
    if (aboOut.has(abo)) {
      RhOrder.forEach(rh => {
        if (rhOut.has(rh)) final.push(abo + rh);
      });
    }
  });
  return final;
}
