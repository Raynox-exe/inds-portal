const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow same-origin requests (where origin is undefined or matches the current host)
        if (!origin) return callback(null, true);
        
        // If it's a known allowed origin or same-site on Render/Localhost
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('onrender.com') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        } else {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true
}));
const PORT = process.env.PORT || 3000;

// EJS Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'inds_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(flash());

// Global Variables for EJS
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.token = req.session.token || null;
    res.locals.currentPath = req.path;
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('danger');
    next();
});

// Import Routes
const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const apiDashboardRoutes = require('./routes/api_dashboard');

// Use Routes
app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/api/dashboard', apiDashboardRoutes);

// Error Handling (404)
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Database Connection Test
const db = require('./config/db');
db.getConnection()
    .then(conn => {
        console.log('✅ Connected to Database Successfully!');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database Connection Failed:', err.message);
    });

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
