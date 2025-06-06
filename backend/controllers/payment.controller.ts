import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import stripe from "../utils/stripe";


export const createSubscription = catchAsyncErrors(
    async (email: string, paymentMethodId: string) => {
        await dbConnect();

        const customer = await stripe.customers.create({
            email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: "price_1RWo2wE2uf6jt8LcuTqMYbBs" }],
            expand: ["latest_invoice.payment_intent"],
        });

        return { subscription };
    }
);