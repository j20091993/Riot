const SUBJECT_LABELS = {
  general: 'General Inquiry',
  order: 'Order Issue',
  'custom-vp': 'Custom Valorant Points Amount',
  account: 'Account Question',
  payment: 'Payment Help',
};

const FIELD_MESSAGES = {
  name: 'Please enter your name.',
  email: 'Please enter a valid email address.',
  subject: 'Please select a subject.',
  message: 'Please enter a message.',
};

function initCustomSelect(wrapper) {
  const native = wrapper.querySelector('.custom-select-native');
  const trigger = wrapper.querySelector('.custom-select-trigger');
  const valueEl = wrapper.querySelector('.custom-select-value');
  const menu = wrapper.querySelector('.custom-select-menu');
  if (!native || !trigger || !valueEl || !menu) return;

  const options = [...native.options].filter((o) => o.value !== '');

  menu.innerHTML = options.map((opt) => `
    <li>
      <button type="button" class="custom-select-option" role="option" data-value="${opt.value}">
        ${opt.textContent}
      </button>
    </li>
  `).join('');

  const close = () => {
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  };

  const setValue = (value, label) => {
    native.value = value;
    valueEl.textContent = label;
    valueEl.classList.toggle('is-placeholder', !value);
    wrapper.classList.toggle('has-value', Boolean(value));
    menu.querySelectorAll('.custom-select-option').forEach((btn) => {
      const selected = btn.dataset.value === value;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    close();
    native.dispatchEvent(new Event('change', { bubbles: true }));
  };

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wrapper.classList.contains('is-open')) close();
    else open();
  });

  menu.querySelectorAll('.custom-select-option').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setValue(btn.dataset.value, btn.textContent.trim());
    });
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

function clearFieldError(field) {
  field.classList.remove('is-invalid');
  const err = field.querySelector('.field-error');
  if (err) err.textContent = '';
}

function setFieldError(fieldName, message) {
  const field = document.querySelector(`.form-field[data-field="${fieldName}"]`);
  if (!field) return;
  field.classList.add('is-invalid');
  const err = field.querySelector('.field-error');
  if (err) err.textContent = message;
}

function validateReachForm(form) {
  let valid = true;
  form.querySelectorAll('.form-field').forEach(clearFieldError);

  const name = form.name.value.trim();
  if (!name) {
    setFieldError('name', FIELD_MESSAGES.name);
    valid = false;
  }

  const email = form.email.value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    setFieldError('email', FIELD_MESSAGES.email);
    valid = false;
  }

  const subject = form.subject.value;
  if (!subject) {
    setFieldError('subject', FIELD_MESSAGES.subject);
    valid = false;
  }

  const message = form.message.value.trim();
  if (!message) {
    setFieldError('message', FIELD_MESSAGES.message);
    valid = false;
  }

  return valid;
}

function showFormLoading() {
  const panel = document.getElementById('contact-form-panel');
  const loading = document.getElementById('contact-loading');
  if (panel) panel.classList.add('hidden');
  if (loading) loading.classList.remove('hidden');
}

function showFormSuccess() {
  const loading = document.getElementById('contact-loading');
  const success = document.getElementById('contact-success');
  if (loading) {
    loading.classList.add('hidden');
    loading.setAttribute('aria-busy', 'false');
  }
  if (success) success.classList.remove('hidden');
}

function showFormError(message) {
  const loading = document.getElementById('contact-loading');
  const panel = document.getElementById('contact-form-panel');
  const errEl = document.getElementById('contact-error');

  if (loading) {
    loading.classList.add('hidden');
    loading.setAttribute('aria-busy', 'false');
  }
  if (panel) panel.classList.remove('hidden');
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.remove('hidden');
  } else {
    showToast(message);
  }
}

async function sendContactToTelegram(data) {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send message. Please try again.');
  }

  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  initLayout('reach');

  const selectWrapper = document.getElementById('subject-select');
  if (selectWrapper) initCustomSelect(selectWrapper);

  const form = document.getElementById('reach-form');
  if (!form) return;

  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => {
      const field = input.closest('.form-field');
      if (field) clearFieldError(field);
    });
  });

  const subjectSelect = form.querySelector('[name="subject"]');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', () => {
      const field = document.querySelector('.form-field[data-field="subject"]');
      if (field) clearFieldError(field);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateReachForm(form)) return;

    const errEl = document.getElementById('contact-error');
    if (errEl) errEl.classList.add('hidden');

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value,
      subjectLabel: SUBJECT_LABELS[form.subject.value] || form.subject.value,
      message: form.message.value.trim(),
    };

    const submitBtn = form.querySelector('#reach-submit');
    if (submitBtn) submitBtn.disabled = true;

    showFormLoading();

    try {
      await sendContactToTelegram(data);
      showFormSuccess();
    } catch (err) {
      showFormError(err.message || 'Failed to send message. Please try again.');
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});