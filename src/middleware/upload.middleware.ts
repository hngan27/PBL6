// import express from 'express';
// import upload from '../config/multer-config'; // Cấu hình multer (bộ nhớ)
// import uploadImageToCloudinary from '../utils/cloudinaryUpload'; // Hàm upload ảnh

// const router = express.Router();

// // Route xử lý việc tải lên ảnh
// router.post('/upload', upload.single('avatar'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: 'No file uploaded' });
//   }

//   try {
//     // Upload ảnh trực tiếp từ bộ nhớ lên Cloudinary
//     const result = await uploadImageToCloudinary(req.file);
//     res.status(200).json({ message: 'File uploaded successfully', file: result });
//   } catch (error) {
//     res.status(500).json({ message: 'Error uploading file', error });
//   }
// });

// export default router;
