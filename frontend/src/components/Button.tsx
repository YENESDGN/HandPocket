import React from 'react'
import { Loader2 } from 'lucide-react'

interface buttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { 
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
    isLoading?: boolean
}

export default function Button () {
    return (
        <div className='bg-[#08b4fb] text-white font-Ping-Hebrew text-xl absolute top-25 right-70 flex rounded-[50px] w-max'>
            <button className='flex p-2'>Giriş Yap</button>
            <button className='flex p-2'>Kayıt Ol</button>
        </div>
    )
}