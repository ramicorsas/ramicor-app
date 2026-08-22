// Uso: node generar-hash.js "MiContraseña123"
// Genera el hash bcrypt para pegar en el INSERT de admins/transportistas
// en Neon. La contraseña en texto plano nunca se guarda en la base.
const bcrypt = require('bcryptjs');
const pass = process.argv[2];
if (!pass) {
  console.log('Uso: node generar-hash.js "MiContraseña"');
  process.exit(1);
}
console.log(bcrypt.hashSync(pass, 10));
