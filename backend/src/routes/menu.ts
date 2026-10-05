import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/menu - Fetch all menus with their type
router.get('/', async (req: Request, res: Response) => {
  try {
    const { typeId } = req.query;

    const whereCondition = typeId ? { typeId: Number(typeId) } : {};

    const menus = await prisma.menu.findMany({
      where: whereCondition,
      include: {
        type: true,
      },
      orderBy: {
        menuId: 'desc',
      },
    });

    res.json(menus);
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({ error: 'Failed to fetch menus' });
  }
});

// POST /api/menu - Create a menu
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, price, isBestSeller, typeId } = req.body;

    if (!name || price === undefined || !typeId) {
      res.status(400).json({ error: 'name, price, and typeId are required' });
      return;
    }

    const newMenu = await prisma.menu.create({
      data: {
        name: name.trim(),
        price: parseFloat(price),
        isBestSeller: Boolean(isBestSeller),
        typeId: parseInt(typeId, 10),
      },
      include: {
        type: true,
      },
    });

    res.status(201).json(newMenu);
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({ error: 'Failed to create menu' });
  }
});

// PUT /api/menu/:id - Update menu
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const menuId = parseInt(req.params.id, 10);
    const { name, price, isBestSeller, typeId } = req.body;

    if (isNaN(menuId)) {
      res.status(400).json({ error: 'Invalid menu ID' });
      return;
    }

    const updatedMenu = await prisma.menu.update({
      where: { menuId },
      data: {
        name: name ? name.trim() : undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : undefined,
        typeId: typeId ? parseInt(typeId, 10) : undefined,
      },
      include: {
        type: true,
      },
    });

    res.json(updatedMenu);
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

// DELETE /api/menu/:id - Delete menu
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const menuId = parseInt(req.params.id, 10);
    if (isNaN(menuId)) {
      res.status(400).json({ error: 'Invalid menu ID' });
      return;
    }

    await prisma.menu.delete({
      where: { menuId },
    });

    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({ error: 'Failed to delete menu' });
  }
});

export default router;
