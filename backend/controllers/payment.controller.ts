import Stripe from "stripe";
import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";
import stripe from "../utils/stripe";
import { headers } from "next/headers";


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

export const cancelSubscription = catchAsyncErrors(
    async (email: string) => {
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user || !user.subscription?.id) {
            throw new Error("User or Subscription not found");
        }

        const subscription = await stripe.subscriptions.cancel(user.subscription.id);

        return { status: subscription.status };
    }
);

export const subscriptionWebhook = async (req: Request) => {
    console.log("Received webhook request");
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;
    let event;
    let subscriptionId;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );

    } catch (err) {
        console.error(`Error message: ${err}`);
    }

    if(!event) {
        throw new Error("Payment event not found");
    }

    await dbConnect();

    switch (event.type) {
        case "invoice.payment_succeeded":
            const invoice = event.data.object as Stripe.Invoice;
            const email = invoice.customer_email;
            const customer = await stripe.customers.retrieve(invoice.customer as string);
            subscriptionId = (invoice as Stripe.Invoice & { subscription: string }).subscription;

            await User.findOneAndUpdate(
                { email },
                {
                    subscription: {
                        id: subscriptionId,
                        customerId: customer.id,
                        created: new Date(invoice.created * 1000),
                        status: "active",
                        startDate: new Date(invoice.lines.data[0].period.start * 1000),
                        currentPeriodEnd: new Date(invoice.lines.data[0].period.end * 1000),
                        nextPaymentAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
                    }
                },
                { new: true, upsert: true }
            );
            break;
        case "invoice.payment_failed":
            const paymentFailed = event.data.object as Stripe.Invoice;
            const nextPaymentAttempt = paymentFailed.next_payment_attempt;
            subscriptionId = (paymentFailed as Stripe.Invoice & { subscription: string }).subscription;
            await User.findOneAndUpdate({ "subscription.id": subscriptionId }, {
                subscription: {
                    status: "past_due",
                    nextPaymentAttempt: nextPaymentAttempt ? new Date(nextPaymentAttempt * 1000) : null,
                }
            });
            break;
        case "customer.subscription.deleted":
            const subscriptionDeleted = event.data.object;
            await User.findOneAndUpdate({ "subscription.id": subscriptionDeleted.id }, {
                subscription: {
                    status: "canceled",
                    nextPaymentAttempt: null,
                }
            });
            break;        
        case "customer.subscription.created":
            // Handle subscription creation
            console.log("Subscription created:", event.data.object);
            break;
        case "customer.subscription.updated":
            // Handle subscription update
            console.log("Subscription updated:", event.data.object);
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    return { success: true }
}
