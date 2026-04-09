const Report = require("../models/Report");

module.exports.isReportedBetween = async (userA, userB) => {
  const report = await Report.findOne({
    $or: [
      { reporter: userA, reported: userB },
      { reporter: userB, reported: userA },
    ],
  }).lean();

  return !!report;
};
