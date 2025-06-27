import { NextResponse } from 'next/server';
import { Chapter, Resource, Topic } from '@/app/types';
import getFetchConfig from '@/api/fetchConfig';
import { api } from '@/services/url';

const afdbBaseUrl = api.afdb.baseUrl;
const afdbBearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

const fetchData = async (url: string) => {
    const response = await fetch(url, getFetchConfig(afdbBearerToken));

    if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }

    return response.json();
};

const fetchWithParams = async (endpoint: string, queryParams: URLSearchParams) => {
    const urlWithParams = `${afdbBaseUrl}/${endpoint}?${queryParams.toString()}`;
    return fetchData(urlWithParams);
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'curriculum': {
                const name = searchParams.get('name');
                if (!name) return NextResponse.json({ error: 'Curriculum name is required' }, { status: 400 });
                const url = `${afdbBaseUrl}/curriculum?name=${encodeURIComponent(name)}`;
                const data = await fetchData(url);
                return NextResponse.json(data);
            }

            case 'subjects': {
                const name = searchParams.get('name');
                if (!name) return NextResponse.json({ error: 'Subject name is required' }, { status: 400 });
                const url = `${afdbBaseUrl}/subject?name=${encodeURIComponent(name)}`;
                const data = await fetchData(url);
                return NextResponse.json(data);
            }

            case 'grades': {
                const number = searchParams.get('number');
                if (!number) return NextResponse.json({ error: 'Grade number is required' }, { status: 400 });
                const url = `${afdbBaseUrl}/grade?number=${number}`;
                const data = await fetchData(url);
                return NextResponse.json(data);
            }

            case 'chapters': {
                const queryParams = new URLSearchParams();
                const id = searchParams.get('id');
                const subjectId = searchParams.get('subject_id');
                const gradeId = searchParams.get('grade_id');
                const curriculumId = searchParams.get('curriculum_id');

                if (id) queryParams.append('id', id);
                if (subjectId) queryParams.append('subject_id', subjectId);
                if (gradeId) queryParams.append('grade_id', gradeId);
                if (curriculumId) queryParams.append('curriculum_id', curriculumId);

                const data = await fetchWithParams('chapter', queryParams);
                return NextResponse.json(data);
            }

            case 'topics': {
                const chapterIds = searchParams.get('chapter_ids');
                if (!chapterIds) return NextResponse.json({ error: 'Chapter IDs are required' }, { status: 400 });

                const chapterIdArray = chapterIds.split(',').map(Number);
                const topicPromises = chapterIdArray.map(async (chapterId) => {
                    const queryParams = new URLSearchParams({ chapter_id: chapterId.toString() });
                    return fetchWithParams('topic', queryParams);
                });

                const topicResponses = await Promise.all(topicPromises);
                const data = topicResponses.flat();
                return NextResponse.json(data);
            }

            case 'resources': {
                const topicIds = searchParams.get('topic_ids');
                if (!topicIds) return NextResponse.json({ error: 'Topic IDs are required' }, { status: 400 });

                const topicIdArray = topicIds.split(',').map(Number);
                const resourcePromises = topicIdArray.map(async (topicId) => {
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
                const data = results.flat();
                return NextResponse.json(data);
            }

            case 'teachers': {
                const queryParams = new URLSearchParams();
                const id = searchParams.get('id');
                const subjectId = searchParams.get('subject_id');

                if (id) queryParams.append('id', id);
                if (subjectId) queryParams.append('subject_id', subjectId);

                const data = await fetchWithParams('teacher', queryParams);
                return NextResponse.json(data);
            }

            case 'chapter-resources': {
                const chapterId = searchParams.get('chapter_id');
                const type = searchParams.get('type');
                const teacherId = searchParams.get('teacher_id');

                if (!chapterId || !type) {
                    return NextResponse.json({ error: 'Chapter ID and type are required' }, { status: 400 });
                }

                const queryParams = new URLSearchParams();
                queryParams.append('chapter_id', chapterId);
                queryParams.append('type', type);
                if (teacherId) queryParams.append('teacher_id', teacherId);

                const chapterResources: Resource[] = await fetchWithParams('resource', queryParams);

                const resourcesWithSource = chapterResources.map((resource) => {
                    if (resource.source && resource.source.link) {
                        resource.link = resource.source.link;
                    }
                    return resource;
                });

                return NextResponse.json(resourcesWithSource);
            }

            case 'class-chapters': {
                const queryParams = new URLSearchParams();
                const id = searchParams.get('id');
                const subjectId = searchParams.get('subject_id');
                const gradeId = searchParams.get('grade_id');
                const teacherId = searchParams.get('teacher_id');

                if (id) queryParams.append('id', id);
                if (subjectId) queryParams.append('subject_id', subjectId);
                if (gradeId) queryParams.append('grade_id', gradeId);

                const chapterData: Chapter[] = await fetchWithParams('chapter', queryParams);

                const filteredChapters = await Promise.all(
                    chapterData.map(async (chapter) => {
                        const chapterResources = await getResourcesOfChapter(chapter.id, 'class', teacherId ? Number(teacherId) : undefined);
                        return chapterResources.length > 0 ? chapter : null;
                    })
                );

                const validChapters: Chapter[] = filteredChapters.filter((chapter): chapter is Chapter => chapter !== null);
                return NextResponse.json(validChapters);
            }

            case 'chapter-complete': {
                const chapterId = searchParams.get('chapter_id');
                if (!chapterId) return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });

                const [topicData, chapterResourceData] = await Promise.all([
                    getTopics([Number(chapterId)]),
                    getResourcesOfChapter(Number(chapterId), 'content')
                ]);

                const topicIds = topicData.map((topic) => topic.id);
                const topicResourceData = topicIds.length > 0 ? await getResourcesWithSource(topicIds) : [];

                return NextResponse.json({
                    topics: topicData,
                    topicResources: topicResourceData,
                    chapterResources: chapterResourceData
                });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in library API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper functions
async function getResourcesOfChapter(chapterId: number, type: string, teacherId?: number): Promise<Resource[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('chapter_id', chapterId.toString());
    queryParams.append('type', type);
    if (teacherId) queryParams.append('teacher_id', teacherId.toString());

    const chapterResources: Resource[] = await fetchWithParams('resource', queryParams);

    return chapterResources.map((resource) => {
        if (resource.source && resource.source.link) {
            resource.link = resource.source.link;
        }
        return resource;
    });
}

async function getTopics(chapterIds: number[]): Promise<Topic[]> {
    const topicPromises = chapterIds.map(async (chapterId) => {
        const queryParams = new URLSearchParams({ chapter_id: chapterId.toString() });
        return fetchWithParams('topic', queryParams);
    });

    const topicResponses = await Promise.all(topicPromises);
    return topicResponses.flat();
}

async function getResourcesWithSource(topicIds: number[]): Promise<Resource[]> {
    const resourcePromises = topicIds.map(async (topicId) => {
        const queryParams = new URLSearchParams({ topic_id: topicId.toString() });
        const chapterResources: Resource[] = await fetchWithParams('resource', queryParams);

        return chapterResources.map((resource) => {
            if (resource.source && resource.source.link) {
                resource.link = resource.source.link;
            }
            return resource;
        });
    });

    const results = await Promise.all(resourcePromises);
    return results.flat();
} 