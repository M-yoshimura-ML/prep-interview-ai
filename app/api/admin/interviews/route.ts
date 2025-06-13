import { getInterviews } from "@/backend/controllers/interview.controller";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const res = await getInterviews(req, "admin");

    if(res?.error) {
        return NextResponse.json(
            {
                error: { message: res?.error?.message },
            },
            { status: res.error?.statusCode }
        )
    }

    const { interviews, resultsPerPage, filteredCount } = res;
    return NextResponse.json({ interviews, resultsPerPage, filteredCount });
}