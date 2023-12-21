"use server"

const baseUrl = process.env.AF_QUIZ_URL;
const apiKey = process.env.AF_QUIZ_API_KEY;

export const generateQuizLink = async (platformLink: string, userId: string) => {
    return `${baseUrl}${platformLink}?apiKey=${apiKey}&userId=${userId}`;
};
