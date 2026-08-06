import type { CSSProperties } from 'react';

export type MeterTokenEmailProps = {
  firstName?: string | null;
  meterName?: string | null;
  meterNumber: string;
  token: string;
  units?: string | null;
  amount?: number | string | null;
  charges?: number | string | null;
  transactionDate?: string | Date | null;
  appUrl?: string | null;
  supportEmail?: string | null;
};

const colors = {
  background: '#f5ebdd',
  card: '#fff9ef',
  ink: '#102a2a',
  muted: '#6d6258',
  line: 'rgba(16, 42, 42, 0.14)',
  accent: '#f2b84b',
  warm: '#d95f43',
};

export function getMeterTokenEmailSubject(meterName?: string | null) {
  return meterName?.trim() ? `Your ${meterName.trim()} electricity token` : 'Your electricity token is ready';
}

export default function MeterTokenEmail({
  firstName,
  meterName,
  meterNumber,
  token,
  units,
  amount,
  charges,
  transactionDate,
  appUrl,
  supportEmail,
}: MeterTokenEmailProps) {
  const displayName = firstName?.trim() || 'there';
  const displayMeterName = meterName?.trim() || 'Electricity meter';
  const formattedAmount = formatMoney(amount);
  const formattedCharges = formatMoney(charges);
  const formattedTotalPaid = formatTotalPaid(amount, charges);
  const formattedDate = formatDate(transactionDate);
  const preheader = `Your token for ${displayMeterName} is ready. Meter number: ${meterNumber}.`;

  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.preheader}>{preheader}</div>

        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.shell}>
          <tbody>
            <tr>
              <td align="center" style={styles.outerCell}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.container}>
                  <tbody>
                    <tr>
                      <td style={styles.brandRow}>
                        <div style={styles.logoMark}>mu</div>
                        <div>
                          <p style={styles.brandName}>myUnits</p>
                          <p style={styles.brandTagline}>Electricity, kept simple.</p>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.hero}>
                        <p style={styles.kicker}>Token ready</p>
                        <h1 style={styles.title}>Hi {displayName}, your electricity token is ready.</h1>
                        <p style={styles.heroCopy}>
                          Use the token below on your meter keypad. We also saved this in your myUnits history so you
                          can find it again later.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.tokenCard}>
                        <p style={styles.label}>Meter token</p>
                        <p style={styles.token}>{token}</p>
                        <p style={styles.helper}>Keep this email until you have loaded the token successfully.</p>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.detailsCard}>
                        <DetailRow label="Meter" value={displayMeterName} />
                        <DetailRow label="Meter number" value={meterNumber} />
                        {units && <DetailRow label="Units" value={units} />}
                        {formattedAmount && <DetailRow label="Recharge amount" value={formattedAmount} />}
                        {formattedCharges && <DetailRow label="Charges" value={formattedCharges} />}
                        {formattedTotalPaid && <DetailRow label="Total paid" value={formattedTotalPaid} />}
                        {formattedDate && <DetailRow label="Date" value={formattedDate} />}
                      </td>
                    </tr>

                    {appUrl && (
                      <tr>
                        <td style={styles.ctaWrap}>
                          <a href={appUrl} style={styles.cta}>
                            View in myUnits
                          </a>
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td style={styles.noteCard}>
                        <p style={styles.noteTitle}>Quick note</p>
                        <p style={styles.noteCopy}>
                          If your meter does not accept the token immediately, wait a few minutes and try again. Make
                          sure the meter number above matches the meter you are loading.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style={styles.footer}>
                        <p style={styles.footerText}>
                          This email was sent because a recharge was completed on myUnits.
                          {supportEmail ? (
                            <>
                              {' '}
                              Need help? Contact us at{' '}
                              <a href={`mailto:${supportEmail}`} style={styles.footerLink}>
                                {supportEmail}
                              </a>
                              .
                            </>
                          ) : null}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={styles.detailRow}>
      <tbody>
        <tr>
          <td style={styles.detailLabel}>{label}</td>
          <td align="right" style={styles.detailValue}>
            {value}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function formatMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return null;

  const numberValue = parseMoney(value);
  if (!Number.isFinite(numberValue)) return String(value);

  return `NGN ${numberValue.toLocaleString()}`;
}

function formatTotalPaid(amount: MeterTokenEmailProps['amount'], charges: MeterTokenEmailProps['charges']) {
  const amountValue = parseMoney(amount);
  const chargesValue = parseMoney(charges);

  if (!Number.isFinite(amountValue) || !Number.isFinite(chargesValue)) return null;

  return `NGN ${(amountValue + chargesValue).toLocaleString()}`;
}

function parseMoney(value: number | string | null | undefined) {
  if (value == null || value === '') return Number.NaN;
  if (typeof value === 'number') return value;

  return Number(value.replace(/[^\d.-]/g, ''));
}

function formatDate(value: MeterTokenEmailProps['transactionDate']) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

const styles: Record<string, CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: colors.background,
    color: colors.ink,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  preheader: {
    display: 'none',
    maxHeight: 0,
    overflow: 'hidden',
    opacity: 0,
    color: 'transparent',
  },
  shell: {
    width: '100%',
    background:
      'radial-gradient(circle at top left, rgba(242, 184, 75, 0.28), transparent 320px), linear-gradient(180deg, #f5ebdd 0%, #eadcc9 100%)',
  },
  outerCell: {
    padding: '28px 12px',
  },
  container: {
    width: '100%',
    maxWidth: 640,
    margin: '0 auto',
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.card,
    border: `1px solid ${colors.line}`,
    boxShadow: '0 24px 70px rgba(16, 42, 42, 0.14)',
  },
  brandRow: {
    padding: '24px 24px 10px',
  },
  logoMark: {
    display: 'inline-block',
    width: 44,
    height: 44,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: colors.ink,
    color: colors.accent,
    fontSize: 14,
    fontWeight: 900,
    lineHeight: '44px',
    textAlign: 'center',
    verticalAlign: 'middle',
    letterSpacing: '-0.04em',
  },
  brandName: {
    display: 'inline-block',
    margin: '0 0 2px',
    color: colors.ink,
    fontSize: 18,
    fontWeight: 900,
    lineHeight: '22px',
    verticalAlign: 'middle',
  },
  brandTagline: {
    margin: '0 0 0 60px',
    color: colors.muted,
    fontSize: 12,
    lineHeight: '18px',
  },
  hero: {
    padding: '18px 24px 26px',
    backgroundColor: colors.ink,
    backgroundImage:
      'radial-gradient(circle at 82% 12%, rgba(242, 184, 75, 0.35), transparent 180px), radial-gradient(circle at 0% 100%, rgba(217, 95, 67, 0.22), transparent 220px)',
  },
  kicker: {
    margin: '0 0 14px',
    color: colors.accent,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: '#fff9ef',
    fontSize: 34,
    lineHeight: '39px',
    fontWeight: 900,
    letterSpacing: '-0.04em',
  },
  heroCopy: {
    maxWidth: 520,
    margin: '16px 0 0',
    color: 'rgba(255, 249, 239, 0.74)',
    fontSize: 15,
    lineHeight: '24px',
  },
  tokenCard: {
    padding: '24px',
    backgroundColor: '#fff4d6',
    borderBottom: `1px solid ${colors.line}`,
  },
  label: {
    margin: '0 0 10px',
    color: colors.muted,
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  token: {
    margin: 0,
    color: colors.ink,
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    fontSize: 28,
    lineHeight: '38px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    wordBreak: 'break-word',
  },
  helper: {
    margin: '12px 0 0',
    color: colors.muted,
    fontSize: 13,
    lineHeight: '20px',
  },
  detailsCard: {
    padding: '18px 24px',
  },
  detailRow: {
    borderBottom: `1px solid ${colors.line}`,
  },
  detailLabel: {
    width: '44%',
    padding: '13px 0',
    color: colors.muted,
    fontSize: 13,
    lineHeight: '18px',
  },
  detailValue: {
    padding: '13px 0 13px 12px',
    color: colors.ink,
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 800,
    wordBreak: 'break-word',
  },
  ctaWrap: {
    padding: '4px 24px 24px',
  },
  cta: {
    display: 'block',
    width: '100%',
    borderRadius: 18,
    backgroundColor: colors.ink,
    color: '#fff9ef',
    fontSize: 15,
    fontWeight: 900,
    lineHeight: '52px',
    textAlign: 'center',
    textDecoration: 'none',
  },
  noteCard: {
    padding: '20px 24px',
    backgroundColor: 'rgba(242, 184, 75, 0.18)',
    borderTop: `1px solid ${colors.line}`,
  },
  noteTitle: {
    margin: '0 0 6px',
    color: colors.ink,
    fontSize: 15,
    fontWeight: 900,
  },
  noteCopy: {
    margin: 0,
    color: colors.muted,
    fontSize: 14,
    lineHeight: '22px',
  },
  footer: {
    padding: '20px 24px 26px',
  },
  footerText: {
    margin: 0,
    color: colors.muted,
    fontSize: 12,
    lineHeight: '20px',
    textAlign: 'center',
  },
  footerLink: {
    color: colors.warm,
    fontWeight: 800,
    textDecoration: 'none',
  },
};
