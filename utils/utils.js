const MEDIA_FOLDER = 'media/';
const PATH = {
    users: 'users/'
}
const { uuid } = require('uuidv4');
function generatePathFile(extension) {
    const timestamp = new Date().getTime().toString();
    return MEDIA_FOLDER + PATH.users + timestamp + uuid() + extension ;
}
module.exports = {generatePathFile,};


