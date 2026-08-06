'use server';

import { Resend } from 'resend';
import { getCurrentUser } from './auth-actions';
import {
  getMeterTokenEmailSubject,
  MeterTokenEmail,
  type MeterTokenEmailProps,
} from '@/components/emails';

type SendMeterTokenEmailInput = Omit<MeterTokenEmailProps, 'firstName'> & {
  idempotencyKey?: string | null;
  subject?: string | null;
};

type SendMeterTokenEmailResult = {
  ok: boolean;
  message: string;
  emailId?: string;
};

export async function sendMeterTokenEmailAction(
  input: SendMeterTokenEmailInput,
): Promise<SendMeterTokenEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL || process.env.SUPPORT_EMAIL || undefined;
  const user = await getCurrentUser();
  const recipientEmail = user?.email?.trim().toLowerCase() || '';
  const firstName = user?.profile?.first_name ? String(user.profile.first_name).trim() : null;

  if (!apiKey || !from) {
    console.error('Skipping meter token email because Resend is not configured.', {
      hasApiKey: Boolean(apiKey),
      hasFrom: Boolean(from),
    });

    return {
      ok: false,
      message: 'Email is not configured yet.',
    };
  }

  if (!user) {
    return {
      ok: false,
      message: 'You need to be signed in before we can send this email.',
    };
  }

  if (!isEmail(recipientEmail)) {
    return {
      ok: false,
      message: 'Your account does not have a valid email address.',
    };
  }

  if (!input.meterNumber?.trim() || !input.token?.trim()) {
    return {
      ok: false,
      message: 'Meter number and token are required before sending an email.',
    };
  }

  const emailProps: MeterTokenEmailProps = {
    firstName,
    meterName: input.meterName,
    meterNumber: input.meterNumber.trim(),
    token: input.token.trim(),
    units: input.units,
    amount: input.amount,
    charges: input.charges,
    transactionDate: input.transactionDate,
    appUrl: input.appUrl ?? process.env.APP_URL ?? null,
    supportEmail: input.supportEmail ?? process.env.SUPPORT_EMAIL ?? null,
  };

  const subject = input.subject?.trim() || getMeterTokenEmailSubject(emailProps.meterName);
  const text = renderMeterTokenEmailText(emailProps);
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send(
      {
        from,
        to: recipientEmail,
        subject,
        react: MeterTokenEmail(emailProps),
        text,
        ...(replyTo ? { replyTo } : {}),
      },
      input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : undefined,
    );

    if (error) {
      console.error('Failed to send meter token email through Resend.', {
        resendError: error,
      });

      return {
        ok: false,
        message: 'We could not send the token email right now.',
      };
    }

    return {
      ok: true,
      message: 'Token email sent.',
      emailId: data.id,
    };
  } catch (error) {
    console.error('Unexpected error while sending meter token email.', error);

    return {
      ok: false,
      message: 'We could not send the token email right now.',
    };
  }
}

function renderMeterTokenEmailText(props: MeterTokenEmailProps) {
  const lines = [
    `Your electricity token is ready.`,
    ``,
    `Meter: ${props.meterName?.trim() || 'Electricity meter'}`,
    `Meter number: ${props.meterNumber}`,
    `Token: ${props.token}`,
    props.units ? `Units: ${props.units}` : null,
    formatMoneyLine('Recharge amount', props.amount),
    formatMoneyLine('Charges', props.charges),
    formatTotalPaidLine(props.amount, props.charges),
    props.transactionDate ? `Date: ${new Date(props.transactionDate).toLocaleString()}` : null,
    ``,
    `If your meter does not accept the token immediately, wait a few minutes and try again.`,
    props.appUrl ? `View in myUnits: ${props.appUrl}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

function formatMoneyLine(label: string, value: number | string | null | undefined) {
  const formattedValue = formatMoney(value);
  return formattedValue ? `${label}: ${formattedValue}` : null;
}

function formatTotalPaidLine(amount: number | string | null | undefined, charges: number | string | null | undefined) {
  const amountValue = parseMoney(amount);
  const chargesValue = parseMoney(charges);

  if (!Number.isFinite(amountValue) || !Number.isFinite(chargesValue)) return null;

  return `Total paid: NGN ${(amountValue + chargesValue).toLocaleString()}`;
}

function formatMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return null;

  const numberValue = parseMoney(value);
  if (!Number.isFinite(numberValue)) return String(value);

  return `NGN ${numberValue.toLocaleString()}`;
}

function parseMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return Number.NaN;
  if (typeof value === 'number') return value;

  return Number(value.replace(/[^\d.-]/g, ''));
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
