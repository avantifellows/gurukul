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


export const getSource = async (sourceId: number) => {
  try {
    const response = await axios.get(`${url}/source`, {
      params: { id: sourceId },
    });

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Error in getSource for sourceId", sourceId, ":", error);
  }
  return null;
};

export const getResourcesWithSource = async (topicIds: number[]): Promise<Resource[]> => {
  const resources: Resource[] = [];

  for (const topicId of topicIds) {
    try {
      const response = await axios.get(`${url}/resource`, {
        params: { topic_id: topicId },
      });

      if (response.data) {
        const chapterResources: Resource[] = response.data;

        for (const resource of chapterResources) {
          if (resource.source_id) {
            const sourceData = await getSource(resource.source_id);
            if (sourceData) {
              resource.link = sourceData[0].link;
            }
          }

          resources.push(resource);
        }
      }
    } catch (error) {
      console.error("Error in getResources for topicId", topicId, ":", error);
    }
  }
  return resources;
};
