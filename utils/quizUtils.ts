"use server"

const baseUrl = process.env.AF_QUIZ_URL;
const apiKey = process.env.AF_QUIZ_API_KEY;
const userId = process.env.AF_QUIZ_USER_ID;

export const generateQuizLink = async (platformLink: string) => {
    return `${baseUrl}${platformLink}?apiKey=${apiKey}&userId=${userId}`;
};
