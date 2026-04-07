# HỆ THỐNG QUẢN LÝ KHO ĐA CHI NHÁNH (WAREHOUSE MANAGEMENT SYSTEM)

## 1. TỔNG QUAN

### 1.1. Mục tiêu
Xây dựng hệ thống quản lý kho toàn diện cho phép:
- Quản lý nhiều kho thuộc các chi nhánh khác nhau
- Theo dõi vị trí lưu trữ chi tiết (aisle, shelf, bin)
- Quản lý nhập/xuất/chuyển/kiểm kê kho
- Tích hợp với hệ thống đa chi nhánh
- Báo cáo tồn kho real-time
- Tối ưu hóa không gian kho
- Quản lý nhà cung cấp và đơn đặt hàng

### 1.2. Phạm vi hệ thống

```
┌────────────────────────────────────────────────────┐
│           WAREHOUSE MANAGEMENT SYSTEM              │
└────────────────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│ INBOUND │      │INVENTORY│      │OUTBOUND │
│         │      │ CONTROL │      │         │
│-Purchase│      │         │      │-Picking │
│-GRN     │      │-Storage │      │-Packing │
│-QC      │      │-Tracking│      │-Shipping│
└─────────┘      │-Count   │      └─────────┘
                 │-Location│
                 └─────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│SUPPLIERS│      │ REPORTS │      │OPTIMIZE │
│         │      │ ALERTS  │      │         │
└─────────┘      └─────────┘      └─────────┘
```

---

## 2. DATABASE SCHEMA

### 2.1. Warehouse Model

```javascript
// backend/models/warehouse.js
const mongoose = require("mongoose");

const warehouseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Example: "WH-HCM-01", "WH-HN-CENTRAL"
    },
    name: {
      type: String,
      required: true,
      // Example: "Kho trung tâm TP.HCM"
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      // Kho thuộc chi nhánh nào
    },
    type: {
      type: String,
      enum: ["CENTRAL", "REGIONAL", "LOCAL", "TRANSIT"],
      default: "LOCAL",
      // CENTRAL: Kho trung tâm lớn
      // REGIONAL: Kho vùng
      // LOCAL: Kho chi nhánh
      // TRANSIT: Kho trung chuyển
    },
    address: {
      street: { type: String, required: true },
      ward: { type: String },
      district: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    },
    capacity: {
      totalArea: { type: Number }, // m²
      usedArea: { type: Number, default: 0 },
      availableArea: { type: Number },
      maxPallets: { type: Number }, // Số pallet tối đa
      currentPallets: { type: Number, default: 0 },
      utilizationRate: { type: Number, default: 0 }, // %
    },
    zones: [
      {
        name: { type: String, required: true }, // "Zone A", "Zone B"
        code: { type: String, required: true }, // "ZA", "ZB"
        type: {
          type: String,
          enum: ["STORAGE", "RECEIVING", "SHIPPING", "QUARANTINE", "RETURNS"],
        },
        aisles: [
          {
            code: { type: String, required: true }, // "A1", "A2"
            shelves: [
              {
                code: { type: String, required: true }, // "S1", "S2"
                bins: [
                  {
                    code: { type: String, required: true }, // "B1", "B2"
                    capacity: { type: Number }, // Số sản phẩm tối đa
                    currentOccupancy: { type: Number, default: 0 },
                    status: {
                      type: String,
                      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "DAMAGED"],
                      default: "AVAILABLE",
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    operatingHours: {
      weekdays: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String, isClosed: Boolean },
    },
    features: {
      hasTemperatureControl: { type: Boolean, default: false },
      hasSecuritySystem: { type: Boolean, default: false },
      hasFireSafety: { type: Boolean, default: false },
      hasLoadingDock: { type: Boolean, default: false },
      numberOfDocks: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "MAINTENANCE", "CLOSED"],
      default: "ACTIVE",
    },
    metadata: {
      totalProducts: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      lastInventoryDate: { type: Date },
      averageInboundTime: { type: Number }, // minutes
      averageOutboundTime: { type: Number }, // minutes
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ branch: 1, status: 1 });
warehouseSchema.index({ type: 1 });

// Method to get full location path
warehouseSchema.methods.getLocationPath = function (
  zoneCode,
  aisleCode,
  shelfCode,
  binCode
) {
  return `${this.code}-${zoneCode}-${aisleCode}-${shelfCode}-${binCode}`;
};

module.exports = mongoose.model("Warehouse", warehouseSchema);
```

