import express from 'express';
import sa from 'superagent';

const CaptchaAPI = process.env.CAPTCHA_API || 'https://recaptcha.net/recaptcha/api/siteverify';
const captcha = express.Router();

captcha.use(express.json());

captcha
  .post('/', (req, res) => {
    const { captchaToken } = req.body;

    if (!captchaToken || captchaToken === '') {
      res.status(400).send({
        msg: 'No token provided',
      });
      return;
    }
    
    verifyCaptcha(captchaToken)
      .then(e => {
        if (e.success) {
          res.send({
            msg: 'ok'
          });
        } else {
          res.status(400).send({
            msg: e['error-codes'].join(','),
          });
        }
      })
      .catch(e => {
        console.error(e);
        res.status(500).send({
          msg: 'Failed to verify CAPTCHA'
        });
      });
  });

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

export { captcha as RouterCaptcha };