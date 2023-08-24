import moment from 'moment';

/**
 * @param {string} pLength password length
 * @return {string} strong password
 */
async function generatePassword(pLength) {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const number = '0123456789';
  const symbol = '!@#$%^&*';

  const full = upperCase.concat(lowerCase, number, symbol);
  let unshuffled = [];

  unshuffled.push(upperCase[Math.floor(Math.random() * upperCase.length)]);
  unshuffled.push(lowerCase[Math.floor(Math.random() * lowerCase.length)]);
  unshuffled.push(number[Math.floor(Math.random() * number.length)]);
  unshuffled.push(symbol[Math.floor(Math.random() * symbol.length)]);

  for (let i = 0; i < pLength - 4; i++) {
    unshuffled.push(full[Math.floor(Math.random() * full.length)]);
  }

  let shuffled = unshuffled
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.join('');
}

/**
 * @param {string} filetype - file tye
 * @returns {string} file type
 */
function getFileType(filetype) {
  if (_checkIfFileIs(filetype, 'image')) {
    return 'image';
  } else if (_checkIfFileIs(filetype, 'video')) {
    return 'video';
  } else if (_checkIfFileIs(filetype, 'audio')) {
    return 'audio';
  } else if (filetype === 'application/pdf') {
    return 'pdf';
  }
  return 'file';
}

/**
 * @param {string} filetype - MIME type
 * @param {string} matches - file type
 * @returns { boolean } - return true when conditions satisfies
 */
function _checkIfFileIs(filetype, matches) {
  var uploadedFileType = filetype.substr(0, filetype.indexOf('/'));
  if (uploadedFileType.indexOf(matches) >= 0) {
    return true;
  }
  return false;
}

const startDate = moment().utc().startOf('month');
const endDate = moment().utc().endOf('month');
const startOfToday = moment().utc().startOf('day');
const endOfToday = moment().utc().endOf('day');

module.exports = {
  generatePassword,
  getFileType,
  startDate,
  endDate,
  startOfToday,
  endOfToday,
};
