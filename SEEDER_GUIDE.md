# 🌱 Database Seeder Guide

Complete guide để sử dụng seeders cho dự án eCommerce.

## 📁 Cấu Trúc Seeders

```
backend/
├── seeder.js                    # Master seeder (chạy tất cả)
└── seeders/
    ├── categories.js            # Seeder cho Category
    ├── products.js              # Seeder cho Product
    ├── blogs.js                 # Seeder cho Blog
    ├── sliders.js               # Seeder cho Slider
    └── users.js                 # Seeder cho User
```

## 🚀 Cách Sử Dụng

### 1️⃣ **Chạy Master Seeder (Tất cả cùng lúc)**

Cách nhanh nhất - tự động chạy tất cả seeders theo thứ tự:

```bash
# Sử dụng npm script
npm run seed

# Hoặc chạy trực tiếp
node seeder.js
```

### 2️⃣ **Chạy Seeder Riêng Lẻ**

Nếu bạn chỉ muốn seed một số model:

```bash
# Chỉ seed categories
node -e "require('dotenv').config(); require('./seeders/categories').seedCategories().then(() => process.exit(0))"

# Chỉ seed blogs
node -e "require('dotenv').config(); require('./seeders/blogs').seedBlogs().then(() => process.exit(0))"
```

## 📋 Dữ Liệu Được Tạo

### Categories (5 danh mục)
- ✅ Điện thoại
- ✅ Laptop
- ✅ Tablet
- ✅ Phụ kiện
- ✅ Tai nghe

### Products (6 sản phẩm)
- ✅ iPhone 15 Pro
- ✅ Samsung Galaxy S24
- ✅ MacBook Pro 14
- ✅ Dell XPS 15
- ✅ Sony WH-1000XM5
- ✅ Apple AirPods Pro

### Blogs (5 bài viết)
- ✅ Hướng dẫn chọn điện thoại
- ✅ So sánh MacBook vs Windows
- ✅ Tai nghe cho chuyên gia âm nhạc
- ✅ Bảo vệ thiết bị điện tử
- ✅ Xu hướng công nghệ 2024

### Sliders (5 slide)
- ✅ Khuyến mãi điện thoại
- ✅ Khuyến mãi laptop
- ✅ Khuyến mãi tai nghe
- ✅ Hãng sản xuất hàng đầu
- ✅ Mùa hè 2024

### Users (5 người dùng)
- ✅ 1 Admin (role: admin)
- ✅ 4 Users thường (role: user)

## 🔐 Thông Tin Đăng Nhập Mặc Định

Sau khi chạy seeder, bạn có thể đăng nhập bằng:

### Admin
```
Email: admin@example.com
Password: admin123
```

### User
```
Email: user1@example.com
Password: password123
```

Các user khác:
- user2@example.com
- user3@example.com
- user4@example.com

(Tất cả password là: `password123`)

## ⚠️ Lưu Ý Quan Trọng

1. **Dữ liệu cũ sẽ bị xóa** - Seeder sẽ xóa toàn bộ dữ liệu hiện có trước khi tạo dữ liệu mới
2. **Tuần tự chạy** - Categories phải được tạo trước Products (vì Products referencing Categories)
3. **MongoDB phải chạy** - Đảm bảo MongoDB đang hoạt động trước khi chạy seeder
4. **ENV file** - Kiểm tra `.env` file có giá trị `MONGO_URL` đúng không

## 🔄 Thứ Tự Chạy (tự động trong master seeder)

```
1. Categories → 2. Products → 3. Blogs → 4. Sliders → 5. Users
```

## 🛠️ Tùy Chỉnh Dữ Liệu

Để thay đổi dữ liệu mẫu, edit các file tương ứng trong thư mục `seeders/`:

```javascript
// Ví dụ: seeders/categories.js
const categoriesSeed = [
  {
    name: "Tên danh mục mới",
    image: {
      public_id: "unique_id",
      url: "https://image-url.com/image.jpg",
    },
  },
  // Thêm danh mục khác...
];
```

## ❌ Lỗi Thường Gặp

### "MongoDB connection error"
→ Kiểm tra MongoDB có chạy không và `MONGO_URL` đúng

### "No categories found"
→ Chạy categories seeder trước products

### "Module not found"
→ Chạy `npm install` để cài đặt dependencies

## 📊 Kiểm Tra Dữ Liệu

Sau khi seed, bạn có thể kiểm tra:

```bash
# Từ MongoDB Compass hoặc MongoDB Shell
use ecommerce
db.categories.find()
db.products.find()
db.blogs.find()
db.sliders.find()
db.users.find()
```

## 🔧 Các Script Có Sẵn

```bash
# Chạy seeder
npm run seed

# Tương tự (seed:clean)
npm run seed:clean
```

## 💡 Tips

- Chạy seeder lần đầu trước khi phát triển ứng dụng
- Có thể chạy lại bất cứ lúc nào để reset dữ liệu
- Các ảnh sử dụng placeholder từ `placeholder.com` - thay bằng ảnh thật nếu cần

---

**Tạo bởi**: Seeder System
**Phiên bản**: 1.0.0