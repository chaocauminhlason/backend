const Branch = require("../models/branch");

const branchesData = [
  {
    code: "HQ",
    name: "Trụ sở chính - Hà Nội",
    type: "HEADQUARTER",
    address: {
      street: "123 Láng Hạ",
      ward: "Láng Hạ",
      district: "Đống Đa",
      city: "Hà Nội",
      country: "Vietnam",
    },
    contact: {
      phone: "0241234567",
      email: "hq@techstore.vn",
    },
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi",
      businessHours: {
        monday: { open: "08:00", close: "18:00", isClosed: false },
        tuesday: { open: "08:00", close: "18:00", isClosed: false },
        wednesday: { open: "08:00", close: "18:00", isClosed: false },
        thursday: { open: "08:00", close: "18:00", isClosed: false },
        friday: { open: "08:00", close: "18:00", isClosed: false },
        saturday: { open: "09:00", close: "17:00", isClosed: false },
        sunday: { open: "09:00", close: "17:00", isClosed: true },
      },
      autoApproveOrders: false,
      allowOnlineOrders: true,
      allowWalkInOrders: true,
    },
    status: "ACTIVE",
    openingDate: new Date("2020-01-15"),
  },
  {
    code: "HCM01",
    name: "Chi nhánh Quận 1 - TP.HCM",
    type: "BRANCH",
    address: {
      street: "456 Nguyễn Huệ",
      ward: "Bến Nghé",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      country: "Vietnam",
    },
    contact: {
      phone: "0281234567",
      email: "hcm01@techstore.vn",
    },
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi",
      businessHours: {
        monday: { open: "08:00", close: "22:00", isClosed: false },
        tuesday: { open: "08:00", close: "22:00", isClosed: false },
        wednesday: { open: "08:00", close: "22:00", isClosed: false },
        thursday: { open: "08:00", close: "22:00", isClosed: false },
        friday: { open: "08:00", close: "22:00", isClosed: false },
        saturday: { open: "08:00", close: "22:00", isClosed: false },
        sunday: { open: "09:00", close: "21:00", isClosed: false },
      },
      autoApproveOrders: true,
      allowOnlineOrders: true,
      allowWalkInOrders: true,
    },
    status: "ACTIVE",
    openingDate: new Date("2020-06-01"),
  },
  {
    code: "HN01",
    name: "Chi nhánh Cầu Giấy - Hà Nội",
    type: "BRANCH",
    address: {
      street: "789 Trần Duy Hưng",
      ward: "Trung Hòa",
      district: "Cầu Giấy",
      city: "Hà Nội",
      country: "Vietnam",
    },
    contact: {
      phone: "0241234568",
      email: "hn01@techstore.vn",
    },
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi",
      businessHours: {
        monday: { open: "08:00", close: "20:00", isClosed: false },
        tuesday: { open: "08:00", close: "20:00", isClosed: false },
        wednesday: { open: "08:00", close: "20:00", isClosed: false },
        thursday: { open: "08:00", close: "20:00", isClosed: false },
        friday: { open: "08:00", close: "20:00", isClosed: false },
        saturday: { open: "09:00", close: "20:00", isClosed: false },
        sunday: { open: "09:00", close: "18:00", isClosed: false },
      },
      autoApproveOrders: true,
      allowOnlineOrders: true,
      allowWalkInOrders: true,
    },
    status: "ACTIVE",
    openingDate: new Date("2021-03-15"),
  },
  {
    code: "DN01",
    name: "Chi nhánh Hải Châu - Đà Nẵng",
    type: "BRANCH",
    address: {
      street: "321 Lê Duẩn",
      ward: "Hải Châu 1",
      district: "Hải Châu",
      city: "Đà Nẵng",
      country: "Vietnam",
    },
    contact: {
      phone: "0236123456",
      email: "dn01@techstore.vn",
    },
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi",
      businessHours: {
        monday: { open: "08:00", close: "20:00", isClosed: false },
        tuesday: { open: "08:00", close: "20:00", isClosed: false },
        wednesday: { open: "08:00", close: "20:00", isClosed: false },
        thursday: { open: "08:00", close: "20:00", isClosed: false },
        friday: { open: "08:00", close: "20:00", isClosed: false },
        saturday: { open: "09:00", close: "21:00", isClosed: false },
        sunday: { open: "09:00", close: "21:00", isClosed: false },
      },
      autoApproveOrders: true,
      allowOnlineOrders: true,
      allowWalkInOrders: true,
    },
    status: "ACTIVE",
    openingDate: new Date("2021-09-01"),
  },
  {
    code: "WH01",
    name: "Kho trung tâm Miền Bắc",
    type: "WAREHOUSE",
    address: {
      street: "Khu công nghiệp Quang Minh",
      ward: "Phù Lỗ",
      district: "Sóc Sơn",
      city: "Hà Nội",
      country: "Vietnam",
    },
    contact: {
      phone: "0241234569",
      email: "wh01@techstore.vn",
    },
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi",
      businessHours: {
        monday: { open: "07:00", close: "17:00", isClosed: false },
        tuesday: { open: "07:00", close: "17:00", isClosed: false },
        wednesday: { open: "07:00", close: "17:00", isClosed: false },
        thursday: { open: "07:00", close: "17:00", isClosed: false },
        friday: { open: "07:00", close: "17:00", isClosed: false },
        saturday: { open: "07:00", close: "12:00", isClosed: false },
        sunday: { open: "", close: "", isClosed: true },
      },
      autoApproveOrders: false,
      allowOnlineOrders: false,
      allowWalkInOrders: false,
    },
    status: "ACTIVE",
    openingDate: new Date("2020-03-01"),
  },
];

const seedBranches = async () => {
  try {
    await Branch.deleteMany({});
    const branches = await Branch.insertMany(branchesData);
    console.log(`✅ Seeded ${branches.length} branches successfully`);
    return branches;
  } catch (error) {
    console.error("❌ Error seeding branches:", error);
    throw error;
  }
};

module.exports = { branchesData, seedBranches };
