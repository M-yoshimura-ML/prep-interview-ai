import { getInterviews } from "@/backend/controllers/interview.controller";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const res = await getInterviews(request);
        const { interviews, resultsPerPage, filteredCount } = res;
        return NextResponse.json({ interviews, resultsPerPage, filteredCount }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Not authenticated" },
            { status: 401 }
        );
    }
}