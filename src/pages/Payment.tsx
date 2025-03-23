import React, { useState } from 'react';

interface PaymentDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
}

const PaymentComponent: React.FC = () => {
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPaymentDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const validateCardNumber = (cardNumber: string): boolean => {
        const cardNumberRegex = /^\d{16}$/;
        return cardNumberRegex.test(cardNumber);
    };

    const validateExpiryDate = (expiryDate: string): boolean => {
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryDateRegex.test(expiryDate)) return false;

        const [month, year] = expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100; // Get last two digits of the year
        const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JavaScript

        if (parseInt(year) < currentYear) return false;
        return !(parseInt(year) === currentYear && parseInt(month) < currentMonth);
    };

    const validateCVV = (cvv: string): boolean => {
        const cvvRegex = /^\d{3}$/;
        return cvvRegex.test(cvv);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: { [key: string]: string } = {};

        if (!validateCardNumber(paymentDetails.cardNumber)) {
            newErrors.cardNumber = 'Le numéro de carte n\'est pas valide.';
        }

        if (!validateExpiryDate(paymentDetails.expiryDate)) {
            newErrors.expiryDate = 'La date d\'expiration n\'est pas valide.';
        }

        if (!validateCVV(paymentDetails.cvv)) {
            newErrors.cvv = 'Le CVV n\'est pas valide.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // If every Input is valid, proceed to payment :
        console.log('Processing payment with details:', paymentDetails);
        alert('Paiement en cours de traitement...');
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="cardNumber">Numéro de carte:</label>
                <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleChange}
                    required
                />
                {errors.cardNumber && <span style={{ color: 'red' }}>{errors.cardNumber}</span>}
            </div>
            <div>
                <label htmlFor="expiryDate">Date d'expiration (MM/YY):</label>
                <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={handleChange}
                    required
                />
                {errors.expiryDate && <span style={{ color: 'red' }}>{errors.expiryDate}</span>}
            </div>
            <div>
                <label htmlFor="cvv">CVV:</label>
                <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentDetails.cvv}
                    onChange={handleChange}
                    required
                />
                {errors.cvv && <span style={{ color: 'red' }}>{errors.cvv}</span>}
            </div>
            <button type="submit">Payer</button>
        </form>
    );
};

export default PaymentComponent;