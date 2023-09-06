const Patient = require("../models/patient");
const Appointment = require("../../server/models/appointment");

// async function pagination(req, res, next) {
//   try {
//     let { page_size, page_number } = req.query;
//     page_size = parseInt(page_size);
//     page_number = parseInt(page_number);
//     let data = await Patient.aggregate([
//       { $project: { first_name: 1, last_name: 1, email: 1, gender: 1 } },
//       { $skip: (page_number - 1) * page_size },
//       { $limit: page_size },
//     ]);

//     console.log("daata", data);
//     let patientList = await Patient.find({})
//       .select(" first_name last_name email gender")
//       .skip((page_number - 1) * page_size)
//       .limit(page_size);

//     let totalCount = await Patient.find({}).countDocuments();
//     let totalPage = Math.ceil(totalCount / page_size);
//     next({ patientList, totalPage, page_number });
//   } catch (err) {
//     return next(
//       new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
//     );
//   }
// }

async function pagination(req, res, next) {
  try {
    let { page_size, page_number } = req.query;
    page_size = parseInt(page_size);
    page_number = parseInt(page_number);
    let data = await Patient.aggregate([
      {$sort:{first_name:1}},
      { $project: { first_name: 1, last_name: 1, email: 1, gender: 1 } },

      { $skip: (page_number - 1) * page_size },
      { $limit: page_size },
    ]);

    console.log("daata", data);
    let patientList = await Patient.find({})
      .select(" first_name last_name email gender")
      .skip((page_number - 1) * page_size)
      .limit(page_size);

    let totalCount = await Patient.find({}).countDocuments();
    let totalPage = Math.ceil(totalCount / page_size);
    // next({ patientList, totalPage, page_number });
    next({ data });

  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function pd_data(req, res) {
  try {
    let dts = await Patient.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "enrollee_info",
        },
      },
      {
        $project: {
          doctor: { $first: "$enrollee_info" },
          email: { $first: "$enrollee_info.email" },
        },
      },
      {
        $sort: {
          email: 1,
        },
      },
    ]);

    res.status(200).json({ dts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  pagination,
};
