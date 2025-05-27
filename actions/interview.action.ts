'use server';

import { createInterview } from "@/backend/controllers/interview.controller";
import { InterviewBody } from "@/backend/types/interview.types";

export async function newInterview(body: InterviewBody) {
    return await createInterview(body);
}
