const Patient = require("../../models/patient");

async function pagination(req, res) {
  try {
    let { page_size, page_number } = req.query;
    page_size = parseInt(page_size);
    page_number = parseInt(page_number);
    let data = await Patient.aggregate([
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
    res.status(200).json({ patientList, totalPage, page_number });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
