"use server"

import axios from 'axios';
import { Curriculum, Subject, Grade, Chapter, Resource, Topic } from '../../app/types'
import getFetchConfig from '../fetchConfig';

const baseUrl = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getCurriculum = async (curriculumName: string): Promise<Curriculum[]> => {
  try {
    const url = `${baseUrl}/curriculum?name=${encodeURIComponent(curriculumName)}`;
    const response = await fetch(url, getFetchConfig(bearerToken),);

    if (!response.ok) {
      throw new Error(`Error in fetching curriculumId for ${curriculumName}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetching curriculumId for ${curriculumName}:`, error);
    throw error;
  }
};

export const getSubjects = async (subjectName: string): Promise<Subject[]> => {
  try {
    const url = `${baseUrl}/subject?name=${encodeURIComponent(subjectName)}`;
    const response = await fetch(url, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching subjects for ${subjectName}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetching subjects for ${subjectName}:`, error);
    throw error;
  }
};

export const getGrades = async (number: number): Promise<Grade[]> => {
  try {
    const url = `${baseUrl}/grade?number=${number}`;
    const response = await fetch(url, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching grades for ${number}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error in fetching grades for ${number}:`, error);
    throw error;
  }
};

export const getChapters = async (
  subjectId?: number,
  gradeId?: number,
  id?: number,
  curriculumId?: number
): Promise<Chapter[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (id !== undefined) queryParams.append('id', id.toString());
    if (subjectId !== undefined) queryParams.append('subject_id', subjectId.toString());
    if (gradeId !== undefined) queryParams.append('grade_id', gradeId.toString());
    if (curriculumId !== undefined) queryParams.append('curriculum_id', curriculumId.toString());

    const urlWithParams = `${baseUrl}/chapter?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching chapters: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching chapters:", error);
    throw error;
  }
};

export const getTopics = async (chapterIds: number[]): Promise<Topic[]> => {
  const topicPromises = chapterIds.map(async (chapterId) => {
    try {
      const queryParams = new URLSearchParams({
        chapter_id: chapterId.toString(),
      });

      const urlWithParams = `${baseUrl}/topic?${queryParams.toString()}`;
      const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

      if (!response.ok) {
        throw new Error(`Error in fetching topics for chapterId ${chapterId}: ${response.statusText}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error(`Error in fetching topics for chapterId ${chapterId}:`, error);
      return [];
    }
  });

  const topicResponses = await Promise.all(topicPromises);
  return topicResponses.flat();
};

export const getSource = async (sourceId: number) => {
  try {
    const queryParams = new URLSearchParams({
      id: sourceId.toString(),
    });

    const urlWithParams = `${baseUrl}/source?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching source for sourceId ${sourceId}: ${response.statusText}`);
    }

    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error(`Error in fetching source for sourceId ${sourceId}:`, error);
    return null;
  }
};


export const getResourcesWithSource = async (topicIds: number[]): Promise<Resource[]> => {
  const resourcePromises = topicIds.map(async (topicId) => {
    try {
      const queryParams = new URLSearchParams({
        topic_id: topicId.toString(),
      });

      const urlWithParams = `${baseUrl}/resource?${queryParams.toString()}`;
      const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

      if (!response.ok) {
        throw new Error(`Error in fetching resources for topicId ${topicId}: ${response.statusText}`);
      }

      const chapterResources: Resource[] = await response.json();

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
    } catch (error) {
      console.error("Error in fetching resources for topicId", topicId, ":", error);
      return [];
    }
  });

  const resourceResponses = await Promise.all(resourcePromises);
  return resourceResponses.flat();
};
