const { verificarCedula } = require('udv-ec');

const validateCi = (req, res, next) => {
    const cedula = req.body.ci;

    if (verificarCedula(cedula)) {
        next();
    } else {
        res.status(400).json({ message: 'Cédula inválida.' });
    }
};

module.exports = validateCi;


