import axios from 'axios';
import { Subject, Grade, Chapter, Resource, Topic } from '../types'

const url = process.env.NEXT_PUBLIC_AF_DB_SERVICE_URL;

export const getSubjects = async (subjectName: string): Promise<Subject[]> => {
  try {
    const response = await axios.get(`${url}/subject`, {
      params: { name: subjectName },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getSubjects:", error);
    throw error;
  }
};

export const getGrades = async (number: number): Promise<Grade[]> => {
  try {
    const response = await axios.get(`${url}/grade`, {
      params: { number: number },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getSubjects:", error);
    throw error;
  }
};

export const getChapters = async (subjectId: number, gradeId: number, limit: number, offset: number): Promise<Chapter[]> => {
  try {
    const response = await axios.get(`${url}/chapter`, {
      params: { subject_id: subjectId, grade_id: gradeId, limit, offset },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getChapters:", error);
    throw error;
  }
};

export const getTopics = async (chapterIds: number[], limit: number, offset: number): Promise<Topic[]> => {
  console.log(chapterIds, "chapterIds")
  const topics: Topic[] = [];
  for (const chapterId of chapterIds) {
    try {
      const response = await axios.get(`${url}/topic`, {
        params: { chapter_id: chapterId, limit, offset },
      });

      if (response.data) {
        const chapterTopics: Topic[] = response.data;
        topics.push(...chapterTopics);
      }
    } catch (error) {
      console.error("Error in getTopics for chapterId", chapterId, ":", error);
    }
  }
  return topics;
};


export const getResources = async (topicIds: number[]): Promise<Resource[]> => {
  console.log(topicIds, "topicIds");
  const resources: Resource[] = [];

  for (const topicId of topicIds) {
    try {
      const response = await axios.get(`${url}/resource`, {
        params: { topic_id: topicId },
      });

      if (response.data) {
        const chapterResources: Resource[] = response.data;
        resources.push(...chapterResources);
      }
    } catch (error) {
      console.error("Error in getResources for topicId", topicId, ":", error);
      // You can choose to handle or ignore this error and continue processing other topics
    }
  }
  return resources;
};
