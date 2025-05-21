import dbConnect from "../config/dbConnect";
import User from "../models/user.model";

export const register = async (name: string, email: string, password: string) => {
    await dbConnect();
    const newUser = await User.create({
        name,
        email,
        password,
        authProviders: [
            {
                provider: "credentials",
                providerId: email,
            },
        ],
        roles: ["user"],
    });

    return newUser?._id ? {created: true} : (() => {
        throw new Error("User not created");
    })();
};
          