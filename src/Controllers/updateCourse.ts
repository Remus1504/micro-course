import { courseUpdateSchema } from '../Schemas/course';
import {
  updateActiveCourseProp,
  updateCourse,
} from '../Services/course.service';
import {
  BadRequestError,
  InstructorCourse,
  isDataURL,
  uploads,
} from '@remus1504/micrograde';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

const courseUpdate = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(
    courseUpdateSchema.validate(req.body)
  );
  if (error?.details) {
    throw new BadRequestError(
      error.details[0].message,
      'Update course() method'
    );
  }
  const isDataUrl = isDataURL(req.body.coverImage);
  let coverImage = '';
  if (isDataUrl) {
    const result: UploadApiResponse = (await uploads(
      req.body.coverImage
    )) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError(
        'File upload error. Try again.',
        'Update course() method'
      );
    }
    coverImage = result?.secure_url;
  } else {
    coverImage = req.body.coverImage;
  }
  const course: InstructorCourse = {
    title: req.body.title,
    description: req.body.description,
    categories: req.body.categories,
    subCategories: req.body.subCategories,
    tags: req.body.tags,
    price: req.body.price,
    expectedDuration: req.body.expectedDuration,
    basicTitle: req.body.basicTitle,
    basicDescription: req.body.basicDescription,
    coverImage,
  };
  const updatedCourse: InstructorCourse = await updateCourse(
    req.params.courseId,
    course
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Course updated successfully.', course: updatedCourse });
};

const courseUpdateActive = async (
  req: Request,
  res: Response
): Promise<void> => {
  const updatedCourse: InstructorCourse = await updateActiveCourseProp(
    req.params.courseId,
    req.body.active
  );
  res
    .status(StatusCodes.OK)
    .json({ message: 'Course updated successfully.', course: updatedCourse });
};

export { courseUpdate, courseUpdateActive };
