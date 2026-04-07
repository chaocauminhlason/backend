# HỆ THỐNG ĐA CHI NHÁNH (MULTI-BRANCH SYSTEM)

## 1. TỔNG QUAN

### 1.1. Mục tiêu
Xây dựng hệ thống quản lý đa chi nhánh cho phép:
- Quản lý nhiều chi nhánh độc lập
- Mỗi chi nhánh có inventory riêng
- Đồng bộ dữ liệu giữa chi nhánh và trung tâm
- Báo cáo tổng hợp và chi tiết theo chi nhánh
- Phân quyền quản lý theo chi nhánh

### 1.2. Phạm vi
```
┌──────────────────────────────────────────────────┐
│              HEAD OFFICE (HQ)                    │
│  - Quản lý tất cả chi nhánh                      │
│  - Báo cáo tổng hợp                              │
│  - Cài đặt chính sách chung                      │
└────────────────┬─────────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────┐
      ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
  │Branch 1│ │Branch 2│ │Branch 3│ │Branch N│
  │ HCM    │ │ HN     │ │ DN     │ │ ...    │
  └────────┘ └────────┘ └────────┘ └────────┘
   - Orders   - Orders   - Orders   - Orders
   - Stock    - Stock    - Stock    - Stock
   - Staff    - Staff    - Staff    - Staff
   - Reports  - Reports  - Reports  - Reports
```

---

## 2. DATABASE SCHEMA

### 2.1. Branch Model (Chi nhánh)

```javascript
// backend/models/branch.js
const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Example: "HQ", "HCM01", "HN01", "DN01"
    },
    name: {
      type: String,
      required: true,
      // Example: "Chi nhánh Quận 1 - TP.HCM"
    },
    type: {
      type: String,
      enum: ["HEADQUARTER", "BRANCH", "WAREHOUSE", "STORE"],
      default: "BRANCH",
      // HEADQUARTER: Trụ sở chính
      // BRANCH: Chi nhánh bán lẻ
      // WAREHOUSE: Kho trung tâm
      // STORE: Cửa hàng/showroom
    },
    address: {
      street: { type: String, required: true },
      ward: { type: String },
      district: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Vietnam" },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      fax: { type: String },
      website: { type: String },
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      // Quản lý chi nhánh
    },
    parentBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
      // Chi nhánh cha (nếu có cấu trúc phân cấp)
    },
    settings: {
      timezone: { type: String, default: "Asia/Ho_Chi_Minh" },
      currency: { type: String, default: "VND" },
      language: { type: String, default: "vi" },
      businessHours: {
        monday: { open: String, close: String, isClosed: Boolean },
        tuesday: { open: String, close: String, isClosed: Boolean },
        wednesday: { open: String, close: String, isClosed: Boolean },
        thursday: { open: String, close: String, isClosed: Boolean },
        friday: { open: String, close: String, isClosed: Boolean },
        saturday: { open: String, close: String, isClosed: Boolean },
        sunday: { open: String, close: String, isClosed: Boolean },
      },
      autoApproveOrders: { type: Boolean, default: false },
      allowOnlineOrders: { type: Boolean, default: true },
      allowWalkInOrders: { type: Boolean, default: true },
    },
    financial: {
      bankName: { type: String },
      bankAccount: { type: String },
      taxCode: { type: String },
      monthlyRevenue: { type: Number, default: 0 },
      yearlyRevenue: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "CLOSED", "UNDER_CONSTRUCTION"],
      default: "ACTIVE",
    },
    openingDate: { type: Date },
    closingDate: { type: Date },
    metadata: {
      totalEmployees: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
branchSchema.index({ code: 1 });
branchSchema.index({ type: 1, status: 1 });
branchSchema.index({ "address.city": 1 });
branchSchema.index({ manager: 1 });

module.exports = mongoose.model("Branch", branchSchema);
```

### 2.2. BranchProduct Model (Sản phẩm theo chi nhánh)

