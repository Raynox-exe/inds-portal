-- Migration script to update Research Digest schema and content
-- Run this on your online database (e.g., via phpMyAdmin or Render Console)

-- 1. Add missing columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS authors VARCHAR(255) AFTER title;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS abstract TEXT AFTER authors;

-- 2. Insert the Journal Volume if it doesn't exist
INSERT IGNORE INTO journals (name, volume_no, issue_no, publication_year, status)
VALUES ('Volume 12, Issue 1 (June 2017)', 12, 1, 2017, 'published');

-- 3. Get the journal ID (Assuming it's the one we just inserted or already exists)
-- We will use a subquery to find the ID of Vol 12, Issue 1
SET @journal_id = (SELECT id FROM journals WHERE volume_no = 12 AND issue_no = 1 LIMIT 1);

-- 4. Insert the 5 articles
INSERT INTO articles (title, authors, abstract, journal_id, status, file_path, published_at)
VALUES 
(
    'The Information Needs of Librarians in Niger Delta University, Bayelsa State.',
    'Joyce Chinyere Oyadonghan Ph.D and Dime Ishioma Angela and Victor O. Idiedo.',
    'Librarians are custodians of information and as such examining the information needs of librarians is paramount. The study was conducted to find out librarians’ information needs, access points to such information needs, the types of information needed by Librarians that are available in Niger Delta University (NDU) and the problems encountered while searching for information. 21 professional librarians were purposely sampled for the study based on availability. A self-constructed questionnaire tagged “Questionnaire on Information Needs of Librarians” (QINL) was the sole instrument for data collection. The data was analyzed using frequency counts and percentages. The findings of the study show that librarians basically need academic information. Although the information needs are available in NDU, they are not adequate and so do not meet the demands of Librarians. Libraries and the internet using PCs and handheld devices were the major access points to the information needs. However, irrelevant and outdated resources, poor internet connectivity amongst others were problems the librarians faced when seeking information. It was recommended that efforts should be made on seeking information that could solve library users’ needs, information about health and even foreign affairs. There should be adequate provision for library and information resources for a better service delivery. Also, Internet Service Providers (ISPs) should reduce their cost of Internet Service Provision to that affordable to individuals in this part of the world. Keywords: Information, information needs, librarians, Niger Delta University, Bayelsa State.',
    @journal_id,
    'published',
    'article1.pdf',
    '2017-06-01 00:00:00'
),
(
    'The Ibibio Union and Educational Development of Ibibioland: 1928-1966',
    'Uwem Jonah Akpan, PhD.',
    'Abstract The Ibibio Union was established by the Ibibio people in 1928 as an instrument of development and social mobilisation. Although the Union recorded landmark achievements in many areas of national life, this study is concerned with its contributions to the educational development of Ibibioland. The Union established a Teachers’ Training College in Uyo, in the 1930s following the failure of the colonial government to establish either a technical training institution or a grammar school in the area. It also initiated the first community based tertiary educational programme in the country – the Ibibio Union’s scholarship in 1938, for the training of six Ibibio scholars overseas, built the Ibibio State College at Ikot Ekpene in 1946, The paper discovers that the Union’s educational schemes contributed significantly to nation building and filled the gap that was created through inadequate educational services by the missionaries and colonial government. Adopting a historical narrative method, the study challenges ethnic unions and individuals in modern Nigeria to learn from the example of the Ibibio Union and contribute to the development of the education of their respective communities.',
    @journal_id,
    'published',
    'article2.pdf',
    '2017-06-01 00:00:00'
),
(
    'Niger Delta and the Poetics of Power',
    'Bernard Otonye Stephen, Ibiwari Ikiriko, G.Ebinyo, Obari Gomba.',
    'Abstract The poetry of Ikiriko, Ogbowei and Gomba in various ways versifies the socio-economic, political and environmental concerns bedevilling Nigeria’s Niger Delta. These poets belong to a third generation of writers involved in capturing, through poetry, the changing fortunes of the crude-oil rich region—a geopolitical space that has greatly inspired recent Nigerian literature in all genres. A close reading of their poetry reveals that the issues the listed poets are preoccupied with have also been the subject of a variety of non-literary writing as well. Given the view that a writer draws much of his materials from society, the study deploys the close reading ethnographic technique of the New Historicism to examine the common themes which underpin the poems under study. In addition, part of the study’s methodology involves the juxtaposition of literary and non-literary texts to give appropriate cultural context to the analysis. Thus, the study demonstrates that the selected poems form aspects of discourses on the Niger Delta, in the wake of petroleum exploration and the impact on the people’s way of life.',
    @journal_id,
    'published',
    'article3.pdf',
    '2024-08-20 00:00:00'
),
(
    'The National Inland Waterways Authority and its Contributions to the Development of Inland Waterways in Nigeria, 1997-2014',
    'idelis Achoba, and Muhammed Lawal Shuaibu.',
    'Abstract Inland Waterways were the major highways in the pre-colonial and colonial eras. In the Niger-Delta, they are still the major highways in the socio-political and economic activities of the area. This work focuses on the history of the administrative authorities that had serially managed and controlled the Nigerian inland waterways over the years. The Government Maritime Depatment was established by Britain a month after it declared the north as a protectorate to ensure that the department managed and controlled the inland waterways on her behalf. i It inherited the powers exercised by the Royal Niger Company (RNC) on the Niger River before the revocation of the Royal Charter in 1899.This study adopts the use of primary and secondary sources. The primary data include official documents from NIWA, such as Newsletters, ships registries, licenses, vouchers and other relevant materials in the national archives, Kaduna. In addition, in-depth interview with serving and retired staff of NIWA also formed part of primary sources. The secondary sources which include published and unpublished works relating to the study were adequately analyzed for proper interpretation and reconstruction in order to bridge the gap in the historiography of inland waterways. Keywords: Inland waterways, Nigeria, marine department, Niger River, Royal Niger ompany',
    @journal_id,
    'published',
    'article4.pdf',
    '2017-06-01 00:00:00'
),
(
    'The Consequences of Ethnic Conflicts and Disunity on the Civic Education of Youths in the Niger Delta',
    'Henchard B. Erezene, PhD.',
    'Abstract The Niger Delta, like many other parts of Nigeria, has become a region of almost unending conflicts in recent times. These conflicts which are mainly caused by bad government policies and the exploitative activities of the various multi-national oil companies operating in the area, have introduced bad blood (hatred) and disunity between communities and peoples in the region. This paper examines the consequences of these conflicts and disunity on the civic education of the youths in the area. The paper contends that the conflicts and the hatred and disunity caused by them have made many of the youths in the area misfits as they are the ones that do the physical fighting. The paper also recommends some measures – theproper orientation of the youths through lectures, symposia and seminars; creation of employment opportunities to keep them occupied; and the teaching of history at levels of education to show them the connections between them and others – that could end the conflicts and disunity in the region. When the conflict and disunity cease, the youths can then be properly educated to become good citizens. Keywords: Consequences, ethnic conflicts, disunity, Niger Delta, education of youths',
    @journal_id,
    'published',
    'article5.pdf',
    '2017-06-01 00:00:00'
);
