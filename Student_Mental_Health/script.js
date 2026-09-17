// ---------- Static option lists (mirrors the Pydantic model) ----------

const TOP_COUNTRIES = ['India', 'USA', 'Canada', 'Australia', 'UK', 'Germany', 'Mexico', 'Turkey', 'France'];
const ACADEMIC_LEVELS = ['Undergraduate', 'Graduate', 'High School'];
const PLATFORMS = ['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter', 'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat'];
const PURPOSES = ['Networking', 'Education', 'Entertainment', 'News'];

function fillSelect(select, values) {
  select.innerHTML = values.map(v => `<option value="${v}">${v}</option>`).join('');
}

const countrySelect = document.getElementById('country');
fillSelect(countrySelect, [...TOP_COUNTRIES, 'Other']);

fillSelect(document.getElementById('academic-level'), ACADEMIC_LEVELS);
fillSelect(document.getElementById('platform'), PLATFORMS);
fillSelect(document.getElementById('purpose'), PURPOSES);

// ---------- Country "Other" toggle ----------

const countryOtherWrap = document.getElementById('country-other-wrap');
const countryOtherInput = document.getElementById('country-other');

countrySelect.addEventListener('change', () => {
  const isOther = countrySelect.value === 'Other';
  countryOtherWrap.hidden = !isOther;
  countryOtherInput.required = isOther;
  if (!isOther) countryOtherInput.value = '';
});

// ---------- Sliders ----------

const sliders = [
  { id: 'usage', outId: 'usage-out' },
  { id: 'study', outId: 'study-out' },
  { id: 'activity', outId: 'activity-out' },
  { id: 'sleep', outId: 'sleep-out' },
];

sliders.forEach(({ id, outId }) => {
  const input = document.getElementById(id);
  const out = document.getElementById(outId);
  const update = () => { out.textContent = `${input.value} h`; };
  input.addEventListener('input', update);
  update();
});

// ---------- Segmented control (stress level) ----------

const stressGroup = document.getElementById('stress');
const stressPill = document.getElementById('stress-pill');
let stressValue = 'Medium';

// পিলকে বর্তমান active বাটনের নিচে বসায়
function moveStressPill() {
  const active = stressGroup.querySelector('button.is-active');
  const first = stressGroup.querySelector('button');
  if (!active || !first || !stressPill) return;
  stressPill.style.width = `${active.offsetWidth}px`;
  stressPill.style.transform = `translateX(${active.offsetLeft - first.offsetLeft}px)`;
}

stressGroup.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  stressGroup.querySelectorAll('button').forEach(b => {
    b.classList.remove('is-active');
    b.setAttribute('aria-checked', 'false');
  });
  btn.classList.add('is-active');
  btn.setAttribute('aria-checked', 'true');
  stressValue = btn.dataset.value;
  moveStressPill();
});

moveStressPill();
window.addEventListener('load', moveStressPill);
window.addEventListener('resize', moveStressPill);

// ---------- API base URL (persisted) ----------

const apiBaseInput = document.getElementById('api-base');
const defaultBase = window.location.protocol === 'http:' || window.location.protocol === 'https:'
  ? window.location.origin
  : 'http://127.0.0.1:8000';
const savedBase = localStorage.getItem('mh-api-base');
apiBaseInput.value = (savedBase || defaultBase).replace(/\/predict\/?$/, '').replace(/\/$/, '');
apiBaseInput.addEventListener('change', () => {
  apiBaseInput.value = apiBaseInput.value.trim().replace(/\/predict\/?$/, '').replace(/\/$/, '');
  localStorage.setItem('mh-api-base', apiBaseInput.value);
});

// ---------- Result panel elements ----------

const resultEmpty = document.getElementById('result-empty');
const resultContent = document.getElementById('result-content');
const resultError = document.getElementById('result-error');
const resultErrorText = document.getElementById('result-error-text');
const scoreValueEl = document.getElementById('score-value');
const resultReadEl = document.getElementById('result-read');
const gaugeValue = document.getElementById('gauge-value');

const GAUGE_CIRCUMFERENCE = 282.7; // pi * r(90), matches the SVG arc length

function showPanel(which) {
  resultEmpty.hidden = which !== 'empty';
  resultContent.hidden = which !== 'content';
  resultError.hidden = which !== 'error';
}

function readingFor(score) {
  if (score < 4) return "This lands lower than most students in the data — worth a gentler week.";
  if (score < 7) return "Middling — some pressure, but holding steady.";
  return "Comfortably above where most students in the data land.";
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


function animateScoreNumber(target) {
  if (prefersReducedMotion) {
    scoreValueEl.textContent = target.toFixed(1);
    return;
  }
  const duration = 700;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    scoreValueEl.textContent = (target * eased).toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
    else scoreValueEl.textContent = target.toFixed(1);
  }
  requestAnimationFrame(tick);
}

function renderScore(score) {
  const clamped = Math.max(0, Math.min(10, score));
  animateScoreNumber(score);
  resultReadEl.textContent = readingFor(clamped);

  const strokeColor = clamped < 4 ? 'var(--danger)' : clamped < 7 ? 'var(--amber)' : 'var(--teal)';
  gaugeValue.style.stroke = strokeColor;
  gaugeValue.style.filter = `drop-shadow(0 0 8px ${strokeColor})`;

  // reset then animate on next frame so the transition always fires
  gaugeValue.style.transition = 'none';
  gaugeValue.style.strokeDashoffset = GAUGE_CIRCUMFERENCE;
  requestAnimationFrame(() => {
    gaugeValue.style.transition = '';
    const offset = GAUGE_CIRCUMFERENCE * (1 - clamped / 10);
    gaugeValue.style.strokeDashoffset = offset;
  });

  showPanel('content');
}

// ---------- Form submit ----------

const form = document.getElementById('check-form');
const submitBtn = document.getElementById('submit-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const country = countrySelect.value === 'Other'
    ? (countryOtherInput.value.trim() || 'Other')
    : countrySelect.value;

  const payload = {
    age: Number(document.getElementById('age').value),
    gender: document.getElementById('gender').value,
    country,
    academic_level: document.getElementById('academic-level').value,
    most_used_platform: document.getElementById('platform').value,
    purpose_of_use: document.getElementById('purpose').value,
    avg_daily_usage_hours: Number(document.getElementById('usage').value),
    daily_unlocks: Number(document.getElementById('unlocks').value),
    study_hours: Number(document.getElementById('study').value),
    physical_activity_hours: Number(document.getElementById('activity').value),
    sleep_hours_per_night: Number(document.getElementById('sleep').value),
    stress_level: stressValue,
  };

  const base = (apiBaseInput.value.trim() || 'http://127.0.0.1:8000')
    .replace(/\/predict\/?$/, '')
    .replace(/\/$/, '');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking…';

  try {
    const res = await fetch(`${base}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Server responded ${res.status}${detail ? `: ${detail}` : ''}`);
    }

    const data = await res.json();
    renderScore(data.predicted_mental_health_score);
  } catch (err) {
    resultErrorText.textContent = err instanceof TypeError
      ? `Couldn't connect to ${base}. Start the API with "uvicorn main:app --reload" and check the server URL.`
      : `Something went wrong: ${err.message}`;
    showPanel('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get my score';
  }
});
