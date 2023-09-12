"use client";

import { useState } from 'react';
import AvantiLogo from '../../assets/avanti_logo.png';
import CapgeminiLogo from '../../assets/capgemeni_logo.png';
import Image from 'next/image';
import InputLabel from '@/components/InputLabel';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import CurrentTime from '@/components/CurrentTime';
import axios from 'axios';

const Login = () => {
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState('');
    const authUrl = `${process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL}/create-access-token`;

    const handleLogin = async () => {
        const requestBody = {
            id: studentId,
            type: 'user',
            is_user_valid: true,
        };
        try {
            const response = await axios.post(authUrl, requestBody);
            console.log(response)
            if (response.status === 200) {
                const data = response.data;
                localStorage.setItem('accessToken', data.access_token);
                localStorage.setItem('refreshToken', data.refresh_token);
            } else {
                setError(`Error: ${response.statusText}`);
            }
        } catch (err) {
            throw err;
        }
    };

    return (
        <>
            <CurrentTime className='bg-primary pl-4 pt-4 text-sm' />
            <div className="flex min-h-screen flex-col items-center pt-24 bg-white text-black bg-gradient-to-b from-primary via-secondary to-white">
                <Image src={AvantiLogo} alt="Avanti Logo" className="bg-transparent mt-6 w-20 h-20 border-2 rounded-full" />
                <div className='text-white mt-6 text-2xl'>Avanti Gurukul</div>
                <div className='flex mt-2'>
                    <span className='text-white text-lg pr-2 pt-1'>supported by</span>
                    <Image src={CapgeminiLogo} alt="Avanti Logo" className="w-32 h-9" />
                </div>
                <InputLabel htmlFor="login" className="mt-20 text-sm font-semibold text-slate-800
            ">Please enter your state issued Student ID</InputLabel>
                <InputField
                    id='login'
                    className='w-72 border-2 rounded-md h-12 bg-transparent border-primary mt-4'
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                />
                <PrimaryButton className='w-72 border-2 rounded-md h-12 bg-primary border-primary mt-4 text-white' onClick={handleLogin}>LOGIN</PrimaryButton>
                {error && <div className="text-red-500">{error}</div>}
            </div>
        </>
    )
}

export default Login;
