export type VtPassRechargeResponse = {
    code?: string;
    response_description?: string;
    requestId?: string;
    purchased_code?: string | null;
    token?: string | null;
    Token?: string | null;
    units?: string | null;
    PurchasedUnits?: string | null;
    content?: {
        transactions?: {
            status?: string | null;
            extras?: string | null;
        }
    };
    [key: string]: unknown;
}

export type VtPassRechargeResult = {
    ok: boolean;
    status: 'success' | 'failed' | 'pending' | 'reversed' | 'requery_required';
    code: string;
    message: string;
    requestId?: string;
    transactionStatus?: string | null;
    token: string | null;
    units: string | null;
    data: VtPassRechargeResponse;
}

const vtPassRechargeResponseMessages: Record<string, string> = {
    '000': 'Transaction processed. Checking delivery status.',
    '001': 'Transaction query received. Checking delivery status.',
    '010': 'Invalid variation code. Please check the meter type and try again.',
    '011': 'Invalid request. Please check the recharge details and try again.',
    '012': 'Product does not exist. Please check the selected distribution company.',
    '013': 'The recharge amount is below the minimum allowed.',
    '014': 'Duplicate request ID. Please try again.',
    '015': 'Invalid request ID. The transaction could not be found on VTpass.',
    '016': 'Transaction failed.',
    '017': 'The recharge amount is above the maximum allowed.',
    '018': 'Low VTpass wallet balance.',
    '019': 'Likely duplicate transaction. Please wait before trying again.',
    '021': 'VTpass account is locked.',
    '022': 'VTpass account is suspended.',
    '023': 'API access is not enabled for this VTpass account.',
    '024': 'VTpass account is inactive.',
    '025': 'Recipient bank is invalid.',
    '026': 'Recipient account could not be verified.',
    '027': 'Server IP is not whitelisted on VTpass.',
    '028': 'This product is not whitelisted on the VTpass account.',
    '030': 'The biller is not reachable at this time. Please try again later.',
    '031': 'Quantity is below the minimum allowed.',
    '032': 'Quantity is above the maximum allowed.',
    '034': 'This service is currently suspended.',
    '035': 'This service is currently inactive.',
    '040': 'Transaction reversed.',
    '044': 'Transaction resolved. Please contact VTpass for more information.',
    '083': 'VTpass returned a system error. Please try again later.',
    '085': 'Invalid request ID format. The request ID must contain a valid date.',
    '087': 'Invalid VTpass credentials.',
    '089': 'Request is still processing. Please wait before making another request.',
    '091': 'Transaction was not processed and should not be charged.',
    '099': 'Transaction is still processing. Requery is required.',
};

const vtPassStatusRequeryRequired = new Set(['initiated', 'pending']);
const vtPassCodeRequeryRequired = new Set(['089', '099']);
const vtPassCodeNeedsTransactionStatus = new Set(['000', '001']);
const vtPassReversedCodes = new Set(['040']);

function getLagosRequestIdPrefix() {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).formatToParts(new Date());

    const valueByType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${valueByType.year}${valueByType.month}${valueByType.day}${valueByType.hour}${valueByType.minute}`;
}

export function generateVtPassRequestId() {
    return `${getLagosRequestIdPrefix()}${Math.random().toString(36).slice(2, 12)}`;
}

function normalizeVtPassToken(value: unknown) {
    if (typeof value !== 'string') return null;

    let token = value.trim();
    while (/^token\s*:/i.test(token)) {
        token = token.replace(/^token\s*:\s*/i, '').trim();
    }

    return token || null;
}

function getVtPassToken(data: VtPassRechargeResponse) {
    return normalizeVtPassToken(
        data.token
        ?? data.Token
        ?? data.purchased_code
        ?? data.content?.transactions?.extras
        ?? null
    );
}

function getVtPassUnits(data: VtPassRechargeResponse) {
    const units = data.units ?? data.PurchasedUnits;
    return typeof units === 'string' && units.trim() ? units.trim() : null;
}

export async function requeryUnclearVtPassTransaction(requestId: string | undefined, data: VtPassRechargeResponse, message: string): Promise<VtPassRechargeResult> {
    return {
        ok: false,
        status: 'requery_required',
        code: data.code ?? 'unknown',
        message,
        requestId,
        transactionStatus: data.content?.transactions?.status ?? null,
        token: null,
        units: null,
        data,
    };
}

export async function getVtPassRechargeResult(data: VtPassRechargeResponse, requestId?: string): Promise<VtPassRechargeResult> {
    const code = data.code ?? 'unknown';
    const transactionStatus = data.content?.transactions?.status?.toLowerCase() ?? null;
    const message = data.response_description || vtPassRechargeResponseMessages[code] || 'VTpass transaction status is unclear. Please requery the transaction.';
    const resolvedRequestId = data.requestId ?? requestId;

    if (vtPassCodeNeedsTransactionStatus.has(code)) {
        if (transactionStatus === 'delivered') {
            return {
                ok: true,
                status: 'success',
                code,
                message: data.response_description || 'Transaction successful.',
                requestId: resolvedRequestId,
                transactionStatus,
                token: getVtPassToken(data),
                units: getVtPassUnits(data),
                data,
            };
        }

        if (transactionStatus && vtPassStatusRequeryRequired.has(transactionStatus)) {
            return requeryUnclearVtPassTransaction(resolvedRequestId, data, 'Transaction is still pending. Please requery to confirm the final status.');
        }

        return requeryUnclearVtPassTransaction(resolvedRequestId, data, 'VTpass processed the transaction, but the delivery status is unclear. Please requery to confirm the final status.');
    }

    if (vtPassCodeRequeryRequired.has(code)) {
        return requeryUnclearVtPassTransaction(resolvedRequestId, data, message);
    }

    if (vtPassReversedCodes.has(code)) {
        return {
            ok: false,
            status: 'reversed',
            code,
            message,
            requestId: resolvedRequestId,
            transactionStatus,
            token: null,
            units: null,
            data,
        };
    }

    return {
        ok: false,
        status: 'failed',
        code,
        message,
        requestId: resolvedRequestId,
        transactionStatus,
        token: null,
        units: null,
        data,
    };
}
