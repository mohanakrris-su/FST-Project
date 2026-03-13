const Payment=require("../models/Payment.js")
const Razorpay=require("razorpay")
const razorpay = new Razorpay({
    key_id: "rzp_test_SGR9qfZK8ypm0h",
    key_secret: "ZCM6XIR3X1VTaCFRaAW2pEBv"
}); 
async function createOrder(req, res) {

    const options = {
        amount: 10000,
        currency: "INR",
        receipt: "receipt_order_1"
    };

    try {
        const order = await razorpay.orders.create(options);
        console.log("kjwe");
        res.json(order);
    } catch (err) {
        res.status(500).send(err);
    }
};
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
async function getPayment(req, res) {
    try {
        const paymentId = req.params.paymentId;
        const payment = await Payment.findById(paymentId);
        if (!payment)
            return res.status(404).json({ msg: "Payment not found" });

        res.status(200).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
module.exports={makePayment,createOrder,getPayment};