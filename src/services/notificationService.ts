import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { db } from '../firebase';
import { Appointment } from '../types';

// Lazy initialized SMTP transporter
let transporterInstance: nodemailer.Transporter | null = null;
let transporterInitialized = false;

const getTransporter = () => {
  if (transporterInitialized) {
    return transporterInstance;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('\n=============================================================');
    console.log('[Notification Engine] SMTP variables not fully configured in environment.');
    console.log(`SMTP_HOST: ${host ? 'Configured ✅' : 'NOT FOUND ❌'}`);
    console.log(`SMTP_USER: ${user ? 'Configured ✅' : 'NOT FOUND ❌'}`);
    console.log(`SMTP_PASS: ${pass ? 'Configured ✅' : 'NOT FOUND ❌'}`);
    console.log('Fallback Simulation: Email notifications will be outputted to terminal logs.');
    console.log('=============================================================\n');
    transporterInitialized = true;
    transporterInstance = null;
    return null;
  }

  try {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log('=============================================================');
    console.log('[Notification Engine] Nodemailer SMTP connection created successfully ✅');
    console.log(`Sender: ${process.env.SMTP_FROM || 'no-reply@lawofnexus.com'}`);
    console.log('=============================================================');
  } catch (error) {
    console.error('[Notification Engine] Error initializing SMTP transport:', error);
    transporterInstance = null;
  }

  transporterInitialized = true;
  return transporterInstance;
};

