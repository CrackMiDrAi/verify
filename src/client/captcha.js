
export function CreateNewCaptcha(element) {
  return new Promise(async (res, rej) => {
    const initCaptcha = () => {
      grecaptcha.render(element, {
        sitekey: import.meta.env.RECAPTCHA_SITEKEY,
        callback: response => {
          res(response);
        },
        'error-callback': e => {
          rej(e);
        },
        'expired-callback': e => {
          rej(e);
        }
      });
    };

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