```javascript
// backend/models/branchProduct.js
const mongoose = require("mongoose");

const branchProductSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // Inventory specifics per branch
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      // Mức tồn kho tối thiểu cảnh báo
    },
    maxStockLevel: {
      type: Number,
      default: 1000,
      // Mức tồn kho tối đa
    },
    reorderPoint: {
      type: Number,
      default: 20,
      // Điểm đặt hàng lại
    },
    reorderQuantity: {
      type: Number,
      default: 50,
      // Số lượng đặt hàng lại
    },
    // Color-specific inventory
    colorInventory: [
      {
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        reserved: { type: Number, default: 0 }, // Đã đặt hàng nhưng chưa xuất
        available: { type: Number, default: 0 }, // Sẵn có = quantity - reserved
      },
    ],
    // Pricing (có thể khác giá theo chi nhánh)
    price: {
      type: Number,
      // Nếu null, dùng giá gốc từ Product
      default: null,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    // Location in branch warehouse
    location: {
      aisle: { type: String }, // Lối đi
      shelf: { type: String }, // Kệ
      bin: { type: String }, // Ngăn
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
      // Sản phẩm có được bán tại chi nhánh này không
    },
    isAvailableOnline: {
      type: Boolean,
      default: true,
      // Hiển thị online cho chi nhánh này
    },
    // Statistics
    stats: {
      totalSold: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      lastSoldDate: { type: Date },
      turnoverRate: { type: Number, default: 0 }, // Tỷ lệ luân chuyển kho
    },
    // Metadata
    notes: { type: String },
    lastStockUpdate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
branchProductSchema.index({ branch: 1, product: 1 }, { unique: true });
branchProductSchema.index({ branch: 1, quantity: 1 });
branchProductSchema.index({ branch: 1, isActive: 1 });
branchProductSchema.index({ product: 1, branch: 1 });

// Pre-save: Calculate available quantity
branchProductSchema.pre("save", function (next) {
  if (this.colorInventory && this.colorInventory.length > 0) {
    this.colorInventory.forEach((item) => {
      item.available = item.quantity - (item.reserved || 0);
    });
    // Tính tổng quantity
    this.quantity = this.colorInventory.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }
  next();
});

module.exports = mongoose.model("BranchProduct", branchProductSchema);
```

### 2.3. BranchTransfer Model (Chuyển hàng giữa chi nhánh)

```javascript
// backend/models/branchTransfer.js
const mongoose = require("mongoose");

const branchTransferSchema = new mongoose.Schema(
  {
    transferCode: {
      type: String,
      required: true,
      unique: true,
      // Format: TRF-YYYYMMDD-XXXX
    },
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number },
        totalPrice: { type: Number },
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalValue: { type: Number, default: 0 },
    reason: {
      type: String,
      enum: [
        "RESTOCK",
        "CUSTOMER_REQUEST",
        "BALANCE_INVENTORY",
        "RETURN",
        "OTHER",
      ],
      default: "RESTOCK",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    shippedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    shippingInfo: {
      carrier: { type: String },
      trackingNumber: { type: String },
      estimatedDelivery: { type: Date },
      actualDelivery: { type: Date },
      shippingCost: { type: Number, default: 0 },
    },
    notes: { type: String },
    timestamps: {
      requestedAt: { type: Date, default: Date.now },
      approvedAt: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

branchTransferSchema.index({ transferCode: 1 });
branchTransferSchema.index({ fromBranch: 1, status: 1 });
branchTransferSchema.index({ toBranch: 1, status: 1 });
branchTransferSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("BranchTransfer", branchTransferSchema);
```

### 2.4. Update Order Model (Cập nhật)

```javascript
// Thêm vào backend/models/order.js
const orderSchema = new mongoose.Schema(
  {
    // ... existing fields ...
    
    // NEW: Branch information
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      // Đơn hàng thuộc chi nhánh nào
    },
    orderType: {
      type: String,
      enum: ["ONLINE", "WALK_IN", "PHONE", "MOBILE_APP"],
      default: "ONLINE",
    },
    
    // ... rest of schema ...
  },
  { timestamps: true }
);
```

