const constant = require('./constant');
const { uuid } = require('uuidv4');

function generatePathFile(extension, folder) {
    const timestamp = new Date().getTime().toString();
    return constant.MEDIA_FOLDER + folder + timestamp + uuid() + extension ;
}
module.exports = {generatePathFile,};


