"use client"

import AvantiLogo from '../assets/avanti_logo.png'
import CapgeminiLogo from '../assets/capgemeni_logo.png';
import Image from 'next/image';
import PrimaryButton from "@/component/PrimaryButton";

export default function Home() {

  const handleLogin = async () => {
    const redirectUrl = process.env.NEXT_PUBLIC_AF_PORTAL_FRONTEND_URL;

    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      console.error('Please try again later');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center pt-24 bg-white text-black bg-gradient-to-b from-primary via-secondary to-white">
      <Image src={AvantiLogo} alt="Avanti Logo" className="bg-transparent mt-6 w-20 h-20 border-2 rounded-full" />
      <div className='text-white mt-6 text-2xl'> Welcome to Gurukul</div>
      <div className='flex mt-2'>
        <span className='text-white text-lg pr-2 pt-1'>supported by</span>
        <Image src={CapgeminiLogo} alt="Avanti Logo" className="w-32 h-9" />
      </div>
      <PrimaryButton className='w-72 border-2 rounded-md h-12 mt-32' onClick={handleLogin}>LOGIN</PrimaryButton>
    </div>
  );
}
