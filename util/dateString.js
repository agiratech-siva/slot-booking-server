
const { DateTime } = require('luxon');

const dateString = () => {
    const dt = DateTime.now().setZone('Asia/Kolkata');
    return dt.day + "-" + dt.month + "-" + dt.year;
}

module.exports.stringDate = dateString;
