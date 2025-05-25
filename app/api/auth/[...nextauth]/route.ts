import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
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
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
    ],
    session: {
        strategy: "jwt" as const,
    },
    callbacks: {
        async signIn({ user, account, profile }: any) {
            //signIn callback is called when the user signs in google or Github
            console.log("SignIn Callback", user);
            console.log("Account Callback", account);
            console.log("Profile Callback", profile);
            await dbConnect();
            if (account.provider === "credentials") {
                user.id = user?._id;
            } else {
                const existingUser = await User.findOne({ email: user?.email });
                if (!existingUser) {
                    const newUser = await User.create({
                        name: user?.name,
                        email: user?.email,
                        profilePicture: {url: profile?.avatar_url || user?.image},
                        authProviders: [
                            {
                                provider: account?.provider,
                                providerId: account?.id || profile?.id || profile?.sub,
                            }
                        ]
                    });
                    user.id = newUser._id;
                } else {
                    user.id = existingUser._id;
                    // Optional: update missing profile picture
                    if (!existingUser.profilePicture?.url && (profile?.avatar_url || user?.image)) {
                        existingUser.profilePicture = {url: profile?.avatar_url || user?.image};
                        await existingUser.save();
                    }
                }
            }
            
            return true;
        },
        async jwt({ token, user }: any) {
            //console.log("JWT Callback", token);
            if (user) {
                token.user = user;
            } else {
                await dbConnect();
                const dbUser = await User.findById(token.user.id);
                if (dbUser) {
                    token.user = dbUser
                }
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