const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to protect admin routes
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('danger', 'Unauthorized access.');
    res.redirect('/login.html');
};

router.use(isAdmin);

// @route   GET /admin
// @desc    Submission Queue
router.get('/', async (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../public/admin_dashboard.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /admin/review/:id
router.get('/review/:id', async (req, res) => {
    try {
        const [submissions] = await db.query(`
            SELECT s.*, u.full_name, u.email 
            FROM submissions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `, [req.params.id]);
        
        if (submissions.length === 0) return res.redirect('/admin');

        res.render('admin/review', { 
            title: 'Review Submission | INDS',
            sub: submissions[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /admin/review/:id
router.post('/review/:id', async (req, res) => {
    const { action, feedback } = req.body;
    const subId = req.params.id;

    try {
        const status = action === 'accept' ? 'accepted' : 'rejected';
        await db.query("UPDATE submissions SET status = ?, admin_feedback = ? WHERE id = ?", [status, feedback, subId]);

        // Get submission info for notification
        const [[sub]] = await db.query("SELECT s.*, u.full_name, u.email FROM submissions s JOIN users u ON s.user_id = u.id WHERE s.id = ?", [subId]);
        
        const msg = action === 'accept' 
            ? `Congratulations! Your article "${sub.title}" has been accepted for publication.` 
            : `We regret to inform you that your article "${sub.title}" was not accepted. Feedback: ${feedback}`;
        
        await db.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [sub.user_id, msg]);

        // Mock Email Notification
        console.log(`[EMAIL MOCK] To: ${sub.email} | Subject: Article Status Update | Message: ${msg}`);

        req.flash('success', `Submission ${status} and researcher notified.`);
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /admin/journals
router.get('/journals', async (req, res) => {
    try {
        const [journals] = await db.query("SELECT * FROM journals ORDER BY volume_no DESC, issue_no DESC");
        const [readyToPublish] = await db.query(`
            SELECT * FROM submissions 
            WHERE status = 'accepted' 
            AND id NOT IN (SELECT submission_id FROM articles WHERE submission_id IS NOT NULL)
        `);

        res.render('admin/journals', { 
            title: 'Manage Journals | INDS',
            journals,
            readyToPublish
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /admin/journals/create
router.post('/journals/create', async (req, res) => {
    const { volume, issue, year } = req.body;
    try {
        await db.query("INSERT INTO journals (volume_no, issue_no, publication_year) VALUES (?, ?, ?)", [volume, issue, year]);
        req.flash('success', 'New Journal Issue created as Draft.');
        res.redirect('/admin/journals');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const fs = require('fs');
const path = require('path');

// @route   POST /admin/journals/assign
router.post('/journals/assign', async (req, res) => {
    const { journal_id, sub_id, pages } = req.body;
    try {
        const [[sub]] = await db.query("SELECT * FROM submissions WHERE id = ?", [sub_id]);
        
        // Copy file to public folder
        const oldPath = path.join(__dirname, '..', 'uploads', 'manuscripts', sub.file_path);
        const newPath = path.join(__dirname, '..', 'public', 'uploads', 'published', sub.file_path);
        
        if (fs.existsSync(oldPath)) {
            fs.copyFileSync(oldPath, newPath);
        }

        await db.query(`
            INSERT INTO articles (journal_id, submission_id, title, authors, abstract, pdf_path, page_range) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [journal_id, sub_id, sub.title, sub.authors, sub.abstract, sub.file_path, pages]);
        
        req.flash('success', 'Article assigned to Journal successfully.');
        res.redirect('/admin/journals');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /admin/journals/deploy/:id
router.get('/journals/deploy/:id', async (req, res) => {
    try {
        await db.query("UPDATE journals SET status = 'published' WHERE id = ?", [req.params.id]);
        req.flash('success', 'Journal Issue DEPLOYED successfully! Content is now live.');
        res.redirect('/admin/journals');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
