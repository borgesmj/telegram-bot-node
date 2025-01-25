export const botReplies = [
  //! 0
  `🤖 Hola\n\nTe doy la bienvenida.\n\nSoy un asistente personal para llevar un control de tus finanzas, configuremos tu perfil.\n\nEsto tomará unos pocos minutos`,
  //! 1
  `🤖\n\nVeo que te llamas %username,\n¿Quieres que te llame asi, o quieres guardar un nombre distinto?.\n\n/EstaBienAsi\n/Cambiemoslo\n\nSelecciona la opcion de tu preferencia`,
  //! 2
  `🤖\n\nGenial, te llamaré %username`,
  //! 3
  `🤖\n\nEscribe tu nombre, con el que quieres que te llame`,
  //! 4
  `🤖\n\nAhora dame, por favor, tu correo electronico completo\n\nEjemplo: correo@mail.com`,
  //! 5
  `🤖\n\nTu perfil ya fué guardado, lo puedes ver en cualquier momento a traves de la opcion *Mi perfil* del menú principal. Ahora vamos a configurar las categorías de tus movimientos.`,
  // ! 6
  `🤖\n\nTe envié un correo electrónico de confirmación a %email. Esto te será necesario para cuando quieras entrar a la página web.`,
  // ! 7
  `🤖\n\nDisculpa, el correo que introdujiste no es válido, por favor introduce uno con el formato correo@mail.com`,
  // ! 8
  `🤖\n\nColoca la moneda que quieras usar, por ejemplo: $ o Є`,
  // ! 9
  `🤖\n\nAun no se estoy programado para escuchar notas de voz, por favor, introduce un texto`,
  // ! 10
  `🤖\n\nBienvenido de vuelta %username, haz click en /menu para ver el menu principal`,
  // ! 11
  "🤖\n\nVas a ingresar las categorías de tus movimientos frecuentes, comenzaremos por los *INGRESOS*, por ejemplo `Salario`, `Freelance`\n\nColoca de uno a la vez",
  // ! 12
  "🤖\n\nVas a ingresar las categorías de tus movimientos frecuentes, esta vez serán los *EGRESOS*, por ejemplo `Arriendo`, `Comida`, `Servicios`\n\nColoca de uno a la vez",
  // ! 13
  "🤖\n\nPor último, vamos a configurar tus valores iniciales, eso me ayudará a llevar al dia tus cuentas",
  // ! 14
  "🤖\n\nComencemos con tu balance inicial, vas a escribir el monto de saldo que tienes en este momento, sin comas\n\nsi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`",
  // ! 15
  "🤖\n\nDisculpa, el monto debe ser un texto solamente con números",
  // ! 16
  "🤖\n\nAhora configuremos el monto inicial de tus ahorros. Escribe el numero completo sin comas. \n\nSi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`\n\nEn caso de que no tengas, escribe 0",
  // ! 17
  "🤖\n\nTu perfil está completo, lo puedes ver en cualquier momento a traves de la opcion *Mi perfil* del menú principal.",
  // ! 18
  `*Perfil del usuario 👤*

  👤 *Nombres:* $userFirstName  
  👤 *Apellidos:* $userLastName 
  📧 *E-mail:* $userEmail  
  📱 *Telegram:* $username 
  💲 *Moneda predeterminada:* $userCurrency
  `,
  // ! 19
  "Perfil actualizado con exito 🎉",
  // ! 20
  "Para finalizar, haz click en /ConfigurarEgresos",
  // ! 21
  "Para finalizar, haz click en /hecho",
  // ! 22
  "🤖\n\n*NUEVO INGRESO*\n\nEnviame el nombre de la transaccion.\n\nPara cancelar, haz click en el botón de abajo",
  // ! 23
  "🤖\n\nAhora vas a enviarme el monto de la transacción. Solo deben ser números, si deseas colocar decimales, escribe un punto. Por ejemplo: `XXXXXX.50`\n\nPara cancelar, haz click en el botón de abajo",
  // ! 24
  "🤖\n\n*NUEVO EGRESO*\n\nEnviame el nombre de la transaccion.\n\nPara cancelar, haz click en el botón de abajo",
  // ! 25
  "🤖\n\nElige la categoria de esta transacción. Si deseas cancelar, haz click en el botón de abajo",
  // ! 26
  "🤖\n\nConfirma la transaccion:\n\n*Detalles:* `$details`\n*Monto:* `$ammount`\n*Categoria:* `$category`\n*Tipo:* `$type`",
  // ! 27
  "🤖\n\n*MUY IMPORTANTE TENER AHORROS!!!*\n\nIngresa el monto que quieras ahorrar:\n\nSi quieres cancelar, hazlo por el boton de abajo.",
  // ! 28
  "🤖\n\nTus ahorros fueron guardados con éxito 💰",
  // !29
  "🤖\n\nConfirma el nuevo ahorro:\n\n*Monto:* `$ammount`",
  // ! 30
  "🤖\n\nResumen de tus finanzas:\n\n💰 *Ingresos:* `$income`\n💸 *Egresos:* `$expenses`\n💵 *Ahorros:* `$savings`\n\n\n📊 *Saldo Total:* `$balance`\n\n¡Sigue así para alcanzar tus metas financieras! 🚀",
  // ! 31
  "🤖\n\nResumen de tus finanzas del mes actual:\n\n💰 *Ingresos:* `$income`\n💸 *Egresos:* `$expenses`\n💵 *Ahorros:* `$savings`\n\n\n📊 *Saldo Total:* `$balance`\n\n¡Sigue así para alcanzar tus metas financieras! 🚀",
  // ! 32
  "🤖\n\nResumen de tus finanzas del mes de *$month*:\n\n💰 *Ingresos:* `$income`\n💸 *Egresos:* `$expenses`\n💵 *Ahorros:* `$savings`\n\n\n📊 *Saldo Total:* `$balance`\n\n¡Sigue así para alcanzar tus metas financieras! 🚀",
  // ! 33
  "🤖\n\nDisculpa, no hay movimientos guardados para el mes de $month del $currentYear",
  // ! 34
  "🤖\n\n👍 $category fué agregada con exito.\n\nSi quieres seguir agregando, pon una siguiente categoria, de una a la vez",
  // ! 35
  "🤖\n\n¿Que quieres hacer?\n¿*Editar* una categoria ya existente o *agregar* una nueva?",
  // ! 36
  "🤖\n\nVamos a agregar una categoria nueva, por favor escribe el nombre de la categoria nueva y haces click en el botón de *enviar*",
  // ! 37
  "🤖\n\n¿En donde lo quieres almacenar?\n\n¿Ingreso o egreso?",
  // ! 38
  "🤖\n\nConfirma que quieres agregar *$category*, para *$type*",
  // ! 39
  "🤖\n\n👍 $category fué agregada con exito.",
  // ! 40
  "🤖\n\n¿Cuales categorias quieres editar? ¿Ingreso o egreso?",
  // ! 41
  "🤖\n\nSelecciona la categoría que quieras editar",
  // ! 42
  "🤖\n\n¿Como quieres llamar ahora a la categoria $category?",
  // ! 43
  "🤖\n\nConfirma cambiar el nombre de *$oldname* ➡️ a *$newname*",
  // ! 44
  "🤖\n\nNombre cambiado con exito!!!",
  // ! 45
  "🤖\n\nDetalles de la transacción:\n\n📌 *Tipo*: `$type`\n📅 *Fecha*: `$date`\n💰 *Monto*: `$ammount`\n📝 *Detalles*: `$details`\n🏷️ *Categoría*: `$category`"
];
