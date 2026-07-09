import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authSchema } from '../schemas/auth.schema.js';
import { config } from '../config/index.js';

// In-memory mock database for users
const users: any[] = [];

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = authSchema.parse(req.body);
    const { email, password } = validatedData;

    if (users.find(u => u.email === email)) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: String(users.length + 1), email, password: hashedPassword };
    users.push(newUser);

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, config.jwt.secret, { expiresIn: '1d' });
    res.status(201).json({ token, user: { email: newUser.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = authSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = users.find(u => u.email === email);
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, { expiresIn: '1d' });
    res.status(200).json({ token, user: { email: user.email } });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};
