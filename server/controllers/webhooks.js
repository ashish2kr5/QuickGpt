// import Stripe from "stripe";
// import Transaction from "../models/Transaction.js";
// import UserModel from "../models/UserModel.js";


// export const stripeWebhooks = async(req,res)=>{

//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

//   const sig = req.headers['stripe-signature']

//   let event;
//   try{
//     event = stripe.webhooks.constructEvent(req.body,sig,process.env.STRIPE_WEBHOOK_SECRET)

//   }
//   catch(error){
//     return res.status(400).send(`Webhook Error: ${error.message}`)
//   }

//   try {
    
//     switch (event.type) {
//       // case "payment_intent.succeeded":
//         case "checkout.session.completed":{
//           const paymentIntent = event.data.object;
//           const sessionList = await stripe.checkout.sessions.list({
//             payment_intent: paymentIntent.id,
//           })

//           const session = sessionList.data[0];
//           const {transactionId,appId} = session.metadata; 
//           if(appId === "quickgpt"){
//             const transaction = await Transaction.findOne({_id:transactionId,isPaid:false})


//             //update credits in user accnt

//             await UserModel.updateOne({_id:transaction.userId},{$inc:{credits:transaction.credits}})

//             //update payment satus

//             transaction.isPaid = true;
//             await transaction.save()
//         }
//         else{
//           return res.json({received:true,message:"ignord event :invalid app"})
//         }
//         break;
//         }
        
    
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//         break;
//     }

//     res.json({received:true})
//   } catch (error) {
//     console.log("webhook process error",error)
//     res.status(500).send("Internal server error")
//   }




// }






import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import UserModel from "../models/UserModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {

    switch (event.type) {

      case "checkout.session.completed": {

        const session = event.data.object;
        const { transactionId, appId } = session.metadata || {};

        if (!transactionId || appId !== "quickgpt") {
          return res.json({ received: true });
        }

        const transaction = await Transaction.findById(transactionId);
        

        if (!transaction || transaction.isPaid) {
          return res.json({ received: true });
        }

        await UserModel.findByIdAndUpdate(transaction.userId, {
          $inc: { credits: transaction.credits }
        });

        transaction.isPaid = true;
        await transaction.save();

        return res.json({ received: true });
      }

      
      default:
        return res.json({ received: true });
    }

  } catch (error) {
    return res.status(500).json({ error: "Webhook failed" });
  }
   
};