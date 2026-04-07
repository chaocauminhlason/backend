# HỆ THỐNG QUẢN LÝ NHÂN SỰ - HRM (HUMAN RESOURCE MANAGEMENT SYSTEM)

## 1. TỔNG QUAN

### 1.1. Mục tiêu
Xây dựng hệ thống HRM toàn diện để quản lý nhân sự đa chi nhánh:
- Quản lý thông tin nhân viên
- Quản lý phòng ban, vị trí công việc
- Chấm công và quản lý ca làm việc
- Quản lý nghỉ phép, đơn từ
- Tính lương tự động
- Đánh giá hiệu suất nhân viên
- Quản lý hợp đồng lao động
- Tuyển dụng và onboarding

### 1.2. Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────┐
│              HRM SYSTEM OVERVIEW                    │
└─────────────────────────────────────────────────────┘
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│EMPLOYEE  │     │  TIME &  │     │  PAYROLL │
│  MGMT    │     │ATTENDANCE│     │          │
│          │     │          │     │          │
│-Profile  │     │-Check In │     │-Salary   │
│-Dept     │     │-Shifts   │     │-Bonus    │
│-Position │     │-Overtime │     │-Deduct   │
│-Contract │     │-Leave    │     │-Payslip  │
└──────────┘     └──────────┘     └──────────┘
      │                 │                 │
      └────────┬────────┴────────┬────────┘
               ▼                 ▼
        ┌──────────┐      ┌──────────┐
        │EVALUATION│      │RECRUITMENT│
        │          │      │          │
        │-KPI      │      │-Posting  │
        │-Review   │      │-Candidate│
        │-Promotion│      │-Interview│
        └──────────┘      └──────────┘
```

---

## 2. DATABASE SCHEMA

### 2.1. Employee Model (Nhân viên)

```javascript
// backend/models/employee.js
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Format: EMP-XXXXX
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Link to User account for login
    },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      fullName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
        required: true,
      },
      nationalId: { type: String, unique: true, sparse: true }, // CMND/CCCD
      nationalIdIssueDate: { type: Date },
      nationalIdIssuePlace: { type: String },
      passportNumber: { type: String },
      maritalStatus: {
        type: String,
        enum: ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"],
      },
      nationality: { type: String, default: "Vietnamese" },
      ethnicity: { type: String },
      religion: { type: String },
      photo: {
        public_id: String,
        url: String,
      },
    },
    contact: {
      email: { type: String, required: true, unique: true },
      phone: { type: String, required: true },
      alternatePhone: { type: String },
      permanentAddress: {
        street: String,
        ward: String,
        district: String,
        city: String,
      },
      currentAddress: {
        street: String,
        ward: String,
        district: String,
        city: String,
      },
      emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
      },
    },
    employment: {
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true,
      },
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true,
      },
      position: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position",
        required: true,
      },
      directManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
      employmentType: {
        type: String,
        enum: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCE"],
        required: true,
      },
      workingType: {
        type: String,
        enum: ["ONSITE", "REMOTE", "HYBRID"],
        default: "ONSITE",
      },
      joinDate: { type: Date, required: true },
      probationEndDate: { type: Date },
      confirmationDate: { type: Date },
      resignationDate: { type: Date },
      lastWorkingDate: { type: Date },
      yearsOfService: { type: Number, default: 0 },
    },
    salary: {
      baseSalary: { type: Number, required: true },
      currency: { type: String, default: "VND" },
      paymentMethod: {
        type: String,
        enum: ["BANK_TRANSFER", "CASH", "CHECK"],
        default: "BANK_TRANSFER",
      },
      bankInfo: {
        bankName: { type: String },
        accountNumber: { type: String },
        accountName: { type: String },
        branch: { type: String },
      },
      allowances: [
        {
          name: { type: String }, // "Phụ cấp xăng xe", "Phụ cấp ăn trưa"
          amount: { type: Number },
          type: {
            type: String,
            enum: ["FIXED", "PERCENTAGE"],
          },
        },
      ],
      taxCode: { type: String },
      socialInsuranceNumber: { type: String },
      healthInsuranceNumber: { type: String },
    },
    education: [
      {
        degree: { type: String }, // "Bachelor", "Master", "PhD"
        major: { type: String },
        university: { type: String },
        graduationYear: { type: Number },
        gpa: { type: Number },
      },
    ],
    experience: [
      {
        company: { type: String },
        position: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        description: { type: String },
      },
    ],
    skills: [
      {
        name: { type: String },
        level: {
          type: String,
          enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
        },
        yearsOfExperience: { type: Number },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuingOrganization: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialId: { type: String },
      },
    ],
    documents: [
      {
        name: { type: String },
        type: {
          type: String,
          enum: [
            "RESUME",
            "ID_CARD",
            "DIPLOMA",
            "CONTRACT",
            "CERTIFICATE",
            "OTHER",
          ],
        },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    performance: {
      currentRating: { type: Number, min: 1, max: 5 },
      lastReviewDate: { type: Date },
      nextReviewDate: { type: Date },
      kpiScore: { type: Number },
      achievements: [
        {
          title: String,
          description: String,
          date: Date,
        },
      ],
      warnings: [
        {
          type: String,
          reason: String,
          date: Date,
          issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
          },
        },
      ],
    },
    attendance: {
      totalWorkingDays: { type: Number, default: 0 },
      totalAbsences: { type: Number, default: 0 },
      totalLateArrivals: { type: Number, default: 0 },
      totalEarlyLeaves: { type: Number, default: 0 },
      totalOvertimeHours: { type: Number, default: 0 },
      annualLeaveBalance: { type: Number, default: 12 },
      sickLeaveBalance: { type: Number, default: 12 },
    },
    status: {
      type: String,
      enum: [
        "ACTIVE",
        "PROBATION",
        "ON_LEAVE",
        "SUSPENDED",
        "RESIGNED",
        "TERMINATED",
      ],
      default: "PROBATION",
    },
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ "employment.branch": 1, status: 1 });
employeeSchema.index({ "employment.department": 1 });
employeeSchema.index({ "personalInfo.email": 1 });
employeeSchema.index({ "contact.email": 1 });

