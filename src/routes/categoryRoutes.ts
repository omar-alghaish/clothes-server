import express from 'express';
import * as categoryController from '../controllers/categoryController';
import * as authController from '../controllers/authController';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Protected routes for admins only
router.use(authController.protect);
router.use(authController.restrictTo('admin'));


router.post('/', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;