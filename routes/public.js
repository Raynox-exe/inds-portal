const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/db');

// @route   GET /api/articles/latest
router.get('/api/articles/latest', async (req, res) => {
    try {
        const [articles] = await db.query(`
            SELECT a.*, j.volume_no, j.issue_no 
            FROM articles a 
            JOIN journals j ON a.journal_id = j.id 
            WHERE j.status = 'published' 
            ORDER BY j.publication_year DESC, a.id DESC LIMIT 2
        `);
        res.json({ success: true, articles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/journals
router.get('/api/journals', async (req, res) => {
    try {
        const [journals] = await db.query("SELECT * FROM journals WHERE status = 'published' ORDER BY volume_no DESC, issue_no DESC");
        res.json({ success: true, journals });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/digest
router.get('/api/digest', async (req, res) => {
    try {
        const { volume, issue } = req.query;
        let query = `
            SELECT a.*, j.volume_no, j.issue_no, j.publication_year FROM articles a 
            JOIN journals j ON a.journal_id = j.id 
            WHERE j.status = 'published'
        `;
        let params = [];

        if (volume && issue) {
            query += " AND j.volume_no = ? AND j.issue_no = ?";
            params = [volume, issue];
        }

        query += " ORDER BY j.volume_no DESC, j.issue_no DESC, a.id ASC";
        const [articles] = await db.query(query, params);
        res.json({ success: true, articles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /
// @desc    Home Page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// @route   GET /about
router.get('/about', (req, res) => {
    res.render('about', { title: 'About Us | INDS' });
});

// @route   GET /digest
router.get('/digest', async (req, res) => {
    try {
        const volume = req.query.volume;
        const issue = req.query.issue;

        const [allJournals] = await db.query("SELECT * FROM journals WHERE status = 'published' ORDER BY volume_no DESC, issue_no DESC");

        let query = `
            SELECT a.*, j.volume_no, j.issue_no, j.publication_year FROM articles a 
            JOIN journals j ON a.journal_id = j.id 
            WHERE j.status = 'published'
        `;
        let params = [];

        if (volume && issue) {
            query += " AND j.volume_no = ? AND j.issue_no = ?";
            params = [volume, issue];
        }

        query += " ORDER BY j.volume_no DESC, j.issue_no DESC, a.id ASC";
        const [articles] = await db.query(query, params);

        res.render('digest', { 
            title: 'Research Digest | INDS',
            allJournals,
            articles,
            selectedVol: volume,
            selectedIssue: issue
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /programs
router.get('/programs', (req, res) => {
    res.render('programs', { title: 'Programs | INDS' });
});

// @route   GET /contact
router.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us | INDS' });
});

// @route   GET /submission (Public Submission Info)
router.get('/submission', (req, res) => {
    res.render('submission', { title: 'Online Submission | INDS' });
});

module.exports = router;
