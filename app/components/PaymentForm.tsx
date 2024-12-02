'use client';
import React, { useEffect, useState } from 'react';

interface PaymentStatus {
    id: number;
    name: string;
    email: string;
    mobile: string;
    amount: number;
    status: string;
    paymentId: string;
    orderId: string;
}

const PaymentForm: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        amount: ''
    });
    const [payments, setPayments] = useState<PaymentStatus[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const showMessage = (message: string) => {
        setStatusMessage(message);
        setTimeout(() => {
            setStatusMessage('');
        }, 2000);
    };

    const fetchPayments = async () => {
        showMessage("Fetching payment records...");
        try {
            const response = await fetch('http://localhost:8080/api/payments/payment-status');
            const data: PaymentStatus[] = await response.json();
            setPayments(data);
            showMessage("Payments fetched successfully.");
        } catch (error) {
            console.error('Error fetching payments:', error);
            showMessage("Error fetching payments.");
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        showMessage("Creating payment order...");
        const response = await fetch('http://localhost:8080/api/payments/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: parseFloat(formData.amount),
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile
            }),
        });

        const paymentData = await response.json();
        console.log('Received payment data:', paymentData);
        showMessage("Order created. Redirecting to payment...");
        
        // Call Razorpay after order creation
        loadRazorpay(paymentData.orderId);
    };

    const loadRazorpay = (orderId: string) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: parseFloat(formData.amount) * 100,
            currency: "INR",
            name: "Your Company Name",
            description: "Payment for Order",
            order_id: orderId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            handler: async (response: any) => {
                console.log("Payment successful! Payment response:", response);
                showMessage("Processing payment verification...");
                await handlePaymentVerification(response);
            },
            prefill: {
                name: formData.name,
                email: formData.email,
                contact: formData.mobile
            },
            theme: {
                color: "#F37254"
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePaymentVerification = async (response: any) => {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        const paymentData = {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        };

        try {
            const result = await fetch("http://localhost:8080/api/payments/verify-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            });
            const data = await result.json();
            console.log("Payment verification response: ", data);

            // Update the status, paymentId, and other fields in the UI
            setPayments((prevPayments) =>
                prevPayments.map((payment) =>
                    payment.orderId === razorpay_order_id
                        ? { ...payment, status: data.status, paymentId: razorpay_payment_id }
                        : payment
                )
            );
            showMessage("Payment verified successfully.");
        } catch (error) {
            console.error("Error verifying payment: ", error);
            showMessage("Error verifying payment.");
        }
    };

    return (
        <div>
            {statusMessage && <p className="text-center text-green-600">{statusMessage}</p>}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment Form</h2>

                {/* Input fields */}
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                />

                <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                />

                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                />

                <button 
                    type="submit" 
                    className="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition duration-200"
                >
                    Pay Now
                </button>
            </form>

            <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-white">
                <thead className="bg-blue-500 text-white">
                <tr>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">ID</th>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">Name</th>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">Email</th>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">Mobile</th>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">Amount</th>
                    <th className="py-3 px-6 font-semibold text-sm uppercase tracking-wider">Status</th>
                </tr>
                </thead>
                <tbody>
                {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-100 transition-colors duration-200 ease-in-out">
                    <td className="border-b border-gray-200 py-4 px-6 text-center text-gray-700">{payment.id}</td>
                    <td className="border-b border-gray-200 py-4 px-6 text-center text-gray-700">{payment.name}</td>
                    <td className="border-b border-gray-200 py-4 px-6 text-center text-gray-700">{payment.email}</td>
                    <td className="border-b border-gray-200 py-4 px-6 text-center text-gray-700">{payment.mobile}</td>
                    <td className="border-b border-gray-200 py-4 px-6 text-center text-gray-700">{(payment.amount / 100).toFixed(2)}</td>
                    <td
                        className={`border-b border-gray-200 py-4 px-6 text-center font-semibold rounded-md ${
                        payment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                        {payment.status}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default PaymentForm;
