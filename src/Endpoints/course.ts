import { courseCreate } from '../Controllers/createCourse';
import { courseDelete } from '../Controllers/deleteCourse';
import {
  courseById,
  coursesByCategory,
  moreLikeThis,
  instructorCourses,
  instructorInactiveCourses,
  topRatedCoursesByCategory,
} from '../Controllers/getCourse';
import { courses } from '../Controllers/search';
import { course } from '../Controllers/seed';
import { courseUpdate, courseUpdateActive } from '../Controllers/updateCourse';
import express, { Router } from 'express';

const router: Router = express.Router();

const courseRoutes = (): Router => {
  router.get('/:courseId', courseById);
  router.get('/instructor/:instructorId', instructorCourses);
  router.get('/instructor/pause/:instructorId', instructorInactiveCourses);
  router.get('/search/:from/:size/:type', courses);
  router.get('/category/:username', coursesByCategory);
  router.get('/top/:username', topRatedCoursesByCategory);
  router.get('/similar/:courseId', moreLikeThis);
  router.post('/create', courseCreate);
  router.put('/:courseId', courseUpdate);
  router.put('/active/:courseId', courseUpdateActive);
  router.put('/seed/:count', course);
  router.delete('/:courseId/:instructorId', courseDelete);

  return router;
};

export { courseRoutes };
