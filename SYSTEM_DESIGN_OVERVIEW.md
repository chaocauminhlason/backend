# THIẾT KẾ TỔNG QUAN HỆ THỐNG

## 1. GIỚI THIỆU

### 1.1. Mô tả hệ thống hiện tại
Hệ thống hiện tại là một nền tảng E-commerce được xây dựng với:
- **Backend**: Node.js + Express + MongoDB + Redis + Socket.IO
- **Frontend**: React
- **Database**: MongoDB (NoSQL)
- **Cache**: Redis
- **Real-time**: Socket.IO

### 1.2. Mục tiêu mở rộng
Mở rộng hệ thống hiện tại để hỗ trợ 3 chức năng lớn:
1. **Hệ thống đa chi nhánh** - Quản lý nhiều chi nhánh độc lập và tập trung
2. **Hệ thống quản lý kho** - Quản lý kho hàng đa chi nhánh
3. **Hệ thống HRM** - Quản lý nhân sự toàn công ty

---

## 2. KIẾN TRÚC TỔNG QUAN

### 2.1. Kiến trúc hiện tại
```
┌─────────────┐
│   Client    │
│   (React)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────────┐
│   Express   │◄─────┤  Socket.IO  │
│   Server    │      │  Real-time  │
└──────┬──────┘      └─────────────┘
       │
       ├──────────┐
       ▼          ▼
┌─────────┐  ┌─────────┐
│ MongoDB │  │  Redis  │
└─────────┘  └─────────┘
```

### 2.2. Kiến trúc mở rộng đề xuất
```
┌────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Admin   │  │  Branch  │  │   HRM    │  │   POS    │  │
│  │  Portal  │  │  Portal  │  │  Portal  │  │  System  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │    Rate Limiting │ Auth │ Logging │ Load Balancing  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   BRANCH     │  │  WAREHOUSE   │  │     HRM      │
│   SERVICE    │  │   SERVICE    │  │   SERVICE    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴────────┬────────┘
                ▼                 ▼
        ┌──────────────┐  ┌──────────────┐
        │   MongoDB    │  │    Redis     │
        │   Cluster    │  │    Cache     │
        └──────────────┘  └──────────────┘
```

---

## 3. STACK CÔNG NGHỆ

### 3.1. Backend Core
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: JavaScript (có thể nâng cấp TypeScript)

### 3.2. Database & Cache
- **Primary DB**: MongoDB v6+ (Document-based)
- **Cache**: Redis v7+ (Session, Real-time data)
- **Search**: MongoDB Atlas Search (hoặc Elasticsearch)

### 3.3. Authentication & Authorization
- **JWT**: jsonwebtoken
- **Encryption**: bcrypt
- **RBAC**: Role-Based Access Control (đã có)

### 3.4. Real-time Communication
- **WebSocket**: Socket.IO v4+
- **Use cases**: 
  - Notifications
  - Real-time inventory updates
  - Live order tracking
  - Employee attendance tracking

### 3.5. File Storage
- **Current**: Cloudinary
- **Expand**: Support S3 hoặc local storage cho documents

### 3.6. Additional Tools
- **Validation**: Joi
- **Date/Time**: Moment.js (có thể chuyển sang Day.js)
- **Logging**: Winston hoặc Pino
- **Monitoring**: PM2 + Optional: New Relic/DataDog

---

## 4. CẤU TRÚC DATABASE TỔNG QUAN

### 4.1. Collections hiện tại
```
users
products
categories
orders
roles
permissions
loyaltyPoints
loyaltyRewards
promoCodes
blogs
sliders
settings
events
miniGames
gamePlays
```

### 4.2. Collections mới cần thêm

#### A. Multi-Branch System
```
branches
branchSettings
branchProducts (inventory per branch)
branchOrders
branchTransfers
```

#### B. Warehouse Management
```
warehouses
warehouseLocations
inventoryTransactions
stockMovements
stockAdjustments
purchaseOrders
suppliers
```

#### C. HRM System
```
employees
departments
positions
attendance
leaves
payroll
contracts
evaluations
shifts
timeSheets
```

---

## 5. QUAN HỆ DỮ LIỆU CHÍNH

### 5.1. Branch - Product - Warehouse
```
Branch (1) ──► (N) BranchProduct ◄── (1) Product
Branch (1) ──► (N) Warehouse
Warehouse (1) ──► (N) InventoryTransaction
```

### 5.2. Employee - Branch - Department
```
Branch (1) ──► (N) Department
Department (1) ──► (N) Employee
Employee (N) ──► (N) Role/Permission
Employee (1) ──► (N) Attendance
```

### 5.3. Order - Branch - Warehouse
```
User (1) ──► (N) Order
Order (1) ──► (1) Branch
Branch (1) ──► (1) Warehouse
```

