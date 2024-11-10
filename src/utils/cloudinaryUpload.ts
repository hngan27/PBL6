import cloudinary from '../config/cloudinary.config';
// Định nghĩa kiểu trả về từ Cloudinary
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  // Các trường khác có thể có từ Cloudinary (như url gốc, size, format, ...)
  [key: string]: any;
}

// Hàm upload ảnh lên Cloudinary
const uploadImageToCloudinary = async (file: Express.Multer.File): Promise<CloudinaryUploadResult> => {
  try {
    // Kiểm tra nếu file có tồn tại và là một file hợp lệ
    if (!file || !file.buffer) {
      throw new Error('No file buffer found');
    }

    // Upload ảnh lên Cloudinary thông qua upload_stream
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { resource_type: 'auto' }, // Tự động nhận dạng tài nguyên (ảnh, video, v.v.)
        (error, result) => {
          if (error) {
            return reject(error); // Nếu có lỗi, từ chối promise
          }
          resolve(result as CloudinaryUploadResult); // Trả về kết quả sau khi upload thành công
        }
      ).end(file.buffer); // Kết thúc và upload file buffer
    });

    return result; // Trả về kết quả upload từ Cloudinary
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Error uploading image to Cloudinary');
  }
};

export default uploadImageToCloudinary;
