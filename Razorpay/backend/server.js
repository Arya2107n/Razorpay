 require('dotenv').config();
const express = require('express');
const port = process.env.PORT;
const app = express();
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

app.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required"
            });
        }
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt:
                `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        console.log("Razorpay Order:", order);
        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order"
        });
    }
});

app.post("/verify", async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;
        const body = razorpay_order_id +"|"+razorpay_payment_id;
        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }
        console.log(
            "Payment Verified:",
            razorpay_payment_id
        );
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            paymentId:
                razorpay_payment_id,
            orderId:
                razorpay_order_id
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Payment verification error"
        });
    }
});



 

app.listen(port,(err)=>{
    if(err){
        console.log(err);
        return false; 
    }else{
        console.log("Server is running on port", port);
    }
});