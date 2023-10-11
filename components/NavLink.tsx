import Link from 'next/link';
import { NavLinkProps } from '@/app/types';

export default function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link href={href} className={`flex flex-col items-center ${active ? 'text-primary font-semibold' : 'text-black'}`}>
            {children}
        </Link>
    );
}