import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebaseConfig";
import { QuizSession } from "@/app/types";

export const generateQuizLinks = async (batchData: any): Promise<QuizSession[]> => {
    try {
        const sessionsCollection = collection(db, "Sessions");

        const quizObjectsArray = await Promise.all(batchData.map(async (batchItem: any) => {
            const batchId = batchItem.batch_id;

            const batchQuery = query(sessionsCollection, where("batch", "==", batchId));
            const querySnapshot = await getDocs(batchQuery);
            const sessionsDataArray = querySnapshot.docs.map((doc) => doc.data());

            const today = new Date().toISOString().split("T")[0];

            const quizSessionObject = sessionsDataArray
                .filter((sessionData: any) => today >= sessionData.startDate && today <= sessionData.endDate)
                .map((sessionData: any) => {
                    const redirectParams = sessionData.redirectPlatformParams;
                    if (redirectParams && redirectParams.id) {
                        return {
                            batch: sessionData.batch,
                            end_date: sessionData.endDate,
                            end_time: sessionData.endTime,
                            redirectPlatformParams: {
                                id: redirectParams.id,
                            },
                            start_date: sessionData.startDate,
                            start_time: sessionData.startTime,
                            redirectPlatform: sessionData.redirectPlatform,
                            name: sessionData.name,
                            stream: sessionData.stream,
                            id: sessionData.id
                        };
                    }
                    return null;
                })
                .filter((quizSessionObject) => quizSessionObject !== null) as QuizSession[];

            return quizSessionObject;
        }));

        const flattenedQuizObjectsArray = quizObjectsArray.flat();

        return flattenedQuizObjectsArray;
    } catch (error) {
        console.error("Error fetching quiz data from Firestore:", error);
        throw error;
    }
};