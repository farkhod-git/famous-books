/** Backenddagi BookGenreEnum bilan bir xil bo'lishi kerak. */
const CATALOG = [
  ["ROMANCE", "Romantika"],
  ["THRILLER", "Triller"],
  ["DETECTIVE", "Detektiv"],
  ["MYSTERY", "Sirli / Jumboq"],
  ["HORROR", "Qo'rqinchli"],
  ["FANTASY", "Fentezi"],
  ["SCIENCE_FICTION", "Ilmiy fantastika"],
  ["ADVENTURE", "Sarguzasht"],
  ["HISTORICAL", "Tarixiy"],
  ["CLASSIC", "Klassika"],
  ["DRAMA", "Drama"],
  ["POETRY", "She'riyat"],
  ["BIOGRAPHY", "Biografiya"],
  ["MEMOIR", "Xotiralar"],
  ["PHILOSOPHY", "Falsafa"],
  ["PSYCHOLOGY", "Psixologiya"],
  ["SELF_DEVELOPMENT", "Shaxsiy rivojlanish"],
  ["BUSINESS", "Biznes va iqtisod"],
  ["SCIENCE", "Ilmiy"],
  ["TECHNOLOGY", "Texnologiya"],
  ["RELIGION", "Diniy"],
  ["EDUCATION", "O'quv adabiyoti"],
  ["TRAVEL", "Sayohat"],
  ["CHILDREN", "Bolalar adabiyoti"],
  ["YOUNG_ADULT", "O'smirlar uchun"],
  ["OTHER", "Boshqa"],
];

export const GENRES = CATALOG.map(([value, label]) => ({ value, label }));

export function genreLabel(value) {
  return GENRES.find((genre) => genre.value === value)?.label || value || "Janr yo'q";
}
