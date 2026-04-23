const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is logged in
const isAuth = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ success: false, message: 'Forbidden' });
};

// --- Member Dashboard Endpoints ---

// @route   GET /api/dashboard/member/stats
router.get('/member/stats', isAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
            FROM submissions 
            WHERE user_id = ?
        `, [userId]);
        
        res.json({ success: true, stats: stats[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/member/articles
router.get('/member/articles', isAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [articles] = await db.query("SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC", [userId]);
        res.json({ success: true, articles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// --- Admin Dashboard Endpoints ---

// @route   GET /api/dashboard/admin/stats
router.get('/admin/stats', isAuth, isAdmin, async (req, res) => {
    try {
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'researcher'");
        const [subCount] = await db.query("SELECT COUNT(*) as count FROM submissions");
        const [pendingCount] = await db.query("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'");
        const [publishedCount] = await db.query("SELECT COUNT(*) as count FROM articles");

        res.json({ 
            success: true, 
            stats: {
                totalUsers: userCount[0].count,
                totalSubmissions: subCount[0].count,
                pendingReviews: pendingCount[0].count,
                publishedArticles: publishedCount[0].count
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/admin/submissions
router.get('/admin/submissions', isAuth, isAdmin, async (req, res) => {
    try {
        const [submissions] = await db.query(`
            SELECT s.*, u.full_name as author_name 
            FROM submissions s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.submitted_at DESC
        `);
        res.json({ success: true, submissions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/admin/users
router.get('/admin/users', isAuth, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query("SELECT id, full_name, email, role, status, created_at FROM users ORDER BY created_at DESC");
        res.json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/member/notifications
router.get('/member/notifications', isAuth, async (req, res) => {
    try {
        const userId = req.session.user.id;
        const [notifications] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [userId]);
        res.json({ success: true, notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// --- Admin Journal Management ---

// @route   GET /api/dashboard/admin/journals
router.get('/admin/journals', isAuth, isAdmin, async (req, res) => {
    try {
        const [journals] = await db.query("SELECT * FROM journals ORDER BY volume_no DESC, issue_no DESC");
        res.json({ success: true, journals });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/dashboard/admin/ready-to-publish
router.get('/admin/ready-to-publish', isAuth, isAdmin, async (req, res) => {
    try {
        const [ready] = await db.query(`
            SELECT id, title, author_name FROM submissions 
            WHERE status = 'accepted' 
            AND id NOT IN (SELECT submission_id FROM articles WHERE submission_id IS NOT NULL)
        `);
        res.json({ success: true, submissions: ready });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/dashboard/admin/journals/assign
router.post('/admin/journals/assign', isAuth, isAdmin, async (req, res) => {
    const { journal_id, sub_id, pages } = req.body;
    try {
        const [[sub]] = await db.query("SELECT * FROM submissions WHERE id = ?", [sub_id]);
        if (!sub) return res.status(404).json({ success: false, message: 'Submission not found' });

        await db.query(`
            INSERT INTO articles (journal_id, submission_id, title, authors, abstract, pdf_path, page_range, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'published')
        `, [journal_id, sub_id, sub.title, sub.author_name || sub.authors, sub.abstract, sub.file_path, pages]);
        
        res.json({ success: true, message: 'Article assigned and published successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/dashboard/admin/journals/deploy/:id
router.post('/admin/journals/deploy/:id', isAuth, isAdmin, async (req, res) => {
    try {
        await db.query("UPDATE journals SET status = 'published' WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Journal issue deployed successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   POST /api/dashboard/admin/journals/create
router.post('/admin/journals/create', isAuth, isAdmin, async (req, res) => {
    const { volume, issue, year, name } = req.body;
    try {
        await db.query("INSERT INTO journals (volume_no, issue_no, publication_year, name, status) VALUES (?, ?, ?, ?, 'draft')", [volume, issue, year, name]);
        res.json({ success: true, message: 'New journal issue created as draft.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
