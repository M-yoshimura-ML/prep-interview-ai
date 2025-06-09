import { getInterviewStats } from "@/backend/controllers/interview.controller";
import { NextResponse } from "next/server";

export async function GET(
    request: Request, 
) {

    try {
        const res = await getInterviewStats(request);

        if(res?.error) {
            return NextResponse.json(
                {
                    error: { message: res?.error?.message },
                }, 
                { status: res.error?.statusCode }
            )
        }

        return NextResponse.json({ data: res });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Not authenticated" },
            { status: 401 }
        );
    }
}