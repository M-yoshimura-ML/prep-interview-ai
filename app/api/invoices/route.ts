import { getInvoice } from "@/backend/controllers/payment.controller";
import { NextResponse } from "next/server";

export async function GET(
    request: Request, 
) {

    try {
        const res = await getInvoice(request);

        if(res?.error) {
            return NextResponse.json(
                {
                    error: { message: res?.error?.message },
                }, 
                { status: res.error?.statusCode }
            )
        }

        return NextResponse.json({ invoices: res });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Not authenticated" },
            { status: 401 }
        );
    }
}