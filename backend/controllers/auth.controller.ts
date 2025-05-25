import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";

export const register = catchAsyncErrors(async (name: string, email: string, password: string) => {
    await dbConnect();

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay for demonstration
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
});
          