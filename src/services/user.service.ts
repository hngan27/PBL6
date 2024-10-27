import { AppDataSource } from '../config/data-source';
import { User } from '../entity/user.entity';

const userRepository = AppDataSource.getRepository(User);
export const getUserById = async (userId: string) => {
    const user = await userRepository.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  };