### 2.2. InventoryTransaction Model

```javascript
// backend/models/inventoryTransaction.js
const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    transactionCode: {
      type: String,
      required: true,
      unique: true,
      // Format: TXN-YYYYMMDD-XXXXX
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "INBOUND", // Nhập kho
        "OUTBOUND", // Xuất kho
        "TRANSFER_IN", // Chuyển đến
        "TRANSFER_OUT", // Chuyển đi
        "ADJUSTMENT", // Điều chỉnh
        "RETURN", // Trả hàng
        "DAMAGE", // Hàng hỏng
        "LOST", // Hàng mất
      ],
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
        location: {
          zone: { type: String },
          aisle: { type: String },
          shelf: { type: String },
          bin: { type: String },
          fullPath: { type: String }, // e.g., "WH-HCM-01-ZA-A1-S2-B3"
        },
        unitCost: { type: Number },
        totalCost: { type: Number },
        batchNumber: { type: String },
        expiryDate: { type: Date },
        serialNumbers: [{ type: String }], // For tracked items
      },
    ],
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      // Liên kết với đơn hàng (nếu có)
    },
    relatedPurchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      // Liên kết với đơn đặt hàng (nếu nhập kho)
    },
    relatedTransfer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BranchTransfer",
      // Liên kết với chuyển kho (nếu có)
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      // Nhà cung cấp (cho INBOUND)
    },
    reason: {
      type: String,
      // Lý do giao dịch
    },
    notes: { type: String },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    timestamps: {
      requestedAt: { type: Date, default: Date.now },
      approvedAt: { type: Date },
      completedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
inventoryTransactionSchema.index({ transactionCode: 1 });
inventoryTransactionSchema.index({ warehouse: 1, type: 1, createdAt: -1 });
inventoryTransactionSchema.index({ status: 1, createdAt: -1 });
inventoryTransactionSchema.index({ "items.product": 1 });

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
```

### 2.3. StockMovement Model

```javascript
// backend/models/stockMovement.js
const mongoose = require("mongoose");

const stockMovementSchema = new mongoose.Schema(
  {
    movementCode: {
      type: String,
      required: true,
      unique: true,
      // Format: MOV-YYYYMMDD-XXXXX
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    color: { type: String, required: true },
    movementType: {
      type: String,
      enum: ["RELOCATION", "CONSOLIDATION", "REPLENISHMENT"],
      // RELOCATION: Di chuyển vị trí
      // CONSOLIDATION: Gộp chung
      // REPLENISHMENT: Bổ sung vị trí picking
    },
    fromLocation: {
      zone: { type: String, required: true },
      aisle: { type: String, required: true },
      shelf: { type: String, required: true },
      bin: { type: String, required: true },
      fullPath: { type: String },
    },
    toLocation: {
      zone: { type: String, required: true },
      aisle: { type: String, required: true },
      shelf: { type: String, required: true },
      bin: { type: String, required: true },
      fullPath: { type: String },
    },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },
    timestamps: {
      createdAt: { type: Date, default: Date.now },
      startedAt: { type: Date },
      completedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

stockMovementSchema.index({ warehouse: 1, status: 1 });
stockMovementSchema.index({ product: 1, warehouse: 1 });

module.exports = mongoose.model("StockMovement", stockMovementSchema);
```

### 2.4. StockCount Model (Kiểm kê)

