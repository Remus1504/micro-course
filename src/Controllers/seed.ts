import { publishDirectMessage } from '../Queues/course.producer';
import { courseChannel } from '../server';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const course = async (req: Request, res: Response): Promise<void> => {
  const { count } = req.params;
  await publishDirectMessage(
    courseChannel,
    'micrograde-course',
    'get-instructors',
    JSON.stringify({ type: 'getInstructors', count }),
    'Course seed message sent to user service.'
  );
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Course created successfully' });
};

export { course };
