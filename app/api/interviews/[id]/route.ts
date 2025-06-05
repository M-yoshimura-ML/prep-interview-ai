import { getInterviewById } from "@/backend/controllers/interview.controller";
import { NextResponse } from "next/server";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{ id: string }> }
) {

    try {
        const {id} = await params;
        const res = await getInterviewById(id);

        if(res?.error) {
            return NextResponse.json(
                {
                    error: { message: res?.error?.message },
                }, 
                { status: res.error?.statusCode }
            )
        }

        return NextResponse.json({ interview: res?.interview });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Not authenticated" },
            { status: 401 }
        );
    }
}