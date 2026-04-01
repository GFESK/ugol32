/* ============================================
   УГОЛ32 — Form Logic
   Validation, phone mask, Email + Telegram
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Configuration --- */
  const CONFIG = {
    // Telegram Bot API
    telegramBotToken: 'YOUR_BOT_TOKEN',
    telegramChatId: 'YOUR_CHAT_ID',
    // EmailJS (or FormSubmit)
    emailServiceId: 'YOUR_SERVICE_ID',
    emailTemplateId: 'YOUR_TEMPLATE_ID',
    emailPublicKey: 'YOUR_PUBLIC_KEY',
    // Fallback phone
    fallbackPhone: '+7 (XXX) XXX-XX-XX',
  };

  /* --- Phone Mask --- */
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', handlePhoneMask);
    input.addEventListener('focus', handlePhoneMask);
    input.addEventListener('keydown', handlePhoneKeydown);
  });

  function handlePhoneMask(e) {
    const input = e.target;
    let digits = input.value.replace(/\D/g, '');

    // Ensure starts with 7
    if (digits.length === 0) {
      input.value = '';
      return;
    }
    if (digits[0] === '8') digits = '7' + digits.slice(1);
    if (digits[0] !== '7') digits = '7' + digits;

    // Limit to 11 digits
    digits = digits.slice(0, 11);

    // Format: +7 (XXX) XXX-XX-XX
    let formatted = '+7';
    if (digits.length > 1) formatted += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) formatted += ')';
    if (digits.length > 4) formatted += ' ' + digits.slice(4, 7);
    if (digits.length > 7) formatted += '-' + digits.slice(7, 9);
    if (digits.length > 9) formatted += '-' + digits.slice(9, 11);

    input.value = formatted;
  }

  function handlePhoneKeydown(e) {
    // Allow backspace to work naturally
    if (e.key === 'Backspace' && e.target.value.length <= 3) {
      e.target.value = '';
      e.preventDefault();
    }
  }

  /* --- Form Validation & Submission --- */
  const forms = document.querySelectorAll('.contact-form');
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });

  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('.btn-submit');
    const msgEl = form.querySelector('.form-message');

    // Reset message
    if (msgEl) {
      msgEl.className = 'form-message';
      msgEl.style.display = 'none';
      msgEl.textContent = '';
    }

    // Gather values
    const name = form.querySelector('[name="name"]')?.value.trim() || '';
    const phone = form.querySelector('[name="phone"]')?.value.trim() || '';
    const service = form.querySelector('[name="service"]')?.value || '';
    const message = form.querySelector('[name="message"]')?.value.trim() || '';
    const consent = form.querySelector('[name="consent"]')?.checked;

    // Validate
    const errors = [];
    if (name.length < 2) errors.push('Введите имя (минимум 2 символа)');
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name) && name.length >= 2) errors.push('Имя содержит недопустимые символы');

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 11) errors.push('Введите корректный номер телефона');

    if (!consent) errors.push('Необходимо согласие на обработку данных');

    if (errors.length > 0) {
      showMessage(msgEl, errors.join('. '), 'error');
      return;
    }

    // Disable button
    const btnText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    // Build message text
    const text = [
      '--- Новая заявка с сайта ugol32.ru ---',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      service ? `Услуга: ${service}` : '',
      message ? `Сообщение: ${message}` : '',
      `Время: ${new Date().toLocaleString('ru-RU')}`
    ].filter(Boolean).join('\n');

    let success = false;

    // Send to Telegram
    if (CONFIG.telegramBotToken !== 'YOUR_BOT_TOKEN') {
      try {
        const tgResp = await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CONFIG.telegramChatId,
            text: text,
            parse_mode: 'HTML'
          })
        });
        if (tgResp.ok) success = true;
      } catch (err) {
        console.warn('Telegram send failed:', err);
      }
    }

    // Send Email via EmailJS (if configured)
    if (typeof emailjs !== 'undefined' && CONFIG.emailServiceId !== 'YOUR_SERVICE_ID') {
      try {
        await emailjs.send(CONFIG.emailServiceId, CONFIG.emailTemplateId, {
          from_name: name,
          phone: phone,
          service: service,
          message: message
        });
        success = true;
      } catch (err) {
        console.warn('EmailJS send failed:', err);
      }
    }

    // If no services configured, simulate success for development
    if (CONFIG.telegramBotToken === 'YOUR_BOT_TOKEN' && CONFIG.emailServiceId === 'YOUR_SERVICE_ID') {
      console.log('Form data (dev mode):', { name, phone, service, message });
      success = true;
    }

    // Restore button
    btn.disabled = false;
    btn.textContent = btnText;

    if (success) {
      showMessage(msgEl, 'Заявка отправлена! Мы перезвоним в течение 30 минут.', 'success');
      form.reset();
    } else {
      showMessage(msgEl, `Не удалось отправить заявку. Позвоните нам: ${CONFIG.fallbackPhone}`, 'error');
    }
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

});