### 2.5. Update User/Employee Model

```javascript
// Thêm vào backend/models/user.js hoặc employee.js
const userSchema = new mongoose.Schema(
  {
    // ... existing fields ...
    
    // NEW: Branch assignment
    assignedBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      // Employee thuộc chi nhánh nào
    },
    canAccessBranches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        // Employee có thể truy cập các chi nhánh nào
      },
    ],
    
    // ... rest of schema ...
  },
  { timestamps: true }
);
```

---

## 3. API ENDPOINTS

### 3.1. Branch Management APIs

#### A. Create Branch
```http
POST /api/v1/branches
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "HCM01",
  "name": "Chi nhánh Quận 1 - TP.HCM",
  "type": "BRANCH",
  "address": {
    "street": "123 Nguyễn Huệ",
    "district": "Quận 1",
    "city": "Hồ Chí Minh"
  },
  "contact": {
    "phone": "0901234567",
    "email": "hcm01@company.com"
  },
  "manager": "employee_id"
}

Response 201:
{
  "success": true,
  "message": "Branch created successfully",
  "data": { ... }
}
```

#### B. Get All Branches
```http
GET /api/v1/branches?status=ACTIVE&type=BRANCH&page=1&limit=20
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "branches": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

#### C. Get Branch Details
```http
GET /api/v1/branches/:branchId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "branch": { ... },
    "stats": {
      "totalProducts": 150,
      "totalOrders": 500,
      "totalRevenue": 50000000,
      "totalEmployees": 10
    }
  }
}
```

#### D. Update Branch
```http
PUT /api/v1/branches/:branchId
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated name",
  "status": "INACTIVE",
  "settings": { ... }
}

Response 200:
{
  "success": true,
  "message": "Branch updated successfully",
  "data": { ... }
}
```

#### E. Delete Branch (Soft delete)
```http
DELETE /api/v1/branches/:branchId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Branch deleted successfully"
}
```

### 3.2. Branch Product APIs

#### A. Add Product to Branch
```http
POST /api/v1/branches/:branchId/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 100,
  "colorInventory": [
    { "color": "Red", "quantity": 50 },
    { "color": "Blue", "quantity": 50 }
  ],
  "minStockLevel": 20,
  "location": {
    "aisle": "A1",
    "shelf": "S2",
    "bin": "B3"
  }
}

Response 201:
{
  "success": true,
  "message": "Product added to branch successfully",
  "data": { ... }
}
```

#### B. Get Branch Products (Inventory)
```http
GET /api/v1/branches/:branchId/products?page=1&limit=20&search=laptop
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "products": [
      {
        "branchProduct": { ... },
        "product": { ... },
        "branch": { ... }
      }
    ],
    "pagination": { ... }
  }
}
```

#### C. Update Branch Product Quantity
```http
PATCH /api/v1/branches/:branchId/products/:productId
Authorization: Bearer {token}
Content-Type: application/json

{
  "colorInventory": [
    { "color": "Red", "quantity": 30 }
  ]
}

Response 200:
{
  "success": true,
  "message": "Product quantity updated",
  "data": { ... }
}
```

#### D. Get Low Stock Products
```http
GET /api/v1/branches/:branchId/products/low-stock
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "lowStockProducts": [
      {
        "product": { ... },
        "currentQuantity": 5,
        "minStockLevel": 20,
        "status": "CRITICAL"
      }
    ]
  }
}
```

### 3.3. Branch Transfer APIs

#### A. Create Transfer Request
```http
POST /api/v1/branches/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromBranch": "branch_id_1",
  "toBranch": "branch_id_2",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 10
    }
  ],
  "reason": "RESTOCK",
  "notes": "Urgent restock needed"
}

