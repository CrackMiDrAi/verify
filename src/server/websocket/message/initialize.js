import sa from 'superagent';

const CaptchaAPI = process.env.CAPTCHA_API || 'https://recaptcha.net/recaptcha/api/siteverify';

export function WebSocketInitialzeHandler(data, sendMsg) {
  verifyCaptcha(data.token)
    .then(e => {
      if (e.success) sendMsg({ type: 'InitializeMessage', data: { result: true }});
      else sendMsg({ type: 'InitializeMessage', data: { result: false, msg: e['error-codes'].join(',') }});
    })
    .catch(e => {
      console.error(e);
      sendMsg({ type: 'InitializeMessage', data: { result: false, msg: 'Internal server error' }});
    });
}

function verifyCaptcha(token) {
  return new Promise((res, rej) => {
    sa.post(CaptchaAPI)
      .send({
        secret: process.env.RECAPTCHA_KEY,
        response: token,
      })
      .type('form')
      .accept('json')
      .then(e => res(e.body))
      .catch(e => rej(e));
  });
}