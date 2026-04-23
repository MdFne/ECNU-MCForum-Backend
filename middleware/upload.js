// 文件上传中间件配置
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/avatars/';
// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 存储配置
const storage = multer.diskStorage({
  // 存储目录
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // 文件名：用户id_时间戳.扩展名
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.user.id;
    const timestamp = Date.now();
    cb(null, `${userId}_${timestamp}${ext}`);
  }
});

// 文件过滤：只允许图片
const fileFilter = function (req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 JPG、PNG、GIF、WebP 格式的图片'), false);
  }
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

module.exports = upload;
