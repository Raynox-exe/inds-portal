const https = require('https');
const path = require('path');
require('dotenv').config();

const CROSSREF_API_TEST = 'test.crossref.org';
const CROSSREF_API_LIVE = 'doi.crossref.org';

/**
 * Generate XML for Crossref DOI Registration
 */
function generateCrossrefXML(article, journal) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const batchId = `nduj_batch_${article.id}_${timestamp}`;
    
    // Split authors (assuming comma separated)
    const authorsList = article.authors.split(',').map(a => a.trim());
    const contributors = authorsList.map((author, index) => {
        const parts = author.split(' ');
        const surname = parts.pop();
        const givenName = parts.join(' ');
        return `
          <person_name sequence="${index === 0 ? 'first' : 'additional'}" contributor_role="author">
            <given_name>${givenName || 'N/A'}</given_name>
            <surname>${surname}</surname>
          </person_name>`;
    }).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="5.3.1" xmlns="http://www.crossref.org/schema/5.3.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 http://www.crossref.org/schema/deposit/crossref5.3.1.xsd">
  <head>
    <doi_batch_id>${batchId}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${process.env.PUBLISHER_NAME || 'Niger Delta University'}</depositor_name>
      <email_address>${process.env.CONTACT_EMAIL}</email_address>
    </depositor>
    <registrant>${process.env.PUBLISHER_NAME || 'Niger Delta University'}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${journal.name}</full_title>
        <issn media_type="electronic">${journal.issn_electronic || process.env.JOURNAL_ISSN_E}</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date>
          <year>${journal.publication_year}</year>
        </publication_date>
        <journal_volume>
          <volume>${journal.volume_no}</volume>
        </journal_volume>
        <issue>${journal.issue_no}</issue>
      </journal_issue>
      <journal_article>
        <titles>
          <title>${article.title}</title>
        </titles>
        <contributors>
          ${contributors}
        </contributors>
        <publication_date>
          <year>${journal.publication_year}</year>
        </publication_date>
        <doi_data>
          <doi>${article.doi}</doi>
          <resource>${process.env.BASE_URL}/article/${article.id}</resource>
        </doi_data>
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}

/**
 * Submit XML to Crossref API
 */
async function submitToCrossref(xmlContent, isLive = false) {
    const host = isLive ? CROSSREF_API_LIVE : CROSSREF_API_TEST;
    const path = '/servlet/deposit';
    const auth = Buffer.from(`${process.env.CROSSREF_USERNAME}:${process.env.CROSSREF_PASSWORD}`).toString('base64');

    return new Promise((resolve, reject) => {
        // Crossref expects multipart/form-data for XML submission usually, 
        // but they also support direct POST of the XML file.
        // Let's use the simplest method: POST with the XML in the body.
        
        const options = {
            hostname: host,
            port: 443,
            path: `${path}?operation=doMDIImport`,
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/xml',
                'Content-Length': Buffer.byteLength(xmlContent)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve({ success: true, response: data });
                } else {
                    reject({ success: false, status: res.statusCode, response: data });
                }
            });
        });

        req.on('error', (e) => reject({ success: false, error: e.message }));
        req.write(xmlContent);
        req.end();
    });
}

/**
 * Generate a DOI Suffix based on the pattern suggested
 */
function generateDOISuffix(article, journal) {
    const journalCode = 'nduj'; // Niger Delta University Journal
    const year = journal.publication_year;
    const vol = journal.volume_no;
    const issue = journal.issue_no;
    const articleId = article.id.toString().padStart(3, '0');
    
    return `${journalCode}.${year}.${vol}.${issue}.${articleId}`;
}

module.exports = {
    generateCrossrefXML,
    submitToCrossref,
    generateDOISuffix
};
