// -----------------------------
// VALIDACIONES PARA ORDENES
// -----------------------------

module.exports = {
    
    validarUserName(userName) {
        if (!userName) return "El nombre de usuario es requerido.";
        if (userName.length > 50) return "El nombre de usuario no debe superar los 50 caracteres.";
        return null;
    },

    validarTotalPrice(totalPrice) {
        if (totalPrice === undefined || totalPrice === null) return "El precio total es requerido.";
        if (isNaN(totalPrice)) return "El precio total debe ser un número.";
        if (totalPrice <= 0) return "El precio total debe ser mayor a 0.";
        return null;
    },

    validarNombre(firstName) {
        if (!firstName) return "El nombre es requerido.";
        if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(firstName)) 
            return "El nombre solo puede contener letras.";
        if (firstName.length > 50) return "El nombre no debe superar los 50 caracteres.";
        return null;
    },

    validarApellido(lastName) {
        if (!lastName) return "El apellido es requerido.";
        if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ ]+$/.test(lastName)) 
            return "El apellido solo puede contener letras.";
        if (lastName.length > 50) return "El apellido no debe superar los 50 caracteres.";
        return null;
    },

    validarEmail(email) {
        if (!email) return "El correo electrónico es requerido.";
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regex.test(email)) return "El correo electrónico no es válido.";
        if (email.length > 100) return "El correo no debe tener más de 100 caracteres.";
        return null;
    },

    validarAddressLine(address) {
        if (!address) return "La dirección es requerida.";
        if (address.length > 150) return "La dirección no debe superar los 150 caracteres.";
        return null;
    },

    validarCardNumber(cardNumber) {
        if (!cardNumber) return "El número de tarjeta es requerido.";
        if (!/^[0-9]+$/.test(cardNumber)) 
            return "El número de tarjeta solo puede contener dígitos.";
        if (cardNumber.length < 13 || cardNumber.length > 19) 
            return "El número de tarjeta debe tener entre 13 y 19 dígitos.";
        return null;
    },

    validarCVV(cvv) {
        if (!cvv) return "El CVV es requerido.";
        if (!/^[0-9]+$/.test(cvv)) return "El CVV solo puede contener números.";
        if (cvv.length < 3 || cvv.length > 4) 
            return "El CVV debe tener entre 3 y 4 dígitos.";
        return null;
    },

    validarExpiration(exp) {
        if (!exp) return "La fecha de expiración es requerida.";
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(exp)) return "La fecha debe tener el formato MM/YY.";
        return null;
    },

    // -----------------------------
    // VALIDAR TODOS LOS DATOS JUNTOS
    // -----------------------------
    validarOrdenCompleta(data) {
        const errores = [];

        const reglas = [
            this.validarUserName(data.userName),
            this.validarTotalPrice(data.totalPrice),
            this.validarNombre(data.firstName),
            this.validarApellido(data.lastName),
            this.validarEmail(data.emailAddress),
            this.validarAddressLine(data.addressLine),
            this.validarCardNumber(data.cardNumber),
            this.validarCVV(data.cvv),
            this.validarExpiration(data.expiration)
        ];

        reglas.forEach(err => { if (err) errores.push(err); });

        return errores;
    }
};
