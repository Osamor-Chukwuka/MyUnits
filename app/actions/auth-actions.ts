'use server'

import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AuthActionState = {
    ok: boolean;
    message?: string;
    fieldErrors?: Partial<Record<'first_name' | 'last_name' | 'email' | 'password', string>>;
    values?: Partial<Record<'first_name' | 'last_name' | 'email' | 'password' | 'confirm_password', string>>;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

//signup action
export async function signupAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState>{

    //extarct form data and validate
    const first_name = String(formData.get('first_name') ?? '').trim();
    const last_name = String(formData.get('last_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLocaleLowerCase();
    const password = String(formData.get('password') ?? '');
    const confirm_password = String(formData.get('confirm_password') ?? '');

    const fieldErrors: AuthActionState['fieldErrors'] = {};

    if (!first_name) fieldErrors.first_name = 'First name is required';
    if (!last_name) fieldErrors.last_name = 'Last name is required';

    if(!email){
        fieldErrors.email = 'Email is required';
    }else if (!isEmail(email)) {
        fieldErrors.email = 'Enter a valid email address';
    }

    if (password.length < 8) fieldErrors.password = 'Password must be at least 8 characters long';
    else if (password !== confirm_password) fieldErrors.password = 'Passwords do not match';

    if(Object.keys(fieldErrors).length > 0){
        return {
            ok: false,
            message: 'Please fix the errors above',
            fieldErrors,
            values: {
                first_name,
                last_name,
                email,
                password,
                confirm_password
            }
        }
    };

    //start the main user creation logic
    const supabase = await supabaseServer();
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.APP_URL}/auth/callback`,
        }
    })

    if(error){
        return {
            ok: false,
            message: error.message || 'An error occurred during signup',
            values: {
                first_name,
                last_name,
                email,
                password,
                confirm_password
            }
        }
    }

    return {
        ok: true,
        message: 'Signup successful! Please check your email to verify your account.',
        values: {
                first_name,
                last_name,
                email,
                password,
                confirm_password
            }
    }
}


//logout action
export async function logoutAction(){
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signOut()
    if (error) {
        console.error('Logout error:', error);
        return {
            ok: false,
            message: 'Could not logout. Please try again.',
        }
    }
    
    //redirect to login
    redirect('/auth/login');
}