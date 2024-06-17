const passwordValidator = require('password-validator');

const schema = new passwordValidator();

schema
    .is().min(8)                                    // Longitud mínima 8 caracteres
    .has().uppercase()                              // Al menos una letra mayúscula
    .has().lowercase()                              // Al menos una letra minúscula
    .has().digits()                                 // Al menos un número
    .has().symbols();                               // Al menos un símbolo

const validatePassword = (req, res, next) => {
    const contrasena = req.body.password;
    const validationResults = schema.validate(contrasena, { details: true });

    if (validationResults.length === 0) {
        next();
    } else {
        const errorMessages = validationResults.map(error => {
            switch (error.validation) {
                case 'min':
                    return 'La contraseña debe tener al menos 8 caracteres.';
                case 'uppercase':
                    return 'La contraseña debe contener al menos una letra mayúscula.';
                case 'lowercase':
                    return 'La contraseña debe contener al menos una letra minúscula.';
                case 'digits':
                    return 'La contraseña debe contener al menos un número.';
                case 'symbols':
                    return 'La contraseña debe contener al menos un símbolo.';
                default:
                    return 'La contraseña no cumple con los requisitos.';
            }
        });

        res.status(400).json({ message: 'La contraseña no cumple con los requisitos.', errors: errorMessages });
    }
};

module.exports = validatePassword;
