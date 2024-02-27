import { deleteCourse } from '../Services/course.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const courseDelete = async (req: Request, res: Response): Promise<void> => {
  await deleteCourse(req.params.courseId, req.params.instructorId);
  res.status(StatusCodes.OK).json({ message: 'Course deleted successfully.' });
};

export { courseDelete };
