import withAuth from "next-auth/middleware";
import { IUser } from "./backend/models/user.model";
import { isUserAdmin, isUserSubscribed } from "./helpers/auth";
import { NextResponse } from "next/server";

export default withAuth(function middleware(req) {
    const url = req.nextUrl?.pathname;
    const user = req.nextauth?.token?.user as IUser;

    const isSubscribed = isUserSubscribed(user);
    const isAdminUser = isUserAdmin(user);

    if(url?.startsWith("/app") && !isSubscribed && !isAdminUser) {
        // Redirect to the subscription page if the user is not subscribed
        return NextResponse.redirect(new URL("/", req.url));
    }
})

export const config = {
    // Define the paths that should be protected by authentication
    matcher: ["/app/:path*", "/api/interviews/:path*"],
};
