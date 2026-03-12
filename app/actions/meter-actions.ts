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


//get total recharged
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


//delete meter 
export async function deleteMeter(meterId: string){
    const supabase = await supabaseServer();

    const { error } = await supabase.from('meters').delete().eq('id', meterId);

    if (error) throw new Error(error.message);

    return;
}


// get monthly analytics for a meter
// In meter-actions.ts
export async function getMonthlyAnalytics(meterId: string): Promise<[Record<string, number>, { amount: string, created_at: string }]> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from('recharges')
    .select('amount, created_at')
    .eq('meter_id', meterId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  console.log("here here: ", data)

  const lastRecharge = data?.[data.length - 1];

  // Group by year-month
  const monthly = (data ?? []).reduce((acc, row) => {
    const date = new Date(row.created_at);
    const key = `${date.getFullYear()}-${date.toLocaleString('en-US', { month: 'long' })}`;
    acc[key] = (acc[key] || 0) + Number(row.amount);
    return acc;
}, {} as Record<string, number>);

  return [monthly, lastRecharge]; 
}


//get paginated recharges for a meter
export async function getRecharges(meterId: string, page: number = 1, pageSize: number = 10) {
    const supabase = await supabaseServer();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await supabase
        .from('recharges')
        .select('*', { count: 'exact' })
        .eq('meter_id', meterId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) throw new Error(error.message);

    return {
        recharges: data ?? [],
        totalCount: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
        currentPage: page,
    };
}
