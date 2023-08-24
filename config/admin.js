// import { roleObj } from '../server/helpers/roles';
// import user from '../server/models/user.model';

// //automatically create superadmin
// async function createAdmin(name, email, password, phoneNumber, profilePicture) {
//   try {
//     let findUser = await user.findOne({ email });
//     if (!findUser) {
//       await user.create({
//         name,
//         email,
//         password,
//         phoneNumber,
//         profilePicture,
//         role: roleObj.admin,
//       });
//     }
//   } catch (err) {
//     console.log(err);
//   }
// }

// module.exports = {
//   createAdmin,
// };
