export function orderConfirmedEmailTemplate({
  name,
  email,
  orderNumber,
  totalAmount,
  currency,
  items,
}: {
  name: string;
  email: string;
  orderNumber: string;
  totalAmount: string;
  currency: string;
  items: { productName: string; variantName?: string | null; quantity: number }[];
}) {
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 6px 0; color: #333;">${item.productName}${
            item.variantName ? ` &mdash; ${item.variantName}` : ""
          }</td>
          <td style="padding: 6px 0; color: #333; text-align: center;">${item.quantity}</td>
        </tr>`,
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; margin: 0; padding: 24px; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
    <div style="background: #0B2D45; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed!</h1>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
      <p style="font-size: 16px; color: #333;">Your payment has been received. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px 0; color: #666;">Order Number</td><td style="padding: 8px 0; font-weight: 600;">${orderNumber}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Total Paid</td><td style="padding: 8px 0; font-weight: 600;">${currency} ${totalAmount}</td></tr>
        <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; font-weight: 600;">${email}</td></tr>
      </table>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f5f5f5;">
          <th style="padding: 8px; text-align: left; color: #666;">Item</th>
          <th style="padding: 8px; color: #666;">Qty</th>
        </tr>
        ${itemRows}
      </table>
      <p style="font-size: 14px; color: #999; margin-top: 24px;">If you have any questions, please contact us.</p>
    </div>
    <div style="background: #f9f9f9; padding: 16px; text-align: center; font-size: 12px; color: #999;">
      Thank you for shopping with us
    </div>
  </div>
</body>
</html>`;
}
