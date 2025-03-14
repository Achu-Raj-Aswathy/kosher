const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/uploads/'); // Directory to save uploaded images
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
//     }
// });

// const imageFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')|| file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
//   }
// };

// const upload = multer({ storage: storage, fileFilter: imageFilter })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage });
  

module.exports = upload