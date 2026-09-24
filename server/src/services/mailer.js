import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

export const sendEmailVerification = async (to, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: "Vérification de votre adresse email",
        html: `
            <p>Bonjour,</p>
            <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
            <p><a href="${verificationLink}">${verificationLink}</a></p>
        `,
    });
    console.log(`Verification email sent to ${to}`);
};
