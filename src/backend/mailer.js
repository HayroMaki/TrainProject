import nodemailer from "nodemailer";
import dotenv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

dotenv.config();

// Obtenir le chemin du répertoire temporaire
const tempDir = os.tmpdir();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

/**
 * Génère un fichier PDF contenant plusieurs billets
 * @param {Array} commands - Liste des commandes (billets)
 * @returns {Promise<string>} Chemin du fichier PDF généré
 */
const generateMultipleTicketsPDF = async (commands) => {
    if (!commands || commands.length === 0) {
        throw new Error("Aucun billet à générer");
    }
    
    // Si un seul billet, on utilise la fonction de billet unique
    if (commands.length === 1) {
        const reservationNumber = generateReservationNumber();
        return generateTicketPDF(commands[0], reservationNumber);
    }
    
    // Créer un nouveau document PDF pour plusieurs billets
    const reservationNumber = generateReservationNumber();
    const pdfPath = path.join(tempDir, `billets-${reservationNumber}.pdf`);
    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        info: {
            Title: `Billets SwiftRail`,
            Author: 'SwiftRail',
            Subject: 'Billets de train',
            Keywords: 'train, voyage, billets, swiftrail',
            Creator: 'SwiftRail Booking System',
        }
    });
    
    // Pipe du document dans un fichier
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Pour chaque billet, on génère une page
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const individualReservationNumber = `${reservationNumber}-${i+1}`;
        
        const { travel_info, options, seat } = command;
        
        // Extraire le numéro de voiture et de siège
        let carNumber = "?";
        let seatNumber = "?";
        
        if (seat && typeof seat === 'string' && seat.includes('-')) {
            const seatParts = seat.split('-');
            if (seatParts.length >= 2) {
                carNumber = seatParts[0];
                seatNumber = seatParts[1];
            }
        } else if (seat && typeof seat === 'string') {
            seatNumber = seat;
        }
        
        // Formater les heures et durée pour l'affichage
        const departureTime = travel_info.time;
        const durationHours = Math.floor(travel_info.length / 60);
        const durationMinutes = travel_info.length % 60;
        const durationFormatted = `${durationHours}h${durationMinutes > 0 ? durationMinutes.toString().padStart(2, '0') : '00'}`;
        const arrivalTime = calculateArrivalTime(departureTime, travel_info.length);
        
        // Générer le prix total
        const optionsPrice = calculateOptionsPrice(options);
        const totalPrice = calculateTotalPrice(travel_info.price, options);
        
        // Couleurs principales
        const colorPrimary = '#0b486b';
        const colorSecondary = '#1a8a89';
        const colorGray = '#666666';
        const colorLightGray = '#f5f5f5';
        
        // Fonction pour dessiner la bordure arrondie avec fond
        const drawBox = (x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 1) => {
            doc.roundedRect(x, y, width, height, radius)
               .fillAndStroke(fillColor, strokeColor)
               .lineWidth(strokeWidth);
        };
        
        // Si ce n'est pas le premier billet, on ajoute une nouvelle page
        if (i > 0) {
            doc.addPage();
        }
        
        // Dessiner le fond du billet
        drawBox(10, 10, doc.page.width - 20, doc.page.height - 20, 10, 'white', colorSecondary, 2);
        
        // En-tête du billet
        const gradientOptions = {
            gradient: {
                stops: [
                    { offset: 0, color: colorPrimary },
                    { offset: 1, color: colorSecondary }
                ],
                coords: { x1: 0, y1: 0, x2: doc.page.width, y2: 0 }
            }
        };
        
        doc.save()
           .roundedRect(10, 10, doc.page.width - 20, 70, { tl: 10, tr: 10, bl: 0, br: 0 })
           .fill(gradientOptions.gradient)
           .restore();
        
        // Titre du billet
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill('white')
           .text(i === 0 ? 'BILLET ALLER' : 'BILLET RETOUR', 0, 30, { align: 'center' });
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('white')
           .text('SwiftRail - Votre voyage en toute simplicité', 0, 60, { align: 'center' });
        
        // Bande d'information
        drawBox(10, 82, doc.page.width - 20, 50, 0, colorLightGray, 'white', 0);
        
        // Informations de réservation
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fill(colorGray)
           .text('RÉSERVATION', 30, 92);
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(`#${individualReservationNumber}`, 30, 108);
        
        // Informations du train
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fill(colorGray)
           .text('TRAIN', doc.page.width - 150, 92, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(travel_info.train_ref, doc.page.width - 150, 108, { align: 'right' });
        
        // Séparateur
        doc.moveTo(10, 134)
           .lineTo(doc.page.width - 10, 134)
           .dash(4, { space: 4 })
           .stroke(colorGray);
        
        // Section principale - Trajet
        // Départ
        doc.font('Helvetica')
           .fontSize(12)
           .fill(colorGray)
           .text('DÉPART', 50, 160);
        
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill(colorPrimary)
           .text(travel_info.departure, 50, 175);
        
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .fill('black')
           .text(departureTime, 50, 205);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(travel_info.date, 50, 230);
        
        // Durée
        const middleX = doc.page.width / 2;
        const lineStartX = 140;
        const lineEndX = doc.page.width - 140;
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(durationFormatted, middleX - 20, 170, { align: 'center' });
        
        // Ligne de trajet
        doc.moveTo(lineStartX, 200)
           .lineTo(lineEndX, 200)
           .lineWidth(2)
           .stroke(colorSecondary);
        
        // Points de départ et d'arrivée
        doc.circle(lineStartX, 200, 6).fill(colorPrimary);
        doc.circle(lineEndX, 200, 6).fill(colorSecondary);
        
        // Arrivée
        doc.font('Helvetica')
           .fontSize(12)
           .fill(colorGray)
           .text('ARRIVÉE', doc.page.width - 50, 160, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill(colorSecondary)
           .text(travel_info.arrival, doc.page.width - 50, 175, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .fill('black')
           .text(arrivalTime, doc.page.width - 50, 205, { align: 'right' });
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(travel_info.date, doc.page.width - 50, 230, { align: 'right' });
        
        // Informations de place et options
        const boxWidth = (doc.page.width - 80) / 2;
        
        // Boîte des informations de place
        drawBox(40, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
        
        doc.moveTo(40, 300)
           .lineTo(40 + boxWidth, 300)
           .lineWidth(1)
           .stroke('#e9ecef');
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#555')
           .text('VOTRE PLACE', 60, 280);
        
        // Détails de la place
        const placeDetails = [
            { label: 'Voiture', value: carNumber },
            { label: 'Siège', value: seatNumber },
            { label: 'Classe', value: 'Standard' }
        ];
        
        let yPos = 310;
        placeDetails.forEach(detail => {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text(detail.label, 60, yPos);
            
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fill('black')
               .text(detail.value, boxWidth - 20, yPos, { align: 'right' });
            
            yPos += 30;
        });
        
        // Boîte des options
        drawBox(doc.page.width - 40 - boxWidth, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
        
        doc.moveTo(doc.page.width - 40 - boxWidth, 300)
           .lineTo(doc.page.width - 40, 300)
           .lineWidth(1)
           .stroke('#e9ecef');
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#555')
           .text('OPTIONS & SERVICES', doc.page.width - 40 - boxWidth + 20, 280);
        
        // Liste des options
        if (options && options.length) {
            let optionY = 310;
            let optionX = doc.page.width - 40 - boxWidth + 20;
            let currentLine = 0;
            
            options.forEach((option, index) => {
                if (currentLine > 2) {
                    optionX += 150;
                    optionY = 310;
                    currentLine = 0;
                }
                
                drawBox(optionX, optionY, 140, 25, 4, '#e6f3f3', '#bfdcdb', 1);
                
                doc.font('Helvetica')
                   .fontSize(12)
                   .fill(colorPrimary)
                   .text(option, optionX + 10, optionY + 7, { width: 120 });
                
                optionY += 30;
                currentLine++;
            });
        } else {
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#888')
               .text('Aucune option', doc.page.width - 40 - boxWidth + 20, 320);
        }
        
        // Boîte des tarifs
        drawBox(40, 410, doc.page.width - 80, 80, 6, colorLightGray, '#e9ecef', 1);
        
        // Détails des tarifs
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text('Tarif de base', 60, 425);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('black')
           .text(`${travel_info.price.toFixed(2)}€`, doc.page.width - 60, 425, { align: 'right' });
        
        if (options && options.length) {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text('Options', 60, 450);
            
            doc.font('Helvetica')
               .fontSize(14)
               .fill('black')
               .text(`+${optionsPrice.toFixed(2)}€`, doc.page.width - 60, 450, { align: 'right' });
        }
        
        // Ligne séparatrice pour le total
        doc.moveTo(60, 475)
           .lineTo(doc.page.width - 60, 475)
           .lineWidth(1)
           .stroke('#ddd');
        
        // Total
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#333')
           .text('Total', 60, 485);
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(`${totalPrice.toFixed(2)}€`, doc.page.width - 60, 485, { align: 'right' });
        
        // Code-barres (simulation)
        const barcodeY = 170;
        const barcodeHeight = 100;
        const barcodeWidth = 200;
        const barcodeX = doc.page.width - 80 - barcodeWidth / 2;
        
        // Dessiner le code-barres (simulation simple)
        for (let j = 0; j < 30; j++) {
            const x = barcodeX - barcodeWidth / 2 + j * (barcodeWidth / 30);
            const height = Math.random() * 40 + 60; // Hauteur aléatoire entre 60 et 100
            const barWidth = (barcodeWidth / 30) * 0.7; // Largeur de chaque barre
            
            doc.rect(x, barcodeY, barWidth, height)
               .fill('black');
        }
        
        // Numéro de réservation sous le code-barres
        doc.font('Courier')
           .fontSize(14)
           .fill('black')
           .text(individualReservationNumber, barcodeX - barcodeWidth / 2, barcodeY + barcodeHeight + 10, { align: 'center', width: barcodeWidth });
        
        // Pied de page
        doc.moveTo(10, doc.page.height - 60)
           .lineTo(doc.page.width - 10, doc.page.height - 60)
           .dash(4, { space: 4 })
           .stroke(colorGray);
        
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text('Billet transmis par email. Ce document électronique sert de preuve d'achat et de titre de transport.', 0, doc.page.height - 40, { align: 'center' });
        
        // Numéro de page
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text(`Page ${i+1}/${commands.length}`, 0, doc.page.height - 25, { align: 'center' });
    }
    
    // Finaliser le document
    doc.end();
    
    // Attendre que le fichier soit complètement écrit
    return new Promise((resolve, reject) => {
        doc.on('end', () => {
            resolve(pdfPath);
        });
        
        doc.on('error', (err) => {
            reject(err);
        });
    });
};
                                        
                                        <!-- Tarifs -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f0f4f8" style="border-radius: 6px; margin-bottom: 20px;">
                                            <tr>
                                                <td style="padding: 15px;">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td width="50%" style="font-size: 14px; color: #666; padding-bottom: 8px;">Tarif de base</td>
                                                            <td width="50%" style="font-size: 14px; text-align: right; padding-bottom: 8px;">${travel_info.price.toFixed(2)}€</td>
                                                        </tr>
                                                        ${options && options.length ? `
                                                        <tr>
                                                            <td width="50%" style="font-size: 14px; color: #666; padding-bottom: 8px;">Options</td>
                                                            <td width="50%" style="font-size: 14px; text-align: right; padding-bottom: 8px;">+${optionsPrice.toFixed(2)}€</td>
                                                        </tr>
                                                        ` : ''}
                                                        <tr>
                                                            <td colspan="2" style="border-top: 1px solid #ddd; padding-top: 8px;">
                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                    <tr>
                                                                        <td width="50%" style="font-size: 16px; font-weight: bold; color: #333;">Total</td>
                                                                        <td width="50%" style="font-size: 18px; font-weight: bold; color: #0b486b; text-align: right;">${totalPrice.toFixed(2)}€</td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    
                                    <!-- Code-barres et informations complémentaires (partie droite) -->
                                    <td width="30%" valign="top" bgcolor="#f8f9fa" style="padding: 20px; border-left: 1px dashed #ccc;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" height="100%">
                                            <tr>
                                                <td valign="top">
                                                    <div style="font-weight: bold; font-size: 16px; color: #0b486b; margin-bottom: 30px; letter-spacing: 3px; text-align: center;">
                                                        SWIFT RAIL
                                                    </div>
                                                    
                                                    <div style="margin-top: 30px; text-align: center;">
                                                        <img src="https://barcode.tec-it.com/barcode.ashx?data=${reservationNumber}&code=Code128&dpi=96" alt="Code-barres" style="max-width: 100%; height: 120px;">
                                                        <div style="font-family: monospace; margin-top: 8px; font-size: 14px; letter-spacing: 1px; color: #333;">${reservationNumber}</div>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td valign="bottom" style="padding-top: 30px; border-top: 1px solid #ddd; text-align: center;">
                                                    <div style="color: #666; font-size: 12px; margin-bottom: 5px;">CONDITIONS DE VOYAGE</div>
                                                    <a href="#" style="color: #1a8a89; text-decoration: none; font-size: 14px;">Consulter sur notre site</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Pied de page -->
                    <tr>
                        <td bgcolor="#f0f4f8" style="padding: 15px; border-top: 1px dashed #ccc; text-align: center; border-radius: 0 0 8px 8px;">
                            <div style="font-size: 12px; color: #666;">
                                Billet transmis par email. Ce document électronique sert de preuve d'achat et de titre de transport.
                                <div style="margin-top: 5px;">© ${new Date().getFullYear()} SwiftRail - Tous droits réservés</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

/**
 * Calcule l'heure d'arrivée en fonction de l'heure de départ et de la durée
 * @param {string} departureTime - L'heure de départ au format "HH:MM"
 * @param {number} durationMinutes - La durée du voyage en minutes
 * @returns {string} L'heure d'arrivée au format "HH:MM"
 */
const calculateArrivalTime = (departureTime, durationMinutes) => {
    const [hours, minutes] = departureTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + durationMinutes;
    
    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
    const arrivalMinutes = totalMinutes % 60;
    
    return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
};

/**
 * Calcule le prix total des options
 * @param {Array} options - Liste des options
 * @returns {number} Le prix total des options
 */
const calculateOptionsPrice = (options) => {
    const optionPrices = {
        "PLA_TRA": 3,
        "PRI_ELE": 2,
        "BAG_SUP": 5,
        "INF_SMS": 1,
        "GAR_ANN": 2.9,
        "Bagage supplémentaire": 5,
        "Garantie annulation": 2.9,
        "Place tranquille": 3,
        "Prise électrique": 2,
        "Information par SMS": 1
    };

    return options.reduce((total, opt) => {
        return total + (optionPrices[opt] || 0);
    }, 0);
};

/**
 * Calcule le prix total du billet (prix de base + options)
 * @param {number} basePrice - Le prix de base du billet
 * @param {Array} options - Liste des options
 * @returns {number} Le prix total
 */
const calculateTotalPrice = (basePrice, options) => {
    return basePrice + calculateOptionsPrice(options);
};

/**
 * Génère un fichier PDF pour un billet
 * @param {Object} command - L'objet commande contenant les informations du billet
 * @param {string} reservationNumber - Le numéro de réservation
 * @returns {Promise<string>} Chemin du fichier PDF généré
 */
const generateTicketPDF = async (command, reservationNumber) => {
    const { travel_info, options, seat } = command;
    
    // Extraire le numéro de voiture et de siège
    let carNumber = "?";
    let seatNumber = "?";
    
    if (seat && typeof seat === 'string' && seat.includes('-')) {
        const seatParts = seat.split('-');
        if (seatParts.length >= 2) {
            carNumber = seatParts[0];
            seatNumber = seatParts[1];
        }
    } else if (seat && typeof seat === 'string') {
        seatNumber = seat;
    }
    
    // Formater les heures et durée pour l'affichage
    const departureTime = travel_info.time;
    const durationHours = Math.floor(travel_info.length / 60);
    const durationMinutes = travel_info.length % 60;
    const durationFormatted = `${durationHours}h${durationMinutes > 0 ? durationMinutes.toString().padStart(2, '0') : '00'}`;
    const arrivalTime = calculateArrivalTime(departureTime, travel_info.length);
    
    // Générer le prix total
    const optionsPrice = calculateOptionsPrice(options);
    const totalPrice = calculateTotalPrice(travel_info.price, options);
    
    // Créer un nouveau document PDF
    const pdfPath = path.join(tempDir, `billet-${reservationNumber}.pdf`);
    const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 0,
        info: {
            Title: `Billet SwiftRail - ${travel_info.departure} → ${travel_info.arrival}`,
            Author: 'SwiftRail',
            Subject: 'Billet de train',
            Keywords: 'train, voyage, billet, swiftrail',
            Creator: 'SwiftRail Booking System',
        }
    });
    
    // Pipe du document dans un fichier
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Couleurs principales
    const colorPrimary = '#0b486b';
    const colorSecondary = '#1a8a89';
    const colorGray = '#666666';
    const colorLightGray = '#f5f5f5';
    
    // Fonction pour dessiner la bordure arrondie avec fond
    const drawBox = (x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 1) => {
        doc.roundedRect(x, y, width, height, radius)
           .fillAndStroke(fillColor, strokeColor)
           .lineWidth(strokeWidth);
    };
    
    // Dessiner le fond du billet
    drawBox(10, 10, doc.page.width - 20, doc.page.height - 20, 10, 'white', colorSecondary, 2);
    
    // En-tête du billet
    const gradientOptions = {
        gradient: {
            stops: [
                { offset: 0, color: colorPrimary },
                { offset: 1, color: colorSecondary }
            ],
            coords: { x1: 0, y1: 0, x2: doc.page.width, y2: 0 }
        }
    };
    
    doc.save()
       .roundedRect(10, 10, doc.page.width - 20, 70, { tl: 10, tr: 10, bl: 0, br: 0 })
       .fill(gradientOptions.gradient)
       .restore();
    
    // Titre du billet
    doc.font('Helvetica-Bold')
       .fontSize(28)
       .fill('white')
       .text('BILLET DE TRAIN', 0, 30, { align: 'center' });
    
    doc.font('Helvetica')
       .fontSize(14)
       .fill('white')
       .text('SwiftRail - Votre voyage en toute simplicité', 0, 60, { align: 'center' });
    
    // Bande d'information
    drawBox(10, 82, doc.page.width - 20, 50, 0, colorLightGray, 'white', 0);
    
    // Informations de réservation
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fill(colorGray)
       .text('RÉSERVATION', 30, 92);
    
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fill(colorPrimary)
       .text(`#${reservationNumber}`, 30, 108);
    
    // Informations du train
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .fill(colorGray)
       .text('TRAIN', doc.page.width - 150, 92, { align: 'right' });
    
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fill(colorPrimary)
       .text(travel_info.train_ref, doc.page.width - 150, 108, { align: 'right' });
    
    // Séparateur
    doc.moveTo(10, 134)
       .lineTo(doc.page.width - 10, 134)
       .dash(4, { space: 4 })
       .stroke(colorGray);
    
    // Section principale - Trajet
    // Départ
    doc.font('Helvetica')
       .fontSize(12)
       .fill(colorGray)
       .text('DÉPART', 50, 160);
    
    doc.font('Helvetica-Bold')
       .fontSize(24)
       .fill(colorPrimary)
       .text(travel_info.departure, 50, 175);
    
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .fill('black')
       .text(departureTime, 50, 205);
    
    doc.font('Helvetica')
       .fontSize(14)
       .fill(colorGray)
       .text(travel_info.date, 50, 230);
    
    // Durée
    const middleX = doc.page.width / 2;
    const lineStartX = 140;
    const lineEndX = doc.page.width - 140;
    
    doc.font('Helvetica')
       .fontSize(14)
       .fill(colorGray)
       .text(durationFormatted, middleX - 20, 170, { align: 'center' });
    
    // Ligne de trajet
    doc.moveTo(lineStartX, 200)
       .lineTo(lineEndX, 200)
       .lineWidth(2)
       .stroke(colorSecondary);
    
    // Points de départ et d'arrivée
    doc.circle(lineStartX, 200, 6).fill(colorPrimary);
    doc.circle(lineEndX, 200, 6).fill(colorSecondary);
    
    // Arrivée
    doc.font('Helvetica')
       .fontSize(12)
       .fill(colorGray)
       .text('ARRIVÉE', doc.page.width - 50, 160, { align: 'right' });
    
    doc.font('Helvetica-Bold')
       .fontSize(24)
       .fill(colorSecondary)
       .text(travel_info.arrival, doc.page.width - 50, 175, { align: 'right' });
    
    doc.font('Helvetica-Bold')
       .fontSize(20)
       .fill('black')
       .text(arrivalTime, doc.page.width - 50, 205, { align: 'right' });
    
    doc.font('Helvetica')
       .fontSize(14)
       .fill(colorGray)
       .text(travel_info.date, doc.page.width - 50, 230, { align: 'right' });
    
    // Informations de place et options
    const boxWidth = (doc.page.width - 80) / 2;
    
    // Boîte des informations de place
    drawBox(40, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
    
    doc.moveTo(40, 300)
       .lineTo(40 + boxWidth, 300)
       .lineWidth(1)
       .stroke('#e9ecef');
    
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fill('#555')
       .text('VOTRE PLACE', 60, 280);
    
    // Détails de la place
    const placeDetails = [
        { label: 'Voiture', value: carNumber },
        { label: 'Siège', value: seatNumber },
        { label: 'Classe', value: 'Standard' }
    ];
    
    let yPos = 310;
    placeDetails.forEach(detail => {
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(detail.label, 60, yPos);
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('black')
           .text(detail.value, boxWidth - 20, yPos, { align: 'right' });
        
        yPos += 30;
    });
    
    // Boîte des options
    drawBox(doc.page.width - 40 - boxWidth, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
    
    doc.moveTo(doc.page.width - 40 - boxWidth, 300)
       .lineTo(doc.page.width - 40, 300)
       .lineWidth(1)
       .stroke('#e9ecef');
    
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fill('#555')
       .text('OPTIONS & SERVICES', doc.page.width - 40 - boxWidth + 20, 280);
    
    // Liste des options
    if (options && options.length) {
        let optionY = 310;
        let optionX = doc.page.width - 40 - boxWidth + 20;
        let currentLine = 0;
        
        options.forEach((option, index) => {
            if (currentLine > 2) {
                optionX += 150;
                optionY = 310;
                currentLine = 0;
            }
            
            drawBox(optionX, optionY, 140, 25, 4, '#e6f3f3', '#bfdcdb', 1);
            
            doc.font('Helvetica')
               .fontSize(12)
               .fill(colorPrimary)
               .text(option, optionX + 10, optionY + 7, { width: 120 });
            
            optionY += 30;
            currentLine++;
        });
    } else {
        doc.font('Helvetica')
           .fontSize(14)
           .fillColor('#888')
           .text('Aucune option', doc.page.width - 40 - boxWidth + 20, 320);
    }
    
    // Boîte des tarifs
    drawBox(40, 410, doc.page.width - 80, 80, 6, colorLightGray, '#e9ecef', 1);
    
    // Détails des tarifs
    doc.font('Helvetica')
       .fontSize(14)
       .fill(colorGray)
       .text('Tarif de base', 60, 425);
    
    doc.font('Helvetica')
       .fontSize(14)
       .fill('black')
       .text(`${travel_info.price.toFixed(2)}€`, doc.page.width - 60, 425, { align: 'right' });
    
    if (options && options.length) {
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text('Options', 60, 450);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('black')
           .text(`+${optionsPrice.toFixed(2)}€`, doc.page.width - 60, 450, { align: 'right' });
    }
    
    // Ligne séparatrice pour le total
    doc.moveTo(60, 475)
       .lineTo(doc.page.width - 60, 475)
       .lineWidth(1)
       .stroke('#ddd');
    
    // Total
    doc.font('Helvetica-Bold')
       .fontSize(16)
       .fill('#333')
       .text('Total', 60, 485);
    
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .fill(colorPrimary)
       .text(`${totalPrice.toFixed(2)}€`, doc.page.width - 60, 485, { align: 'right' });
    
    // Code-barres (simulation)
    const barcodeY = 170;
    const barcodeHeight = 100;
    const barcodeWidth = 200;
    const barcodeX = doc.page.width - 80 - barcodeWidth / 2;
    
    // Dessiner le code-barres (simulation simple)
    for (let i = 0; i < 30; i++) {
        const x = barcodeX - barcodeWidth / 2 + i * (barcodeWidth / 30);
        const height = Math.random() * 40 + 60; // Hauteur aléatoire entre 60 et 100
        const barWidth = (barcodeWidth / 30) * 0.7; // Largeur de chaque barre
        
        doc.rect(x, barcodeY, barWidth, height)
           .fill('black');
    }
    
    // Numéro de réservation sous le code-barres
    doc.font('Courier')
       .fontSize(14)
       .fill('black')
       .text(individualReservationNumber, barcodeX - barcodeWidth / 2, barcodeY + barcodeHeight + 10, { align: 'center', width: barcodeWidth });
    
    // Pied de page
    doc.moveTo(10, doc.page.height - 60)
       .lineTo(doc.page.width - 10, doc.page.height - 60)
       .dash(4, { space: 4 })
       .stroke(colorGray);
    
    doc.font('Helvetica')
       .fontSize(10)
       .fill(colorGray)
       .text('Billet transmis par email. Ce document électronique sert de preuve d'achat et de titre de transport.', 0, doc.page.height - 40, { align: 'center' });
    
    // Numéro de page
    doc.font('Helvetica')
       .fontSize(10)
       .fill(colorGray)
       .text(`Page ${i+1}/${commands.length}`, 0, doc.page.height - 25, { align: 'center' });
}

// Finaliser le document
doc.end();

// Attendre que le fichier soit complètement écrit
return new Promise((resolve, reject) => {
    doc.on('end', () => {
        resolve(pdfPath);
    });
    
    doc.on('error', (err) => {
        reject(err);
    });
});
    
    // Pipe du document dans un fichier
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Pour chaque billet, on génère une page
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        const individualReservationNumber = `${reservationNumber}-${i+1}`;
        
        const { travel_info, options, seat } = command;
        
        // Extraire le numéro de voiture et de siège
        let carNumber = "?";
        let seatNumber = "?";
        
        if (seat && typeof seat === 'string' && seat.includes('-')) {
            const seatParts = seat.split('-');
            if (seatParts.length >= 2) {
                carNumber = seatParts[0];
                seatNumber = seatParts[1];
            }
        } else if (seat && typeof seat === 'string') {
            seatNumber = seat;
        }
        
        // Formater les heures et durée pour l'affichage
        const departureTime = travel_info.time;
        const durationHours = Math.floor(travel_info.length / 60);
        const durationMinutes = travel_info.length % 60;
        const durationFormatted = `${durationHours}h${durationMinutes > 0 ? durationMinutes.toString().padStart(2, '0') : '00'}`;
        const arrivalTime = calculateArrivalTime(departureTime, travel_info.length);
        
        // Générer le prix total
        const optionsPrice = calculateOptionsPrice(options);
        const totalPrice = calculateTotalPrice(travel_info.price, options);
        
        // Couleurs principales
        const colorPrimary = '#0b486b';
        const colorSecondary = '#1a8a89';
        const colorGray = '#666666';
        const colorLightGray = '#f5f5f5';
        
        // Fonction pour dessiner la bordure arrondie avec fond
        const drawBox = (x, y, width, height, radius, fillColor, strokeColor, strokeWidth = 1) => {
            doc.roundedRect(x, y, width, height, radius)
               .fillAndStroke(fillColor, strokeColor)
               .lineWidth(strokeWidth);
        };
        
        // Si ce n'est pas le premier billet, on ajoute une nouvelle page
        if (i > 0) {
            doc.addPage();
        }
        
        // Dessiner le fond du billet
        drawBox(10, 10, doc.page.width - 20, doc.page.height - 20, 10, 'white', colorSecondary, 2);
        
        // En-tête du billet
        const gradientOptions = {
            gradient: {
                stops: [
                    { offset: 0, color: colorPrimary },
                    { offset: 1, color: colorSecondary }
                ],
                coords: { x1: 0, y1: 0, x2: doc.page.width, y2: 0 }
            }
        };
        
        doc.save()
           .roundedRect(10, 10, doc.page.width - 20, 70, { tl: 10, tr: 10, bl: 0, br: 0 })
           .fill(gradientOptions.gradient)
           .restore();
        
        // Titre du billet
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill('white')
           .text(i === 0 ? 'BILLET ALLER' : 'BILLET RETOUR', 0, 30, { align: 'center' });
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('white')
           .text('SwiftRail - Votre voyage en toute simplicité', 0, 60, { align: 'center' });
        
        // Bande d'information
        drawBox(10, 82, doc.page.width - 20, 50, 0, colorLightGray, 'white', 0);
        
        // Informations de réservation
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fill(colorGray)
           .text('RÉSERVATION', 30, 92);
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(`#${individualReservationNumber}`, 30, 108);
        
        // Informations du train
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .fill(colorGray)
           .text('TRAIN', doc.page.width - 150, 92, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(travel_info.train_ref, doc.page.width - 150, 108, { align: 'right' });
        
        // Séparateur
        doc.moveTo(10, 134)
           .lineTo(doc.page.width - 10, 134)
           .dash(4, { space: 4 })
           .stroke(colorGray);
        
        // Section principale - Trajet
        // Départ
        doc.font('Helvetica')
           .fontSize(12)
           .fill(colorGray)
           .text('DÉPART', 50, 160);
        
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill(colorPrimary)
           .text(travel_info.departure, 50, 175);
        
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .fill('black')
           .text(departureTime, 50, 205);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(travel_info.date, 50, 230);
        
        // Durée
        const middleX = doc.page.width / 2;
        const lineStartX = 140;
        const lineEndX = doc.page.width - 140;
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(durationFormatted, middleX - 20, 170, { align: 'center' });
        
        // Ligne de trajet
        doc.moveTo(lineStartX, 200)
           .lineTo(lineEndX, 200)
           .lineWidth(2)
           .stroke(colorSecondary);
        
        // Points de départ et d'arrivée
        doc.circle(lineStartX, 200, 6).fill(colorPrimary);
        doc.circle(lineEndX, 200, 6).fill(colorSecondary);
        
        // Arrivée
        doc.font('Helvetica')
           .fontSize(12)
           .fill(colorGray)
           .text('ARRIVÉE', doc.page.width - 50, 160, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(24)
           .fill(colorSecondary)
           .text(travel_info.arrival, doc.page.width - 50, 175, { align: 'right' });
        
        doc.font('Helvetica-Bold')
           .fontSize(20)
           .fill('black')
           .text(arrivalTime, doc.page.width - 50, 205, { align: 'right' });
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text(travel_info.date, doc.page.width - 50, 230, { align: 'right' });
        
        // Informations de place et options
        const boxWidth = (doc.page.width - 80) / 2;
        
        // Boîte des informations de place
        drawBox(40, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
        
        doc.moveTo(40, 300)
           .lineTo(40 + boxWidth, 300)
           .lineWidth(1)
           .stroke('#e9ecef');
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#555')
           .text('VOTRE PLACE', 60, 280);
        
        // Détails de la place
        const placeDetails = [
            { label: 'Voiture', value: carNumber },
            { label: 'Siège', value: seatNumber },
            { label: 'Classe', value: 'Standard' }
        ];
        
        let yPos = 310;
        placeDetails.forEach(detail => {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text(detail.label, 60, yPos);
            
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fill('black')
               .text(detail.value, boxWidth - 20, yPos, { align: 'right' });
            
            yPos += 30;
        });
        
        // Boîte des options
        drawBox(doc.page.width - 40 - boxWidth, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
        
        doc.moveTo(doc.page.width - 40 - boxWidth, 300)
           .lineTo(doc.page.width - 40, 300)
           .lineWidth(1)
           .stroke('#e9ecef');
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#555')
           .text('OPTIONS & SERVICES', doc.page.width - 40 - boxWidth + 20, 280);
        
        // Liste des options
        if (options && options.length) {
            let optionY = 310;
            let optionX = doc.page.width - 40 - boxWidth + 20;
            let currentLine = 0;
            
            options.forEach((option, index) => {
                if (currentLine > 2) {
                    optionX += 150;
                    optionY = 310;
                    currentLine = 0;
                }
                
                drawBox(optionX, optionY, 140, 25, 4, '#e6f3f3', '#bfdcdb', 1);
                
                doc.font('Helvetica')
                   .fontSize(12)
                   .fill(colorPrimary)
                   .text(option, optionX + 10, optionY + 7, { width: 120 });
                
                optionY += 30;
                currentLine++;
            });
        } else {
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#888')
               .text('Aucune option', doc.page.width - 40 - boxWidth + 20, 320);
        }
        
        // Boîte des tarifs
        drawBox(40, 410, doc.page.width - 80, 80, 6, colorLightGray, '#e9ecef', 1);
        
        // Détails des tarifs
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text('Tarif de base', 60, 425);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('black')
           .text(`${travel_info.price.toFixed(2)}€`, doc.page.width - 60, 425, { align: 'right' });
        
        if (options && options.length) {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text('Options', 60, 450);
            
            doc.font('Helvetica')
               .fontSize(14)
               .fill('black')
               .text(`+${optionsPrice.toFixed(2)}€`, doc.page.width - 60, 450, { align: 'right' });
        }
        
        // Ligne séparatrice pour le total
        doc.moveTo(60, 475)
           .lineTo(doc.page.width - 60, 475)
           .lineWidth(1)
           .stroke('#ddd');
        
        // Total
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#333')
           .text('Total', 60, 485);
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(`${totalPrice.toFixed(2)}€`, doc.page.width - 60, 485, { align: 'right' });
        
        // Code-barres (simulation)
        const barcodeY = 170;
        const barcodeHeight = 100;
        const barcodeWidth = 200;
        const barcodeX = doc.page.width - 80 - barcodeWidth / 2;
        
        // Dessiner le code-barres (simulation simple)
        for (let j = 0; j < 30; j++) {
            const x = barcodeX - barcodeWidth / 2 + j * (barcodeWidth / 30);
            const height = Math.random() * 40 + 60; // Hauteur aléatoire entre 60 et 100
            const barWidth = (barcodeWidth / 30) * 0.7; // Largeur de chaque barre
            
            doc.rect(x, barcodeY, barWidth, height)
               .fill('black');
        }
        
        // Numéro de réservation sous le code-barres
        doc.font('Courier')
           .fontSize(14)
           .fill('black')
           .text(individualReservationNumber, barcodeX - barcodeWidth / 2, barcodeY + barcodeHeight + 10, { align: 'center', width: barcodeWidth });
        
        // Pied de page
        doc.moveTo(10, doc.page.height - 60)
           .lineTo(doc.page.width - 10, doc.page.height - 60)
           .dash(4, { space: 4 })
           .stroke(colorGray);
        
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text('Billet transmis par email. Ce document électronique sert de preuve d'achat et de titre de transport.', 0, doc.page.height - 40, { align: 'center' });
        
        // Numéro de page
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text(`Page ${i+1}/${commands.length}`, 0, doc.page.height - 25, { align: 'center' });
    }
    
    // Finaliser le document
    doc.end();
    
    // Attendre que le fichier soit complètement écrit
    return new Promise((resolve, reject) => {
        doc.on('end', () => {
            resolve(pdfPath);
        });
        
        doc.on('error', (err) => {
            reject(err);
        });
    });
};
        
        let yPos = 310;
        placeDetails.forEach(detail => {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text(detail.label, 60, yPos);
            
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fill('black')
               .text(detail.value, boxWidth - 20, yPos, { align: 'right' });
            
            yPos += 30;
        });
        
        // Boîte des options
        drawBox(doc.page.width - 40 - boxWidth, 270, boxWidth, 120, 6, colorLightGray, '#e9ecef', 1);
        
        doc.moveTo(doc.page.width - 40 - boxWidth, 300)
           .lineTo(doc.page.width - 40, 300)
           .lineWidth(1)
           .stroke('#e9ecef');
        
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#555')
           .text('OPTIONS & SERVICES', doc.page.width - 40 - boxWidth + 20, 280);
        
        // Liste des options
        if (options && options.length) {
            let optionY = 310;
            let optionX = doc.page.width - 40 - boxWidth + 20;
            let currentLine = 0;
            
            options.forEach((option, index) => {
                if (currentLine > 2) {
                    optionX += 150;
                    optionY = 310;
                    currentLine = 0;
                }
                
                drawBox(optionX, optionY, 140, 25, 4, '#e6f3f3', '#bfdcdb', 1);
                
                doc.font('Helvetica')
                   .fontSize(12)
                   .fill(colorPrimary)
                   .text(option, optionX + 10, optionY + 7, { width: 120 });
                
                optionY += 30;
                currentLine++;
            });
        } else {
            doc.font('Helvetica')
               .fontSize(14)
               .fillColor('#888')
               .text('Aucune option', doc.page.width - 40 - boxWidth + 20, 320);
        }
        
        // Boîte des tarifs
        drawBox(40, 410, doc.page.width - 80, 80, 6, colorLightGray, '#e9ecef', 1);
        
        // Détails des tarifs
        doc.font('Helvetica')
           .fontSize(14)
           .fill(colorGray)
           .text('Tarif de base', 60, 425);
        
        doc.font('Helvetica')
           .fontSize(14)
           .fill('black')
           .text(`${travel_info.price.toFixed(2)}€`, doc.page.width - 60, 425, { align: 'right' });
        
        if (options && options.length) {
            doc.font('Helvetica')
               .fontSize(14)
               .fill(colorGray)
               .text('Options', 60, 450);
            
            doc.font('Helvetica')
               .fontSize(14)
               .fill('black')
               .text(`+${optionsPrice.toFixed(2)}€`, doc.page.width - 60, 450, { align: 'right' });
        }
        
        // Ligne séparatrice pour le total
        doc.moveTo(60, 475)
           .lineTo(doc.page.width - 60, 475)
           .lineWidth(1)
           .stroke('#ddd');
        
        // Total
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .fill('#333')
           .text('Total', 60, 485);
        
        doc.font('Helvetica-Bold')
           .fontSize(18)
           .fill(colorPrimary)
           .text(`${totalPrice.toFixed(2)}€`, doc.page.width - 60, 485, { align: 'right' });
        
        // Code-barres (simulation)
        const barcodeY = 170;
        const barcodeHeight = 100;
        const barcodeWidth = 200;
        const barcodeX = doc.page.width - 80 - barcodeWidth / 2;
        
        // Dessiner le code-barres (simulation simple)
        for (let j = 0; j < 30; j++) {
            const x = barcodeX - barcodeWidth / 2 + j * (barcodeWidth / 30);
            const height = Math.random() * 40 + 60; // Hauteur aléatoire entre 60 et 100
            const barWidth = (barcodeWidth / 30) * 0.7; // Largeur de chaque barre
            
            doc.rect(x, barcodeY, barWidth, height)
               .fill('black');
        }
        
        // Numéro de réservation sous le code-barres
        doc.font('Courier')
           .fontSize(14)
           .fill('black')
           .text(individualReservationNumber, barcodeX - barcodeWidth / 2, barcodeY + barcodeHeight + 10, { align: 'center', width: barcodeWidth });
        
        // Pied de page
        doc.moveTo(10, doc.page.height - 60)
           .lineTo(doc.page.width - 10, doc.page.height - 60)
           .dash(4, { space: 4 })
           .stroke(colorGray);
        
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text('Billet transmis par email. Ce document électronique sert de preuve d'achat et de titre de transport.', 0, doc.page.height - 40, { align: 'center' });
        
        // Numéro de page
        doc.font('Helvetica')
           .fontSize(10)
           .fill(colorGray)
           .text(`Page ${i+1}/${commands.length}`, 0, doc.page.height - 25, { align: 'center' });
    }
    
    // Finaliser le document
    doc.end();
    
    // Attendre que le fichier soit complètement écrit
    return new Promise((resolve, reject) => {
        doc.on('end', () => {
            resolve(pdfPath);
        });
        
        doc.on('error', (err) => {
            reject(err);
        });
    });
};

/**
 * Envoie un email de confirmation de billet avec un PDF en pièce jointe
 * @param {string} email - L'adresse email du destinataire
 * @param {Object|Array} command - L'objet commande ou un tableau de commandes contenant les informations des billets
 * @returns {Promise} Promesse résolue avec l'info d'envoi, ou rejetée avec une erreur
 */
export const sendTicketConfirmation = async (email, command) => {
    try {
        // Conversion en tableau si c'est un objet unique
        const commands = Array.isArray(command) ? command : [command];
        const firstCommand = commands[0];
        const { travel_info } = firstCommand;
        
        // Générer un PDF contenant le ou les billets
        const pdfPath = commands.length > 1 
            ? await generateMultipleTicketsPDF(commands)
            : await generateTicketPDF(commands[0], generateReservationNumber());
        
        // Type de billet (aller simple ou aller-retour)
        const ticketType = commands.length > 1 ? 'aller-retour' : 'aller simple';
        
        // Texte HTML de l'email
        const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #0b486b, #1a8a89); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Confirmation de Réservation</h1>
                <p style="margin: 5px 0 0;">SwiftRail - Votre voyage en toute simplicité</p>
            </div>
            
            <div style="background-color: #f8f9fa; border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
                <p>Bonjour,</p>
                
                <p>Nous vous remercions pour votre réservation chez SwiftRail. Votre billet de train ${ticketType} est confirmé !</p>
                
                <div style="background-color: #e6f3f3; border-left: 4px solid #1a8a89; padding: 15px; margin: 20px 0;">
                    <strong>Voyage ${commands.length > 1 ? 'Aller' : ''} :</strong> ${travel_info.departure} → ${travel_info.arrival}<br>
                    <strong>Date :</strong> ${travel_info.date}<br>
                    <strong>Heure de départ :</strong> ${travel_info.time}
                </div>
                
                ${commands.length > 1 ? `
                <div style="background-color: #e6f3f3; border-left: 4px solid #1a8a89; padding: 15px; margin: 20px 0;">
                    <strong>Voyage Retour :</strong> ${commands[1].travel_info.departure} → ${commands[1].travel_info.arrival}<br>
                    <strong>Date :</strong> ${commands[1].travel_info.date}<br>
                    <strong>Heure de départ :</strong> ${commands[1].travel_info.time}
                </div>
                ` : ''}
                
                <p>Votre billet est joint à ce message au format PDF. Vous pouvez l'imprimer ou le présenter sur votre appareil mobile lors de votre voyage.</p>
                
                <p>Nous vous souhaitons un excellent voyage avec SwiftRail.</p>
                
                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                    Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                    Si vous avez des questions, veuillez consulter notre <a href="#" style="color: #1a8a89;">FAQ</a> ou contacter notre <a href="#" style="color: #1a8a89;">service client</a>.
                </p>
            </div>
        </div>
        `;
        
        // Envoi de l'email avec le PDF en pièce jointe
        const info = await transporter.sendMail({
            from: `"SwiftRail" <${SMTP_USER}>`,
            to: email,
            subject: `Vos billets SwiftRail - ${travel_info.departure} → ${travel_info.arrival}`,
            html: htmlContent,
            attachments: [
                {
                    filename: commands.length > 1 ? 'billets-swiftrail.pdf' : 'billet-swiftrail.pdf',
                    path: pdfPath,
                    contentType: 'application/pdf'
                }
            ]
        });
        
        console.log(`Email de confirmation avec PDF envoyé à ${email} (ID: ${info.messageId})`);
        
        // Supprimer le fichier PDF temporaire après l'envoi
        fs.unlink(pdfPath, (err) => {
            if (err) console.error("Erreur lors de la suppression du fichier PDF temporaire:", err);
        });
        
        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email avec PDF:", error);
        throw error;
    }
};

// Export des fonctions utilitaires pour les tests
export const utils = {
    calculateArrivalTime,
    calculateOptionsPrice,
    calculateTotalPrice,
    generateReservationNumber
};