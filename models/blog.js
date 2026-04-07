const mongoose = require("mongoose");

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    content: { type: Buffer },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
  next();
});

module.exports = mongoose.model("Blog", blogSchema);
