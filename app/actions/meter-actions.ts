'use server';

import { supabaseServer } from "@/lib/supabase/server";
import { MeterFormData, MeterInterface } from "@/types/meter-types";

type RechargeFilterPeriod = 'all' | 'this-month' | 'last-3-months' | 'this-year' | 'custom' | `${number}-${string}`;

interface RechargeFilterOptions {
    period?: RechargeFilterPeriod;
    from?: string;
    to?: string;
}

interface RechargeMonthOption {
    value: string;
    label: string;
}

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


function getRechargeDateRange({ period = 'all', from, to }: RechargeFilterOptions): { start: Date; endExclusive: Date } | null {
    const now = new Date();

    if (period === 'all') {
        return null;
    }

    if (period === 'this-month') {
        return {
            start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
            endExclusive: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
        };
    }

    if (period === 'last-3-months') {
        return {
            start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 2, 1)),
            endExclusive: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)),
        };
    }

    if (period === 'this-year') {
        return {
            start: new Date(Date.UTC(now.getUTCFullYear(), 0, 1)),
            endExclusive: new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1)),
        };
    }

    if (period === 'custom') {
        if (!from || !to) {
            return null;
        }

        const start = new Date(`${from}T00:00:00.000Z`);
        const endExclusive = new Date(`${to}T00:00:00.000Z`);
        endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

        if (Number.isNaN(start.getTime()) || Number.isNaN(endExclusive.getTime()) || start >= endExclusive) {
            return null;
        }

        return { start, endExclusive };
    }

    // Handle dynamic month filters like "2026-03".
    if (/^\d{4}-\d{2}$/.test(period)) {
        const [yearString, monthString] = period.split('-');
        const year = Number(yearString);
        const monthIndex = Number(monthString) - 1;

        if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
            return null;
        }

        return {
            start: new Date(Date.UTC(year, monthIndex, 1)),
            endExclusive: new Date(Date.UTC(year, monthIndex + 1, 1)),
        };
    }

    return null;
}


export async function getRechargeMonthOptions(meterId: string): Promise<RechargeMonthOption[]> {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from('recharges')
        .select('created_at')
        .eq('meter_id', meterId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });

    const uniqueMonths = new Map<string, RechargeMonthOption>();

    for (const row of data ?? []) {
        const date = new Date(row.created_at);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const value = `${year}-${String(month).padStart(2, '0')}`;

        if (!uniqueMonths.has(value)) {
            uniqueMonths.set(value, {
                value,
                label: formatter.format(date),
            });
        }
    }

    return [...uniqueMonths.values()].sort((a, b) => b.value.localeCompare(a.value));
}


//get paginated recharges for a meter
export async function getRecharges(
    meterId: string,
    options: RechargeFilterOptions & { page?: number; pageSize?: number } = {},
) {
    const supabase = await supabaseServer();
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const dateRange = getRechargeDateRange(options);

    let query = supabase
        .from('recharges')
        .select('*', { count: 'exact' })
        .eq('meter_id', meterId)
        .order('created_at', { ascending: false });

    if (dateRange) {
        query = query
            .gte('created_at', dateRange.start.toISOString())
            .lt('created_at', dateRange.endExclusive.toISOString());
    }

    const { data, count, error } = await query.range(from, to);

    if (error) throw new Error(error.message);

    return {
        recharges: data ?? [],
        totalCount: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / pageSize),
        currentPage: page,
    };
}

