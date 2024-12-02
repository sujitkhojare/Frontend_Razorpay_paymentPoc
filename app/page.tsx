// app/page.tsx
import PaymentForm from './components/PaymentForm';

const PaymentPage: React.FC = () => {
    return (
        <div className="container mx-auto p-4">
            {/* <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Razorpay Payment Integration</h1> */}
            <PaymentForm />
        </div>
    );
};

export default PaymentPage;