---

## 6. API ARCHITECTURE

### 6.1. API Versioning
```
/api/v1/branches/*
/api/v1/warehouses/*
/api/v1/hrm/*
/api/v1/inventory/*
/api/v1/products/*
/api/v1/orders/*
```

### 6.2. Authentication Flow
```
1. Client → POST /api/v1/auth/login
2. Server → Validate credentials
3. Server → Generate JWT (access + refresh token)
4. Server → Store refresh token in Redis
5. Client → Store tokens (httpOnly cookie/localStorage)
6. Client → Requests with Authorization header
7. Server → Verify JWT + Check permissions
```

### 6.3. Authorization Levels
```
Level 1: Super Admin (Full system access)
Level 2: Branch Manager (Branch-specific access)
Level 3: Warehouse Manager (Warehouse operations)
Level 4: HR Manager (Employee management)
Level 5: Employee (Limited access)
Level 6: Customer (Public API only)
```

---

## 7. MICROSERVICES APPROACH (OPTIONAL)

### 7.1. Service Decomposition
Có thể tách thành các service độc lập:

```
┌─────────────────┐
│  Auth Service   │ → JWT, User Session
└─────────────────┘

┌─────────────────┐
│ Branch Service  │ → Branch management
└─────────────────┘

┌─────────────────┐
│Warehouse Service│ → Inventory, Stock
└─────────────────┘

┌─────────────────┐
│   HRM Service   │ → Employees, Payroll
└─────────────────┘

┌─────────────────┐
│  Order Service  │ → Orders, Payments
└─────────────────┘
```

### 7.2. Communication
- **Synchronous**: REST API hoặc gRPC
- **Asynchronous**: RabbitMQ hoặc Kafka (cho events)

---

## 8. SECURITY & COMPLIANCE

### 8.1. Security Measures
- ✅ JWT Authentication
- ✅ HTTPS/TLS
- ✅ CORS Configuration
- ✅ Rate Limiting (Express rate limiter)
- ✅ Input Validation (Joi)
- ✅ SQL/NoSQL Injection Prevention
- ✅ XSS Protection
- ⬜ CSRF Protection (cần thêm)
- ⬜ API Key Management
- ⬜ Audit Logging

### 8.2. Data Privacy
- Mã hóa password (bcrypt)
- Không log sensitive data
- GDPR compliance cho customer data
- Employee data protection (PDPA)

### 8.3. Backup & Recovery
- MongoDB automated backup (Atlas)
- Redis persistence (RDB/AOF)
- Daily backup schedule
- Disaster recovery plan

---

## 9. PERFORMANCE & SCALABILITY

### 9.1. Performance Optimization
```
1. Database Indexing
   - User email, role
   - Product slug, category
   - Order user, status, createdAt
   - Branch code, isActive
   - Employee code, branch, department

2. Caching Strategy
   - Product catalog (Redis)
   - User sessions (Redis)
   - Branch settings (Redis)
   - Frequently accessed data

3. Query Optimization
   - Use projection (select specific fields)
   - Limit & pagination
   - Aggregation pipeline
   - Avoid N+1 queries

4. CDN for static assets
   - Images, CSS, JS
   - Cloudinary for product images
```

### 9.2. Scalability Plan
```
Phase 1: Vertical Scaling
- Increase server resources (RAM, CPU)
- Optimize database queries

Phase 2: Horizontal Scaling
- Load balancer (Nginx)
- Multiple Node.js instances (PM2 cluster mode)
- MongoDB replica set

Phase 3: Distributed System
- Separate services (microservices)
- Message queue (RabbitMQ/Kafka)
- Distributed cache (Redis Cluster)
```

---

## 10. MONITORING & LOGGING

### 10.1. Logging Strategy
```javascript
// Log levels
ERROR   → Critical errors, exceptions
WARN    → Warning messages
INFO    → General information
DEBUG   → Debugging information
TRACE   → Detailed trace information

// Log categories
- API requests/responses
- Database queries
- Authentication events
- Business transactions
- Error stack traces
- Performance metrics
```

### 10.2. Monitoring Metrics
```
System Metrics:
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

Application Metrics:
- Request rate (req/sec)
- Response time (ms)
- Error rate (%)
- Active connections

Business Metrics:
- Orders per hour
- Revenue per branch
- Inventory turnover
- Employee productivity
```

### 10.3. Tools
- **Logging**: Winston + ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: PM2 monitoring, Prometheus + Grafana
- **APM**: New Relic hoặc DataDog
- **Uptime**: UptimeRobot, Pingdom

---

## 11. DEPLOYMENT & DEVOPS

### 11.1. Development Workflow
```
Local Dev → Git → GitHub → CI/CD → Staging → Production
```

