import { getDocumentCount } from '../elasticsearch';
import { courseCreateSchema } from '../Schemas/course';
import { createCourse } from '../Services/course.service';
import {
  BadRequestError,
  InstructorCourse,
  uploads,
} from '@remus1504/micrograde-shared';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const courseCreate = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(
    courseCreateSchema.validate(req.body),
  );
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Create course() method',
    );
  }
  const result: UploadApiResponse = (await uploads(
    req.body.coverImage,
  )) as UploadApiResponse;
  if (!result.public_id) {
    throw new BadRequestError(
      'File upload error. Try again.',
      'Create course() method',
    );
  }
  const count: number = await getDocumentCount('courses');
  const course: InstructorCourse = {
    instructorId: req.body.instructorId,
    username: req.currentUser!.username,
    email: req.currentUser!.email,
    profilePicture: req.body.profilePicture,
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
    subCategories: req.body.subCategories,
    tags: req.body.tags,
    price: req.body.price,
    expectedDuration: req.body.expectedDuration,
    basicTitle: req.body.basicTitle,
    basicDescription: req.body.basicDescription,
    coverImage: `${result?.secure_url}`,
    sortId: count + 1,
  };
  const createdCourse: InstructorCourse = await createCourse(course);
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Course created successfully.', course: createdCourse });
};

export { courseCreate };
