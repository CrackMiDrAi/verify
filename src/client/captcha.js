
export function CreateNewCaptcha() {
  const captchaOverlay = document.createElement('div');
  const captchaContainer = document.createElement('div');

  captchaOverlay.className = 'captcha-overlay';
  captchaContainer.className = 'captcha-container';

  captchaContainer.innerText = 'Loading reCAPTCHA...';

  document.body.appendChild(captchaOverlay);
  document.body.appendChild(captchaContainer);

  // For some stupid animation
  setTimeout(() => {
    captchaOverlay.classList.add('show');
    captchaContainer.classList.add('show');
  }, 100);

  const destroyCaptchaElement = () => {
    setTimeout(() => {
      captchaOverlay.classList.remove('show');
      captchaContainer.classList.remove('show');
    }, 500);

    setTimeout(() => {
      document.body.removeChild(captchaOverlay);
      document.body.removeChild(captchaContainer);
    }, 1000);
  };

  return new Promise((res, rej) => {
    const initCaptcha = () => grecaptcha.render(captchaContainer, {
      sitekey: import.meta.env.RECAPTCHA_SITEKEY,
      theme: 'dark',
      callback: response => {
        res(response);
        destroyCaptchaElement();
      },
      'error-callback': () => {
        rej('Failed to load reCAPTCHA');
        destroyCaptchaElement();
      }
    });

    let captchaLoadTimeCount = 0;
    const captchaApiClock = setInterval(() => {
      if (grecaptcha && typeof grecaptcha === 'object') {
        initCaptcha();
        clearInterval(captchaApiClock);
      }

      captchaLoadTimeCount++;

      if (captchaLoadTimeCount >= 30) {
        rej('Failed to load reCAPTCHA API');
        clearInterval(captchaApiClock);
      }
    }, 100);
  });
}