// Main function to format and send the status update email
const sendStatusEmail = async (appointmentId: string, appointment: Appointment, newStatus: 'approved' | 'rejected') => {
  const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const dashboardUrl = `${appUrl}/dashboard`;

  try {
    // 1. Fetch user's profile to obtain email address
    const userDocRef = doc(db, 'users', appointment.userId);
    const userSnapshot = await getDoc(userDocRef);
    let email = '';
    let clientName = appointment.name || 'Valued Client';

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      email = userData.email || '';
      if (userData.name) {
        clientName = userData.name;
      }
    }

    if (!email) {
      console.warn(`[Notification Engine] Skipping notification for appointment ${appointmentId}: No associated user profile or email found for userId ${appointment.userId}.`);
      return;
    }

    const emailSubject = newStatus === 'approved' 
      ? `Appointment Approved - LAW OF NEXUS` 
      : `Appointment Status Update - LAW OF NEXUS`;

    const fromAddress = process.env.SMTP_FROM || '"LAW OF NEXUS" <no-reply@lawofnexus.com>';

    let htmlContent = '';
    if (newStatus === 'approved') {
      htmlContent = `
        <div style="font-family: 'Georgia', serif; background-color: #fcfcfc; padding: 40px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-top: 4px solid #c5a880;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: normal;">LAW OF NEXUS</h1>
            <p style="color: #c5a880; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Advocate Debdip Mandal</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #f1f1f1; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #16a34a; font-size: 18px; margin-top: 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">Appointment Approved / অ্যাপয়েন্টমেন্ট অনুমোদিত</h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #333333;">
              Dear <strong>${clientName}</strong>,<br><br>
              Your consultation schedule request with <strong>Advocate Debdip Mandal</strong> has been <strong>APPROVED</strong>.
            </p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #c5a880;">
              <table style="width: 100%; font-size: 13px; color: #4b5563; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 45%;">Case Type / মামলার ধরন:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.caseType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Date / তারিখ:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Time / সময়:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.time}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #333333;">
              প্রিয় <strong>${clientName}</strong>,<br>
              <strong>অ্যাডভোকেট দেবদীপ মণ্ডল</strong>-এর সাথে আপনার আইনি পরামর্শের অনুরোধটি <strong>অনুমোদন করা হয়েছে</strong>। অনুগ্রহ করে উপরে উল্লিখিত তারিখে ও সময়ে প্রস্তুত বা উপস্থিত থাকিবেন।
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${dashboardUrl}" style="background-color: #c5a880; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: bold; letter-spacing: 1px; display: inline-block;">VIEW DASHBOARD / ড্যাশবোর্ড দেখুন</a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888888;">
            <p style="margin: 0;">LAW OF NEXUS &copy; 2026. All Rights Reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated legal notification regarding your scheduled consultation.</p>
          </div>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: 'Georgia', serif; background-color: #fcfcfc; padding: 40px; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e5e5e5; border-top: 4px solid #dc2626;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; margin: 0; font-weight: normal;">LAW OF NEXUS</h1>
            <p style="color: #c5a880; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Advocate Debdip Mandal</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #f1f1f1; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #dc2626; font-size: 18px; margin-top: 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">Appointment Canceled / অ্যাপয়েন্টমেন্ট বাতিল</h2>
            
            <p style="font-size: 14px; line-height: 1.6; color: #333333;">
              Dear <strong>${clientName}</strong>,<br><br>
              We regret to inform you that your appointment request with <strong>Advocate Debdip Mandal</strong> has been <strong>DECLINED / CANCELED</strong> due to court sessions alignment issues.
            </p>

            <div style="background-color: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #dc2626;">
              <table style="width: 100%; font-size: 13px; color: #4b5563; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 45%;">Case Type / মামলার ধরন:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.caseType}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Requested Date / তারিখ:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.date}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold;">Requested Time / সময়:</td>
                  <td style="padding: 6px 0; color: #1f2937;">${appointment.time}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #333333;">
              প্রিয় <strong>${clientName}</strong>,<br>
              দুঃখিত, <strong>অ্যাডভোকেট দেবদীপ মণ্ডল</strong>-এর সাথে আপনার অ্যাপয়েন্টমেন্ট অনুরোধটি <strong>বাতিল করা হয়েছে</strong>। অন্য কোনো তারিখে পুনরায় আইনি সেশন বুক করার জন্য আপনার ড্যাশবোর্ড ব্যবহার করুন।
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${dashboardUrl}" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 13px; font-weight: bold; letter-spacing: 1px; display: inline-block;">RE-BOOK APPOINTMENT / পুনরায় বুক করুন</a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; font-size: 11px; color: #888888;">
            <p style="margin: 0;">LAW OF NEXUS &copy; 2026. All Rights Reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated legal notification regarding your scheduled consultation.</p>
          </div>
        </div>
      `;
    }

    const textContent = `
      LAW OF NEXUS - Advocate Debdip Mandal
      -------------------------------------
      Dear ${clientName},
      
      Your consultation schedule request with Advocate Debdip Mandal has been ${newStatus.toUpperCase()}.
      
      Details:
      - Case Type: ${appointment.caseType}
      - Date: ${appointment.date}
      - Time: ${appointment.time}
      
      Please visit your dashboard to view more details: ${dashboardUrl}
    `;

    const transporter = getTransporter();

    if (transporter) {
      // Real Email Dispatch
      const info = await transporter.sendMail({
        from: fromAddress,
        to: email,
        subject: emailSubject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[Notification Engine] Email dispatched successfully to: ${email}`);
      console.log(`MessageId: ${info.messageId}`);
    } else {
      // Fallback Console Simulation Logger
      console.log('\n--- SIMULATED AUTOMATED EMAIL DISPATCH ---');
      console.log(`FROM: ${fromAddress}`);
      console.log(`TO: ${email}`);
      console.log(`SUBJECT: ${emailSubject}`);
      console.log(`TEXT CONTENT:\n${textContent}`);
      console.log('-------------------------------------------\n');
    }

  } catch (error) {
    console.error(`[Notification Engine] Error dispatching email notification for appointment ${appointmentId}:`, error);
  }
};

// Start the Firestore snapshot-based listener
export const startAppointmentNotificationListener = () => {
  console.log('[Notification Engine] Initializing appointment state snapshot monitor...');

  const statusCache = new Map<string, 'pending' | 'approved' | 'rejected' | 'completed'>();
  const appointmentsQuery = query(collection(db, 'appointments'));

  const unsubscribe = onSnapshot(
    appointmentsQuery,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const appData = change.doc.data() as Appointment;
        const currentStatus = appData.status;

        if (change.type === 'added') {
          // Cache the initial status present on load to prevent spamming notifications for old records on server start
          statusCache.set(id, currentStatus);
        } else if (change.type === 'modified') {
          const previousStatus = statusCache.get(id);

          if (previousStatus && previousStatus !== currentStatus) {
            console.log(`[Notification Engine] Status transition detected for appointment ${id}: '${previousStatus}' -> '${currentStatus}'`);
            
            if (currentStatus === 'approved' || currentStatus === 'rejected') {
              // Fire async email sending event
              sendStatusEmail(id, appData, currentStatus);
            }
          }
          statusCache.set(id, currentStatus);
        } else if (change.type === 'removed') {
          statusCache.delete(id);
        }
      });
    },
    (error) => {
      console.error('[Notification Engine] Error in Firestore snapshot listener:', error);
    }
  );

  return unsubscribe;
};