### 11.2. Environments
```
1. Development (Local)
   - Docker Compose
   - Local MongoDB
   - Local Redis

2. Staging
   - Heroku / DigitalOcean
   - MongoDB Atlas
   - Redis Cloud

3. Production
   - AWS / GCP / Azure
   - MongoDB Atlas (Cluster)
   - Redis Enterprise
   - Load Balancer
   - Auto-scaling
```

### 11.3. CI/CD Pipeline
```yaml
# Example GitHub Actions
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Code coverage
    
  build:
    - Build Docker image
    - Push to registry
    
  deploy:
    - Deploy to staging
    - Run smoke tests
    - Deploy to production (manual approval)
```

---

## 12. ROADMAP TRIỂN KHAI

### Phase 1: Foundation (2-3 weeks)
- ✅ Thiết kế database schema cho 3 modules
- ⬜ Cập nhật Role & Permission system
- ⬜ API Gateway & Route structure
- ⬜ Authentication middleware nâng cao

### Phase 2: Multi-Branch System (3-4 weeks)
- ⬜ Branch model & CRUD APIs
- ⬜ Branch-specific product inventory
- ⬜ Branch orders & reports
- ⬜ Branch settings & configuration

### Phase 3: Warehouse Management (4-5 weeks)
- ⬜ Warehouse model & locations
- ⬜ Inventory tracking system
- ⬜ Stock movements & transfers
- ⬜ Purchase orders & suppliers
- ⬜ Reports & analytics

### Phase 4: HRM System (4-5 weeks)
- ⬜ Employee management
- ⬜ Department & positions
- ⬜ Attendance & leave management
- ⬜ Payroll system
- ⬜ Performance evaluation

### Phase 5: Integration & Testing (2-3 weeks)
- ⬜ Integration testing
- ⬜ Performance testing
- ⬜ Security audit
- ⬜ User acceptance testing (UAT)

### Phase 6: Deployment & Training (1-2 weeks)
- ⬜ Production deployment
- ⬜ User training
- ⬜ Documentation
- ⬜ Post-launch monitoring

**Total Timeline: 16-22 weeks (4-5.5 months)**

---

## 13. TEAM & RESOURCES

### 13.1. Development Team
```
- 1x Technical Lead / Architect
- 2-3x Backend Developers (Node.js)
- 2x Frontend Developers (React)
- 1x DevOps Engineer
- 1x QA Engineer
- 1x UI/UX Designer (optional)
```

### 13.2. Infrastructure Cost (Monthly Estimate)
```
- Server (AWS/GCP): $100-300
- MongoDB Atlas: $60-200
- Redis Cloud: $30-100
- Cloudinary: $50-100
- CDN: $20-50
- Monitoring tools: $50-150
- Total: $310-900/month
```

---

## 14. RỦI RO & GIẢI PHÁP

### 14.1. Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration complexity | High | Incremental migration, backup strategy |
| Performance degradation | High | Load testing, optimization before launch |
| MongoDB scaling limits | Medium | Plan for sharding, replica sets |
| Redis memory limits | Medium | Cache eviction policies, Redis Cluster |
| Breaking changes to existing API | High | API versioning, backward compatibility |

### 14.2. Business Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| User resistance to new system | Medium | Training, phased rollout |
| Data inconsistency across branches | High | Transaction handling, validation rules |
| Downtime during migration | High | Zero-downtime deployment strategy |

---

## 15. TÀI LIỆU THAM KHẢO

### 15.1. Internal Documents
- `MULTI_BRANCH_SYSTEM.md` - Chi tiết hệ thống đa chi nhánh
- `WAREHOUSE_MANAGEMENT.md` - Chi tiết quản lý kho
- `HRM_SYSTEM.md` - Chi tiết hệ thống HRM

### 15.2. External Resources
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Redis Best Practices](https://redis.io/topics/admin)

---

## 16. KẾT LUẬN

Hệ thống được thiết kế để:
- ✅ **Scalable**: Có thể mở rộng theo chiều ngang và dọc
- ✅ **Maintainable**: Code structure rõ ràng, dễ maintain
- ✅ **Secure**: Bảo mật đa lớp, tuân thủ best practices
- ✅ **Performant**: Tối ưu hóa database, caching, queries
- ✅ **Modular**: Có thể tách thành microservices nếu cần
- ✅ **Flexible**: Dễ dàng thêm tính năng mới

### Next Steps
1. Review và approve thiết kế này
2. Đọc chi tiết 3 documents module
3. Bắt đầu implementation theo roadmap
4. Setup development environment
5. Create development branch và bắt đầu coding

---

**Ngày tạo**: 2024-12-14  
**Version**: 1.0  
**Author**: System Architect Team  
**Status**: Draft - Pending Review
