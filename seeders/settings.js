const Settings = require("../models/settings");

const seedSettings = async () => {
  try {
    const existingSettings = await Settings.findOne();
    
    if (existingSettings) {
      return;
    }

    const defaultSettings = new Settings({
      websiteName: "TopPhone",
      websiteLogo: "",
      websiteDescription: "E-commerce website for phones",
      companyEmail: "info@topphone.com",
      companyPhone: "+84 123 456 789",
      companyAddress: "123 Main St, City",
      header: {
        logoSize: 50,
        logoPosition: "left",
        headerHeight: 80,
        stickyHeader: true,
        menuSpacing: 20,
        layoutStyle: "modern",
        showSearchBar: true,
        showWishlist: true,
        transparentOnTop: false,
        dropShadow: true,
      },
      features: {
        promoCode: {
          enabled: true,
          description: "Mã giảm giá",
        },
        loyaltyProgram: {
          enabled: true,
          description: "Chương trình tích điểm",
        },
        miniGames: {
          enabled: true,
          description: "Mini games - quay bánh xe",
        },
      },
      miniGames: {
        dailyPlayLimit: 3,
        spinWheelEnabled: true,
        scratchCardEnabled: true,
        mysteryBoxEnabled: true,
        quizGameEnabled: true,
        luckyDrawEnabled: true,
        rewardResetTime: "00:00",
      },
      loyalty: {
        pointsPerDong: 1,
        pointExpiryDays: 365,
        pointsForReferral: 500,
        enableTierSystem: true,
        tiers: {
          bronze: {
            name: "Bronze",
            minSpent: 0,
            pointMultiplier: 1.0,
            bonusPointsOnTierUp: 100,
          },
          silver: {
            name: "Silver",
            minSpent: 5000000,
            pointMultiplier: 1.2,
            bonusPointsOnTierUp: 200,
          },
          gold: {
            name: "Gold",
            minSpent: 20000000,
            pointMultiplier: 1.5,
            bonusPointsOnTierUp: 500,
          },
          platinum: {
            name: "Platinum",
            minSpent: 50000000,
            pointMultiplier: 2.0,
            bonusPointsOnTierUp: 1000,
          },
        },
      },
      promoCode: {
        maxDiscountPercentage: 50,
        maxFixedDiscount: 500000,
        defaultValidityDays: 30,
      },
      email: {
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPassword: "",
        enableEmailNotification: false,
      },
      theme: {
        primaryColor: "#007bff",
        secondaryColor: "#6c757d",
        accentColor: "#28a745",
        successColor: "#28a745",
        dangerColor: "#dc3545",
        warningColor: "#ffc107",
        infoColor: "#17a2b8",
        backgroundColor: "#ffffff",
        backgroundSecondaryColor: "#f8f9fa",
        surfaceColor: "#ffffff",
        cardBackgroundColor: "#ffffff",
        textColor: "#212529",
        textSecondaryColor: "#6c757d",
        textLightColor: "#868e96",
        borderColor: "#dee2e6",
        borderLightColor: "#e9ecef",
        hoverColor: "#0056b3",
        shadowColor: "rgba(0, 0, 0, 0.1)",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        linkColor: "#007bff",
        linkHoverColor: "#0056b3",
        buttonPrimaryBg: "#007bff",
        buttonPrimaryText: "#ffffff",
        buttonSecondaryBg: "#6c757d",
        buttonSecondaryText: "#ffffff",
        inputBorderColor: "#ced4da",
        inputBackgroundColor: "#ffffff",
        inputTextColor: "#212529",
        footerBackgroundColor: "#1a1a1a",
        footerTextColor: "#ffffff",
        headerBackgroundColor: "#1a1a1a",
        headerTextColor: "#ffffff",
        headerHoverColor: "#ff6b6b",
        headerFontFamily: "'Roboto', sans-serif",
        headerFontSize: 16,
        borderRadius: 8,
        fontFamily: "'Roboto', sans-serif",
        fontSize: 16,
      },
      maintenanceMode: false,
      maintenanceMessage: "Website đang bảo trì",
    });

    await defaultSettings.save();
  } catch (error) {
    console.error("✗ Error seeding settings:", error.message);
    throw error;
  }
};

module.exports = { seedSettings };
