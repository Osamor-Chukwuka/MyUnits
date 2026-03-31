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
export async function signupAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {

    //extarct form data and validate
    const first_name = String(formData.get('first_name') ?? '').trim();
    const last_name = String(formData.get('last_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim().toLocaleLowerCase();
    const password = String(formData.get('password') ?? '');
    const confirm_password = String(formData.get('confirm_password') ?? '');

    const fieldErrors: AuthActionState['fieldErrors'] = {};

    if (!first_name) fieldErrors.first_name = 'First name is required';
    if (!last_name) fieldErrors.last_name = 'Last name is required';

    if (!email) {
        fieldErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
        fieldErrors.email = 'Enter a valid email address';
    }

    if (password.length < 8) fieldErrors.password = 'Password must be at least 8 characters long';
    else if (password !== confirm_password) fieldErrors.password = 'Passwords do not match';

    if (Object.keys(fieldErrors).length > 0) {
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
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.APP_URL}/auth/callback`,
            data: {
                first_name,
                last_name,
                email,
            }
        }
    })

    if (error) {
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

//login action
export async function loginAction(prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {

    //extarct form data and validate
    const email = String(formData.get('email') ?? '').trim().toLocaleLowerCase();
    const password = String(formData.get('password') ?? '');

    const fieldErrors: AuthActionState['fieldErrors'] = {};

    if (!email) {
        fieldErrors.email = 'Email is required';
    } else if (!isEmail(email)) {
        fieldErrors.email = 'Enter a valid email address';
    }

    if (!password) fieldErrors.password = 'Password is required';

    if (Object.keys(fieldErrors).length > 0) {
        return {
            ok: false,
            message: 'Please fix the errors above',
            fieldErrors,
            values: {
                email,
                password,
            }
        }
    };

    //start the main user creation logic
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })


    if (error) {
        return {
            ok: false,
            message: error.message || 'An error occurred during login',
            values: {
                email,
                password,
            }
        }
    }

    return {
        ok: true,
        message: 'Login successful!',
        values: {
            email,
            password,
        }
    }
}


//logout action
export async function logoutAction() {
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


//get current user
export async function getCurrentUser() {
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

    return {
        ...user,
        profile
    };
}


//edit user
export async function editUserAction(data: {}): Promise<AuthActionState> {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            ok: false,
            message: 'User not authenticated',
        }
    }

    const { error } = await supabase.from('users').update(data).eq('auth_id', user.id);

    if (error) {
        return {
            ok: false,
            message: error.message || 'An error occurred while updating profile',
        }
    }

    return {
        ok: true,
        message: 'Profile updated successfully!',
    }


}


//change password
export async function changePassword(current_password: string, new_password: string): Promise<AuthActionState> {
    const supabase = await supabaseServer(); //get supabase server instance

    //get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            ok: false,
            message: 'User not authenticated',
        }
    }

    //re-authenticate user with current password to make sure current password is correct before allowing password change
    const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email ?? '',
        password: current_password
    });

    if (error) {
        return {
            ok: false,
            message: 'Current password is incorrect',
        }
    }

    //if re-authentication is successful, proceed to update password
    const { data: resetData, error: updateError } = await supabase.auth.updateUser({
        password: new_password
    });

    if (updateError) {
        return {
            ok: false,
            message: 'An error occurred while changing password',
        }
    }

    return {
        ok: true,
        message: 'Password changed successfully!',
    }
}