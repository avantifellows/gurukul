"use server"

import { Curriculum, Subject, Grade, Chapter, Resource, Topic, Teacher } from '../../app/types';
import getFetchConfig from '../fetchConfig';

const baseUrl = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

const fetchData = async (url: string) => {
  const response = await fetch(url, getFetchConfig(bearerToken));

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  return response.json();
};

const fetchWithParams = async (endpoint: string, queryParams: URLSearchParams) => {
  const urlWithParams = `${baseUrl}/${endpoint}?${queryParams.toString()}`;
  return fetchData(urlWithParams);
};

export const getCurriculum = async (curriculumName: string): Promise<Curriculum[]> => {
  const url = `${baseUrl}/curriculum?name=${encodeURIComponent(curriculumName)}`;
  return fetchData(url);
};

export const getSubjects = async (subjectName: string): Promise<Subject[]> => {
  const url = `${baseUrl}/subject?name=${encodeURIComponent(subjectName)}`;
  return fetchData(url);
};

export const getGrades = async (number: number): Promise<Grade[]> => {
  const url = `${baseUrl}/grade?number=${number}`;
  return fetchData(url);
};

export const getChapters = async (
  subjectId?: number,
  gradeId?: number,
  id?: number,
  curriculumId?: number
): Promise<Chapter[]> => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subjectId) queryParams.append('subject_id', subjectId.toString());
  if (gradeId) queryParams.append('grade_id', gradeId.toString());
  if (curriculumId) queryParams.append('curriculum_id', curriculumId.toString());

  return fetchWithParams('chapter', queryParams);
};

export const getTopics = async (chapterIds: number[]): Promise<Topic[]> => {
  const topicPromises = chapterIds.map(async (chapterId) => {
    const queryParams = new URLSearchParams({ chapter_id: chapterId.toString() });
    return fetchWithParams('topic', queryParams);
  });

  const topicResponses = await Promise.all(topicPromises);
  return topicResponses.flat();
};

export const getResourcesWithSource = async (topicIds: number[]): Promise<Resource[]> => {
  const resourcePromises = topicIds.map(async (topicId) => {
    const queryParams = new URLSearchParams({ topic_id: topicId.toString() });
    const chapterResources: Resource[] = await fetchWithParams('resource', queryParams);

    const resourcesWithSource = chapterResources.map((resource) => {
      if (resource.source && resource.source.link) {
        resource.link = resource.source.link;
      }
      return resource;
    });

    return resourcesWithSource;
  });

  const results = await Promise.all(resourcePromises);
  return results.flat();
};

export const getTeachers = async (id?: number, subject_id?: number): Promise<Teacher[]> => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subject_id) queryParams.append('subject_id', subject_id.toString());

  return fetchWithParams('teacher', queryParams);
};

export const getResourcesOfChapter = async (
  chapterId: number,
  teacherId?: number
): Promise<Resource[]> => {
  const queryParams = new URLSearchParams();
  if (chapterId) queryParams.append('chapter_id', chapterId.toString());
  if (teacherId) queryParams.append('teacher_id', teacherId.toString());

  const chapterResources: Resource[] = await fetchWithParams('resource', queryParams);

  const resourcesWithSource = chapterResources.map((resource) => {
    if (resource.source && resource.source.link) {
      resource.link = resource.source.link;
    }
    return resource;
  });

  return resourcesWithSource;
};

export const getClassChapters = async (
  subjectId?: number,
  gradeId?: number,
  id?: number,
  teacherId?: number
): Promise<Chapter[]> => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subjectId) queryParams.append('subject_id', subjectId.toString());
  if (gradeId) queryParams.append('grade_id', gradeId.toString());

  const chapterData: Chapter[] = await fetchWithParams('chapter', queryParams);

  const filteredChapters = await Promise.all(
    chapterData.map(async (chapter) => {
      const chapterResources = await getResourcesOfChapter(chapter.id, teacherId);
      if (chapterResources.length > 0) {
        return chapter;
      } else {
        return null;
      }
    })
  );

  const validChapters: Chapter[] = filteredChapters.filter((chapter): chapter is Chapter => chapter !== null);

  return validChapters;
};

export const getChapterResourcesComplete = async (chapterId: number): Promise<{
  topics: Topic[],
  topicResources: Resource[],
  chapterResources: Resource[]
}> => {
  // Fetch topics and chapter resources in parallel
  const [topicData, chapterResourceData] = await Promise.all([
    getTopics([chapterId]),
    getResourcesOfChapter(chapterId)
  ]);

  // Fetch topic resources
  const topicIds = topicData.map((topic) => topic.id);
  const topicResourceData = topicIds.length > 0 ? await getResourcesWithSource(topicIds) : [];

  return {
    topics: topicData,
    topicResources: topicResourceData,
    chapterResources: chapterResourceData
  };
};
