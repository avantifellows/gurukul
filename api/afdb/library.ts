"use server"

import { Curriculum, Subject, Grade, Chapter, Resource, Topic, Teacher } from '../../app/types';
import getFetchConfig from '../fetchConfig';
import { CURRICULUM_NAMES } from '@/constants/config';

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

const courseToCurriculum = {
  'JEE Content': CURRICULUM_NAMES.JEE,
  'NEET Content': CURRICULUM_NAMES.NEET,
  'CA Content': CURRICULUM_NAMES.CA,
  'CLAT Content': CURRICULUM_NAMES.CLAT,
};

type CourseName = keyof typeof courseToCurriculum;

export const getCurriculumId = async (courseName: string): Promise<number | null> => {
  const curriculumName = courseToCurriculum[courseName as CourseName];
  if (!curriculumName) return null;
  const curriculum = await getCurriculum(curriculumName);
  return curriculum.length > 0 ? curriculum[0].id : null;
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
  // Get all chapters for the subject
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subjectId) queryParams.append('subject_id', subjectId.toString());
  if (curriculumId) queryParams.append('curriculum_id', curriculumId.toString());

  const allChapters: Chapter[] = await fetchWithParams('chapter', queryParams);

  // If no gradeId is provided, return all chapters
  if (!gradeId) return allChapters;

  // Filter chapters to include:
  // 1. Chapters for the specific grade (grade_id matches)
  // 2. Universal chapters (grade_id is null)
  const filteredChapters = allChapters.filter(chapter => {
    // Include chapters for the specific grade or universal chapters
    if (chapter.grade_id === gradeId || !chapter.grade_id) return true;

    return false;
  });

  return filteredChapters;
};

export const getTopics = async (chapterIds: number[]): Promise<Topic[]> => {
  const topicPromises = chapterIds.map(async (chapterId) => {
    const queryParams = new URLSearchParams({ chapter_id: chapterId.toString() });
    return fetchWithParams('topic', queryParams);
  });

  const topicResponses = await Promise.all(topicPromises);
  return topicResponses.flat();
};

export const getTeachers = async (id?: number, subject_id?: number): Promise<Teacher[]> => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subject_id) queryParams.append('subject_id', subject_id.toString());

  return fetchWithParams('teacher', queryParams);
};

export const getResourcesOfChapter = async (
  chapterId?: number,
  curriculumId?: number,
  teacherId?: number,
  topicId?: number
): Promise<Resource[]> => {
  const queryParams = new URLSearchParams();
  if (chapterId) queryParams.append('chapter_id', chapterId.toString());
  if (curriculumId) queryParams.append('curriculum_id', curriculumId.toString());
  if (teacherId) queryParams.append('teacher_id', teacherId.toString());
  if (topicId) queryParams.append('topic_id', topicId.toString());

  const chapterResources: Resource[] = await fetchWithParams('resources/curriculum', queryParams);

  const resourcesWithSource = chapterResources.map((resource) => {
    if (resource.type_params && resource.type_params.src_link) {
      resource.link = resource.type_params.src_link;
    }
    return resource;
  });

  return resourcesWithSource;
};

export const getClassChapters = async (
  subjectId?: number,
  gradeId?: number,
  id?: number,
  teacherId?: number,
  curriculumId?: number
): Promise<Chapter[]> => {
  const queryParams = new URLSearchParams();
  if (id) queryParams.append('id', id.toString());
  if (subjectId) queryParams.append('subject_id', subjectId.toString());
  if (gradeId) queryParams.append('grade_id', gradeId.toString());

  const chapterData: Chapter[] = await fetchWithParams('chapter', queryParams);

  const filteredChapters = await Promise.all(
    chapterData.map(async (chapter) => {
      const chapterResources = await getResourcesOfChapter(chapter.id, curriculumId, teacherId);
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

export const getChapterResourcesComplete = async (
  chapterId: number,
  curriculumId?: number
): Promise<{
  topics: Topic[],
  topicResources: Resource[],
  chapterResources: Resource[]
}> => {
  // Fetch topics and chapter resources in parallel
  const [topicData, chapterResourceData] = await Promise.all([
    getTopics([chapterId]),
    getResourcesOfChapter(chapterId, curriculumId)
  ]);

  // Fetch topic resources
  const topicIds = topicData.map((topic) => topic.id);
  const topicResourceData = topicIds.length > 0
    ? (await Promise.all(topicIds.map((id) => getResourcesOfChapter(chapterId, curriculumId, undefined, id)))).flat()
    : [];

  return {
    topics: topicData,
    topicResources: topicResourceData,
    chapterResources: chapterResourceData
  };
};
