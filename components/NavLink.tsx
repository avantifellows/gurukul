import Link from 'next/link';
import { NavLinkProps } from '@/app/types';

export default function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link href={href} className={`flex flex-col items-center transition-colors duration-200 lg:w-full ${active ? 'text-primary font-semibold' : 'text-black hover:text-primary'}`}>
            {children}
        </Link>
    );
}