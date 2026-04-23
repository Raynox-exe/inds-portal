const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: './public/uploads/manuscripts/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('manuscriptFile');

// Check File Type
function checkFileType(file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only PDFs and Word Documents allowed!');
    }
}

// @route   POST /api/submissions/upload
// @desc    Submit a manuscript
// @access  Private
router.post('/submissions/upload', (req, res, next) => {
    // If not in session and no token, unauthorized
    if (!req.session.user && !req.headers.authorization) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    next();
}, (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(400).json({ error: err });
        } else {
            if (req.file == undefined) {
                return res.status(400).json({ error: 'No manuscript file selected!' });
            }

            const { 
                title, area, area_other, abstract, 
                first_author_name, author_email_id, author_institute,
                conatct_number, country, current_co_authors 
            } = req.body;
            
            const filePath = req.file.filename;
            const userId = req.session.user ? req.session.user.id : (req.user ? req.user.id : null);
            const subjectArea = area === 'Other' ? area_other : area;

            // Collect co-authors
            let coAuthors = [];
            const count = parseInt(current_co_authors || 0);
            for (let i = 1; i <= count; i++) {
                coAuthors.push({
                    name: req.body[`author_name${i}`],
                    institute: req.body[`author_institute${i}`],
                    email: req.body[`author_email_id${i}`]
                });
            }

            try {
                // Ensure submissions table is complete
                await db.query(`
                    CREATE TABLE IF NOT EXISTS submissions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        title VARCHAR(255) NOT NULL,
                        subject_area VARCHAR(100),
                        abstract TEXT,
                        author_name VARCHAR(255),
                        author_email VARCHAR(255),
                        author_institute VARCHAR(255),
                        contact_number VARCHAR(50),
                        country VARCHAR(100),
                        co_authors TEXT,
                        file_path VARCHAR(255) NOT NULL,
                        status ENUM('pending', 'under_review', 'accepted', 'rejected') DEFAULT 'pending',
                        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Insert into db
                const [result] = await db.query(
                    `INSERT INTO submissions 
                    (user_id, title, subject_area, abstract, author_name, author_email, author_institute, contact_number, country, co_authors, file_path) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        userId, title, subjectArea, abstract, 
                        first_author_name, author_email_id, author_institute, 
                        conatct_number, country, JSON.stringify(coAuthors), filePath
                    ]
                );

                // Add notification for the user
                await db.query(
                    "INSERT INTO notifications (user_id, message) VALUES (?, ?)",
                    [userId, `Manuscript "${title}" submitted successfully and is awaiting review.`]
                );

                // Notify Admins
                const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin'");
                for (const admin of admins) {
                    await db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", 
                        [admin.id, `New submission received: "${title}" from researcher #${userId}`]);
                }

                res.json({
                    success: true,
                    message: 'Manuscript uploaded successfully!',
                    submissionId: result.insertId,
                    file: filePath
                });
            } catch (dbErr) {
                console.error('DB Error:', dbErr);
                res.status(500).json({ error: 'Server error while saving submission.' });
            }
        }
    });
});

module.exports = router;