```javascript
// backend/models/stockCount.js
const mongoose = require("mongoose");

const stockCountSchema = new mongoose.Schema(
  {
    countCode: {
      type: String,
      required: true,
      unique: true,
      // Format: CNT-YYYYMMDD-XXXXX
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    type: {
      type: String,
      enum: ["FULL", "CYCLE", "SPOT"],
      // FULL: Kiểm kê toàn bộ
      // CYCLE: Kiểm kê định kỳ
      // SPOT: Kiểm kê đột xuất
    },
    scope: {
      type: String,
      enum: ["ENTIRE_WAREHOUSE", "SPECIFIC_ZONE", "SPECIFIC_PRODUCTS"],
    },
    zones: [{ type: String }], // Nếu scope = SPECIFIC_ZONE
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ], // Nếu scope = SPECIFIC_PRODUCTS
    countResults: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: { type: String, required: true },
        location: {
          zone: String,
          aisle: String,
          shelf: String,
          bin: String,
          fullPath: String,
        },
        expectedQuantity: { type: Number, required: true }, // Số lượng theo hệ thống
        actualQuantity: { type: Number, required: true }, // Số lượng thực tế đếm được
        variance: { type: Number, default: 0 }, // Chênh lệch
        variancePercentage: { type: Number, default: 0 },
        status: {
          type: String,
          enum: ["MATCHED", "OVERAGE", "SHORTAGE", "MISSING"],
        },
        countedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        countedAt: { type: Date },
        notes: { type: String },
      },
    ],
    summary: {
      totalItemsCounted: { type: Number, default: 0 },
      totalVariance: { type: Number, default: 0 },
      accuracyRate: { type: Number, default: 100 }, // %
      totalOverage: { type: Number, default: 0 },
      totalShortage: { type: Number, default: 0 },
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "APPROVED", "CANCELLED"],
      default: "SCHEDULED",
    },
    scheduledDate: { type: Date, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    approvedDate: { type: Date },
    adjustmentRequired: { type: Boolean, default: false },
    adjustmentTransactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryTransaction",
      },
    ],
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

stockCountSchema.index({ warehouse: 1, status: 1 });
stockCountSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model("StockCount", stockCountSchema);
```

### 2.5. PurchaseOrder Model

```javascript
// backend/models/purchaseOrder.js
const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: true,
      unique: true,
      // Format: PO-YYYYMMDD-XXXXX
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
      // Kho nhận hàng
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        color: { type: String, required: true },
        orderedQuantity: { type: Number, required: true, min: 1 },
        receivedQuantity: { type: Number, default: 0 },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number },
        taxRate: { type: Number, default: 10 }, // %
        taxAmount: { type: Number },
        expectedDeliveryDate: { type: Date },
      },
    ],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentTerms: {
      type: String,
      enum: ["COD", "NET_30", "NET_60", "PREPAID", "CREDIT"],
      default: "NET_30",
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID"],
      default: "UNPAID",
    },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date, required: true },
    actualDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "SENT",
        "CONFIRMED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CANCELLED",
      ],
      default: "DRAFT",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    receivingNotes: [
      {
        receivedDate: { type: Date },
        receivedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
        },
        items: [
          {
            product: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Product",
            },
            color: String,
            quantity: Number,
            condition: {
              type: String,
              enum: ["GOOD", "DAMAGED", "DEFECTIVE"],
            },
          },
        ],
        notes: String,
      },
    ],
    notes: { type: String },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ supplier: 1, status: 1 });
purchaseOrderSchema.index({ warehouse: 1, status: 1 });
purchaseOrderSchema.index({ status: 1, orderDate: -1 });

// Pre-save: Calculate totals
purchaseOrderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      item.totalPrice = item.orderedQuantity * item.unitPrice;
      item.taxAmount = (item.totalPrice * item.taxRate) / 100;
      return sum + item.totalPrice;
    }, 0);

    this.taxTotal = this.items.reduce((sum, item) => sum + item.taxAmount, 0);
    this.totalAmount =
      this.subtotal + this.taxTotal + this.shippingCost - this.discount;
  }
  next();
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
```

### 2.6. Supplier Model

```javascript
// backend/models/supplier.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Example: "SUP001"
    },
    name: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    taxCode: { type: String },
    address: {
      street: { type: String },
      district: { type: String },
      city: { type: String },
      country: { type: String, default: "Vietnam" },
    },
    contact: {
      primaryName: { type: String },
      primaryPhone: { type: String, required: true },
      primaryEmail: { type: String, required: true },
      secondaryPhone: { type: String },
      secondaryEmail: { type: String },
    },
    bankInfo: {
      bankName: { type: String },
      accountNumber: { type: String },
      accountName: { type: String },
      branch: { type: String },
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        // Danh mục sản phẩm cung cấp
      },
    ],
    paymentTerms: {
      type: String,
      enum: ["COD", "NET_30", "NET_60", "PREPAID", "CREDIT"],
      default: "NET_30",
    },
    creditLimit: { type: Number, default: 0 },
    currentDebt: { type: Number, default: 0 },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    performance: {
      totalOrders: { type: Number, default: 0 },
      totalValue: { type: Number, default: 0 },
      onTimeDeliveryRate: { type: Number, default: 100 }, // %
      defectRate: { type: Number, default: 0 }, // %
      lastOrderDate: { type: Date },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED"],
      default: "ACTIVE",
    },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ code: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ name: "text", companyName: "text" });

module.exports = mongoose.model("Supplier", supplierSchema);
```

