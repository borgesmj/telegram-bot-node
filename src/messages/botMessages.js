export const botReplies = [
  //! 0
  `🤖 Hola\n\nTe doy la bienvenida.\n\nSoy un asistente personal para llevar un control de tus finanzas, configuremos tu perfil.\n\nEsto tomará unos pocos minutos`,
  //! 1
  "🤖\n\nVeo que te llamas `$username`,\n\n¿Quieres que te llame asi, o prefieres guardar un nombre distinto?.\nSelecciona la opcion de tu preferencia",
  // ! 2
  "🤖\n\nEscribe el nombre con el que quieres que te llame",
  // ! 3
  "🤖\n\nGenial, de ahora en adelante te llamaré `$username`",
  //! 4
  "🤖\n\nAhora dame, por favor, tu correo electronico completo\n\nEjemplo: correo@mail.com",
  // !5
  "🤖\n\nGracias por darme tu dirección de correo. En otro momento te enviare un email de confirmación al `$email`\n\nAhora por favor, dame el símbolo de la moneda que quieras utilizar, por ejemplo *$* o *Є*",
  // ! 6
  "🤖\n\nDisculpa, el correo que introdujiste no es válido, por favor introduce uno con el formato correo@mail.com",
  // ! 7
  "🤖\n\nConfirma que son tus datos correctos:\n\n*Nombre*: `$first_name`\n*Apellido*: `$user_lastname`\n*Telegram username*: `$username`\n*email*: `$email`\n*Moneda*: `$currency`",
  // ! 8
  "🤖\n\nGenial, te llamaré `$username`",
  // ! 9
  "🤖\n\nTu perfil ya fué guardado, lo puedes ver en cualquier momento a traves de la opcion *Mi perfil* del menú principal. Ahora vamos a configurar las categorías de tus movimientos.",
  // ! 10
  "🤖\n\nBienvenido de vuelta *$username*!!!",
  // ! 11
  "🤖\n\nVas a ingresar las categorías de tus *INGRESOS* frecuentes, comenzaremos por los *INGRESOS*, por ejemplo `Salario`, `Freelance`\n\nColoca de uno a la vez",
  // ! 12
  "🤖\n\n👍 `$category` fué agregada con exito. Si quieres agregar otra categoría solo enviamela, de lo contrario, presiona el botón para continuar",
  // ! 13
  "🤖\n\nAhora vas a ingresar las categorías de tus *EGRESOS* frecuentes, comenzaremos por los *INGRESOS*, por ejemplo `Arriendo`, `Moto`, `Comida`, `Salidas`\n\nColoca de uno a la vez",
  // ! 14
  "🤖\n\nPor último, vamos a configurar tus valores iniciales, eso me ayudará a llevar al dia tus cuentas",
  // ! 15
  "🤖\n\nComencemos con tu balance inicial, vas a escribir el monto de saldo que tienes en este momento, sin comas\n\nsi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`",
  // ! 16
  "🤖\n\nAhora configuremos el monto inicial de tus ahorros. Escribe el numero completo sin comas. \n\nSi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`\n\nEn caso de que no tengas, escribe 0",
  // ! 17
  "🤖\n\nTu perfil está completo, lo puedes ver en cualquier momento a traves de la opcion *Mi perfil* del menú principal.",
  // ! 18
  "🤖\n\nConfirma que el monto para tu balance inicial es de: `$ammount`,\n\nDe lo contrario, haz click en el boton *Escribir otro monto*",
  // ! 19
  "🤖\n\nEscribe cuál será el monto de tu balance incial. Recuerda escribir el monto con numeros y sin comas,\n\nsi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`",
  // ! 20
  "🤖\n\nConfirma que el monto para tus ahorros iniciales es de: `$ammount`,\n\nDe lo contrario, haz click en el boton *Escribir otro monto*",
  // ! 21
  "🤖\n\nEscribe cuál será el monto de tus ahorros iniciales. Recuerda escribir el monto con numeros y sin comas,\n\nsi deseas escribir decimales, hazlo con un punto. Ejemplo: `XXXXXX.32`",
  // ! 22
  "🤖\n\nComencemos nuevamente. Escribe, por favor, tu nombre",
  // ! 23
  "🤖\n\n*NUEVO INGRESO*\n\nEnviame el nombre de la transaccion.\n\nPara cancelar, haz click en el botón de abajo",
  // ! 24
  "🤖\n\nAhora vas a enviarme el monto de la transacción. Solo deben ser números, si deseas colocar decimales, escribe un punto. Por ejemplo: `XXXXXX.50`\n\nPara cancelar, haz click en el botón de abajo",
  // !25
  "🤖\n\nElige la categoria de esta transacción. Si deseas cancelar, haz click en el botón de abajo",
  // ! 26
  "🤖\n\nConfirma la transaccion:\n\n*Detalles:* `$details`\n*Monto:* `$ammount`\n*Categoria:* `$category`\n*Tipo:* `$type`",
  // ! 27
  "🤖\n\nTu movimiento fue guardado con éxito",
  // !28
  "🤖\n\n*NUEVO EGRESO*\n\nEnviame el nombre de la transaccion.\n\nPara cancelar, haz click en el botón de abajo",
  // ! 29
  "🤖\n\n*MUY IMPORTANTE TENER AHORROS!!!*\n\nIngresa el monto que quieras ahorrar:\n\nSi quieres cancelar, hazlo por el boton de abajo.",
  // ! 30
  "🤖\n\nConfirma el nuevo ahorro:\n\n*Monto:* `$ammount`",
  // ! 31
  "🤖\n\nTus ahorros fueron guardados con éxito 💰",
  // ! 32
  "🤖\n\nResumen de tus finanzas del mes $month:\n\n💰 *Ingresos:* `$income`\n💸 *Egresos:* `$expenses`\n💵 *Ahorros:* `$savings`\n\n\n📊 *Saldo Total:* `$balance`\n\n¡Sigue así para alcanzar tus metas financieras! 🚀",
  // ! 33
  "🤖\n\nDisculpa, no hay movimientos guardados para el mes de $month del $currentYear",
  // ! 34
  "🤖\n\nResumen histórico de tus finanzas:\n\n💰 *Ingresos:* `$income`\n💸 *Egresos:* `$expenses`\n💵 *Ahorros:* `$savings`\n\n\n📊 *Saldo actual:* `$balance`\n\n¡Sigue así para alcanzar tus metas financieras! 🚀",
  // ! 35
  "🤖\n\nHasta ahora tienes un total de `$ammount` ahorrados, puedes retirar en el botón de abajo.",
  // ! 36
  "🟢 *Ingresos totales:* `$ammount`",
  // ! 37
  "\t-\t*$category*: `$ammount`",
  // ! 38
  "🔴 *Gastos totales:* `$ammount`",
  // ! 39
  "\n\n🎯 Este mes ahorraste un total de `$ammount`, lo que representa el `$percent%` de tus ingresos.\n\n",
  // ! 40
  "💵 Saldo final del mes: `$ammount`",
  // ! 41
  "🎉 ¡Increíble trabajo! Ahorrar esa cantidad de tus ingresos demuestra un excelente control de tus finanzas. ¡Sigue así y alcanzarás tus metas más rápido de lo que imaginas! 🚀",
  // ! 42
  "👏 ¡Buen progreso! Ahorrar de tus ingresos es un paso sólido hacia tus objetivos. Un poco más de esfuerzo y pronto verás grandes resultados. ¡No te detengas! 💪",
  // ! 43
  "🌱 ¡No te desanimes! Ahorrar esa cantidad es un buen comienzo. Analiza tus gastos y ajusta un poco más; cada pequeño esfuerzo te acerca a tus sueños. ¡Tú puedes! 🌟}",
  // ! 44
  "💡 No te preocupes, todos los comienzos son importantes. Incluso un pequeño paso hacia el ahorro ya es un logro. Revisa tus gastos, establece prioridades, y verás cómo puedes ahorrar más el próximo mes. ¡Tú puedes lograrlo! 🌟",
  // ! 45
  `*PERFIL DEL USUARIO 👤*

  👤 *Nombres:* $userFirstName  
  👤 *Apellidos:* $userLastName 
  📧 *E-mail:* $userEmail  
  📱 *Telegram:* @$username 
  💲 *Moneda predeterminada:* $userCurrency
  🏷️ *Suscripción*: $tier
  `,
  // ! 46
  "Seguro que quieres cambiar tu $category de $oldname a ➡ $newname",
  // ! 47
  "Tu perfil fué actualizado con éxito",
  // ! 48
  "🤖\n\nTu username lo tomé de tu perfil de telegram, asi que yo me encargo de esta 😉",
  // ! 49
  "🤖\n\n¿Que quieres hacer?\n¿*Editar* una categoria ya existente o *agregar* una nueva?",
  // ! 50
  "🤖\n\n¿Cuales categorias quieres editar? ¿Ingreso o egreso?",
  // ! 51
  "🤖\n\nSelecciona la categoría que quieras editar",
  // ! 52
  "🤖\n\n¿Como quieres llamar ahora a la categoria $category?",
  // ! 53
  "🤖\n\nConfirma cambiar el nombre de *$oldname* ➡️ a *$newname*",
  // !54
  "🤖\n\nNombre cambiado con exito!!!",
  // ! 55
  "🤖\n\n¿En donde lo quieres almacenar?\n\n¿Ingreso o egreso?",
  // ! 56
  "🤖\n\nVamos a agregar una categoria nueva, por favor escribe el nombre de la categoria nueva y haces click en el botón de *enviar*",
  // ! 57
  "🤖\n\nConfirma que quieres agregar *$category*, para *$type*",
  // ! 58
  "🤖\n\n👍 $category fué agregada con exito.",
  // ! 59
  "🤖\n\nDetalles de la transacción:\n\n📌 *Tipo*: `$type`\n📅 *Fecha*: `$date`\n💰 *Monto*: `$ammount`\n📝 *Detalles*: `$details`\n🏷️ *Categoría*: `$category`",
  // ! 60
  "🤖*Acerca de mí:*\nSoy un proyecto de código abierto creado para hacer más fácil el manejo de tus gastos, ingresos y ahorros. Mi objetivo es brindarte herramientas que te permitan tomar decisiones financieras informadas y tener un mejor control de tu dinero.\n\nversion: `1.1.1`",
  //!61
  "💖 *¡Apóyame!*\nSi te gusta mi trabajo y quieres contribuir al proyecto, puedes hacer un aporte en mi página de donaciones. ¡Tu apoyo es fundamental para seguir mejorando!",
  // ! 62
  "¿Vamos a retirar de los ahorros?\n\nBueno, para eso es que guardamos ese dinero.\n\nDame la cantidad:",
  // ! 63
  "¿Confirmas el retiro del monto `$ammount` de tus ahorros?",
  // ! 64
  "🤖 ¡Gracias por tu apoyo!\n\nEstamos muy agradecidos por querer colaborar. Con tu aporte, podremos mejorar este proyecto y desarrollar muchos más en el futuro.\n\nPara apoyarnos:\n1️⃣ Haz clic en la opcion de tu preferencia abajo.\n2️⃣ Completa el proceso indicado.\n3️⃣ Toma una captura de pantalla del comprobante y envíamela por este chat.\n\n¡Mil gracias! ❤️🙏",
  // !65
  "En estos momentos tienes la zona horaria de `$timezone` ¿deseas cambiarlo?",
  // ! 66
  "🤖\n\nLo siento, no tienes suficiente saldo para realizar esta transacción. Por favor, revisa tus cuentas y verifica los saldos en el *Menú* ▶ *Ver saldos* ▶ *Historial Completo* para asegurar que todo esté correcto.",
  // ! 67
  "🤖\n\nLo siento, no tienes suficiente saldo en los ahorros para realizar esta transacción. Por favor, revisa tus cuentas y verifica los saldos en el *Menú* ▶ *Ver saldos* ▶ *Ver ahorros* para asegurar que todo esté correcto.",
  // ! 68
  "¡Muchas gracias por tu apoyo! 🙏💖 Puedes realizar la transferencia utilizando el codigo QR. 😊",
  // ! 69
  "❓ MENÚ DE AYUDA ❓\n\n1. ¿Necesito un username?\n2. ¿Cómo creo un username?\n3. ¿Cómo registro un movimiento?\n4. ¿Cómo registro un ahorro?\n5. ¿Qué es una categoría?\n6. ¿Cómo creo o edito una categoría?\n7. ¿Puedo consultar mi historial de movimientos?\n8. ¿Cómo obtengo un resumen de mis finanzas?\n9. ¿Puedo exportar mis datos?\n10. ¿Cómo cambio la zona horaria?",
  // ! 70
  '¡Hola y bienvenido a *Ahorrin*!\n\nAntes de comenzar, necesitamos que aceptes nuestros Términos y Condiciones y nuestra Política de Privacidad.\n\n🔹 Al hacer clic en *Aceptar*, confirmas que has leído y aceptas estos documentos.'
];
