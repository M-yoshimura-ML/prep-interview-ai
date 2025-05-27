import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import Interview from "../models/interview.model";
import { InterviewBody } from "../types/interview.types";

const mockQuestions = (numOfQuestions: number) => {
    const questions = [];
    for (let i = 0; i < numOfQuestions; i++) {
        questions.push({
            question: `Question ${i + 1}`,
            answer: `Answer for question ${i + 1}`,
        });
    }
    return questions;
}


export const createInterview = catchAsyncErrors(async (body: InterviewBody) => {
    await dbConnect();

    const { industry, type, topic, role, numOfQuestions, difficulty, duration, user } = body;

    const questions = mockQuestions(numOfQuestions);

    const newInterview = await Interview.create({
        industry,
        type,
        topic,
        numOfQuestions,
        difficulty,
        duration: duration * 60,
        durationLeft: duration * 60,
        user,
        role,
        questions,
    });

    return newInterview?._id
    ? { created: true}
    : (() => {
        throw new Error("Failed to create interview");
    })();
})