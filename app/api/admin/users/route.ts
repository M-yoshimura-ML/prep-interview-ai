import { getAllUsers } from "@/backend/controllers/auth.controller";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const res = await getAllUsers(req);

    if(res?.error) {
        return NextResponse.json(
            {
                error: { message: res?.error?.message },
            },
            { status: res.error?.statusCode }
        )
    }

    const { users, resultsPerPage, filteredCount } = res;
    return NextResponse.json({ users, resultsPerPage, filteredCount });
}