// Virtual for age
employeeSchema.virtual("age").get(function () {
  if (!this.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// Pre-save: Calculate years of service
employeeSchema.pre("save", function (next) {
  if (this.employment.joinDate) {
    const today = new Date();
    const joinDate = new Date(this.employment.joinDate);
    const years = (today - joinDate) / (1000 * 60 * 60 * 24 * 365.25);
    this.employment.yearsOfService = Math.floor(years * 10) / 10;
  }
  next();
});

module.exports = mongoose.model("Employee", employeeSchema);
```

### 2.2. Department Model (Phòng ban)

```javascript
// backend/models/department.js
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Example: "IT", "HR", "SALES"
    },
    name: {
      type: String,
      required: true,
      // Example: "Phòng Công nghệ Thông tin"
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    parentDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      // For hierarchical structure
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    description: { type: String },
    responsibilities: [{ type: String }],
    budget: {
      annual: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 },
    },
    metadata: {
      totalEmployees: { type: Number, default: 0 },
      activeProjects: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DISSOLVED"],
      default: "ACTIVE",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

departmentSchema.index({ code: 1 });
departmentSchema.index({ branch: 1, status: 1 });

module.exports = mongoose.model("Department", departmentSchema);
```

### 2.3. Position Model (Vị trí/Chức vụ)

```javascript
// backend/models/position.js
const mongoose = require("mongoose");

const positionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      // Example: "DEV_SENIOR", "SALE_EXEC"
    },
    title: {
      type: String,
      required: true,
      // Example: "Senior Developer", "Sales Executive"
    },
    level: {
      type: String,
      enum: ["INTERN", "JUNIOR", "MIDDLE", "SENIOR", "LEAD", "MANAGER", "DIRECTOR", "C_LEVEL"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    description: { type: String },
    responsibilities: [{ type: String }],
    requirements: {
      education: { type: String },
      experience: { type: String },
      skills: [{ type: String }],
      certifications: [{ type: String }],
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: "VND" },
    },
    benefits: [{ type: String }],
    totalPositions: { type: Number, default: 1 }, // Số lượng vị trí
    filledPositions: { type: Number, default: 0 },
    vacantPositions: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "DEPRECATED"],
      default: "ACTIVE",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

positionSchema.index({ code: 1 });
positionSchema.index({ level: 1, status: 1 });

module.exports = mongoose.model("Position", positionSchema);
```

### 2.4. Attendance Model (Chấm công)

```javascript
// backend/models/attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },
    checkIn: {
      time: { type: Date },
      location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
      },
      method: {
        type: String,
        enum: ["MANUAL", "BIOMETRIC", "MOBILE", "WEB"],
      },
      device: { type: String },
      photo: { type: String }, // Face recognition photo
    },
    checkOut: {
      time: { type: Date },
      location: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
      },
      method: {
        type: String,
        enum: ["MANUAL", "BIOMETRIC", "MOBILE", "WEB"],
      },
      device: { type: String },
      photo: { type: String },
    },
    breakTimes: [
      {
        breakStart: { type: Date },
        breakEnd: { type: Date },
        duration: { type: Number }, // minutes
      },
    ],
    workDuration: { type: Number }, // hours
    overtimeHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "PRESENT",
        "ABSENT",
        "LATE",
        "EARLY_LEAVE",
        "HALF_DAY",
        "ON_LEAVE",
        "HOLIDAY",
        "WEEKEND",
      ],
      default: "PRESENT",
    },
    lateMinutes: { type: Number, default: 0 },
    earlyLeaveMinutes: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    notes: { type: String },
    exceptions: [
      {
        type: {
          type: String,
          enum: ["FORGOT_CHECKIN", "FORGOT_CHECKOUT", "SYSTEM_ERROR", "OTHER"],
        },
        reason: { type: String },
        reportedAt: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ employee: 1, date: -1 });
attendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
```

### 2.5. Leave Model (Nghỉ phép)

```javascript
// backend/models/leave.js
const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    leaveCode: {
      type: String,
      required: true,
      unique: true,
      // Format: LV-YYYYMMDD-XXXXX
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    leaveType: {
      type: String,
      enum: [
        "ANNUAL_LEAVE",
        "SICK_LEAVE",
        "UNPAID_LEAVE",
        "MATERNITY_LEAVE",
        "PATERNITY_LEAVE",
        "BEREAVEMENT_LEAVE",
        "MARRIAGE_LEAVE",
        "STUDY_LEAVE",
        "OTHER",
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalDays: { type: Number, required: true },
    isHalfDay: { type: Boolean, default: false },
    halfDayPeriod: {
      type: String,
      enum: ["MORNING", "AFTERNOON"],
    },
    reason: { type: String, required: true },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    handoverTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      // Bàn giao công việc cho ai
    },
    handoverNotes: { type: String },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Leave", leaveSchema);
```

### 2.6. Payroll Model (Bảng lương)

```javascript
// backend/models/payroll.js
const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    payrollCode: {
      type: String,
      required: true,
      unique: true,
      // Format: PAY-YYYYMM-XXXXX
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    period: {
      month: { type: Number, required: true, min: 1, max: 12 },
      year: { type: Number, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    attendance: {
      workingDays: { type: Number, default: 0 },
      actualWorkingDays: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
      lateDays: { type: Number, default: 0 },
      overtimeHours: { type: Number, default: 0 },
      paidLeaveDays: { type: Number, default: 0 },
      unpaidLeaveDays: { type: Number, default: 0 },
    },
    earnings: {
      baseSalary: { type: Number, required: true },
      allowances: [
        {
          name: { type: String },
          amount: { type: Number },
        },
      ],
      overtimePay: { type: Number, default: 0 },
      bonus: { type: Number, default: 0 },
      commission: { type: Number, default: 0 },
      otherEarnings: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    deductions: {
      tax: { type: Number, default: 0 },
      socialInsurance: { type: Number, default: 0 },
      healthInsurance: { type: Number, default: 0 },
      unemploymentInsurance: { type: Number, default: 0 },
      lateDeduction: { type: Number, default: 0 },
      absentDeduction: { type: Number, default: 0 },
      advancePayment: { type: Number, default: 0 },
      loan: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netSalary: { type: Number, required: true },
    paymentDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "CASH", "CHECK"],
      default: "BANK_TRANSFER",
    },
    paymentStatus: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "PAID", "CANCELLED"],
      default: "DRAFT",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvalDate: { type: Date },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    payslipUrl: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employee: 1, "period.year": -1, "period.month": -1 });
payrollSchema.index({ paymentStatus: 1 });

// Pre-save: Calculate totals
payrollSchema.pre("save", function (next) {
  // Calculate total earnings
  let totalEarnings = this.earnings.baseSalary;
  totalEarnings += this.earnings.allowances.reduce(
    (sum, a) => sum + a.amount,
    0
  );
  totalEarnings += this.earnings.overtimePay;
  totalEarnings += this.earnings.bonus;
  totalEarnings += this.earnings.commission;
  totalEarnings += this.earnings.otherEarnings;
  this.earnings.totalEarnings = totalEarnings;

  // Calculate total deductions
  this.deductions.totalDeductions =
    this.deductions.tax +
    this.deductions.socialInsurance +
    this.deductions.healthInsurance +
    this.deductions.unemploymentInsurance +
    this.deductions.lateDeduction +
    this.deductions.absentDeduction +
    this.deductions.advancePayment +
    this.deductions.loan +
    this.deductions.otherDeductions;

  // Calculate net salary
  this.netSalary =
    this.earnings.totalEarnings - this.deductions.totalDeductions;

  next();
});

module.exports = mongoose.model("Payroll", payrollSchema);
```

### 2.7. Contract Model (Hợp đồng lao động)

```javascript
// backend/models/contract.js
const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      // Format: CT-YYYYMMDD-XXXXX
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    contractType: {
      type: String,
      enum: [
        "PROBATION",
        "DEFINITE_TERM",
        "INDEFINITE_TERM",
        "SEASONAL",
        "PROJECT_BASED",
      ],
      required: true,
      // PROBATION: Hợp đồng thử việc
      // DEFINITE_TERM: Hợp đồng xác định thời hạn
      // INDEFINITE_TERM: Hợp đồng không xác định thời hạn
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Null for indefinite
    signedDate: { type: Date, required: true },
    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    salary: {
      baseSalary: { type: Number, required: true },
      currency: { type: String, default: "VND" },
      paymentFrequency: {
        type: String,
        enum: ["MONTHLY", "BI_WEEKLY", "WEEKLY"],
        default: "MONTHLY",
      },
      probationSalary: { type: Number },
    },
    workingConditions: {
      workingHoursPerDay: { type: Number, default: 8 },
      workingDaysPerWeek: { type: Number, default: 5 },
      workSchedule: { type: String },
      probationPeriod: { type: Number }, // months
    },
    benefits: [
      {
        name: { type: String },
        description: { type: String },
      },
    ],
    terms: [
      {
        clause: { type: String },
        description: { type: String },
      },
    ],
    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_SIGNATURE",
        "ACTIVE",
        "EXPIRED",
        "TERMINATED",
        "RENEWED",
      ],
      default: "DRAFT",
    },
    signedBy: {
      employee: {
        signedDate: { type: Date },
        signature: { type: String }, // Image URL
      },
      employer: {
        name: { type: String },
        position: { type: String },
        signedDate: { type: Date },
        signature: { type: String },
      },
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    terminationInfo: {
      terminationDate: { type: Date },
      terminationType: {
        type: String,
        enum: ["RESIGNATION", "TERMINATION", "MUTUAL_AGREEMENT", "EXPIRATION"],
      },
      reason: { type: String },
      noticePeriod: { type: Number }, // days
      severancePay: { type: Number },
    },
    renewalHistory: [
      {
        previousContractId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Contract",
        },
        renewalDate: { type: Date },
        notes: { type: String },
      },
    ],
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

contractSchema.index({ employee: 1, status: 1 });
contractSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model("Contract", contractSchema);
```

### 2.8. Evaluation Model (Đánh giá nhân viên)

```javascript
// backend/models/evaluation.js
const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    evaluationCode: {
      type: String,
      required: true,
      unique: true,
      // Format: EVAL-YYYYQX-XXXXX
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    evaluationType: {
      type: String,
      enum: ["PROBATION", "ANNUAL", "QUARTERLY", "PROJECT_BASED", "360_DEGREE"],
      required: true,
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      quarter: { type: Number }, // 1, 2, 3, 4
      year: { type: Number, required: true },
    },
    evaluator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    kpiResults: [
      {
        kpiName: { type: String, required: true },
        target: { type: Number, required: true },
        actual: { type: Number, required: true },
        unit: { type: String },
        weight: { type: Number, default: 1 }, // Trọng số
        score: { type: Number }, // % achievement
        notes: { type: String },
      },
    ],
    competencyAssessment: [
      {
        category: {
          type: String,
          enum: [
            "TECHNICAL_SKILLS",
            "SOFT_SKILLS",
            "LEADERSHIP",
            "COMMUNICATION",
            "TEAMWORK",
            "PROBLEM_SOLVING",
            "CREATIVITY",
          ],
        },
        rating: { type: Number, min: 1, max: 5 },
        comments: { type: String },
      },
    ],
    achievements: [
      {
        description: { type: String },
        impact: { type: String },
      },
    ],
    areasOfImprovement: [
      {
        area: { type: String },
        recommendation: { type: String },
        priority: {
          type: String,
          enum: ["HIGH", "MEDIUM", "LOW"],
        },
      },
    ],
    trainingNeeds: [
      {
        skill: { type: String },
        reason: { type: String },
        priority: {
          type: String,
          enum: ["HIGH", "MEDIUM", "LOW"],
        },
      },
    ],
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    overallScore: { type: Number }, // Weighted score
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "F"],
    },
    recommendation: {
      type: String,
      enum: [
        "PROMOTION",
        "SALARY_INCREASE",
        "BONUS",
        "TRAINING",
        "MAINTAIN",
        "PROBATION_EXTENSION",
        "TERMINATION",
      ],
    },
    employeeFeedback: {
      selfAssessment: { type: String },
      comments: { type: String },
      goals: [{ type: String }],
      submittedAt: { type: Date },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "COMPLETED", "ACKNOWLEDGED"],
      default: "DRAFT",
    },
    reviewDate: { type: Date, required: true },
    acknowledgedBy: {
      employee: {
        acknowledged: { type: Boolean, default: false },
        date: { type: Date },
        signature: { type: String },
      },
      manager: {
        acknowledged: { type: Boolean, default: false },
        date: { type: Date },
        signature: { type: String },
      },
    },
    nextReviewDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

