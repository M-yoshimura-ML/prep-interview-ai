import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import Interview, { IInterview, IQuestion } from "../models/interview.model";
import { evaluateAnswer, generateQuestions } from "../openai/openai";
import { InterviewBody } from "../types/interview.types";
import APIFilters from "../utils/apiFilters";
import { getCurrentUser } from "../utils/auth";
import { getQueryStr } from "../utils/utils";

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

    const questions = await generateQuestions(industry, topic, type, role, numOfQuestions, duration, difficulty);

    //const questions = mockQuestions(numOfQuestions);

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
});

export const getInterviews = catchAsyncErrors(async (request: Request) => {
    await dbConnect();

    const resultsPerPage: number = 2;

    const user = await getCurrentUser(request);
    if (!user) throw new Error("Not authenticated");

    const { searchParams } = new URL(request.url);
    const queryStr = getQueryStr(searchParams);

    queryStr.user = user._id;

    const apiFilters = new APIFilters(Interview, queryStr).filter();
    let interviews: IInterview[] = await apiFilters.query;
    const filteredCount: number = interviews.length;

    apiFilters.pagination(resultsPerPage).sort();
    interviews = await apiFilters.query.clone();

    //const interviews = await Interview.find({ user: user._id });
    //const interviews = await apiFilters.query;

    return { interviews, resultsPerPage, filteredCount };
});

export const getInterviewById = catchAsyncErrors(async (id: string) => {
    await dbConnect();

    const interview = await Interview.findById(id);

    return { interview };
});

export const deleteUserInterview = catchAsyncErrors(async (interviewId: string) => {
    await dbConnect();

    const interview = await Interview.findById(interviewId);

    if(!interview) {
        throw new Error("Interview not found");
    }

    await interview.deleteOne();

    return { deleted: true };
});


export const updateInterviewDetails = catchAsyncErrors(async (
    interviewId: string,
    durationLeft: string,
    questionId: string,
    answer: string,
    completed?: boolean
) => {
    await dbConnect();

    const interview = await Interview.findById(interviewId);

    if(!interview) {
        throw new Error("Interview not found");
    }

    if (answer) {
        const questionIndex = interview?.questions?.findIndex(
            (question: IQuestion) => question._id.toString() === questionId
        );
        if(questionIndex === -1) {
            throw new Error("Question not found");
        }

        const question = interview?.questions[questionIndex];

        let overallScore = 0;
        let clarity = 0;
        let relevance = 0;
        let completeness = 0;
        let suggestion = 'No suggestion provided';

        if(answer !== 'pass') {
            ({ overallScore, relevance, clarity, completeness, suggestion } = 
                await evaluateAnswer(question.question, answer)
            )
        }

        if (!question?.completed) {
            interview.answered += 1;
        }

        question.answer = answer;
        question.completed = true;
        question.result = {
            overallScore,
            clarity,
            completeness,
            relevance,
            suggestion
        }
        interview.durationLeft = Number(durationLeft);
    } 

    if(interview?.answered === interview?.questions?.length) {
        interview.status = "completed";
    }

    if(durationLeft === '0') {
        interview.durationLeft = Number(durationLeft);
        interview.status = "completed";
    }

    if(completed) {
        interview.durationLeft = Number(durationLeft);
        interview.status = "completed";
    }

    // await evaluateAnswer(
    //     "What is React.js, and how does it differ from traditional JavaScript frameworks ?",
    //     "React.js is a JS library that is used for building user interfaces. It's different from traditional JS because it use a virtual DOM to update the UI efficiently  and it allows developers to create reusable UI components."
    // );

    await interview.save();

    return { updated: true }
});

