# Smart Persona API Guide - สำหรับ Postman

## 🚀 วิธีการใช้ API Collection ใน Postman

### 1. **นำเข้า Collection ลงใน Postman**

#### วิธีที่ 1: Import จากไฟล์
```
1. เปิด Postman
2. คลิกที่ "Import" ในมุมบนซ้าย
3. เลือก "Upload Files"
4. เลือกไฟล์ `POSTMAN_API_COLLECTION.json`
5. คลิก "Import"
```

#### วิธีที่ 2: Copy/Paste ข้อมูล
```
1. เปิด Postman
2. คลิก "Import"
3. เลือก "Raw text"
4. Copy-Paste เนื้อหาจากไฟล์ POSTMAN_API_COLLECTION.json
5. คลิก "Import"
```

---

## 🔧 การตั้งค่า Environment Variables

### ตั้งค่าสำหรับ Local Development:

```javascript
{
  "BASE_URL": "http://localhost:3000",
  "auth_token": "", // เติมหลังจาก login
  "admin_token": "", // หาก login เป็น admin
  "super_admin_token": "" // หาก login เป็น super_admin
}
```

### ตั้งค่าสำหรับ Production:

```javascript
{
  "BASE_URL": "https://your-production-domain.com",
  "auth_token": "",
  "admin_token": "",
  "super_admin_token": ""
}
```

**วิธีตั้ง Environment Variable ใน Postman:**
1. คลิกที่ไอคอน "Environment" (ซ้ายมือ)
2. คลิก "Create new"
3. ใส่ชื่อ Environment (เช่น "Local Dev" หรือ "Production")
4. เติมค่า variables
5. คลิก "Save"

---

## 📋 API Endpoints ทั้งหมด

### 🔐 Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/sign-up` | ลงทะเบียนใหม่ | ❌ |
| POST | `/auth/login` | เข้าสู่ระบบ | ❌ |

### 📝 Community Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/community/posts` | สร้างโพสต์ | ✅ |
| DELETE | `/api/community/posts/:id` | ลบโพสต์ | ✅ |
| GET | `/api/community/posts/:id` | ดึงข้อมูลโพสต์ | ❌ |

### 👤 Personas
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/persona/generate` | สร้าง Persona ด้วย AI | ✅ |
| POST | `/api/persona/fine-tune` | ปรับแต่ง Persona | ✅ |

### 💬 Chat & Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/chat/send` | ส่งข้อความ | ✅ |
| POST | `/api/chat/start` | เริ่มการสนทนา | ✅ |
| POST | `/api/messages/generate` | สร้างข้อความด้วย AI | ✅ |

### 🛍️ Ads (Admin)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/ads` | สร้างโฆษณา | ✅ Admin |
| PUT | `/api/admin/ads/:id` | แก้ไขโฆษณา | ✅ Admin |
| DELETE | `/api/admin/ads/:id` | ลบโฆษณา | ✅ Admin |

### 🔍 Post Moderation (Admin)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/posts/:id/moderate` | อนุมัติ/ปฏิเสธโพสต์ | ✅ Admin |

### 👥 Community Interactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/community/like` | ให้ไลค์โพสต์ | ✅ |
| POST | `/api/community/comment` | เพิ่มคอมเมนต์ | ✅ |
| POST | `/api/community/share` | แชร์โพสต์ | ✅ |

### 🔗 Follow & Endorsements
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/follow` | ติดตามผู้ใช้ | ✅ |
| POST | `/api/endorsements` | รับรองทักษะ | ✅ |

### 👨‍💼 Admin Management
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/set-role` | ตั้งบทบาท | ✅ SuperAdmin |
| PUT | `/api/admin/update-user-name` | อัปเดตชื่อผู้ใช้ | ✅ Admin |

---

## 🔑 Status Codes และ Error Handling

### Success Codes
- **200**: OK - Request สำเร็จ
- **201**: Created - สร้างข้อมูลใหม่สำเร็จ

### Client Error Codes
- **400**: Bad Request - ข้อมูลไม่ถูกต้อง
- **401**: Unauthorized - ต้องเข้าสู่ระบบ
- **403**: Forbidden - ไม่มีสิทธิ์เข้าถึง
- **404**: Not Found - ไม่พบข้อมูล