evaluationSchema.index({ employee: 1, "period.year": -1 });
evaluationSchema.index({ status: 1 });

module.exports = mongoose.model("Evaluation", evaluationSchema);
```

### 2.9. Shift Model (Ca làm việc)

```javascript
// backend/models/shift.js
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      // Example: "MORNING", "AFTERNOON", "NIGHT"
    },
    name: {
      type: String,
      required: true,
      // Example: "Ca sáng", "Ca chiều"
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    startTime: { type: String, required: true }, // "08:00"
    endTime: { type: String, required: true }, // "17:00"
    breakTime: {
      start: { type: String }, // "12:00"
      end: { type: String }, // "13:00"
      duration: { type: Number }, // minutes
    },
    totalHours: { type: Number, required: true },
    daysOfWeek: [
      {
        type: String,
        enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      },
    ],
    allowedLateMinutes: { type: Number, default: 15 },
    allowedEarlyLeaveMinutes: { type: Number, default: 15 },
    overtimeRateMultiplier: { type: Number, default: 1.5 },
    nightShiftRate: { type: Number, default: 1.3 }, // For night shifts
    color: { type: String }, // For calendar display
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

shiftSchema.index({ branch: 1, isActive: 1 });

module.exports = mongoose.model("Shift", shiftSchema);
```

### 2.10. TimeSheet Model (Bảng chấm công tháng)

```javascript
// backend/models/timeSheet.js
const mongoose = require("mongoose");

const timeSheetSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    period: {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    dailyRecords: [
      {
        date: { type: Date, required: true },
        attendance: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attendance",
        },
        status: {
          type: String,
          enum: [
            "PRESENT",
            "ABSENT",
            "LATE",
            "EARLY_LEAVE",
            "HALF_DAY",
            "ON_LEAVE",
            "HOLIDAY",
            "WEEKEND",
          ],
        },
        workHours: { type: Number, default: 0 },
        overtimeHours: { type: Number, default: 0 },
      },
    ],
    summary: {
      totalWorkingDays: { type: Number, default: 0 },
      actualWorkingDays: { type: Number, default: 0 },
      absentDays: { type: Number, default: 0 },
      lateDays: { type: Number, default: 0 },
      earlyLeaveDays: { type: Number, default: 0 },
      totalWorkHours: { type: Number, default: 0 },
      totalOvertimeHours: { type: Number, default: 0 },
      paidLeaveDays: { type: Number, default: 0 },
      unpaidLeaveDays: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_APPROVAL", "APPROVED", "LOCKED"],
      default: "DRAFT",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    approvalDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

timeSheetSchema.index({ employee: 1, "period.year": -1, "period.month": -1 });

module.exports = mongoose.model("TimeSheet", timeSheetSchema);
```

---

## 3. API ENDPOINTS

### 3.1. Employee Management APIs

#### A. Create Employee
```http
POST /api/v1/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "personalInfo": { ... },
  "contact": { ... },
  "employment": { ... },
  "salary": { ... }
}
```

#### B. Get All Employees
```http
GET /api/v1/employees?branch=branch_id&department=dept_id&status=ACTIVE&page=1&limit=20
```

#### C. Get Employee Details
```http
GET /api/v1/employees/:employeeId
```

#### D. Update Employee
```http
PUT /api/v1/employees/:employeeId
```

#### E. Employee Dashboard
```http
GET /api/v1/employees/:employeeId/dashboard
```

### 3.2. Attendance APIs

#### A. Check In
```http
POST /api/v1/attendance/check-in
Authorization: Bearer {token}

{
  "location": {
    "lat": 10.762622,
    "lng": 106.660172
  },
  "method": "MOBILE",
  "photo": "base64_image_data"
}
```

#### B. Check Out
```http
POST /api/v1/attendance/check-out
```

#### C. Get Attendance History
```http
GET /api/v1/attendance?employee=emp_id&from=2024-01-01&to=2024-12-31
```

#### D. Manual Attendance Entry (Admin)
```http
POST /api/v1/attendance/manual
```

### 3.3. Leave Management APIs

#### A. Request Leave
```http
POST /api/v1/leaves
Authorization: Bearer {token}

{
  "leaveType": "ANNUAL_LEAVE",
  "startDate": "2024-12-20",
  "endDate": "2024-12-22",
  "totalDays": 3,
  "reason": "Personal trip",
  "handoverTo": "employee_id"
}
```

#### B. Approve/Reject Leave
```http
POST /api/v1/leaves/:leaveId/approve
POST /api/v1/leaves/:leaveId/reject
```

#### C. Get Leave Balance
```http
GET /api/v1/leaves/balance/:employeeId
```

### 3.4. Payroll APIs

#### A. Generate Payroll
```http
POST /api/v1/payroll/generate
Authorization: Bearer {token}

{
  "month": 12,
  "year": 2024,
  "employees": ["emp_id_1", "emp_id_2"]
}
```

#### B. Get Payroll
```http
GET /api/v1/payroll?month=12&year=2024&employee=emp_id
```

#### C. Approve Payroll
```http
POST /api/v1/payroll/:payrollId/approve
```

#### D. Generate Payslip PDF
```http
GET /api/v1/payroll/:payrollId/payslip
```

### 3.5. Evaluation APIs

#### A. Create Evaluation
```http
POST /api/v1/evaluations
```

#### B. Submit Self-Assessment
```http
POST /api/v1/evaluations/:evalId/self-assessment
```

#### C. Complete Evaluation
```http
POST /api/v1/evaluations/:evalId/complete
```

---

## 4. BUSINESS LOGIC & WORKFLOWS

### 4.1. Attendance Workflow

```javascript
// Auto-calculate attendance status
async function processAttendance(attendanceRecord) {
  const employee = await Employee.findById(attendanceRecord.employee);
  const shift = await Shift.findById(attendanceRecord.shift);

  // Parse shift times
  const [shiftStartHour, shiftStartMin] = shift.startTime.split(":").map(Number);
  const [shiftEndHour, shiftEndMin] = shift.endTime.split(":").map(Number);

  // Check-in analysis
  const checkInTime = attendanceRecord.checkIn.time;
  const shiftStart = new Date(checkInTime);
  shiftStart.setHours(shiftStartHour, shiftStartMin, 0, 0);

  const lateMinutes = (checkInTime - shiftStart) / (1000 * 60);

  if (lateMinutes > shift.allowedLateMinutes) {
    attendanceRecord.status = "LATE";
    attendanceRecord.lateMinutes = lateMinutes;
  }

  // Check-out analysis
  if (attendanceRecord.checkOut) {
    const checkOutTime = attendanceRecord.checkOut.time;
    const shiftEnd = new Date(checkOutTime);
    shiftEnd.setHours(shiftEndHour, shiftEndMin, 0, 0);

    const earlyLeaveMinutes = (shiftEnd - checkOutTime) / (1000 * 60);

    if (earlyLeaveMinutes > shift.allowedEarlyLeaveMinutes) {
      attendanceRecord.status = "EARLY_LEAVE";
      attendanceRecord.earlyLeaveMinutes = earlyLeaveMinutes;
    }

    // Calculate work duration
    const workDuration =
      (checkOutTime - checkInTime) / (1000 * 60 * 60); // hours
    const breakDuration =
      attendanceRecord.breakTimes.reduce((sum, b) => sum + b.duration, 0) / 60; // convert to hours
    attendanceRecord.workDuration = workDuration - breakDuration;

    // Calculate overtime
    if (attendanceRecord.workDuration > shift.totalHours) {
      attendanceRecord.overtimeHours =
        attendanceRecord.workDuration - shift.totalHours;
    }
  }

  await attendanceRecord.save();
}
```

### 4.2. Payroll Calculation

```javascript
async function calculatePayroll(employee, month, year) {
  // Get timesheet
  const timeSheet = await TimeSheet.findOne({
    employee: employee._id,
    "period.month": month,
    "period.year": year,
  });

  // Base salary
  let baseSalary = employee.salary.baseSalary;

  // Deduct for absent days
  const workingDaysInMonth = 26; // Standard
  const salaryPerDay = baseSalary / workingDaysInMonth;
  const absentDeduction =
    timeSheet.summary.absentDays * salaryPerDay +
    timeSheet.summary.unpaidLeaveDays * salaryPerDay;

  // Calculate allowances
  let totalAllowances = employee.salary.allowances.reduce(
    (sum, a) => sum + a.amount,
    0
  );

  // Calculate overtime pay
  const overtimePay =
    (baseSalary / workingDaysInMonth / 8) *
    timeSheet.summary.totalOvertimeHours *
    1.5;

  // Total earnings
  const totalEarnings = baseSalary + totalAllowances + overtimePay;

  // Calculate deductions
  const socialInsurance = baseSalary * 0.08; // 8%
  const healthInsurance = baseSalary * 0.015; // 1.5%
  const unemploymentInsurance = baseSalary * 0.01; // 1%

  // Tax calculation (Vietnam progressive tax)
  const tax = calculatePersonalIncomeTax(totalEarnings);

  const totalDeductions =
    tax +
    socialInsurance +
    healthInsurance +
    unemploymentInsurance +
    absentDeduction;

  // Net salary
  const netSalary = totalEarnings - totalDeductions;

  // Create payroll record
  const payroll = await Payroll.create({
    employee: employee._id,
    period: { month, year },
    attendance: timeSheet.summary,
    earnings: {
      baseSalary,
      allowances: employee.salary.allowances,
      overtimePay,
      totalEarnings,
    },
    deductions: {
      tax,
      socialInsurance,
      healthInsurance,
      unemploymentInsurance,
      absentDeduction,
      totalDeductions,
    },
    netSalary,
  });

  return payroll;
}
```

---

## 5. ADVANCED FEATURES

### 5.1. Face Recognition Check-in

```javascript
// Using Face-API.js or similar
async function verifyFaceCheckIn(employeeId, photoBase64) {
  const employee = await Employee.findById(employeeId);

  // Get stored face descriptor from employee profile
  const storedFaceDescriptor = employee.personalInfo.faceDescriptor;

  // Extract descriptor from uploaded photo
  const uploadedFaceDescriptor = await extractFaceDescriptor(photoBase64);

  // Compare similarity
  const similarity = compareFaceDescriptors(
    storedFaceDescriptor,
    uploadedFaceDescriptor
  );

  if (similarity > 0.6) {
    // 60% match threshold
    return { verified: true, similarity };
  } else {
    return { verified: false, similarity };
  }
}
```

### 5.2. Geo-fencing Check-in

```javascript
function isWithinGeofence(userLat, userLng, branchLat, branchLng, radiusKm) {
  const R = 6371; // Earth radius in km

  const dLat = ((branchLat - userLat) * Math.PI) / 180;
  const dLng = ((branchLng - userLng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLat * Math.PI) / 180) *
      Math.cos((branchLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance <= radiusKm;
}
```

### 5.3. Automated Leave Approval

```javascript
async function autoApproveLeave(leaveRequest) {
  const employee = await Employee.findById(leaveRequest.employee).populate(
    "employment.directManager"
  );

  // Rules for auto-approval
  const autoApprovalRules = [
    // Rule 1: Annual leave <= 2 days with sufficient balance
    leaveRequest.leaveType === "ANNUAL_LEAVE" &&
      leaveRequest.totalDays <= 2 &&
      employee.attendance.annualLeaveBalance >= leaveRequest.totalDays,

    // Rule 2: Sick leave <= 1 day with medical certificate
    leaveRequest.leaveType === "SICK_LEAVE" &&
      leaveRequest.totalDays <= 1 &&
      leaveRequest.attachments.length > 0,
  ];

  if (autoApprovalRules.some((rule) => rule)) {
    leaveRequest.status = "APPROVED";
    leaveRequest.approver = employee.employment.directManager._id;
    leaveRequest.approvalDate = new Date();

    // Deduct leave balance
    employee.attendance.annualLeaveBalance -= leaveRequest.totalDays;
    await employee.save();
    await leaveRequest.save();

    // Send notification
    await sendLeaveApprovalNotification(leaveRequest);

    return { autoApproved: true };
  }

  return { autoApproved: false };
}
```

---

## 6. REPORTS & ANALYTICS

### 6.1. Key HR Reports

```javascript
// 1. Headcount Report
async function getHeadcountReport(branchId) {
  const report = await Employee.aggregate([
    { $match: { "employment.branch": branchId, status: "ACTIVE" } },
    {
      $group: {
        _id: {
          department: "$employment.department",
          position: "$employment.position",
        },
        count: { $sum: 1 },
      },
    },
  ]);
  return report;
}

// 2. Turnover Rate
async function getTurnoverRate(year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const avgEmployees = await Employee.countDocuments({
    "employment.joinDate": { $lte: endOfYear },
    $or: [
      { "employment.resignationDate": { $gte: startOfYear } },
      { "employment.resignationDate": null },
    ],
  });

  const resigned = await Employee.countDocuments({
    "employment.resignationDate": {
      $gte: startOfYear,
      $lte: endOfYear,
    },
  });

  const turnoverRate = (resigned / avgEmployees) * 100;
  return turnoverRate.toFixed(2);
}

// 3. Attendance Summary
async function getAttendanceSummary(branchId, month, year) {
  const summary = await Attendance.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(year, month - 1, 1),
          $lt: new Date(year, month, 1),
        },
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "employee",
        foreignField: "_id",
        as: "employeeInfo",
      },
    },
    { $unwind: "$employeeInfo" },
    {
      $match: {
        "employeeInfo.employment.branch": branchId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  return summary;
}
```

---

## 7. INTEGRATION POINTS

### 7.1. Integration with Branch System
- Employee assignment to branches
- Branch-level HR reports
- Cross-branch transfers

### 7.2. Integration with Payroll System
- Automatic timesheet → payroll generation
- Bank file export for salary payment
- Tax reporting

### 7.3. Integration with External Systems
- **Email**: Send notifications (leave approval, payslip, etc.)
- **SMS**: Attendance alerts, reminders
- **Biometric devices**: Sync attendance data
- **Accounting software**: Export payroll data

---

## 8. MOBILE APP FEATURES

### 8.1. Employee Self-Service
```
- View profile & documents
- Check-in/Check-out
- Request leave
- View payslip
- View attendance history
- Submit expense claims
- View company announcements
```

### 8.2. Manager App
```
- Approve leaves
- View team attendance
- Approve timesheets
- Conduct evaluations
- View team performance
```

---

## 9. DEPLOYMENT CHECKLIST

- ⬜ Database models implemented
- ⬜ API endpoints created
- ⬜ Authentication & authorization
- ⬜ Attendance auto-processing
- ⬜ Payroll calculation engine
- ⬜ Face recognition integration
- ⬜ Geo-fencing implementation
- ⬜ Email/SMS notifications
- ⬜ Report generation
- ⬜ Mobile app (React Native/Flutter)
- ⬜ Data migration
- ⬜ Testing
- ⬜ Employee training

---

**Ngày tạo**: 2024-12-14  
**Version**: 1.0  
**Author**: System Architect Team  
**Status**: Draft - Pending Review
