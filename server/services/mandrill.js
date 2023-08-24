import { mailchimpapikey, email } from "../../bin/www";
const mailchimp = require("@mailchimp/mailchimp_transactional")(
  mailchimpapikey
);

/**
 *
 * @param {string} name - user name
 * @param {string} toEmail - user email
 * @param {string} password - password
 * @returns {Promise}
 */
const sendPasswordMail = async (name, toEmail, password) => {
  const msg = {
    message: {
      from_email: email,
      subject: "User's Password",
      to: [{ email: toEmail, type: "to" }],
      html: `<p>Hi ${name} </p>
      <p>Your password is ${password}</p> 
      <p>You can use this password at time of login.</p>`,
    },
  };
  await sendMail(msg);
};

/**
 *
 * @param {string} msg - message template
 */
async function sendMail(msg) {
  await mailchimp.messages
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
}

module.exports = {
  sendPasswordMail,
};
