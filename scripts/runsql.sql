-- create post
INSERT INTO community_posts (user_id, persona_id, title, content, post_type, tags)
VALUES (
  'uuid-ของ-user',
  'uuid-ของ-persona',  -- หรือ NULL ถ้าไม่มี
  'หัวข้อโพสต์',
  'เนื้อหาโพสต์',
  'text',  -- text | project | achievement | question
  ARRAY['tag1', 'tag2']
);

-- like post
INSERT INTO post_likes (post_id, user_id)
VALUES ('uuid-ของ-post', 'uuid-ของ-user');


-- comment post
INSERT INTO post_comments (post_id, user_id, content)
VALUES ('uuid-ของ-post', 'uuid-ของ-user', 'ข้อความคอมเมนต์');


-- update
UPDATE community_posts
SET
  title = 'หัวข้อใหม่',
  content = 'เนื้อหาใหม่',
  tags = ARRAY['tag1', 'tag3'],
  updated_at = NOW()
WHERE id = 'uuid-ของ-post'
  AND user_id = 'uuid-ของ-user';

-- hide and show pots
UPDATE community_posts
SET is_published = false
WHERE id = 'uuid-ของ-post';

-- edit comment
UPDATE post_comments
SET
  content = 'ข้อความใหม่',
  updated_at = NOW()
WHERE id = 'uuid-ของ-comment'
  AND user_id = 'uuid-ของ-user';


  DELETE FROM community_posts
WHERE id = 'uuid-ของ-post'
  AND user_id = 'uuid-ของ-user';

DELETE FROM post_likes
WHERE post_id = 'uuid-ของ-post'
  AND user_id = 'uuid-ของ-user';

  DELETE FROM post_comments
WHERE id = 'uuid-ของ-comment'
  AND user_id = 'uuid-ของ-user';


--   select 
SELECT
  cp.*,
  p.username,
  p.avatar_url
FROM community_posts cp
JOIN profiles p ON cp.user_id = p.id
WHERE cp.is_published = true
ORDER BY cp.created_at DESC;

-- เช็คว่า user ชอบโพสต์นี้หรือไม่ 
SELECT
  cp.*,
  EXISTS (
    SELECT 1 FROM post_likes
    WHERE post_id = cp.id AND user_id = 'uuid-ของ-user'
  ) AS is_liked
FROM community_posts cp
WHERE cp.is_published = true;
  

  SELECT
  pc.*,
  p.username
FROM post_comments pc
JOIN profiles p ON pc.user_id = p.id
WHERE pc.post_id = 'uuid-ของ-post'
ORDER BY pc.created_at ASC;



--  create resume 
INSERT INTO resumes (
  user_id, persona_id,
  full_name, email, phone, location, website, linkedin, github,
  summary,
  experience, education, skills, projects, certifications, languages,
  template_style, color_scheme, font_family,
  title, is_default
)
VALUES (
  'uuid-ของ-user',
  'uuid-ของ-persona',  -- หรือ NULL
  'สมชาย ใจดี', 'somchai@email.com', '081-234-5678', 'Bangkok, Thailand',
  'https://mysite.com', 'https://linkedin.com/in/somchai', 'https://github.com/somchai',
  'Experienced developer with 5 years...',
  '[
    {
      "company": "บริษัท ABC",
      "position": "Senior Developer",
      "start_date": "2022-01",
      "end_date": "2024-12",
      "description": "พัฒนา web application"
    }
  ]'::jsonb,
  '[
    {
      "institution": "มหาวิทยาลัย XYZ",
      "degree": "ปริญญาตรี",
      "field": "วิทยาการคอมพิวเตอร์",
      "start_date": "2016",
      "end_date": "2020"
    }
  ]'::jsonb,
  '["JavaScript", "TypeScript", "React", "PostgreSQL"]'::jsonb,
  '[
    {
      "name": "Portfolio Website",
      "description": "เว็บพอร์ตโฟลิโอส่วนตัว",
      "url": "https://mysite.com",
      "tech_stack": ["Next.js", "Tailwind"]
    }
  ]'::jsonb,
  '[
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2023-06"
    }
  ]'::jsonb,
  '[
    {"language": "ภาษาไทย", "level": "Native"},
    {"language": "English", "level": "Professional"}
  ]'::jsonb,
  'modern', 'brown', 'inter',
  'Resume หลัก', true
);

-- update resume
UPDATE resumes
SET
  full_name = 'สมชาย ใจดีมาก',
  email = 'new@email.com',
  phone = '089-999-9999',
  location = 'Chiang Mai, Thailand'
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';

-- update resume template
  UPDATE resumes
SET
  template_style = 'creative',
  color_scheme = 'blue',
  font_family = 'playfair'
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';

-- เพิ่ม Experience 
UPDATE resumes
SET experience = experience || '[
  {
    "company": "บริษัท DEF",
    "position": "Lead Developer",
    "start_date": "2025-01",
    "end_date": null,
    "description": "หัวหน้าทีม"
  }
]'::jsonb
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';


  -- ยกเลิก default เก่าก่อน
UPDATE resumes
SET is_default = false
WHERE user_id = 'uuid-ของ-user';

-- ตั้งอันใหม่
UPDATE resumes
SET is_default = true
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';


--  delete resume
DELETE FROM resumes
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';


--   select resume
SELECT id, title, template_style, color_scheme, is_default, created_at
FROM resumes
WHERE user_id = 'uuid-ของ-user' 
ORDER BY is_default DESC, created_at DESC;


-- ดูแบบเต็ม
SELECT *
FROM resumes
WHERE id = 'uuid-ของ-resume'
  AND user_id = 'uuid-ของ-user';


  SELECT
  id,
  title,
  jsonb_array_length(experience) AS total_experience,
  experience
FROM resumes
WHERE user_id = 'uuid-ของ-user';