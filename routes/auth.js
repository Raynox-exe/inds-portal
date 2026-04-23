const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// @route   GET /auth/login
router.get('/login', (req, res) => {
    res.render('login', { title: 'Member Login | INDS' });
});

// @route   POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = users[0];

        if (user && await bcrypt.compare(password, user['password'])) {
            req.session.user = {
                id: user.id,
                name: user.full_name,
                role: user.role
            };
            
            // Generate JWT for API access
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'inds_jwt_secret',
                { expiresIn: '24h' }
            );
            req.session.token = token;

            if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
                return res.json({ success: true, redirect: user.role === 'admin' ? 'admin_dashboard.html' : 'member_dashboard.html', user: req.session.user });
            }

            if (user.role === 'admin') {
                res.redirect('/admin_dashboard.html');
            } else {
                res.redirect('/member_dashboard.html');
            }
        } else {
            if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }
            req.flash('danger', 'Invalid email or password.');
            res.redirect('/login.html');
        }
    } catch (err) {
        console.error(err);
        if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
            return res.status(500).json({ success: false, message: 'Server Error' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /auth/register
router.get('/register', (req, res) => {
    res.render('register', { title: 'Researcher Registration | INDS' });
});

// @route   POST /auth/register
router.post('/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        // Check if user exists
        const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
                return res.status(400).json({ success: false, message: 'Email already registered.' });
            }
            req.flash('danger', 'Email already registered.');
            return res.redirect('/register.html');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        await db.query("INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'researcher')", 
            [fullName, email, hashedPassword]);

        if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
            return res.json({ success: true, message: 'Registration successful!' });
        }

        req.flash('success', 'Registration successful! Please login.');
        res.redirect('/login.html');
    } catch (err) {
        console.error(err);
        let message = 'Server Error';
        if (err.code === 'ER_DUP_ENTRY') {
            message = 'Email already registered.';
        }
        
        if (req.xhr || (req.headers['accept'] && req.headers['accept'].includes('json'))) {
            return res.status(500).json({ success: false, message: message });
        }
        res.status(500).send(message);
    }
});

// @route   GET /auth/logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index.html');
});

// @route   GET /auth/status
router.get('/status', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;
