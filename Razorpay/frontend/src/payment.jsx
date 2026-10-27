import axios from "axios";
const Payment = () => {
    const handlePayment = async () => {
        try {
            // =====================================
            // STEP 1
            // CREATE ORDER FROM BACKEND
            // =====================================
            const response = await axios.post("http://localhost:5000/create-order",{ amount: 500 });
            const {
                orderId,
                amount,
                currency
            } = response.data;
            // =====================================
            // STEP 2
            // RAZORPAY CHECKOUT OPTIONS
            // =====================================
            const options = {
                key: "rzp_test_TsqFAgItN6JZpd",
                amount: amount,
                currency: currency,
                name: "Razorpay Payment",
                description: "Test Payment",
                order_id: orderId,
                handler:
                    async function (response) {
                        console.log(
                            "Razorpay Response:",
                            response
                        );
                        // =================================
                        // STEP 3
                        // VERIFY PAYMENT
                        // =================================
                        const verifyResponse =
                            await axioas.post("http://localhost:5000/verify",{
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id:response.razorpay_order_id,
                                    razorpay_signature:response.razorpay_signature
                                }
                            );
                        if (verifyResponse.data.success) {
                            alert("Payment Successful");
                           
                        }
                    },
                prefill: {
                    name:"Piyush",
                    email:"piyush@example.com",
                    contact:"9999999999"
                },
                theme: {
                    color:"#3399cc"
                }
            };
            // =====================================
            // STEP 4
            // OPEN RAZORPAY
            // =====================================
            const razorpay =new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error(error);
            alert( "Something went wrong");
        }
    };
    return (
        <div>
            <h2>Razorpay Payment</h2>
            <button onClick={handlePayment}>Pay ₹500</button>
        </div>
    );
};
export default Payment;
