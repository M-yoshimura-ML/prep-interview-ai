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
}

// export const register = async (req: NextApiRequest, res: NextApiResponse) => {
//     const { email, password, name } = req.body;

//     if (!email || !password || !name) {
//         return res.status(400).json({ message: "All fields are required" });
//     }

//     try {
//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({ message: "User already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = new User({
//             email,
//             password: hashedPassword,
//             name,
//         });

//         await newUser.save();

//         return res.status(201).json({ message: "User registered successfully" });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }