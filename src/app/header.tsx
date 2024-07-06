'use client';

import { doesUserExist } from '@/backend-lib/actions';
import { fetchUserAttributesServer } from '@/utils/amplify-utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
    UserCircleIcon, XMarkIcon, PhotoIcon, UserIcon,
    ArrowRightStartOnRectangleIcon, ArrowLeftEndOnRectangleIcon, PlusIcon
}
    from '@heroicons/react/24/outline';
import { signOut } from 'aws-amplify/auth';
import { useRef } from 'react';

export default function Header() {
    const router = useRouter();
    const [searchUsername, setSearchUsername] = useState<null | string>(null);
    const [signedIn, setSignedIn] = useState(false);
    const [userName, setUserName] = useState<null | string>(null);
    const [showRightMenu, setShowRightMenu] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const searchHitRef = useRef<HTMLButtonElement>(null);

    const handleSearch = useDebouncedCallback(async (term: string) => {
        console.log('searching...');
        const userExists = await doesUserExist(term);
        if (userExists) {
            setSearchUsername(term);
        } else {
            setSearchUsername(null);
        }
    }, 500);

    useEffect(() => {
        const fetchSignedInStatus = async () => {
            const currentUser = await fetchUserAttributesServer();
            const signedIn = currentUser != undefined;
            const username = currentUser?.preferred_username;

            setSignedIn(signedIn);
            setUserName(username ? username : null);
        }

        fetchSignedInStatus();
    }, [])

    return (
        <div className="w-screen pl-2 pr-4 lg:pr-10 bg-gray-900 flex justify-between items-center gap-4">
            <div className="text-2xl lg:text-4xl flex flex-row items-center text-white hover:text-cyan-300 cursor-pointer shrink-0"
                onClick={() => { router.push('/') }}>
                <img src="/cubit_face.png" className="h-12 w-12 m-2 hover:w-14 hover:h-14 hover:m-1" /><span className="hidden md:block">CuBit</span>
            </div>
            <div className="relative grow max-w-md">
                <input type="text" placeholder="Search username..." className="py-1 px-2 rounded-md w-full focus:ring outline-cyan-300"
                    onChange={(e) => {
                        handleSearch(e.target.value);
                    }}
                    onBlur={(e) => {
                        if (searchHitRef.current && !searchHitRef.current.contains(e.relatedTarget)) {
                            setSearchUsername(null);
                        }
                    }}
                    onFocus={(e) => {
                        if (e.target.value) handleSearch(e.target.value);
                    }}
                />
                {searchUsername ?
                    <div><button className="absolute bg-white rounded-md mt-1 py-1 px-2 hover:text-cyan-400 shadow-lg cursor-pointer z-30 w-full text-left"
                        ref={searchHitRef}
                        onClick={() => {
                            router.push(`/user/${searchUsername}`);
                            setSearchUsername(null);
                        }}>
                        @{searchUsername}
                    </button></div> : ""
                }
            </div>
            <Link className="text-white border-2 border-white rounded-full p-1 md:py-1 md:px-2 flex flex-row items-center gap-1 
                hover:text-cyan-300 hover:border-cyan-300"
                href={"/create"}>
                <PlusIcon className="w-5" />
                <div className="hidden md:block px-1">New Canvas</div>
            </Link>
            {signedIn ?
                <div className="flex flex-row items-center cursor-pointer relative text-white hover:text-cyan-200"
                    onClick={() => { setShowRightMenu(true) }}>
                    <UserCircleIcon className="w-10" />
                    <span className="hidden md:block">{userName}</span>
                </div> : <Link href="/signin"
                    className="flex flex-row items-center cursor-pointer relative text-white hover:text-cyan-200">
                    <ArrowLeftEndOnRectangleIcon className="w-10" />
                    <span className="hidden md:block text-sm">Sign in / Create account</span >
                </Link>}
            <div className={`${showRightMenu && signedIn && userName ? "block" : "hidden"} fixed top-0 left-0 bg-slate-900 w-screen h-screen opacity-50 z-30`}
                onClick={() => setShowRightMenu(false)}></div>
            <div className={`${showRightMenu && signedIn && userName ? "w-60 px-4" : "w-0 px-0"} py-4 transition-all duration-300 fixed top-0 right-0 h-full 
            bg-gray-600 rounded-l-lg flex flex-col text-white z-40`}>
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-1">
                        <UserCircleIcon className="w-8" />
                        <span>{userName}</span>
                    </div>
                    <XMarkIcon className="w-6 rounded-md hover:bg-gray-500" onClick={() => setShowRightMenu(false)} />
                </div>
                <hr className="h-px my-2 bg-gray-400 border-0" />
                <Link className="text-sm flex flex-row gap-1 hover:text-cyan-400 cursor-pointer rounded-md p-1 hover:bg-gray-500"
                    href="/studio"
                    onClick={() => setShowRightMenu(false)}>
                    <PhotoIcon className="w-4" />
                    Your Studio
                </Link>
                <div className="text-sm flex flex-row gap-1 hover:text-cyan-400 cursor-pointer rounded-md p-1 hover:bg-gray-500">
                    <UserIcon className="w-4" />
                    Your Profile
                </div>
                <hr className="h-px my-2 bg-gray-400 border-0" />
                <div className="text-sm flex flex-row gap-1 hover:text-cyan-400 cursor-pointer rounded-md p-1 hover:bg-gray-500
                    aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
                    aria-disabled={isSigningOut}
                    onClick={async () => {
                        setIsSigningOut(true);
                        await signOut();
                        setSignedIn(false);
                        setUserName(null);
                        router.refresh();
                        setIsSigningOut(false);
                    }}>
                    <ArrowRightStartOnRectangleIcon className="w-4" />
                    Sign Out
                </div>
            </div>
        </div>
    )
}