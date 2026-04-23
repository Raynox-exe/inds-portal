const fs = require('fs');
const path = require('path');

const files = [
    'c:\\Users\\Danie\\OneDrive\\Desktop\\IND\\inds.org.ng\\index.html',
    'c:\\Users\\Danie\\OneDrive\\Desktop\\IND\\inds.org.ng\\niger-delta-research-digest\\index.html',
    'c:\\Users\\Danie\\OneDrive\\Desktop\\IND\\inds.org.ng\\niger-delta-research-digest-2\\jr-current_issue\\index.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. appearance
    content = content.replace(/-webkit-appearance:(none|checkbox|radio)/g, (match, p1) => {
        return `${match};appearance:${p1}`;
    });

    // 2. speak
    content = content.replace(/speak:none;?/g, '');

    // 3. transform compatibility
    // find -webkit-transform but no standard transform in the same block?
    // This is tricky with regex on minified CSS.
    // Easier to just add standard transform everywhere we see -webkit-transform or translateY etc?
    // Actually, looking at the JSON, it's specific lines.
    // Let's just do a blind replacement for common ones.
    content = content.replace(/-webkit-transform:([^;}]+)/g, (match, p1) => {
        if (content.includes(`;transform:${p1}`) || content.includes(`{transform:${p1}`)) return match;
        return `${match};transform:${p1}`;
    });

    // 4. background-repeat-y
    content = content.replace(/background-repeat-y:no-repeat;?/g, 'background-repeat:no-repeat;');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
