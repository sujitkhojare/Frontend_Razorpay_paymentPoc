import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Payment Integration',
    description: 'Razorpay Payment Integration with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                {/* Load Razorpay script asynchronously */}
                <Script 
                    src="https://checkout.razorpay.com/v1/checkout.js" 
                    strategy="afterInteractive" 
                />
                {children}
            </body>
        </html>
    );
}
