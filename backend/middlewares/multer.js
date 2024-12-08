const multer = require('multer');

// Multer setup to handle image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary directory for uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Temporary filename format
    }
});

const upload = multer({ storage: storage });

module.exports = upload;