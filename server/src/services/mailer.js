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

export const sendEmailVerification = async (to, link, type) => {
    // const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    let title , content ;

    if (type === 'verification')
    {
        title = "Vérification de votre adresse email";
        content = `
            <p>Bonjour,</p>
            <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
            <p><a href="${link}">${link}</a></p>
        `
    }
    else
    {
        title = "Demande de modification de votre mot de passe";
        content = `
            <p>Bonjour,</p>
            <p>Veuillez cliquer sur le lien ci-dessous pour modifier votre adresse mot de passe :</p>
            <p><a href="${link}">${link}</a></p>
        `
    }
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: to,
        subject: title,
        html: content,
    });
    console.log(`Verification email sent to ${to}`);
};
