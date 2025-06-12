import { getAdminDashboardStats } from "@/backend/controllers/auth.controller";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const res = await getAdminDashboardStats(req);

    if(res?.error) {
        return NextResponse.json(
            {
                error: { message: res?.error?.message },
            },
            { status: res.error?.statusCode }
        )
    }
    return NextResponse.json({ data: res });
}