import Link from 'next/link';

interface NavLinkProps {
    href: string;
    active: boolean;
    children: React.ReactNode;
}

export default function NavLink({ href, active, children }: NavLinkProps) {
    return (
        <Link href={href} className={`flex flex-col items-center ${active ? 'text-primary font-semibold' : 'text-black'}`}>
            {children}
        </Link>
    );
}
