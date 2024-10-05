

import express from 'express';
import {
  getAllTimeTables,
  getTimeTableForDay,
  createOrUpdateTimeTableForDay,
  deleteTimeTableForDay
} from '../controllers/timeTableController.js'; // Adjust the path as needed

const router = express.Router();

router.get('/', getAllTimeTables);

router.get('/:day', getTimeTableForDay);

router.post('/', createOrUpdateTimeTableForDay);

router.delete('/:day', deleteTimeTableForDay);

export default router;


// import express from 'express';
// import {
//   getWeekTimeTable,
//   createWeekTimeTable,
//   updateWeekTimeTable,
//   deleteWeekTimeTable,
// } from '../controllers/timeTableController.js';
// import { protect, authorizeRoles } from '../middlewares/auth.js'; 
// const router = express.Router();

// router.route('/')
//   .get(getWeekTimeTable) 
//   .post(protect, authorizeRoles('admin', 'staff'), createWeekTimeTable)
//   .put(protect, authorizeRoles('admin', 'staff'), updateWeekTimeTable) 
//   .delete(protect, authorizeRoles('admin', 'staff'), deleteWeekTimeTable); 

// export default router;