---

## 3. API ENDPOINTS

### 3.1. Warehouse Management APIs

#### A. Create Warehouse
```http
POST /api/v1/warehouses
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "WH-HCM-01",
  "name": "Kho trung tâm TP.HCM",
  "branch": "branch_id",
  "type": "CENTRAL",
  "address": { ... },
  "zones": [ ... ]
}
```

#### B. Get All Warehouses
```http
GET /api/v1/warehouses?branch=branch_id&type=CENTRAL
```

#### C. Get Warehouse Details with Inventory
```http
GET /api/v1/warehouses/:warehouseId
```

#### D. Update Warehouse
```http
PUT /api/v1/warehouses/:warehouseId
```

### 3.2. Inventory Transaction APIs

#### A. Create Inbound Transaction (Nhập kho)
```http
POST /api/v1/inventory/transactions/inbound
Authorization: Bearer {token}

{
  "warehouse": "warehouse_id",
  "supplier": "supplier_id",
  "relatedPurchaseOrder": "po_id",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 100,
      "location": {
        "zone": "ZA",
        "aisle": "A1",
        "shelf": "S2",
        "bin": "B3"
      },
      "unitCost": 100000,
      "batchNumber": "BATCH-001"
    }
  ],
  "notes": "Nhập hàng từ nhà cung cấp X"
}

Response 201:
{
  "success": true,
  "message": "Inbound transaction created",
  "data": {
    "transaction": { ... },
    "transactionCode": "TXN-20241214-00001"
  }
}
```

#### B. Create Outbound Transaction (Xuất kho)
```http
POST /api/v1/inventory/transactions/outbound
Authorization: Bearer {token}

{
  "warehouse": "warehouse_id",
  "relatedOrder": "order_id",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 5,
      "location": {
        "zone": "ZA",
        "aisle": "A1",
        "shelf": "S2",
        "bin": "B3"
      }
    }
  ]
}
```

#### C. Adjustment Transaction (Điều chỉnh)
```http
POST /api/v1/inventory/transactions/adjustment
Authorization: Bearer {token}

{
  "warehouse": "warehouse_id",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 10,
      "location": { ... }
    }
  ],
  "reason": "Stock count adjustment"
}
```

#### D. Get Transaction History
```http
GET /api/v1/inventory/transactions?warehouse=warehouse_id&type=INBOUND&from=2024-01-01&to=2024-12-31
```

### 3.3. Stock Movement APIs

#### A. Create Movement (Di chuyển vị trí)
```http
POST /api/v1/inventory/movements
Authorization: Bearer {token}

{
  "warehouse": "warehouse_id",
  "product": "product_id",
  "color": "Red",
  "movementType": "RELOCATION",
  "fromLocation": {
    "zone": "ZA",
    "aisle": "A1",
    "shelf": "S2",
    "bin": "B3"
  },
  "toLocation": {
    "zone": "ZB",
    "aisle": "B1",
    "shelf": "S1",
    "bin": "B1"
  },
  "quantity": 50,
  "reason": "Optimize storage space"
}
```

#### B. Get Pending Movements
```http
GET /api/v1/inventory/movements?status=PENDING&warehouse=warehouse_id
```

#### C. Complete Movement
```http
POST /api/v1/inventory/movements/:movementId/complete
```

### 3.4. Stock Count APIs

#### A. Schedule Stock Count
```http
POST /api/v1/inventory/stock-counts
Authorization: Bearer {token}

{
  "warehouse": "warehouse_id",
  "type": "CYCLE",
  "scope": "SPECIFIC_ZONE",
  "zones": ["ZA"],
  "scheduledDate": "2024-12-20T08:00:00Z"
}
```

