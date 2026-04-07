const { saveImage, deleteImage } = require("../config/uploadUtils");
const Blog = require("../models/blog");
const createBlog = ({ title, avatar, content }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await Blog.findOne({ title: title });
      if (res) {
        reject({
          success: false,
          mes: "Tiêu đề đã tồn tại",
        });
        return;
      }
      const imageData = saveImage(avatar, "blog");
      const blog = Blog.create({
        title: title,
        avatar: {
          public_id: imageData.public_id,
          url: imageData.url,
        },
        content: content,
      });
      resolve(blog.then((res) => res));
    } catch (e) {
      reject(e);
    }
  });
};
const getBlogs = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const blog = await Blog.find();
      if (!blog) {
        reject({
          success: false,
          mes: "Không tìm thấy",
        });
        return;
      }

      resolve({
        blog,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const findByIdOrSlug = async (identifier) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return await Blog.findById(identifier);
  }
  return await Blog.findOne({ slug: identifier });
};

const getBlog = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blog = await findByIdOrSlug(id);
      if (!blog) {
        reject({
          success: false,
          mes: "Không tìm thấy bài viết",
        });
        return;
      }

      resolve({
        blog,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const deleteBlog = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const blog = await findByIdOrSlug(id);
      if (!blog) {
        reject({
          success: false,
          mes: "Không tìm thấy bài viết",
        });
        return;
      }
      deleteImage(blog.avatar.public_id, "blog");
      await Blog.findByIdAndDelete(blog._id);

      resolve({
        success: true,
        mes: "Xóa thành công",
      });
    } catch (e) {
      reject(e);
    }
  });
};

const updateBlog = (id, props) => {
  return new Promise(async (resolve, reject) => {
    const { avatar, title, content } = props;
    try {
      const blog = await findByIdOrSlug(id);
      if (!avatar.includes("/uploads/")) {
        deleteImage(blog.avatar.public_id, "blog");
        const imageData = saveImage(avatar, "blog");
        blog.avatar = {
          public_id: imageData.public_id,
          url: imageData.url,
        };
      }
      blog.title = title;
      blog.content = content;

      await blog.save();
      resolve({
        success: true,
        blog,
      });
    } catch (e) {
      reject({
        success: false,
      });
    }
  });
};
module.exports = { createBlog, getBlogs, getBlog, deleteBlog, updateBlog };