Response 201:
{
  "success": true,
  "message": "Transfer request created",
  "data": {
    "transfer": { ... },
    "transferCode": "TRF-20241214-0001"
  }
}
```

#### B. Approve Transfer
```http
POST /api/v1/branches/transfers/:transferId/approve
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Transfer approved"
}
```

#### C. Ship Transfer
```http
POST /api/v1/branches/transfers/:transferId/ship
Authorization: Bearer {token}
Content-Type: application/json

{
  "carrier": "Giao Hàng Nhanh",
  "trackingNumber": "GHN123456",
  "estimatedDelivery": "2024-12-20"
}

Response 200:
{
  "success": true,
  "message": "Transfer shipped"
}
```

#### D. Receive Transfer
```http
POST /api/v1/branches/transfers/:transferId/receive
Authorization: Bearer {token}
Content-Type: application/json

{
  "receivedQuantity": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 10,
      "condition": "GOOD"
    }
  ],
  "notes": "All items received in good condition"
}

Response 200:
{
  "success": true,
  "message": "Transfer received and inventory updated"
}
```

#### E. Get Transfers
```http
GET /api/v1/branches/transfers?branch=branch_id&status=PENDING
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "transfers": [...],
    "pagination": { ... }
  }
}
```

### 3.4. Branch Reports & Analytics

#### A. Branch Revenue Report
```http
GET /api/v1/branches/:branchId/reports/revenue?from=2024-01-01&to=2024-12-31
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalRevenue": 100000000,
    "totalOrders": 500,
    "averageOrderValue": 200000,
    "revenueByMonth": [
      { "month": "2024-01", "revenue": 8000000, "orders": 40 },
      ...
    ]
  }
}
```

#### B. Branch Performance Comparison
```http
GET /api/v1/branches/reports/comparison?from=2024-01-01&to=2024-12-31
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "branches": [
      {
        "branchId": "...",
        "branchName": "HCM01",
        "revenue": 50000000,
        "orders": 250,
        "averageOrderValue": 200000,
        "growth": 15.5
      },
      ...
    ]
  }
}
```

#### C. Branch Inventory Report
```http
GET /api/v1/branches/:branchId/reports/inventory
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "totalValue": 200000000,
    "lowStockItems": 10,
    "overStockItems": 5,
    "turnoverRate": 2.5,
    "categories": [
      {
        "categoryName": "Laptop",
        "productCount": 30,
        "totalValue": 100000000
      },
      ...
    ]
  }
}
```

---

## 4. BUSINESS LOGIC & WORKFLOWS

### 4.1. Order Processing Flow (Multi-Branch)

```
┌─────────────────────────────────────────────────┐
│  CUSTOMER PLACES ORDER                          │
│  - Chọn sản phẩm                                │
│  - Chọn chi nhánh (hoặc auto-detect gần nhất)  │
│  - Thanh toán                                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  SYSTEM CHECKS INVENTORY                        │
│  1. Check product availability at branch        │
│  2. Reserve stock (mark as reserved)            │
│  3. If not enough → suggest other branches      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  ORDER CREATED                                  │
│  - Status: PENDING                              │
│  - Assigned to branch                           │
│  - Stock reserved                               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  BRANCH MANAGER/STAFF PROCESS                   │
│  1. Review order                                │
│  2. Approve/Reject                              │
│  3. If approved → Status: CONFIRMED             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  SHIPPING/PICKUP                                │
│  - Status: SHIPPED                              │
│  - Update tracking info                         │
│  - Deduct from inventory (reserved → sold)      │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  DELIVERED                                      │
│  - Status: DELIVERED                            │
│  - Update branch statistics                     │
│  - Generate invoice                             │
└─────────────────────────────────────────────────┘
```

### 4.2. Inventory Transfer Workflow

```
┌─────────────────────────────────────────────────┐
│  BRANCH A: Low stock alert                     │
│  Product X: 5 units (min: 20)                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  MANAGER CREATES TRANSFER REQUEST              │
│  - From: Branch B (has 100 units)               │
│  - To: Branch A                                 │
│  - Quantity: 50 units                           │
│  - Reason: RESTOCK                              │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  WAREHOUSE MANAGER APPROVES                     │
│  - Check Branch B inventory                     │
│  - Verify transfer feasibility                  │
│  - Status: APPROVED                             │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  SHIPPING STAFF SHIPS                           │
│  - Deduct from Branch B: 50 units               │
│  - Pack & ship                                  │
│  - Add tracking info                            │
│  - Status: IN_TRANSIT                           │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│  BRANCH A RECEIVES                              │
│  - Verify quantity & condition                  │
│  - Add to Branch A inventory: +50 units         │
│  - Status: DELIVERED                            │
│  - Update stock levels                          │
└─────────────────────────────────────────────────┘
```

### 4.3. Low Stock Auto-Transfer (Optional)

```javascript
// Pseudo-code for auto-transfer logic
async function checkAndAutoTransfer(branchId) {
  const lowStockProducts = await BranchProduct.find({
    branch: branchId,
    $expr: { $lt: ["$quantity", "$minStockLevel"] },
  });

  for (const branchProduct of lowStockProducts) {
    // Find branch with highest stock
    const donorBranch = await BranchProduct.findOne({
      product: branchProduct.product,
      branch: { $ne: branchId },
      quantity: { $gte: branchProduct.reorderQuantity },
    })
      .sort({ quantity: -1 })
      .populate("branch");

    if (donorBranch) {
      // Create auto-transfer request
      await BranchTransfer.create({
        fromBranch: donorBranch.branch._id,
        toBranch: branchId,
        items: [
          {
            product: branchProduct.product,
            quantity: branchProduct.reorderQuantity,
          },
        ],
        reason: "BALANCE_INVENTORY",
        status: "PENDING",
        // Auto-request, needs approval
      });
    } else {
      // Send alert to purchase department
      await sendLowStockAlert(branchProduct);
    }
  }
}
```

---

## 5. AUTHORIZATION & PERMISSIONS

### 5.1. Role-Based Access Control

```javascript
// Permission definitions
const BRANCH_PERMISSIONS = {
  // Branch Management
  CREATE_BRANCH: "branch.create",
  VIEW_ALL_BRANCHES: "branch.view_all",
  VIEW_OWN_BRANCH: "branch.view_own",
  UPDATE_BRANCH: "branch.update",
  DELETE_BRANCH: "branch.delete",

  // Product Management
  ADD_PRODUCT_TO_BRANCH: "branch.product.add",
  UPDATE_BRANCH_PRODUCT: "branch.product.update",
  VIEW_BRANCH_PRODUCTS: "branch.product.view",
  DELETE_BRANCH_PRODUCT: "branch.product.delete",

  // Inventory
  ADJUST_INVENTORY: "branch.inventory.adjust",
  VIEW_INVENTORY: "branch.inventory.view",

  // Transfers
  CREATE_TRANSFER: "branch.transfer.create",
  APPROVE_TRANSFER: "branch.transfer.approve",
  VIEW_TRANSFERS: "branch.transfer.view",

  // Reports
  VIEW_BRANCH_REPORTS: "branch.reports.view",
  EXPORT_REPORTS: "branch.reports.export",
};

