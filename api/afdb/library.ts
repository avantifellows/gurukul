"use server"

import axios from 'axios';
import { Curriculum, Subject, Grade, Chapter, Resource, Topic } from '../../app/types'
import getAxiosConfig from '../axiosConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getCurriculum = async (curriculumName: string): Promise<Curriculum[]> => {
  try {
    const response = await axios.get(`${url}/curriculum`, {
      params: { name: curriculumName },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error(`Error in fetching curriculumId for ${curriculumName}:`, error);
    throw error;
  }
};


export const getSubjects = async (subjectName: string): Promise<Subject[]> => {
  try {
    const response = await axios.get(`${url}/subject`, {
      params: { name: subjectName },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Subjects:", error);
    throw error;
  }
};

export const getGrades = async (number: number): Promise<Grade[]> => {
  try {
    const response = await axios.get(`${url}/grade`, {
      params: { number: number },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Grades:", error);
    throw error;
  }
};

export const getChapters = async (subjectId?: number, gradeId?: number, id?: number, curriculumId?: number): Promise<Chapter[]> => {
  try {
    const response = await axios.get(`${url}/chapter`, {
      params: { id: id, subject_id: subjectId, grade_id: gradeId, curriculum_id: curriculumId },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Chapters:", error);
    throw error;
  }
};

export const getTopics = async (chapterIds: number[]): Promise<Topic[]> => {
  const topicPromises = chapterIds.map(async (chapterId) => {
    try {
      const response = await axios.get(`${url}/topic`, {
        params: { chapter_id: chapterId },
        ...getAxiosConfig(bearerToken),
      });
      return response.data || [];
    } catch (error) {
      console.error("Error in fetching topics for chapterId", chapterId, ":", error);
      return [];
    }
  });

  const topicResponses = await Promise.all(topicPromises);
  return topicResponses.flat();
};

export const getSource = async (sourceId: number) => {
  try {
    const response = await axios.get(`${url}/source`, {
      params: { id: sourceId },
      ...getAxiosConfig(bearerToken),
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Error in fetching Source for sourceId", sourceId, ":", error);
  }
  return null;
};

export const getResourcesWithSource = async (topicIds: number[]): Promise<Resource[]> => {
  const resourcePromises = topicIds.map(async (topicId) => {
    try {
      const response = await axios.get(`${url}/resource`, {
        params: { topic_id: topicId },
        ...getAxiosConfig(bearerToken),
      });

      if (response.data) {
        const chapterResources: Resource[] = response.data;

        const sourcePromises = chapterResources.map(async (resource) => {
          if (resource.source_id) {
            const sourceData = await getSource(resource.source_id);
            if (sourceData) {
              resource.link = sourceData[0].link;
            }
          }
          return resource;
        });

        const resourcesWithSource = await Promise.all(sourcePromises);
        return resourcesWithSource;
      }
    } catch (error) {
      console.error("Error in fetching Topic for topicId", topicId, ":", error);
    }
    return [];
  });

  const resourceResponses = await Promise.all(resourcePromises);
  return resourceResponses.flat();
};
