'use server';

import { supabaseServer } from "@/lib/supabase/server";
import { MeterFormData, MeterInterface } from "@/types/meter-types";

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


//get total recharged action
export async function getTotalRecharged(meterId?: string): Promise<{ totalAmount: number, totalCount: number }> {
    const supabase = await supabaseServer();

    const { data, error } = await supabase.rpc('get_recharge_totals', {
        p_meter_id: meterId ?? null,
    });

    if (error) throw new Error(error.message);

    const row = data?.[0];

    console.log('RPC result:', row);

    return {
        totalAmount: Number(row?.total_amount ?? 0),
        totalCount: Number(row?.total_count ?? 0),
    };
}


//get all user meters
export async function getUserMeters(): Promise<{ meters: MeterInterface[]; count: number }> {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, count, error } = await supabase
        .from('meters')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return { meters: (data ?? []) as MeterInterface[], count: count ?? 0 };
}
