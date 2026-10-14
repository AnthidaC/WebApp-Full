import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const DATA_FILE = path.join(__dirname, '../../users.json');

interface UserData {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
}

// Default initial users (matching Slide 2)
const defaultUsers: UserData[] = [
  { id: 1, username: 'John', email: 'john@gmail.com', password: 'password', role: 'admin' },
  { id: 2, username: 'Ann', email: 'Ann@gmail.com', password: 'password', role: 'user' },
  { id: 3, username: 'Bob', email: 'Bob@gmail.com', password: 'password', role: 'user' },
  { id: 4, username: 'Cate', email: 'Cate@gmail.com', password: 'password', role: 'user' },
  { id: 5, username: 'Danny', email: 'Danny@gmail.com', password: 'password', role: 'user' },
];

function getUsers(): UserData[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    return defaultUsers;
  } catch (err) {
    return defaultUsers;
  }
}

function saveUsers(users: UserData[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน (Username, Email, Password)' });
      return;
    }

    const users = getUsers();
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingUser) {
      res.status(400).json({ error: 'Username หรือ Email นี้มีในระบบแล้ว' });
      return;
    }

    const newUser: UserData = {
      id: Date.now(),
      username: username.trim(),
      email: email.trim(),
      password: String(password),
      role: 'user',
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Error registering:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'กรุณากรอก Username และ Password' });
      return;
    }

    const users = getUsers();
    const user = users.find(
      (u) =>
        (u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase()) &&
        u.password === String(password)
    );

    if (!user) {
      res.status(401).json({ error: 'Username หรือ Password ไม่ถูกต้อง' });
      return;
    }

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

// GET /api/auth/users
router.get('/users', (req: Request, res: Response) => {
  try {
    const users = getUsers().map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/auth/users/:id/role
router.put('/users/:id/role', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    const users = getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    user.role = role || 'user';
    saveUsers(users);
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

export default router;
