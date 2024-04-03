
const { DateTime } = require('luxon');

const dt = DateTime.now().setZone('Asia/Kolkata');

const dateString = () => {
    return dt.day + "-" + dt.month + "-" + dt.year;
}

module.exports.stringDate = dateString;
module.exports.dt = dt;