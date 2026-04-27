-- INDS Platform Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'author', 'researcher', 'subscriber') DEFAULT 'researcher',
    status ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    bio TEXT,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS journals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    volume_no INT,
    issue_no INT,
    publication_year INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    authors VARCHAR(255),
    abstract TEXT,
    content TEXT NOT NULL,
    author_id INT,
    category_id INT,
    journal_id INT,
    status ENUM('draft', 'pending', 'published', 'rejected') DEFAULT 'draft',
    views INT DEFAULT 0,
    file_path VARCHAR(255), -- For PDF manuscripts
    download_enabled BOOLEAN DEFAULT TRUE,
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    article_id INT NOT NULL,
    user_id INT,
    user_name VARCHAR(100), -- For guest comments or cached name
    content TEXT NOT NULL,
    status ENUM('approved', 'pending', 'flagged') DEFAULT 'approved',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'NGN',
    plan_name VARCHAR(100),
    status ENUM('success', 'pending', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (Password: Admin@123)
-- Hash: $2a$10$7pL0Rz9f1x3K3z.k9Wn9u.vE.V/S8f9A0W9lFvE8U.V8zGfW9lFvE
-- Note: Replace with actual hash in production
INSERT IGNORE INTO users (full_name, email, password, role) 
VALUES ('System Admin', 'admin@inds.org.ng', '$2a$10$7pL0Rz9f1x3K3z.k9Wn9u.vE.V/S8f9A0W9lFvE8U.V8zGfW9lFvE', 'admin');

-- Insert initial categories
INSERT IGNORE INTO categories (name, description) VALUES 
('Environmental Science', 'Research related to the ecology and environment of the Niger Delta.'),
('Socio-Economics', 'Studies on the economic and social welfare of the region.'),
('Policy & Governance', 'Analyses of governance structures and regional policies.');

-- Insert initial Journal issue
INSERT IGNORE INTO journals (name, volume_no, issue_no, publication_year, status)
VALUES ("Volume 12, Issue 1 (June 2017)", 12, 1, 2017, 'published');

SET @journal_id = LAST_INSERT_ID();

-- Insert initial articles
INSERT INTO articles (title, authors, abstract, content, journal_id, status, file_path, published_at)
VALUES 
(
    'The Information Needs of Librarians in Niger Delta University, Bayelsa State.',
    'Joyce Chinyere Oyadonghan Ph.D and Dime Ishioma Angela and Victor O. Idiedo.',
    'Librarians are custodians of information and as such examining the information needs of librarians is paramount. The study was conducted to find out librarians’ information needs, access points to such information needs, the types of information needed by Librarians that are available in Niger Delta University (NDU) and the problems encountered while searching for information. 21 professional librarians were purposely sampled for the study based on availability. A self-constructed questionnaire tagged “Questionnaire on Information Needs of Librarians” (QINL) was the sole instrument for data collection. The data was analyzed using frequency counts and percentages. The findings of the study show that librarians basically need academic information. Although the information needs are available in NDU, they are not adequate and so do not meet the demands of Librarians. Libraries and the internet using PCs and handheld devices were the major access points to the information needs. However, irrelevant and outdated resources, poor internet connectivity amongst others were problems the librarians faced when seeking information. It was recommended that efforts should be made on seeking information that could solve library users’ needs, information about health and even foreign affairs. There should be adequate provision for library and information resources for a better service delivery. Also, Internet Service Providers (ISPs) should reduce their cost of Internet Service Provision to that affordable to individuals in this part of the world. Keywords: Information, information needs, librarians, Niger Delta University, Bayelsa State.',
    'Full content placeholder...',
    @journal_id,
    'published',
    'article1.pdf',
    '2017-06-01'
),
(
    'The Ibibio Union and Educational Development of Ibibioland: 1928-1966',
    'Uwem Jonah Akpan, PhD.',
    'Abstract The Ibibio Union was established by the Ibibio people in 1928 as an instrument of development and social mobilisation. Although the Union recorded landmark achievements in many areas of national life, this study is concerned with its contributions to the educational development of Ibibioland. The Union established a Teachers’ Training College in Uyo, in the 1930s following the failure of the colonial government to establish either a technical training institution or a grammar school in the area. It also initiated the first community based tertiary educational programme in the country – the Ibibio Union’s scholarship in 1938, for the training of six Ibibio scholars overseas, built the Ibibio State College at Ikot Ekpene in 1946, The paper discovers that the Union’s educational schemes contributed significantly to nation building and filled the gap that was created through inadequate educational services by the missionaries and colonial government. Adopting a historical narrative method, the study challenges ethnic unions and individuals in modern Nigeria to learn from the example of the Ibibio Union and contribute to the development of the education of their respective communities.',
    'Full content placeholder...',
    @journal_id,
    'published',
    'article2.pdf',
    '2017-06-01'
),
(
    'Niger Delta and the Poetics of Power',
    'Bernard Otonye Stephen, Ibiwari Ikiriko, G.Ebinyo, Obari Gomba.',
    'Abstract The poetry of Ikiriko, Ogbowei and Gomba in various ways versifies the socio-economic, political and environmental concerns bedevilling Nigeria’s Niger Delta. These poets belong to a third generation of writers involved in capturing, through poetry, the changing fortunes of the crude-oil rich region—a geopolitical space that has greatly inspired recent Nigerian literature in all genres. A close reading of their poetry reveals that the issues the listed poets are preoccupied with have also been the subject of a variety of non-literary writing as well. Given the view that a writer draws much of his materials from society, the study deploys the close reading ethnographic technique of the New Historicism to examine the common themes which underpin the poems under study. In addition, part of the study’s methodology involves the juxtaposition of literary and non-literary texts to give appropriate cultural context to the analysis. Thus, the study demonstrates that the selected poems form aspects of discourses on the Niger Delta, in the wake of petroleum exploration and the impact on the people’s way of life.',
    'Full content placeholder...',
    @journal_id,
    'published',
    'article3.pdf',
    '2024-08-20'
),
(
    'The National Inland Waterways Authority and its Contributions to the Development of Inland Waterways in Nigeria, 1997-2014',
    'idelis Achoba, and Muhammed Lawal Shuaibu.',
    'Abstract Inland Waterways were the major highways in the pre-colonial and colonial eras. In the Niger-Delta, they are still the major highways in the socio-political and economic activities of the area. This work focuses on the history of the administrative authorities that had serially managed and controlled the Nigerian inland waterways over the years. The Government Maritime Depatment was established by Britain a month after it declared the north as a protectorate to ensure that the department managed and controlled the inland waterways on her behalf. i It inherited the powers exercised by the Royal Niger Company (RNC) on the Niger River before the revocation of the Royal Charter in 1899.This study adopts the use of primary and secondary sources. The primary data include official documents from NIWA, such as Newsletters, ships registries, licenses, vouchers and other relevant materials in the national archives, Kaduna. In addition, in-depth interview with serving and retired staff of NIWA also formed part of primary sources. The secondary sources which include published and unpublished works relating to the study were adequately analyzed for proper interpretation and reconstruction in order to bridge the gap in the historiography of inland waterways. Keywords: Inland waterways, Nigeria, marine department, Niger River, Royal Niger ompany',
    'Full content placeholder...',
    @journal_id,
    'published',
    'article4.pdf',
    '2017-06-01'
),
(
    'The Consequences of Ethnic Conflicts and Disunity on the Civic Education of Youths in the Niger Delta',
    'Henchard B. Erezene, PhD.',
    'Abstract The Niger Delta, like many other parts of Nigeria, has become a region of almost unending conflicts in recent times. These conflicts which are mainly caused by bad government policies and the exploitative activities of the various multi-national oil companies operating in the area, have introduced bad blood (hatred) and disunity between communities and peoples in the region. This paper examines the consequences of these conflicts and disunity on the civic education of the youths in the area. The paper contends that the conflicts and the hatred and disunity caused by them have made many of the youths in the area misfits as they are the ones that do the physical fighting. The paper also recommends some measures – theproper orientation of the youths through lectures, symposia and seminars; creation of employment opportunities to keep them occupied; and the teaching of history at levels of education to show them the connections between them and others – that could end the conflicts and disunity in the region. When the conflict and disunity cease, the youths can then be properly educated to become good citizens. Keywords: Consequences, ethnic conflicts, disunity, Niger Delta, education of youths',
    'Full content placeholder...',
    @journal_id,
    'published',
    'article5.pdf',
    '2017-06-01'
);

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
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
