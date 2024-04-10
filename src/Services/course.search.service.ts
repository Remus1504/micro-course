import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { elasticSearchClient } from '../elasticsearch';
import {
  IHitsTotal,
  IPaginateProps,
  IQueryList,
  ISearchResult,
} from '@remus1504/micrograde-shared';

const coursesSearchByInstructorId = async (
  searchQuery: string,
  active: boolean
): Promise<ISearchResult> => {
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: ['instructorId'],
        query: `*${searchQuery}*`,
      },
    },
    {
      term: {
        active,
      },
    },
  ];
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'courses',
    query: {
      bool: {
        must: [...queryList],
      },
    },
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
};

const coursesSearch = async (
  searchQuery: string,
  paginate: IPaginateProps,
  durationTime?: string,
  min?: number,
  max?: number
): Promise<ISearchResult> => {
  const { from, size, type } = paginate;
  const queryList: IQueryList[] = [
    {
      query_string: {
        fields: [
          'username',
          'title',
          'description',
          'basicDescription',
          'basicTitle',
          'categories',
          'subCategories',
          'tags',
        ],
        query: `*${searchQuery}*`,
      },
    },
    {
      term: {
        active: true,
      },
    },
  ];

  if (durationTime !== 'undefined') {
    queryList.push({
      query_string: {
        fields: ['expectedDuration'],
        query: `*${durationTime}*`,
      },
    });
  }

  if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
    queryList.push({
      range: {
        price: {
          gte: min,
          lte: max,
        },
      },
    });
  }
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'courses',
    size,
    query: {
      bool: {
        must: [...queryList],
      },
    },
    sort: [
      {
        sortId: type === 'forward' ? 'asc' : 'desc',
      },
    ],
    ...(from !== '0' && { search_after: [from] }),
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
};

const coursesSearchByCategory = async (
  searchQuery: string
): Promise<ISearchResult> => {
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'courses',
    size: 10,
    query: {
      bool: {
        must: [
          {
            query_string: {
              fields: ['categories'],
              query: `*${searchQuery}*`,
            },
          },
          {
            term: {
              active: true,
            },
          },
        ],
      },
    },
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
};

const getMoreCoursesLikeThis = async (
  courseId: string
): Promise<ISearchResult> => {
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'courses',
    size: 5,
    query: {
      more_like_this: {
        fields: [
          'username',
          'title',
          'description',
          'basicDescription',
          'basicTitle',
          'categories',
          'subCategories',
          'tags',
        ],
        like: [
          {
            _index: 'courses',
            _id: courseId,
          },
        ],
      },
    },
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
};

const getTopRatedCoursesByCategory = async (
  searchQuery: string
): Promise<ISearchResult> => {
  const result: SearchResponse = await elasticSearchClient.search({
    index: 'courses',
    size: 10,
    query: {
      bool: {
        filter: {
          script: {
            script: {
              source:
                "doc['ratingSum'].value != 0 && (doc['ratingSum'].value / doc['ratingsCount'].value == params['threshold'])",
              lang: 'painless',
              params: {
                threshold: 5,
              },
            },
          },
        },
        must: [
          {
            query_string: {
              fields: ['categories'],
              query: `*${searchQuery}*`,
            },
          },
        ],
      },
    },
  });
  const total: IHitsTotal = result.hits.total as IHitsTotal;
  return {
    total: total.value,
    hits: result.hits.hits,
  };
};

export {
  coursesSearchByInstructorId,
  coursesSearch,
  coursesSearchByCategory,
  getMoreCoursesLikeThis,
  getTopRatedCoursesByCategory,
};
