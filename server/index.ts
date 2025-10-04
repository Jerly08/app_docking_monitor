import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Extend Request interface to include user
interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: string;
    fullName?: string;
  };
}

const app = express();
const server = createServer(app);
const prisma = new PrismaClient();

// Environment variables
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-use-at-least-32-characters';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3001';

// Socket.IO setup
const io = new SocketServer(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json());

// JWT Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        fullName: user.fullName 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, username: true, email: true, role: true, fullName: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Work Items Routes
app.get('/api/work-items', async (req, res) => {
  try {
    const workItems = await prisma.workItem.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true
              }
            }
          }
        },
        parent: true,
        tasks: true
      },
      orderBy: [
        { number: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    res.json(workItems);
  } catch (error) {
    console.error('Get work items error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/work-items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workItem = await prisma.workItem.create({
      data: req.body,
      include: {
        children: true,
        parent: true,
        tasks: true
      }
    });

    // Emit to all connected clients
    io.emit('workItemCreated', workItem);

    res.status(201).json(workItem);
  } catch (error) {
    console.error('Create work item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/work-items/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const workItem = await prisma.workItem.update({
      where: { id },
      data: req.body,
      include: {
        children: true,
        parent: true,
        tasks: true
      }
    });

    // Emit to all connected clients
    io.emit('workItemUpdated', workItem);

    res.json(workItem);
  } catch (error) {
    console.error('Update work item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Tasks Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        workItem: true
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/tasks', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: {
        workItem: true
      }
    });

    // Emit to all connected clients
    io.emit('taskCreated', task);

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.update({
      where: { id },
      data: req.body,
      include: {
        workItem: true
      }
    });

    // Emit to all connected clients
    io.emit('taskUpdated', task);

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id }
    });

    // Emit to all connected clients
    io.emit('taskDeleted', { id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Resource conflicts detection
app.get('/api/tasks/conflicts', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: ['PLANNED', 'IN_PROGRESS'] }
      },
      include: {
        workItem: true
      }
    });

    // Simple conflict detection logic
    const conflicts = [];
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];
        
        // Check for overlapping dates and same resources
        if (task1.assignedTo && task2.assignedTo && task1.assignedTo === task2.assignedTo) {
          const start1 = new Date(task1.startDate);
          const end1 = new Date(task1.endDate);
          const start2 = new Date(task2.startDate);
          const end2 = new Date(task2.endDate);
          
          if ((start1 <= end2) && (end1 >= start2)) {
            conflicts.push({
              task1: task1,
              task2: task2,
              conflictType: 'resource_overlap',
              resource: task1.assignedTo
            });
          }
        }
      }
    }

    res.json(conflicts);
  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Docking Monitor API'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Real-time progress updates
  socket.on('updateProgress', (data) => {
    socket.broadcast.emit('progressUpdated', data);
  });
});

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO enabled`);
  console.log(`🗄️  Database connected`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});