import Transaction from "../models/Transaction.js";
import Stripe from "stripe"
import UserModel from "../models/UserModel.js";

const plans = [
   {
        _id: "basic",
        name: "Basic",
        price: 50,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 100,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 200,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]


//api conoleer for getting all plans
  export const getPlans = async(req,res)=>{
    try{
        res.json({success:true,plans}) 
    }catch(error){
        res.json({success:false,message:error.message})
    }
  }


  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)


  //api controller for purchasing a plan
  export const purchasePlan = async(req,res)=>{
    try{  
      const {planId} = req.body
      const userId = req.user._id
      const plan = plans.find(plan => plan._id === planId)
      if(!plan){
        return res.json({success:false,message:"invalid plan"})
      }
      const transaction = await Transaction.create({
        userId:userId,
        planId: plan._id,
        amount: plan.price,
        credits: plan.credits,
        isPaid: false
      })

      const {origin} = req.headers;
     const session = await stripe.checkout.sessions.create({
      
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: plan.price * 100,
            product_data: {
              name: plan.name,
              
            },
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/loading`,
      cancel_url: `${origin}`,
      metadata:{transactionId: transaction._id.toString(),appId:"quickgpt"},
      expires_at:Math.floor(Date.now()/1000) + 31*60, //31 minutes expiry
    });
    // console.log(session);
    
    const transactions = await Transaction.findById(transaction._id.toString());
    console.log("Transaction:", transaction);
    
    if(!transactions) {
      console.error("Transaction not found:", transactionId);
      // return res.json({received:true})
    }

    if(transactions.isPaid) {
      console.log("Transaction already paid");
      // return res.json({received:true})
    }

    console.log("Updating user:", transactions.userId, "with credits:", transactions.credits);
    
    // Update user credits
    const updatedUser = await UserModel.findByIdAndUpdate(
      transactions.userId,
      {$inc: {credits: transactions.credits}},
      {new: true}
    );
    
    console.log("User updated. New credits:", updatedUser?.credits);

    res.json({success:true,url:session.url});
    

    }catch(error){
        res.json({success:false,message:error.message})
    } 
  }

