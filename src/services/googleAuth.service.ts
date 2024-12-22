import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token: string) => {
  try {
    // Xác minh ID Token với Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Client ID của bạn từ Google Cloud Console
    });
    const payload = ticket.getPayload();
    console.log(payload);
    // Trả về payload chứa thông tin người dùng
    return payload;
  } catch (error) {
    console.error('Google token verification failed:', error);
    return null; // Trả về null nếu không xác minh được
  }
};
