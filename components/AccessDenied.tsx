import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import AvantiLogo from '../assets/avanti_logo.png';

const AccessDenied = () => {
    return (
        <div className="min-h-screen flex flex-col items-center text-center mt-8">
            <Head>
                <title>Access Denied</title>
            </Head>
            <div className="max-w-sm p-8 bg-white rounded-lg">
                <div className="flex justify-center">
                    <Image src={AvantiLogo} alt="Avanti Logo" className="w-20 h-20 rounded-full" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 my-4">Access Denied</h1>
                <p className="text-gray-600">You do not have permission to access this page.</p>
                <Link href="/">
                    <div className="mt-4 text-blue-600 hover:underline">Go back to the homepage</div>
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied;
