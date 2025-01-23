export default async function capitalizeWords(string) {
  let newString = "";
  if (string === null || string === "" || string === undefined) {
    return newString;
  } else {
    newString = string;
  }
  if (!newString.includes(" ")) {
    // Si es una sola palabra
    return newString.charAt(0).toUpperCase() + newString.slice(1).toLowerCase();
  }
  // Si hay más de una palabra
  return newString
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