// Role assignments
const ROLES = {
  SUPER_ADMIN: Object.values(BRANCH_PERMISSIONS), // All permissions

  HQ_MANAGER: [
    "branch.create",
    "branch.view_all",
    "branch.update",
    "branch.reports.view",
    "branch.transfer.approve",
  ],

  BRANCH_MANAGER: [
    "branch.view_own",
    "branch.product.add",
    "branch.product.update",
    "branch.inventory.view",
    "branch.inventory.adjust",
    "branch.transfer.create",
    "branch.reports.view",
  ],

  BRANCH_STAFF: [
    "branch.view_own",
    "branch.product.view",
    "branch.inventory.view",
    "branch.transfer.view",
  ],

  WAREHOUSE_MANAGER: [
    "branch.view_all",
    "branch.inventory.view",
    "branch.transfer.create",
    "branch.transfer.approve",
  ],
};
```

### 5.2. Middleware Implementation

```javascript
// backend/middleware/branchAuth.js
const branchAuth = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // From JWT middleware
      const branchId = req.params.branchId || req.body.branchId;

      // Super Admin bypass
      if (user.role.code === "super_admin") {
        return next();
      }

      // Check if user has required permission
      const hasPermission = user.role.permissions.some(
        (p) => p.code === requiredPermission
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Insufficient permissions",
        });
      }

      // Branch-specific access check
      if (branchId && requiredPermission.includes("view_own")) {
        // Check if user belongs to this branch
        if (
          user.assignedBranch.toString() !== branchId &&
          !user.canAccessBranches.includes(branchId)
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied: You cannot access this branch",
          });
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = branchAuth;
```

---

## 6. FRONTEND INTEGRATION

### 6.1. Branch Selection Component

```javascript
// Example: Branch selector for orders
import { useState, useEffect } from "react";
import axios from "axios";