#### B. Record Count Results
```http
POST /api/v1/inventory/stock-counts/:countId/results
Authorization: Bearer {token}

{
  "countResults": [
    {
      "product": "product_id",
      "color": "Red",
      "location": { ... },
      "expectedQuantity": 100,
      "actualQuantity": 98,
      "notes": "2 items damaged"
    }
  ]
}
```

#### C. Approve Count & Generate Adjustments
```http
POST /api/v1/inventory/stock-counts/:countId/approve
```

### 3.5. Purchase Order APIs

#### A. Create Purchase Order
```http
POST /api/v1/purchase-orders
Authorization: Bearer {token}

{
  "supplier": "supplier_id",
  "warehouse": "warehouse_id",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "orderedQuantity": 100,
      "unitPrice": 100000
    }
  ],
  "expectedDeliveryDate": "2024-12-25"
}
```

#### B. Send PO to Supplier
```http
POST /api/v1/purchase-orders/:poId/send
```

#### C. Receive Goods (GRN - Goods Received Note)
```http
POST /api/v1/purchase-orders/:poId/receive
Authorization: Bearer {token}

{
  "receivedDate": "2024-12-20",
  "items": [
    {
      "product": "product_id",
      "color": "Red",
      "quantity": 100,
      "condition": "GOOD"
    }
  ],
  "notes": "All items received in good condition"
}
```

#### D. Get Purchase Orders
```http
GET /api/v1/purchase-orders?supplier=supplier_id&status=SENT
```

### 3.6. Supplier APIs

#### A. Create Supplier
```http
POST /api/v1/suppliers
```

#### B. Get Suppliers
```http
GET /api/v1/suppliers?status=ACTIVE
```

#### C. Get Supplier Performance
```http
GET /api/v1/suppliers/:supplierId/performance
```

### 3.7. Reports & Analytics

#### A. Inventory Summary Report
```http
GET /api/v1/warehouses/:warehouseId/reports/inventory-summary
```

#### B. Stock Movement Report
```http
GET /api/v1/warehouses/:warehouseId/reports/movements?from=2024-01-01&to=2024-12-31
```

#### C. ABC Analysis
```http
GET /api/v1/warehouses/:warehouseId/reports/abc-analysis
```

#### D. Stock Aging Report
```http
GET /api/v1/warehouses/:warehouseId/reports/stock-aging
```

---

## 4. BUSINESS LOGIC & WORKFLOWS

### 4.1. Inbound Process (Nhập kho)

```
┌──────────────────────────────────────┐
│  PURCHASE ORDER CREATED              │
│  - Items, quantities, supplier       │
│  - Expected delivery date            │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  GOODS ARRIVED                       │
│  - Notify warehouse staff            │
│  - Prepare receiving area            │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  QUALITY INSPECTION                  │
│  - Check quantity                    │
│  - Check quality/condition           │
│  - Compare with PO                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  ASSIGN LOCATION                     │
│  - Determine storage location        │
│  - Based on product type, size, etc  │
│  - Update location in system         │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PUT-AWAY                            │
│  - Move to assigned location         │
│  - Scan/confirm location             │
│  - Create INBOUND transaction        │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  UPDATE INVENTORY                    │
│  - Increase stock quantity           │
│  - Update BranchProduct              │
│  - Update PO status                  │
└──────────────────────────────────────┘
```

### 4.2. Outbound Process (Xuất kho)

```
┌──────────────────────────────────────┐
│  ORDER CONFIRMED                     │
│  - Customer order approved           │
│  - Payment confirmed                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PICKING LIST GENERATED              │
│  - List of items to pick             │
│  - Locations of each item            │
│  - Optimized picking route           │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PICKING                             │
│  - Staff picks items from locations  │
│  - Scan items & locations            │
│  - Verify quantities                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PACKING                             │
│  - Pack items for shipment           │
│  - Print shipping label              │
│  - Attach packing slip               │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  SHIPPING                            │
│  - Handover to carrier               │
│  - Update tracking info              │
│  - Create OUTBOUND transaction       │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  UPDATE INVENTORY                    │
│  - Decrease stock quantity           │
│  - Update BranchProduct              │
│  - Update Order status               │
└──────────────────────────────────────┘
```

### 4.3. Stock Count Process (Kiểm kê)