### Server Error Codes
- **500**: Internal Server Error - เกิดข้อผิดพลาดบนเซิร์ฟเวอร์

---

## 📖 ตัวอย่างการใช้งาน

### 1. Sign Up (ลงทะเบียน)
```
POST /auth/sign-up
Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "..."
  }
}
```

### 2. Login (เข้าสู่ระบบ)
```
POST /auth/login
Body:
{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "user": { ... },
  "session": {
    "access_token": "YOUR_TOKEN_HERE"
  }
}

💡 เก็บ access_token ไปยัง {{auth_token}} variable
```

### 3. Create Post (สร้างโพสต์)
```
POST /api/community/posts
Headers:
Authorization: Bearer {{auth_token}}
Content-Type: application/json

Body:
{
  "userId": "your-user-uuid",
  "title": "My First Post",
  "content": "This is the content",
  "postType": "Text",
  "tags": ["javascript", "web"],
  "personaId": "optional-persona-uuid"
}

Response: 201 Created
{
  "id": "post-uuid",
  "userId": "your-user-uuid",
  "title": "My First Post",
  "is_published": false,
  "moderation_status": "pending",
  "created_at": "2024-03-23T..."
}

💡 โพสต์จะอยู่ในสถานะ "pending" รอการอนุมัติจาก Admin
```

### 4. Generate Persona with AI (สร้าง Persona)
```
POST /api/persona/generate
Headers:
Authorization: Bearer {{auth_token}}
Content-Type: application/json

Body:
{
  "jobTitle": "Senior Software Engineer",
  "industry": "Technology",
  "experienceYears": 5
}

Response: 200 OK
{
  "name": "Alex Chen",
  "description": "An experienced software engineer...",
  "tone": "professional",
  "response_style": "detailed",
  "specializations": ["JavaScript", "React", "Node.js", "AWS", "System Design"]
}
```

### 5. Approve Post (Admin อนุมัติโพสต์)
```
POST /api/admin/posts/POST_UUID/moderate
Headers:
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Body:
{
  "action": "approve"
}

Response: 200 OK
{
  "success": true
}
```

### 6. Reject Post (Admin ปฏิเสธโพสต์)
```
POST /api/admin/posts/POST_UUID/moderate
Headers:
Authorization: Bearer {{admin_token}}
Content-Type: application/json

Body:
{
  "action": "reject",
  "reason": "Content violates community guidelines"
}

Response: 200 OK
{
  "success": true
}
```

---

## 🛡️ Security Best Practices

1. **ไม่เก็บ Token ในโค้ด** - เก็บเฉพาะใน Postman Environment
2. **ใช้ HTTPS ในProduction** - เปลี่ยน BASE_URL เป็น https://
3. **Rotate Tokens** - ให้ token หมดอายุสม่ำเสมอ
4. **ไม่ส่ง Sensitive Data ใน URL** - ใช้ Request Body แทน
5. **ตรวจสอบ User ID** - ตัวอย่าง API จะตรวจสอบว่า userId ตรงกับผู้ที่เข้าสู่ระบบ

---

## 🐛 Troubleshooting

### Error: 401 Unauthorized
- ❌ Token หมดอายุ หรือไม่ถูกต้อง
- ✅ ลอง login ใหม่และเก็บ token ใหม่

### Error: 403 Forbidden
- ❌ ไม่มีสิทธิ์ (เช่น ลองลบโพสต์ของคนอื่น)
- ✅ ใช้ admin token สำหรับ admin endpoints

### Error: 400 Bad Request
- ❌ ข้อมูล request ไม่ถูกต้อง
- ✅ ตรวจสอบ format ของ JSON body

### Error: 404 Not Found
- ❌ หาไม่เจอข้อมูลที่ขอ (เช่น post id ไม่ถูกต้อง)
- ✅ ตรวจสอบ UUID ว่าถูกต้องหรือไม่

---

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ Console ของ Postman (View > Show Postman Console)
2. ดูข้อความ error ที่ return มา
3. ตรวจสอบให้แน่ใจว่า BASE_URL ถูกต้อง
4. ลองเข้าสู่ระบบใหม่และ update token

---

**Happy Testing! 🎉**
