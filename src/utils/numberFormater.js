export default async function numberFormater(ammount, currency) {
  return `${currency}${new Intl.NumberFormat().format(ammount)}`;
}
