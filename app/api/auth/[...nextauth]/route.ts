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
                }).select("+password");
                if (!user) {
                    throw new Error("Invalid Email or Password");
                }

                const isPasswordValid = await user.comparePassword(credentials?.password);
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
    callbacks: {
        async jwt({ token, user }: any) {
            //console.log("JWT Callback", token);
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }: any) {
            //console.log("Session Callback", session);
            if (token) {
                session.user = token.user;
            }
            delete session.user.password;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
}

export const GET = NextAuth(options);
export const POST = NextAuth(options);