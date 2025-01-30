export function adjustToLocalTime(utcDateString, timeZone) {
  const utcDate = new Date(utcDateString); 

  // Usamos la librería `Intl.DateTimeFormat` para formatear la fecha con la zona horaria
  const adjustedDate = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  }).formatToParts(utcDate);

  const year = adjustedDate.find(part => part.type === 'year').value;
  const month = adjustedDate.find(part => part.type === 'month').value;
  const day = adjustedDate.find(part => part.type === 'day').value;
  const hour = adjustedDate.find(part => part.type === 'hour').value;
  const minute = adjustedDate.find(part => part.type === 'minute').value;
  const second = adjustedDate.find(part => part.type === 'second').value;
  const fraction = '000';
  
  const timeZoneOffset = new Date().getTimezoneOffset() / -60; 
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${fraction}${(timeZoneOffset < 10 ? '+0' : '+')}${timeZoneOffset}:00`;
}

export const timeZones = [
  "America/Argentina/Buenos_Aires",
  "America/Brazil/Acre",
  "America/Santiago", // Chile
  "America/Bogota", // Colombia
  "America/Mexico_City", // México
  "America/Lima", // Perú
  "America/Asuncion", // Paraguay
  "America/Caracas", // Venezuela
  "America/Montevideo", // Uruguay
  "America/Quito", // Ecuador
];

