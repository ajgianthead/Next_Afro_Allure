import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

// export async function POST() {
//     try {
//         const { data, error } = await resend.emails.send({
//             from: 'noreply <send@notifications.afroallure.co>',
//             to: ['abijah.nez@gmail.com'],
//             subject: 'Appointment Confirmed',
//             react: EmailTemplate({ firstName: 'Abijah' }),
//         });

//         if (error) {
//             return Response.json({ error }, { status: 500 });
//         }

//         return Response.json(data);
//     } catch (error) {
//         return Response.json({ error }, { status: 500 });
//     }
// }
