// src/controllers/authController.ts
import { Request, Response } from 'express';
import { loginUser } from '../services/auth.service';
import { AppDataSource } from '../config/data-source';
import { registerUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  const { username, password, full_name, email } = req.body;
  console.log(req.body);
  try {
    const newUser = await registerUser(username, password, full_name, email);
    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const token = await loginUser(username, password);
    res.json({ token });
  } catch (error) {
    // Kiểm tra kiểu của error
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};
