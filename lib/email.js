'use strict';
/* Utility function to return a working delivery module (email)
 * 
 * Deliver module API:
 * async (user, token, req) => {}
 * 
 */

const email = require('emailjs');
const { promisifyAll } = require('./utils/promise');

const defaultTemplate = ({ user, token, tokenField, req }) => {
  const { hostname, protocol } = req;
  return {
    subject: `Token for ${hostname}!`,
    text: `Hello!\nAccess your account here: ${protocol}://${hostname}/??{tokenField}=${token}`
  };
};

module.exports = ({
  template = defaultTemplate,
  from,
  tokenField,
  ...smtpConfig
}) => {
  const smtpServer = promisifyAll(
    email.server.connect({
      ssl: true,
      ...smtpConfig
    })
  );

  return {
    addressField: 'email',
    async send(user, token, req) {
      await smtpServer.sendAsync({
        to: user.email,
        from,
        ...template({ user, token, tokenField, req })
      });
    }
  };
};
