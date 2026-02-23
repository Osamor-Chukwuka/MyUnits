'use server';

import { supabaseServer } from "@/lib/supabase/server";
import { MeterFormData } from "@/types/meter-types";

//define vtPass base url
const baseUrl = 'https://sandbox.vtpass.com/api' //sandbox url
const liveBaseUrl = ' https://vtpass.com/api' //live url

//get env variables
const vtPassApiKey = process.env.VTPASS_API_KEY || '';
const vtPassPublicKey = process.env.VTPASS_PUBLIC_KEY || '';
const vtPassSecretKey = process.env.VTPASS_SECRET_KEY || '';

//fetch list of discos from vtpass
export async function fetchDiscos() {
    const result = await fetch(`${baseUrl}/services?identifier=electricity-bill`, {
        headers: {
            'content-type': 'application/json',
            'api-key': vtPassApiKey,
            'public-key': vtPassPublicKey,
        }
    })

    if (!result.ok) {
        throw new Error('Failed to fetch distribution companies');
    }

    const data = await result.json();
    return data;
}


//add meter action
export async function addMeterAction(formData: MeterFormData) {
    const supabase = await supabaseServer();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase.from('meters').insert({
        user_id: user.id,
        name: formData.name,
        meter_number: formData.meterNumber,
        disco: formData.disco,
        type: formData.meterType,
    })

    if (error) {
        //duplicate error code from supabase
        if (error.code === '23505') {
            throw new Error('A meter with this number already exists. Please check and try again.');
        }
        throw new Error(error.message);
    }

    return;
}