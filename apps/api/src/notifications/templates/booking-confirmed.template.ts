import { baseTemplate } from './base.template';

export function bookingConfirmedTemplate(data: {
  customerName: string;
  caregiverName: string;
  serviceType: string;
  date: string;
  time: string;
}): string {
  return baseTemplate(`
    <h2 style="color: #0f766e; margin-top: 0;">Booking Confirmed! ✅</h2>
    <p style="color: #475569; font-size: 16px;">
      Hi ${data.customerName},
    </p>
    <p style="color: #475569; font-size: 16px;">
      Great news! Your booking has been confirmed.
    </p>
    <div style="background-color: #f0fdfa; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table width="100%" cellpadding="4" cellspacing="0">
        <tr>
          <td style="color: #64748b; font-size: 14px;">Caregiver:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.caregiverName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Service:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.serviceType}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Date:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.date}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-size: 14px;">Time:</td>
          <td style="color: #0f172a; font-size: 14px; font-weight: bold;">${data.time}</td>
        </tr>
      </table>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/customer/bookings"
       style="display: inline-block; background: linear-gradient(135deg, #0f766e, #14b8a6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
      View Booking Details
    </a>
  `);
}
