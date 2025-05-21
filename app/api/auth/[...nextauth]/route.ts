import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user.model";

const options = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                await dbConnect();
                const user = await User.findOne({
                    email: credentials?.email,
                });
                if (!user) {
                    throw new Error("Invalid Email or Password");
                }

                const isPasswordValid = await user.matchPassword(credentials?.password);
                if (!isPasswordValid) {
                    throw new Error("Invalid Email or Password");
                };
                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export const GET = NextAuth(options);
export const POST = NextAuth(options);