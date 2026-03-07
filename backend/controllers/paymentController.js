const Payment=require("../models/Payment.js")
async  function makePayment(req,res){
    const payment=req.body;
    try{
    const p=await new Payment({
        patientId:payment.patientId,
        amount:payment.amount,
        method:payment.method,
        status:"PAID"
    });
    const save=await p.save();
    res.status(200).json({message:"Payment Successful",payment:save});
    }
catch(err)
{
    res.status(500).json({
        error:err.message
    })
}
}
