import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import UserModel from "../models/UserModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async(req,res)=>{

  console.log("🔔 Webhook received!");
  console.log("Headers:", req.headers['stripe-signature'] ? "✓ Signature present" : "✗ No signature");
  console.log("Body size:", req.body?.length, "bytes");

  const sig = req.headers['stripe-signature']

  if(!sig) {
    console.error("✗ Missing stripe-signature header");
    return res.status(400).send(`Webhook Error: Missing signature`)
  }

  let event;
  try{
    event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET)
    console.log("✓ Webhook signature verified. Event type:", event.type);
  }
  catch(error){
    console.error("✗ Webhook verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  try {
    
    switch (event.type) {
      case "checkout.session.completed": {
        console.log("Processing checkout.session.completed");
        
        // event.data.object IS the session, don't look it up again
        const session = event.data.object;
        const {transactionId, appId} = session.metadata || {};
        
        console.log("Transaction ID:", transactionId);
        console.log("App ID:", appId);
        
        if(appId !== "quickgpt" || !transactionId) {
          console.log("Invalid metadata, skipping");
          return res.json({received:true})
        }

        const transaction = await Transaction.findById(transactionId);
        console.log("Transaction:", transaction);
        
        if(!transaction) {
          console.error("Transaction not found:", transactionId);
          return res.json({received:true})
        }

        if(transaction.isPaid) {
          console.log("Transaction already paid");
          return res.json({received:true})
        }

        console.log("Updating user:", transaction.userId, "with credits:", transaction.credits);
        
        // Update user credits
        const updatedUser = await UserModel.findByIdAndUpdate(
          transaction.userId,
          {$inc: {credits: transaction.credits}},
          {new: true}
        );
        
        console.log("User updated. New credits:", updatedUser?.credits);

        // Mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();
        console.log("✓ Transaction marked as paid");
        
        return res.json({received:true})
      }
        
      default:
        console.log(`Unhandled event type ${event.type}`);
        return res.json({received:true})
    }

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Internal server error")
  }
}
