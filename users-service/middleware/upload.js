const multer = require('multer');
const path = require('path');

// Configurar almacenamiento temporal para multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../media'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
    }
});

const upload = multer({ storage: storage });

const uploadFields = upload.fields([
    { name: 'photo_profile', maxCount: 1 },
    { name: 'photo_cover', maxCount: 1 }
]);

module.exports = uploadFields;
