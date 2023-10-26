import axios from 'axios';
import { Subject, Chapter, Resource, Topic } from '../types'

const url = process.env.NEXT_PUBLIC_AF_DB_SERVICE_URL;

export const getSubjects = async (subjectName: string): Promise<Subject[]> => {
    const response = await axios.get(`${url}/subject`, {
      params: { name: subjectName },
    });
    return response.data;
  };
  
  export const getChapters = async (subjectId: number): Promise<Chapter[]> => {
    const response = await axios.get(`${url}/chapter`, {
      params: { subject_id: subjectId },
    });
    return response.data;
  };
  
  export const getResources = async (chapterIds: number[]): Promise<Resource[]> => {
    console.log(chapterIds, "chapterIds")
    const resources: Resource[] = [];
  
    for (const chapterId of chapterIds) {
      const response = await axios.get(`${url}/resource`, {
        params: { chapter_id: chapterId },
      });
  
      if (response.data) {
        const chapterResources: Resource[] = response.data;
        resources.push(...chapterResources);
      }
    }
  
    return resources;
  };

  export const getTopics = async (chapterIds: number[]): Promise<Topic[]> => {
    const topics: Topic[] = [];
  
    for (const chapterId of chapterIds) {
      const response = await axios.get(`${url}/topic`, {
        params: { chapter_id: chapterId },
      });
  
      if (response.data) {
        const chapterTopics: Topic[] = response.data;
        topics.push(...chapterTopics);
      }
    }
  
    return topics;
  };