```
┌──────────────────────────────────────┐
│  SCHEDULE COUNT                      │
│  - Set date, type, scope             │
│  - Assign staff                      │
│  - Status: SCHEDULED                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  START COUNT                         │
│  - Print count sheets                │
│  - Freeze inventory movements (opt)  │
│  - Status: IN_PROGRESS               │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  PHYSICAL COUNT                      │
│  - Staff count actual quantity       │
│  - Record in system/app              │
│  - Note discrepancies                │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  VARIANCE ANALYSIS                   │
│  - Compare expected vs actual        │
│  - Calculate variance                │
│  - Identify causes                   │
│  - Status: COMPLETED                 │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  APPROVAL & ADJUSTMENT               │
│  - Manager reviews variances         │
│  - Approve count results             │
│  - Create adjustment transactions    │
│  - Update inventory quantities       │
│  - Status: APPROVED                  │
└──────────────────────────────────────┘
```

### 4.4. Location Optimization Algorithm

```javascript
// Pseudo-code for optimal location assignment
function assignOptimalLocation(warehouse, product, quantity) {
  let bestLocation = null;

  // Strategy 1: ABC Analysis
  // A-items (high value/turnover) → Easy-access locations
  // B-items (medium) → Mid-level locations
  // C-items (low) → Deep storage locations

  const productClass = classifyProduct(product); // A, B, or C

  // Strategy 2: Product size & weight
  const productVolume = product.dimensions.volume;
  const productWeight = product.weight;

  // Strategy 3: FIFO (First In First Out)
  // Place new stock behind existing stock

  // Find available locations in warehouse
  const availableLocations = warehouse.zones
    .flatMap((zone) => zone.aisles)
    .flatMap((aisle) => aisle.shelves)
    .flatMap((shelf) => shelf.bins)
    .filter((bin) => bin.status === "AVAILABLE");

  // Score each location
  availableLocations.forEach((location) => {
    let score = 0;

    // Prefer locations near shipping dock for A-items
    if (productClass === "A") {
      score += calculateProximityToShippingDock(location);
    }

    // Check if location can accommodate product size
    if (location.capacity >= quantity) {
      score += 10;
    }

    // Prefer locations with similar products (grouping)
    score += checkSimilarProducts(location, product);

    location.score = score;
  });

  // Select location with highest score
  bestLocation = availableLocations.sort((a, b) => b.score - a.score)[0];

  return bestLocation;
}
```

---

## 5. ADVANCED FEATURES

### 5.1. Barcode/QR Code Integration

```javascript
// Generate barcode for location
function generateLocationBarcode(warehouse, zone, aisle, shelf, bin) {
  const locationCode = `${warehouse.code}-${zone}-${aisle}-${shelf}-${bin}`;
  const barcode = generateBarcode(locationCode);
  return {
    code: locationCode,
    barcode: barcode,
    type: "CODE128",
  };
}

// Scan & verify product at location
async function scanProductAtLocation(barcode) {
  const scannedData = decodeBarcode(barcode);

  // Verify product
  const product = await Product.findOne({ barcode: scannedData.productCode });

  // Verify location
  const location = await getLocationByCode(scannedData.locationCode);

  // Check if product exists at this location
  const inventory = await BranchProduct.findOne({
    product: product._id,
    "location.fullPath": scannedData.locationCode,
  });

  return {
    product,
    location,
    inventory,
    isValid: inventory !== null,
  };
}
```

### 5.2. Batch & Serial Number Tracking

```javascript
// Track items with batch numbers (e.g., food, cosmetics)
const batchTrackingSchema = {
  product: ObjectId,
  batchNumber: "BATCH-2024-001",
  manufacturingDate: Date,
  expiryDate: Date,
  quantity: 100,
  location: { ... },
  status: "AVAILABLE" | "QUARANTINE" | "EXPIRED",
};

// Track items with serial numbers (e.g., electronics)
const serialTrackingSchema = {
  product: ObjectId,
  serialNumber: "SN-123456",
  status: "IN_STOCK" | "SOLD" | "WARRANTY" | "DEFECTIVE",
  location: { ... },
  soldTo: ObjectId, // Customer
  warrantyExpiry: Date,
};
```

### 5.3. FIFO/FEFO Implementation

