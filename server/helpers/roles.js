const allRoles = {
  admin: [],
};

const roles = Object.keys(allRoles);
const roleObj = roles.reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, {});

module.exports = {
  allRoles,
  roles,
  roleObj,
};