const BranchSelector = ({ onBranchSelect, productId }) => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  useEffect(() => {
    // Fetch branches that have this product in stock
    axios
      .get(`/api/v1/products/${productId}/available-branches`)
      .then((res) => {
        setBranches(res.data.data);
      });
  }, [productId]);

  const handleSelect = (branch) => {
    setSelectedBranch(branch);
    onBranchSelect(branch);
  };

  return (
    <div className="branch-selector">
      <h3>Chọn chi nhánh nhận hàng:</h3>
      {branches.map((branch) => (
        <div
          key={branch._id}
          className={`branch-card ${
            selectedBranch?._id === branch._id ? "selected" : ""
          }`}
          onClick={() => handleSelect(branch)}
        >
          <h4>{branch.name}</h4>
          <p>{branch.address.street}</p>
          <p>Còn hàng: {branch.availableQuantity} sản phẩm</p>
          <p>Khoảng cách: {branch.distance}km</p>
        </div>
      ))}
    </div>
  );
};
```

### 6.2. Branch Dashboard

```javascript
// Branch Manager Dashboard
const BranchDashboard = ({ branchId }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    axios.get(`/api/v1/branches/${branchId}/dashboard`).then((res) => {
      setStats(res.data.data);
    });
  }, [branchId]);

  return (
    <div className="branch-dashboard">
      <h2>Dashboard - {stats.branchName}</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Doanh thu hôm nay</h3>
          <p className="stat-value">{formatCurrency(stats.todayRevenue)}</p>
        </div>

        <div className="stat-card">
          <h3>Đơn hàng mới</h3>
          <p className="stat-value">{stats.newOrders}</p>
        </div>

        <div className="stat-card alert">
          <h3>Sản phẩm sắp hết</h3>
          <p className="stat-value">{stats.lowStockCount}</p>
        </div>

        <div className="stat-card">
          <h3>Nhân viên đang làm</h3>
          <p className="stat-value">{stats.activeEmployees}</p>
        </div>
      </div>

      <div className="sections">
        <RecentOrders branchId={branchId} />
        <LowStockAlerts branchId={branchId} />
        <PendingTransfers branchId={branchId} />
      </div>
    </div>
  );
};
```

---

## 7. TESTING SCENARIOS

### 7.1. Unit Tests

```javascript
// tests/branch.test.js
describe("Branch Management", () => {
  test("Should create a new branch", async () => {
    const branchData = {
      code: "TEST01",
      name: "Test Branch",
      type: "BRANCH",
      address: { city: "Test City" },
    };

    const response = await request(app)
      .post("/api/v1/branches")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(branchData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.code).toBe("TEST01");
  });

  test("Should not allow duplicate branch code", async () => {
    // ... test logic
  });

  test("Should get all branches with pagination", async () => {
    // ... test logic
  });
});

