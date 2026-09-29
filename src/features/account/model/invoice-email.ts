/** Omit the recipient when the customer chooses the invoice's billing email. */
export function invoiceEmailBody(customEmail?: string): { recipientEmail?: string } {
  const recipientEmail = customEmail?.trim()
  return recipientEmail ? { recipientEmail } : {}
}
