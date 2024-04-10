import {
  addDataToIndex,
  deleteIndexedData,
  getIndexedData,
  updateIndexedData,
} from '../elasticsearch';
import {
  IRatingTypes,
  IReviewMessageDetails,
  InstructorDocument,
  InstructorCourse,
} from '@remus1504/micrograde-shared';
import { coursesSearchByInstructorId } from '../Services/course.search.service';
import { CourseModel } from '../../src/Modals/course.modal';
import { publishDirectMessage } from '../Queues/course.producer';
import { courseChannel } from '../server';
import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

const getCourseById = async (courseId: string): Promise<InstructorCourse> => {
  const course: InstructorCourse = await getIndexedData('courses', courseId);
  return course;
};

const getInstructorCourses = async (
  instructorId: string
): Promise<InstructorCourse[]> => {
  const resultsHits: InstructorCourse[] = [];
  const courses = await coursesSearchByInstructorId(instructorId, true);
  for (const item of courses.hits) {
    resultsHits.push(item._source as InstructorCourse);
  }
  return resultsHits;
};

const getInstructorPausedCourses = async (
  instructorId: string
): Promise<InstructorCourse[]> => {
  const resultsHits: InstructorCourse[] = [];
  const courses = await coursesSearchByInstructorId(instructorId, false);
  for (const item of courses.hits) {
    resultsHits.push(item._source as InstructorCourse);
  }
  return resultsHits;
};

const createCourse = async (
  course: InstructorCourse
): Promise<InstructorCourse> => {
  const createdCourse: InstructorCourse = await CourseModel.create(course);
  if (createdCourse) {
    const data: InstructorCourse = createdCourse.toJSON?.() as InstructorCourse;
    await publishDirectMessage(
      courseChannel,
      'micrograde-instructor-update',
      'user-instructor',
      JSON.stringify({
        type: 'update-course-count',
        courseInstructorId: `${data.instructorId}`,
        count: 1,
      }),
      'Details sent to users service.'
    );
    await addDataToIndex('courses', `${createdCourse._id}`, data);
  }
  return createdCourse;
};

const deleteCourse = async (
  courseId: string,
  instructorId: string
): Promise<void> => {
  await CourseModel.deleteOne({ _id: courseId }).exec();
  await publishDirectMessage(
    courseChannel,
    'micrograde-instructor-update',
    'user-instructor',
    JSON.stringify({
      type: 'update-course-count',
      courseInstructorId: instructorId,
      count: -1,
    }),
    'Details sent to users service.'
  );
  await deleteIndexedData('courses', `${courseId}`);
};

const updateCourse = async (
  courseId: string,
  courseData: InstructorCourse
): Promise<InstructorCourse> => {
  const document: InstructorCourse = (await CourseModel.findOneAndUpdate(
    { _id: courseId },
    {
      $set: {
        title: courseData.title,
        description: courseData.description,
        categories: courseData.categories,
        subCategories: courseData.subCategories,
        tags: courseData.tags,
        price: courseData.price,
        coverImage: courseData.coverImage,
        expectedDuration: courseData.expectedDuration,
        basicTitle: courseData.basicTitle,
        basicDescription: courseData.basicDescription,
      },
    },
    { new: true }
  ).exec()) as InstructorCourse;
  if (document) {
    const data: InstructorCourse = document.toJSON?.() as InstructorCourse;
    await updateIndexedData('courses', `${document._id}`, data);
  }
  return document;
};

const updateActiveCourseProp = async (
  courseId: string,
  courseActive: boolean
): Promise<InstructorCourse> => {
  const document: InstructorCourse = (await CourseModel.findOneAndUpdate(
    { _id: courseId },
    {
      $set: {
        active: courseActive,
      },
    },
    { new: true }
  ).exec()) as InstructorCourse;
  if (document) {
    const data: InstructorCourse = document.toJSON?.() as InstructorCourse;
    await updateIndexedData('courses', `${document._id}`, data);
  }
  return document;
};

const updateCourseReview = async (
  data: IReviewMessageDetails
): Promise<void> => {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
  };
  const ratingKey: string = ratingTypes[`${data.rating}`];
  const course = await CourseModel.findOneAndUpdate(
    { _id: data.courseId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1,
      },
    },
    { new: true, upsert: true }
  ).exec();
  if (course) {
    const data: InstructorCourse = course.toJSON?.() as InstructorCourse;
    await updateIndexedData('courses', `${course._id}`, data);
  }
};

const seedData = async (
  instructors: InstructorDocument[],
  count: string
): Promise<void> => {
  const categories: string[] = [
    'Maths',
    'English',
    'Computer Science',
    'Religious Education',
    'Music',
    'Geography',
    'Chemisty',
    'Business',
  ];
  const expectedDuration: string[] = [
    '10 Day Duration',
    '20 Days Duration',
    '30 Days Duration',
    '40 Days Duration',
    '50 Days Duration',
  ];
  const randomRatings = [
    { sum: 20, count: 4 },
    { sum: 10, count: 2 },
    { sum: 20, count: 4 },
    { sum: 15, count: 3 },
    { sum: 5, count: 1 },
  ];

  for (let i = 0; i < instructors.length; i++) {
    const instructorDoc: InstructorDocument = instructors[i];
    const title = `I will ${faker.word.words(5)}`;
    const basicTitle = faker.commerce.productName();
    const basicDescription = faker.commerce.productDescription();
    const rating = sample(randomRatings);
    const course: InstructorCourse = {
      profilePicture: instructorDoc.profilePicture,
      instructorId: instructorDoc._id,
      email: instructorDoc.email,
      username: instructorDoc.username,
      title: title.length <= 80 ? title : title.slice(0, 80),
      basicTitle:
        basicTitle.length <= 40 ? basicTitle : basicTitle.slice(0, 40),
      basicDescription:
        basicDescription.length <= 100
          ? basicDescription
          : basicDescription.slice(0, 100),
      categories: `${sample(categories)}`,
      subCategories: [
        faker.commerce.department(),
        faker.commerce.department(),
        faker.commerce.department(),
      ],
      description: faker.lorem.sentences({ min: 2, max: 4 }),
      tags: [
        faker.commerce.product(),
        faker.commerce.product(),
        faker.commerce.product(),
        faker.commerce.product(),
      ],
      price: parseInt(faker.commerce.price({ min: 20, max: 30, dec: 0 })),
      coverImage: faker.image.urlPicsumPhotos(),
      expectedDuration: `${sample(expectedDuration)}`,
      sortId: parseInt(count, 10) + i + 1,
      ratingsCount: (i + 1) % 4 === 0 ? rating!['count'] : 0,
      ratingSum: (i + 1) % 4 === 0 ? rating!['sum'] : 0,
    };
    console.log(`***SEEDING COURSE*** - ${i + 1} of ${count}`);
    await createCourse(course);
  }
};

export {
  getCourseById,
  getInstructorCourses,
  getInstructorPausedCourses,
  createCourse,
  deleteCourse,
  updateCourse,
  updateActiveCourseProp,
  updateCourseReview,
  seedData,
};
