'use client'
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useSession } from 'next-auth/react';
import { User, LayoutDashboard } from "lucide-react"
import PushNotification from "../PushNotification";
import NotificationBell from '@/components/ui/notificationBell';

const Navbar: React.FC = () => {
	const { data: session } = useSession();

	return (
		<nav className="flex justify-between items-center py-4 px-4 sm:py-5 sm:px-8 md:px-16 lg:px-27 bg-white shadow-md sticky top-0 z-50">
			{session?.user?.role === "Mahasiswa" ? <PushNotification /> : null}
			<Link href="/" className="flex items-center space-x-2 sm:space-x-4 min-w-0">
					<div className="shrink-0">
						<Image src="/logoIOM.png" alt="IOM logo" width={40} height={40} priority loading="eager" className="sm:w-[46px] sm:h-[46px]"/>
					</div>
					<div className="min-w-0">
						<h1 className="text-sm sm:text-[18px] font-bold text-main leading-5 truncate">Ikatan Orang Tua Mahasiswa</h1>
						<h2 className="text-xs sm:text-base text-main hidden sm:block">Institut Teknologi Bandung</h2>
					</div>
			</Link>
			<div className="shrink-0 ml-2">
				{session?.user?.role === "Mahasiswa"
				? <Link prefetch={true} href="/student/profile" className="py-2 px-3 sm:px-5 rounded-full bg-var hover:bg-var/90 text-white flex items-center text-sm sm:text-base"><User className="h-4 w-4 sm:h-fit mr-1 sm:mr-2" /><span>Profil</span></Link>
				: session?.user?.role === "Pengurus_IOM"
				? <Link prefetch={true} href="/iom/document" className="py-2 px-3 sm:px-5 rounded-full bg-var hover:bg-var/90 text-white flex items-center text-sm sm:text-base"><LayoutDashboard className="h-4 w-4 sm:h-fit mr-1 sm:mr-2" /><span>Dashboard</span></Link>
				: session?.user?.role === "Admin"
				? <Link prefetch={true} href="/admin/account" className="py-2 px-3 sm:px-5 rounded-full bg-var hover:bg-var/90 text-white flex items-center text-sm sm:text-base"><LayoutDashboard className="h-4 w-4 sm:h-fit mr-1 sm:mr-2" /><span>Dashboard</span></Link>
				: session?.user?.role === "Pewawancara"
				? <Link prefetch={true} href="/interviewer/interview" className="py-2 px-3 sm:px-5 rounded-full bg-var hover:bg-var/90 text-white flex items-center text-sm sm:text-base"><LayoutDashboard className="h-4 w-4 sm:h-fit mr-1 sm:mr-2" /><span>Dashboard</span></Link>
				: <Link prefetch={true} href="/login" className="py-2 px-3 sm:px-5 rounded-full bg-var hover:bg-var/90 text-white text-sm sm:text-base">Masuk</Link>}
			</div>
		</nav>
	);
};

export default Navbar;