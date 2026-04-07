const Product = require("../models/product");
const Category = require("../models/category");

const productsSeed = async () => {
  try {
    // Get categories
    const categories = await Category.find();
    if (categories.length === 0) {
      return;
    }

    // Clear existing data
    await Product.deleteMany({})

    const iphoneCategory = categories.find((c) => c.name === "Iphone");
    const macCategory = categories.find((c) => c.name === "Mac");
    const ipadCategory = categories.find((c) => c.name === "Ipad");
    const watchCategory = categories.find((c) => c.name === "Watch");
    const earphoneCategory = categories.find((c) => c.name === "Tai nghe");
    const accessoryCategory = categories.find((c) => c.name === "Phụ kện");

    const products = [
      {
        name: "Apple Watch Series 9",
        slug: "apple-watch-series-9",
        category: watchCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/ui4porhvkipjp2rcq7yw",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710298122/CloneTopZone/Product/ui4porhvkipjp2rcq7yw.webp",
          },
        ],
        des: "<ul><li>Thu cũ đổi mới trợ giá thêm 300.000đ (Không kèm thanh toán qua cổng online, mua kèm)&nbsp;</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul>",
        price: "18990000",
        discount: "5",
        color: [
          { color: "Đen", quantity: 6 }
        ],
        sold_out: 4,
        ratings: 0,
      },
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/xqljoujc9y88njmehbp2",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710304262/CloneTopZone/Product/xqljoujc9y88njmehbp2.png",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)&nbsp;</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)&nbsp;</li></ul>",
        price: "28000000",
        discount: "5",
        color: [
          { color: "Đen", quantity: 2 }
        ],
        sold_out: 8,
        ratings: 4.142857142857143,
      },
      {
        name: "Iphone 14 Promax",
        slug: "iphone-14-promax",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/sqb4mzgajzdhshcuxsqh",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710304526/CloneTopZone/Product/sqb4mzgajzdhshcuxsqh.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)&nbsp;</li><li>&nbsp;Hoàn tiền: nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)&nbsp;</li></ul>",
        price: "25000000",
        discount: "2",
        color: [
          { color: "Xanh lá cây", quantity: 3 }
        ],
        sold_out: 7,
        ratings: 5,
      },
      {
        name: "Iphone 12",
        slug: "iphone-12",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/fhpbm1npextmzcsrgdel",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710304942/CloneTopZone/Product/fhpbm1npextmzcsrgdel.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)&nbsp;</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)&nbsp;</li></ul><p><br></p>",
        price: "15000000",
        discount: "0",
        color: [
          { color: "Đen", quantity: 2 }
        ],
        sold_out: 8,
        ratings: 5,
      },
      {
        name: "iPad Pro M2 12.9",
        slug: "ipad-pro-m2-129",
        category: ipadCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/qhzkywkizqtpqweexqhb",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710310811/CloneTopZone/Product/qhzkywkizqtpqweexqhb.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul>",
        price: "31000000",
        discount: "0",
        color: [
          { color: "Đen", quantity: 8 }
        ],
        sold_out: 2,
        ratings: 5,
      },
      {
        name: "AirPods Pro",
        slug: "airpods-pro",
        category: earphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/lisyysgumxae0cpj5mla",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710310989/CloneTopZone/Product/lisyysgumxae0cpj5mla.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul>",
        price: "5800000",
        discount: "0",
        color: [
          { color: "white", quantity: 10 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Magic Keyboard",
        slug: "magic-keyboard",
        category: accessoryCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/ms4onexgw89k2syxnff1",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710311062/CloneTopZone/Product/ms4onexgw89k2syxnff1.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul>",
        price: "2000000",
        discount: "0",
        color: [
          { color: "Trắng", quantity: 5 }
        ],
        sold_out: 5,
        ratings: 5,
      },
      {
        name: "Ốp lưng MagSafe cho iPhone 15 Pro Max",
        slug: "op-lung-magsafe-cho-iphone-15-pro-max",
        category: accessoryCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/c5ibymbucsvavajdragj",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710311113/CloneTopZone/Product/c5ibymbucsvavajdragj.webp",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul>",
        price: "200000",
        discount: "0",
        color: [
          { color: "Trắng", quantity: 8 }
        ],
        sold_out: 2,
        ratings: 0,
      },
      {
        name: "MacBook Air 15 inch M3",
        slug: "macbook-air-15-inch-m3",
        category: macCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/qu2vbmvbb1nvylrvnnaw",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1710311461/CloneTopZone/Product/qu2vbmvbb1nvylrvnnaw.webp",
          },
        ],
        des: "<p>Thu cũ Đổi mới: Giảm đến 2 triệu (Tuỳ model máy cũ, Không kèm thanh toán qua cổng online, mua kèm)</p><p>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</p>",
        price: "50000000",
        discount: "5",
        color: [
          { color: "Đen", quantity: 0 }
        ],
        sold_out: 5,
        ratings: 0,
      },
      {
        name: "IPhone 11 64GB",
        slug: "iphone-11-64gb",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/wv8w3h6axivkwyzyvate",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734420604/CloneTopZone/Product/wv8w3h6axivkwyzyvate.png",
          },
        ],
        des: "<p>Iphone 11</p><ol><li>64GB</li></ol>",
        price: "8890000",
        discount: "11",
        color: [
          { color: "Trắng", quantity: 4 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "IPhone 11 128GB",
        slug: "iphone-11-128gb",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/zbpqnp7vavyd1gcbwzdn",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734420672/CloneTopZone/Product/zbpqnp7vavyd1gcbwzdn.png",
          },
        ],
        des: "<p>IPhone 11</p><ol><li>128GB</li></ol>",
        price: "9450000",
        discount: "9",
        color: [
          { color: "Đen", quantity: 3 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Iphone 14 Plus Gold",
        slug: "iphone-14-plus-gold",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/aja5xyzeis8nxh7rfxnw",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734420735/CloneTopZone/Product/aja5xyzeis8nxh7rfxnw.png",
          },
        ],
        des: "<p>IPhone 14 Plus</p><p><br></p><ol><li>Gold 256 GB</li></ol>",
        price: "19790000",
        discount: "4",
        color: [
          { color: "Đen", quantity: 2 },
          { color: "Vàng", quantity: 2 }
        ],
        sold_out: 1,
        ratings: 0,
      },
      {
        name: "Macbook Air 13 M1",
        slug: "macbook-air-13-m1",
        category: macCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/vy6ejd0rbzjh32ilxuqj",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734488546/CloneTopZone/Product/vy6ejd0rbzjh32ilxuqj.png",
          },
        ],
        des: "<ul><li>Nhập mã VNPAYTGDD5 giảm từ 50,000đ đến 200,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR.</li></ul>",
        price: "19900000",
        discount: "9",
        color: [
          { color: "Bạc", quantity: 4 }
        ],
        sold_out: 1,
        ratings: 0,
      },
      {
        name: "Macbook Air 13 M2",
        slug: "macbook-air-13-m2",
        category: macCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/ysmxbtpxmyidk6p4s4yz",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734488954/CloneTopZone/Product/ysmxbtpxmyidk6p4s4yz.png",
          },
        ],
        des: "<p><span style=\"color: rgb(255, 255, 255); background-color: rgb(47, 48, 51);\">Nhập mã VNPAYTGDD5 giảm từ 50,000đ đến 200,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR.</span></p>",
        price: "24490000",
        discount: "4",
        color: [
          { color: "Bạc", quantity: 6 }
        ],
        sold_out: 1,
        ratings: 0,
      },
      {
        name: "Macbook Pro 14inch M3",
        slug: "macbook-pro-14inch-m3",
        category: macCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/f34jpwirh23qyccwpawe",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734490304/CloneTopZone/Product/f34jpwirh23qyccwpawe.png",
          },
        ],
        des: "<p><span style=\"background-color: rgb(47, 48, 51); color: rgb(255, 255, 255);\">Nhập mã VNPAYTGDD5 giảm từ 50,000đ đến 200,000đ (áp dụng tùy giá trị đơn hàng) khi thanh toán qua VNPAY-QR.</span></p>",
        price: "39900000",
        discount: "11",
        color: [
          { color: "Xám", quantity: 2 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Iphone 13",
        slug: "iphone-13",
        category: iphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/muklglkmyfqjdsggaxiq",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734493084/CloneTopZone/Product/muklglkmyfqjdsggaxiq.png",
          },
        ],
        des: "<ul><li>Thu cũ đổi mới trợ giá thêm 300.000đ (Không kèm thanh toán qua cổng online, mua kèm)&nbsp;</li><li>&nbsp;Hoàn tiền nếu ở đâu rẻ hơn (Trong vòng 7 ngày; chỉ áp dụng tại siêu thị)</li></ul><p><br></p>",
        price: "18990000",
        discount: "10",
        color: [
          { color: "Xanh lam", quantity: 7 }
        ],
        sold_out: 1,
        ratings: 5,
      },
      {
        name: "iPad Air 6 M2",
        slug: "ipad-air-6-m2",
        category: ipadCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/rynl5fqlrqp3g0rtdp2s",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734588618/CloneTopZone/Product/rynl5fqlrqp3g0rtdp2s.png",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm thêm đến 2,000,000 (Không kèm ưu đãi thanh toán qua cổng, mua kèm)</li></ul>",
        price: "16990000",
        discount: "11",
        color: [
          { color: "Tím", quantity: 5 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "iPad Pro M4 11",
        slug: "ipad-pro-m4-11",
        category: ipadCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/xmndvmselyop4brfluzn",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734589179/CloneTopZone/Product/xmndvmselyop4brfluzn.png",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm thêm đến 2,000,000 (Không kèm ưu đãi thanh toán qua cổng, mua kèm)</li></ul>",
        price: "28990000",
        discount: "4",
        color: [
          { color: "Đen", quantity: 7 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "iPad 9",
        slug: "ipad-9",
        category: ipadCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/uzy0t3q31s7fmkefubhx",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734589296/CloneTopZone/Product/uzy0t3q31s7fmkefubhx.png",
          },
        ],
        des: "<ul><li>Thu cũ Đổi mới: Giảm thêm đến 2,000,000 (Không kèm ưu đãi thanh toán qua cổng, mua kèm)</li></ul>",
        price: "8390000",
        discount: "15",
        color: [
          { color: "Xám", quantity: 3 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Apple Watch Series 10",
        slug: "apple-watch-series-10",
        category: watchCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/iczpjzytggvtrs9eutp4",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734589692/CloneTopZone/Product/iczpjzytggvtrs9eutp4.png",
          },
        ],
        des: "<ul><li>Phiếu mua hàng áp dụng mua sim trị giá 50.000đ</li><li>Thu cũ đổi mới trợ giá thêm 300,000Đ Cơ hội nhận ngay</li><li>Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà</li></ul>",
        price: "10990000",
        discount: "5",
        color: [
          { color: "Tím", quantity: 2 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Apple Watch Series 10 GPS Titanium",
        slug: "apple-watch-series-10-gps-titanium",
        category: watchCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/oqkwaqwaal205jhspt9t",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734589982/CloneTopZone/Product/oqkwaqwaal205jhspt9t.png",
          },
        ],
        des: "<ul><li>Phiếu mua hàng áp dụng mua sim trị giá 50.000đ</li><li>Thu cũ đổi mới trợ giá thêm 300,000Đ</li><li>Cơ hội nhận ngay Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà</li></ul>",
        price: "21090000",
        discount: "6",
        color: [
          { color: "Vàng", quantity: 1 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Apple Watch SE 2 GPS",
        slug: "apple-watch-se-2-gps",
        category: watchCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/fhj3tqpcd21xnanxb2la",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590051/CloneTopZone/Product/fhj3tqpcd21xnanxb2la.png",
          },
        ],
        des: "<ul><li>Phiếu mua hàng áp dụng mua sim trị giá 50.000đ</li><li>Thu cũ đổi mới trợ giá thêm 300,000Đ</li><li>Cơ hội nhận ngay Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà</li></ul>",
        price: "5990000",
        discount: "5",
        color: [
          { color: "Vàng", quantity: 1 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "AirPods Pro (2nd Gen) USB-C",
        slug: "airpods-pro-2nd-gen-usb-c",
        category: earphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/k0ahfqsq0w0r7yzqrgqb",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590207/CloneTopZone/Product/k0ahfqsq0w0r7yzqrgqb.png",
          },
        ],
        des: "<ul><li>Cơ hội nhận ngay Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà.</li></ul>",
        price: "6200000",
        discount: "9",
        color: [
          { color: "Trắng", quantity: 4 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "AirpPods Max",
        slug: "airpods-max",
        category: earphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/eqe9kar4s1j3dpq22zo1",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590248/CloneTopZone/Product/eqe9kar4s1j3dpq22zo1.png",
          },
        ],
        des: "<ul><li>Cơ hội nhận ngay Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà.</li></ul>",
        price: "13990000",
        discount: "14",
        color: [
          { color: "Trắng", quantity: 4 },
          { color: "Hồng", quantity: 2 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "EarPods jack cắm USB-C",
        slug: "earpods-jack-cam-usb-c",
        category: earphoneCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/lgisaw96hmkuy10gbdhy",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590303/CloneTopZone/Product/lgisaw96hmkuy10gbdhy.png",
          },
        ],
        des: "<ul><li>Cơ hội nhận ngay Phiếu mua hàng trị giá 1.000.000đ khi tham gia Trả chậm Duyệt qua điện thoại, giao hàng tận nhà.</li></ul>",
        price: "550000",
        discount: "1",
        color: [
          { color: "Trắng", quantity: 3 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Adapter sạc Apple USB-C 20W",
        slug: "adapter-sac-apple-usb-c-20w",
        category: accessoryCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/hpzc8vc7at7uc4m5kxm4",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590562/CloneTopZone/Product/hpzc8vc7at7uc4m5kxm4.png",
          },
        ],
        des: "<ul><li>Giảm thêm 50.000 khi mua kèm với iPhone, iPad, MacBook, Apple Watch</li></ul>",
        price: "550000",
        discount: "10",
        color: [
          { color: "Trắng", quantity: 8 }
        ],
        sold_out: 0,
        ratings: 0,
      },
      {
        name: "Cáp sạc Type C - Type C 1m",
        slug: "cap-sac-type-c-type-c-1m",
        category: accessoryCategory._id,
        image: [
          {
            public_id: "CloneTopZone/Product/ke9nncjyujorguome9b8",
            url: "https://res.cloudinary.com/dnicqkz3v/image/upload/v1734590599/CloneTopZone/Product/ke9nncjyujorguome9b8.png",
          },
        ],
        des: "<ul><li>Giảm thêm 50.000 khi mua kèm với iPhone, iPad, MacBook, Apple Watch</li></ul>",
        price: "650000",
        discount: "14",
        color: [
          { color: "Trắng", quantity: 8 }
        ],
        sold_out: 0,
        ratings: 0,
      },
    ];

    const result = await Product.insertMany(products);

    return result;
  } catch (error) {
    console.error("✗ Error seeding products:", error.message);
    throw error;
  }
};

module.exports = { productsSeed };
