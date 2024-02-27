import { coursesSearch } from '../Services/course.search.service';
import {
  IPaginateProps,
  ISearchResult,
  InstructorCourse,
} from '@remus1504/micrograde';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

const courses = async (req: Request, res: Response): Promise<void> => {
  const { from, size, type } = req.params;
  let resultHits: InstructorCourse[] = [];
  const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
  const courses: ISearchResult = await coursesSearch(
    `${req.query.query}`,
    paginate,
    `${req.query.expectedDuration}`,
    parseInt(`${req.query.minprice}`),
    parseInt(`${req.query.maxprice}`)
  );
  for (const item of courses.hits) {
    resultHits.push(item._source as InstructorCourse);
  }
  if (type === 'backward') {
    resultHits = sortBy(resultHits, ['sortId']);
  }
  res.status(StatusCodes.OK).json({
    message: 'Search courses results',
    total: courses.total,
    courses: resultHits,
  });
};

export { courses };
