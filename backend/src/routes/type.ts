import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/type - Get all types
router.get('/', async (req: Request, res: Response) => {
  try {
    const types = await prisma.type.findMany({
      include: {
        _count: {
          select: { menus: true },
        },
      },
    });
    res.json(types);
  } catch (error) {
    console.error('Error fetching types:', error);
    res.status(500).json({ error: 'Failed to fetch food types' });
  }
});

// POST /api/type - Create a new type
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const newType = await prisma.type.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(newType);
  } catch (error) {
    console.error('Error creating type:', error);
    res.status(500).json({ error: 'Failed to create food type' });
  }
});

// PUT /api/type/:id - Update type
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const typeId = parseInt(req.params.id, 10);
    const { name } = req.body;

    if (isNaN(typeId)) {
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    const updatedType = await prisma.type.update({
      where: { typeId },
      data: { name: name.trim() },
    });

    res.json(updatedType);
  } catch (error) {
    console.error('Error updating type:', error);
    res.status(500).json({ error: 'Failed to update type' });
  }
});

// DELETE /api/type/:id - Delete type
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const typeId = parseInt(req.params.id, 10);
    if (isNaN(typeId)) {
      res.status(400).json({ error: 'Invalid type ID' });
      return;
    }

    await prisma.type.delete({
      where: { typeId },
    });

    res.json({ message: 'Type deleted successfully' });
  } catch (error) {
    console.error('Error deleting type:', error);
    res.status(500).json({ error: 'Failed to delete type' });
  }
});

export default router;
