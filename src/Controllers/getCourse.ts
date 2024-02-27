import { getUserSelectedCourseCategory } from '../redis/course.cache';
import {
  getCourseById,
  getInstructorCourses,
  getInstructorPausedCourses,
} from '../Services/course.service';
import {
  getMoreCoursesLikeThis,
  getTopRatedCoursesByCategory,
  coursesSearchByCategory,
} from '../Services/course.search.service';
import { ISearchResult, InstructorCourse } from '@remus1504/micrograde';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const courseById = async (req: Request, res: Response): Promise<void> => {
  const course: InstructorCourse = await getCourseById(req.params.courseId);
  res.status(StatusCodes.OK).json({ message: 'Get course by id', course });
};

const instructorCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const courses: InstructorCourse[] = await getInstructorCourses(
    req.params.instructorId
  );
  res.status(StatusCodes.OK).json({ message: 'Instructor courses', courses });
};

const instructorInactiveCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const courses: InstructorCourse[] = await getInstructorPausedCourses(
    req.params.instructorId
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Instructor inactive courses', courses });
};

const topRatedCoursesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const category = await getUserSelectedCourseCategory(
    `selectedCategories:${req.params.username}`
  );
  const resultHits: InstructorCourse[] = [];
  const courses: ISearchResult = await getTopRatedCoursesByCategory(
    `${category}`
  );
  for (const item of courses.hits) {
    resultHits.push(item._source as InstructorCourse);
  }
  res.status(StatusCodes.OK).json({
    message: 'Search top courses results',
    total: courses.total,
    courses: resultHits,
  });
};

const coursesByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const category = await getUserSelectedCourseCategory(
    `selectedCategories:${req.params.username}`
  );
  const resultHits: InstructorCourse[] = [];
  const courses: ISearchResult = await coursesSearchByCategory(`${category}`);
  for (const item of courses.hits) {
    resultHits.push(item._source as InstructorCourse);
  }
  res.status(StatusCodes.OK).json({
    message: 'Search courses category results',
    total: courses.total,
    courses: resultHits,
  });
};

const moreLikeThis = async (req: Request, res: Response): Promise<void> => {
  const resultHits: InstructorCourse[] = [];
  const courses: ISearchResult = await getMoreCoursesLikeThis(
    req.params.courseId
  );
  for (const item of courses.hits) {
    resultHits.push(item._source as InstructorCourse);
  }
  res.status(StatusCodes.OK).json({
    message: 'More courses like this result',
    total: courses.total,
    courses: resultHits,
  });
};

export {
  courseById,
  instructorCourses,
  instructorInactiveCourses,
  topRatedCoursesByCategory,
  coursesByCategory,
  moreLikeThis,
};
