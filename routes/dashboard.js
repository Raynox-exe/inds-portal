const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Middleware to protect researcher routes
const isAuth = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'researcher') {
        return next();
    }
    req.flash('danger', 'Please login to access your dashboard.');
    res.redirect('/login.html');
};

// Multer Configuration
const storage = multer.diskStorage({
    destination: './uploads/manuscripts/',
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.use(isAuth);

// @route   GET /dashboard
router.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../public/member_dashboard.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /dashboard/submit
router.get('/submit', (req, res) => {
    res.render('dashboard/submit', { title: 'Submit Manuscript | INDS' });
});

// @route   POST /dashboard/submit
router.post('/submit', upload.single('manuscript'), async (req, res) => {
    const { title, authors, abstract } = req.body;
    const userId = req.session.user.id;
    const filePath = req.file ? req.file.filename : null;

    if (!filePath) {
        req.flash('danger', 'Please upload a manuscript file.');
        return res.redirect('/dashboard/submit');
    }

    try {
        await db.query("INSERT INTO submissions (user_id, title, authors, abstract, file_path) VALUES (?, ?, ?, ?, ?)", 
            [userId, title, authors, abstract, filePath]);

        // Notify Admins (Internal)
        const [admins] = await db.query("SELECT id, email FROM users WHERE role = 'admin'");
        for (const admin of admins) {
            await db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", 
                [admin.id, `New submission received: "${title}" from researcher #${userId}`]);
            
            // Mock Email Notification to Admin
            console.log(`[EMAIL MOCK] To Admin: ${admin.email} | Subject: New Manuscript Submitted | Message: Researcher #${userId} has submitted "${title}".`);
        }

        req.flash('success', 'Manuscript submitted successfully for review.');
        res.redirect('/member_dashboard.html');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// API Endpoints for SPA
router.get('/api/member/stats', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [[{ total }]] = await db.query("SELECT COUNT(*) as total FROM submissions WHERE user_id = ?", [userId]);
        const [[{ accepted }]] = await db.query("SELECT COUNT(*) as accepted FROM submissions WHERE user_id = ? AND status = 'accepted'", [userId]);
        const [[{ pending }]] = await db.query("SELECT COUNT(*) as pending FROM submissions WHERE user_id = ? AND status = 'pending'", [userId]);
        res.json({ success: true, stats: { total, accepted, pending } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/api/member/articles', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [articles] = await db.query("SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC", [userId]);
        res.json({ success: true, articles });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/api/member/notifications', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [notifications] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", [userId]);
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/api/member/payments', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [payments] = await db.query("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC", [userId]);
        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
