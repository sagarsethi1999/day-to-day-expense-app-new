const Razorpay = require('razorpay');
const Order = require('../models/orders');
const User = require('../models/user');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');


router.get('/', verifyToken, async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: "rzp_test_laucp39lO1Dvor",
            key_secret: "d52GQhSlvrJTa4g4AyowISvR"
        });

        const amount = 9900; // Amount in smallest currency unit (e.g., paise for INR)

        // Create order with Razorpay
        rzp.orders.create({
            amount,
            currency: "INR"
        },
            async (err, order) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to create order' });
                }

                try {
                    // Create order record in the database
                    const createdOrder = await Order.create({
                        paymentid: '', // You can fill this field later if needed
                        orderid: order.id,
                        status: 'PENDING'
                    });




                    // Return order details and Razorpay key ID to the client
                    return res.status(201).json({ order, key_id: rzp.key_id });
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Failed to create order in database' });
                }
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
);

// In your backend route file (e.g., purchase.js)
router.post('/', verifyToken, async (req, res) => {
    const { order_id, payment_id } = req.body;
    try {
        
        // Update paymentid with the received payment_id
        await Order.update(
            { paymentid: payment_id, status: 'SUCCESSFUL' }, 
            { where: { orderid: order_id } }
        );
            // Find the user by ID
        const user = await User.findByPk(req.user.id);

        // Update premiumUser column to true for the user
        await user.update({ premiumUser: true });

        return res.status(200).json({ message: 'Transaction status updated successfully' });
    } catch (error) {
        console.error(error);
        
        // If an error occurs, update the order status to 'FAILED'
        await Order.update(
            { status: 'FAILED' }, 
            { where: { orderid: order_id } }
        );

        return res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;

// const purchase = async (req, res) => {
//     try {
//         const rzp = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET
//         });

//         const amount = 9900; // Amount in smallest currency unit (e.g., paise for INR)

//         // Create order with Razorpay
//         rzp.orders.create({
//             amount,
//             currency: "INR"
//         },
//         async (err, order) => {
//             if (err) {
//                 console.error(err);
//                 return res.status(500).json({ error: 'Failed to create order' });
//             }

//             try {
//                 // Create order record in the database
//                 const createdOrder = await Order.create({
//                     paymentid: '', // You can fill this field later if needed
//                     orderid: order.id,
//                     status: 'PENDING'
//                 });

//                 // Return order details and Razorpay key ID to the client
//                 return res.status(201).json({ order, key_id: rzp.key_id });
//             } catch (error) {
//                 console.error(error);
//                 return res.status(500).json({ error: 'Failed to create order in database' });
//             }
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };

// module.exports = { purchase };