```javascript
// FIFO: First In First Out
async function pickWithFIFO(product, quantity) {
  const batches = await InventoryBatch.find({
    product: product._id,
    quantity: { $gt: 0 },
  }).sort({ createdAt: 1 }); // Oldest first

  let remainingQuantity = quantity;
  const pickedItems = [];

  for (const batch of batches) {
    if (remainingQuantity <= 0) break;

    const pickQuantity = Math.min(batch.quantity, remainingQuantity);

    pickedItems.push({
      batch: batch._id,
      location: batch.location,
      quantity: pickQuantity,
    });

    remainingQuantity -= pickQuantity;
  }

  return pickedItems;
}

// FEFO: First Expired First Out
async function pickWithFEFO(product, quantity) {
  const batches = await InventoryBatch.find({
    product: product._id,
    quantity: { $gt: 0 },
    expiryDate: { $gte: new Date() }, // Not expired
  }).sort({ expiryDate: 1 }); // Soonest expiry first

  // Similar logic to FIFO
}
```

### 5.4. Warehouse Capacity Management

```javascript
async function checkWarehouseCapacity(warehouse) {
  // Calculate current utilization
  const totalProducts = await BranchProduct.aggregate([
    { $match: { warehouse: warehouse._id } },
    { $group: { _id: null, totalQuantity: { $sum: "$quantity" } } },
  ]);

  const utilizationRate =
    (totalProducts[0].totalQuantity / warehouse.capacity.maxPallets) * 100;

  // Alert if near capacity
  if (utilizationRate > 90) {
    await sendAlert({
      type: "WAREHOUSE_NEAR_CAPACITY",
      warehouse: warehouse._id,
      utilizationRate: utilizationRate,
      recipients: ["warehouse.manager", "operations.manager"],
    });
  }

  return {
    totalProducts: totalProducts[0].totalQuantity,
    maxCapacity: warehouse.capacity.maxPallets,
    utilizationRate: utilizationRate,
    availableSpace: warehouse.capacity.maxPallets - totalProducts[0].totalQuantity,
  };
}
```

---

## 6. REPORTS & ANALYTICS

### 6.1. Key Reports

```javascript
// 1. Inventory Valuation Report
async function getInventoryValuation(warehouseId) {
  const result = await BranchProduct.aggregate([
    { $match: { warehouse: warehouseId } },
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: null,
        totalValue: {
          $sum: { $multiply: ["$quantity", "$productInfo.price"] },
        },
        totalQuantity: { $sum: "$quantity" },
      },
    },
  ]);

  return result[0];
}

// 2. ABC Analysis Report
async function getABCAnalysis(warehouseId) {
  // Classify products by value contribution
  // A: Top 20% of products by value = 80% of total value
  // B: Next 30% of products = 15% of value
  // C: Remaining 50% of products = 5% of value
}

// 3. Stock Turnover Report
async function getStockTurnover(warehouseId, period) {
  // Turnover = Cost of Goods Sold / Average Inventory Value
  // Higher turnover = better inventory management
}

// 4. Slow-Moving & Dead Stock Report
async function getSlowMovingStock(warehouseId, days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const slowMoving = await BranchProduct.find({
    warehouse: warehouseId,
    "stats.lastSoldDate": { $lt: cutoffDate },
    quantity: { $gt: 0 },
  }).populate("product");

  return slowMoving;
}
```

---

## 7. INTEGRATION POINTS

### 7.1. Integration with Branch System
- Khi có order từ chi nhánh → Tự động tạo outbound transaction
- Khi chuyển hàng giữa chi nhánh → Tạo transfer transaction

### 7.2. Integration with E-commerce
- Real-time inventory sync với website
- Update available quantity khi có order
- Alert khi sản phẩm hết hàng

### 7.3. Integration with Accounting
- Export inventory valuation report
- COGS (Cost of Goods Sold) calculation
- Purchase order payment tracking

---

## 8. DEPLOYMENT CHECKLIST

- ⬜ Database indexes created
- ⬜ API endpoints implemented
- ⬜ Authorization middleware
- ⬜ Barcode generation/scanning
- ⬜ Report generation
- ⬜ Alert system
- ⬜ Mobile app for warehouse staff
- ⬜ Training materials
- ⬜ Data migration scripts
- ⬜ Testing completed

---

**Ngày tạo**: 2024-12-14  
**Version**: 1.0  
**Author**: System Architect Team  
**Status**: Draft - Pending Review