describe("Branch Products", () => {
  test("Should add product to branch inventory", async () => {
    // ... test logic
  });

  test("Should update branch product quantity", async () => {
    // ... test logic
  });

  test("Should alert when stock below minimum", async () => {
    // ... test logic
  });
});

describe("Branch Transfers", () => {
  test("Should create transfer request", async () => {
    // ... test logic
  });

  test("Should deduct from source branch on ship", async () => {
    // ... test logic
  });

  test("Should add to destination branch on receive", async () => {
    // ... test logic
  });
});
```

### 7.2. Integration Tests

```javascript
describe("Order Flow with Branches", () => {
  test("Complete order flow for branch", async () => {
    // 1. Customer selects branch
    // 2. Check inventory
    // 3. Reserve stock
    // 4. Create order
    // 5. Process payment
    // 6. Update inventory
    // 7. Update branch stats
  });
});
```

---

## 8. DEPLOYMENT CONSIDERATIONS

### 8.1. Database Indexes
```javascript
// Ensure these indexes are created
db.branches.createIndex({ code: 1 }, { unique: true });
db.branches.createIndex({ type: 1, status: 1 });
db.branchproducts.createIndex({ branch: 1, product: 1 }, { unique: true });
db.branchproducts.createIndex({ branch: 1, quantity: 1 });
db.branchtransfers.createIndex({ status: 1, createdAt: -1 });
```

### 8.2. Data Migration
```javascript
// Script to migrate existing products to branch products
async function migrateToBranchSystem() {
  const headquarters = await Branch.findOne({ type: "HEADQUARTER" });
  const products = await Product.find({ isDeleted: false });

  for (const product of products) {
    await BranchProduct.create({
      branch: headquarters._id,
      product: product._id,
      quantity: product.quantity || 0,
      colorInventory: product.color || [],
      minStockLevel: product.minStockLevel || 10,
      maxStockLevel: product.maxStockLevel || 1000,
    });
  }
}
```

---

## 9. MONITORING & ALERTS

### 9.1. Key Metrics to Track
- Branch inventory levels
- Transfer success/failure rates
- Order fulfillment time per branch
- Branch revenue performance
- Stock-out incidents
- Transfer delays

### 9.2. Alert Rules
```javascript
const ALERT_RULES = {
  LOW_STOCK: {
    condition: (branchProduct) => branchProduct.quantity < branchProduct.minStockLevel,
    recipients: ["branch.manager", "warehouse.manager"],
    urgency: "HIGH",
  },
  
  TRANSFER_DELAYED: {
    condition: (transfer) => {
      const daysSinceShipped = (Date.now() - transfer.shippedAt) / (1000 * 60 * 60 * 24);
      return transfer.status === "IN_TRANSIT" && daysSinceShipped > 7;
    },
    recipients: ["logistics.manager"],
    urgency: "MEDIUM",
  },
  
  BRANCH_UNDERPERFORMING: {
    condition: (branch) => {
      return branch.metadata.monthlyRevenue < branch.expectedRevenue * 0.7;
    },
    recipients: ["regional.manager", "ceo"],
    urgency: "LOW",
  },
};
```

---

## 10. NEXT STEPS

1. ✅ Review và approve schema design
2. ⬜ Implement Branch models
3. ⬜ Create Branch API controllers & routes
4. ⬜ Implement authorization middleware
5. ⬜ Build frontend components
6. ⬜ Write unit & integration tests
7. ⬜ Data migration scripts
8. ⬜ Documentation for API endpoints
9. ⬜ User training materials
10. ⬜ Deploy to staging environment

---

**Ngày tạo**: 2024-12-14  
**Version**: 1.0  
**Author**: System Architect Team  
**Status**: Draft - Pending Review
