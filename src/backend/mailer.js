import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_PORT = process.env.SMTP_PORT;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
});

export async function main(email = "i.like.lepoulet@gmail.com", commands = []) {
    // The html of the ticket with the ticket details
    const generateTicketHTML = (commands) => {
        if (!commands || commands.length === 0) {
            return "<p>Aucun billet n'a été trouvé dans votre commande.</p>";
        }

        let ticketsHTML = "";
        commands.forEach((cmd, index) => {
            // Check if travel_info exists
            if (!cmd.travel_info) {
                console.error("Objet command incomplet:", cmd);
                return "<p>Erreur: impossible d'afficher les détails du billet.</p>";
            }
            
            // Ensure that a reservation number is always present
            const reservationNumber = cmd.reservation_number || `SR-TEMP-${Date.now()}-${index}`;
            
            const travelInfo = cmd.travel_info;
            ticketsHTML += `
            <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; border-radius: 5px; background-color: #f9f9f9;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="color: #0066cc; margin: 0;">Billet #${index + 1}</h3>
                    <div style="background-color: #0066cc; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold; font-size: 12px;">
                        ${reservationNumber}
                    </div>
                </div>
                
                <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">
                        ${travelInfo.departure} → ${travelInfo.arrival}
                    </div>
                    <div>
                        <span style="color: #555;">Le ${travelInfo.date} • Départ à ${travelInfo.time}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0;"><strong>Référence Train:</strong></td>
                            <td style="padding: 5px 0;">${travelInfo.train_ref || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0;"><strong>Siège:</strong></td>
                            <td style="padding: 5px 0;">${cmd.seat || 'Non assigné'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0;"><strong>Prix:</strong></td>
                            <td style="padding: 5px 0;">${travelInfo.price.toFixed(2)}€</td>
                        </tr>
                        ${cmd.options && cmd.options.length > 0 ? `
                        <tr>
                            <td style="padding: 5px 0;"><strong>Options:</strong></td>
                            <td style="padding: 5px 0;">${cmd.options.join(', ')}</td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                ${cmd.ticket_reference ? `
                <div style="border-top: 1px dashed #ccc; padding-top: 15px; margin-top: 15px; text-align: center;">
                    <!-- Simulation d'un code-barre avec une image générique -->
                    <div style="margin-bottom: 10px;">
                        <img src="https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(cmd.ticket_reference)}&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&codepage=&qunit=Mm&quiet=0" alt="Code-barre du billet" style="max-width: 100%; height: auto;"/>
                    </div>
                    <div style="font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 1px; padding: 5px 0;">
                        ${cmd.ticket_reference}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Présentez ce code lors de l'embarquement
                    </div>
                </div>
                ` : `
                <div style="border-top: 1px dashed #ccc; padding-top: 15px; margin-top: 15px; text-align: center;">
                    <div style="font-family: monospace; font-size: 14px; font-weight: bold; letter-spacing: 1px; padding: 5px 0;">
                        Référence: ${reservationNumber}
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Présentez ce code lors de l'embarquement
                    </div>
                </div>
                `}
            </div>
            `;
        });

        return ticketsHTML;
    };

    // send mail with defined transport object :
    const info = await transporter.sendMail({
        from: `"SwiftRail Réservation" <${SMTP_USER}>`,
        to: email,
        subject: "Confirmation de votre réservation SwiftRail",
        text: "Merci pour votre réservation sur SwiftRail. Veuillez trouver les détails de vos billets en pièce jointe ou dans cet email.", 
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h1 style="color: #0066cc;">SwiftRail</h1>
                <h2>Confirmation de réservation</h2>
            </div>
            
            <div style="padding: 20px;">
                <p>Cher client,</p>
                <p>Nous vous remercions pour votre réservation. Veuillez trouver ci-dessous les détails de vos billets :</p>
                
                ${generateTicketHTML(commands)}
                
                <p>Pour toute question concernant votre réservation, n'hésitez pas à nous contacter.</p>
                <p>Bon voyage!</p>
                <p>L'équipe SwiftRail</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                <p>Ce message est automatique, merci de ne pas y répondre.</p>
                <p>&copy; ${new Date().getFullYear()} SwiftRail. Tous droits réservés.</p>
            </div>
        </div>
        `,
    });

    console.log("Message sent: %s", info.messageId);
    return info;
}