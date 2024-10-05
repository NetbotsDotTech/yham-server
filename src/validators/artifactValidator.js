import { body } from 'express-validator';

const validateArtifact = [
  body('name').notEmpty().withMessage('Name is required'),
  body('itemNo').notEmpty().withMessage('Item Number is required'),
  body('serialNo').notEmpty().withMessage('Serial Number is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('madeOf').notEmpty().withMessage('Material is required'),
  body('age').notEmpty().withMessage('Age is required'),
  body('shelfNo').notEmpty().withMessage('Shelf Number is required'),
  body('hallNo').notEmpty().withMessage('Hall Number is required'),
];

export default validateArtifact;
