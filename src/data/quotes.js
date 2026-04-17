import quotesData from './quotes.json';

const imagesGlob = import.meta.glob('@assets/images/people/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

const images = Object.keys(imagesGlob).reduce((acc, path) => {
  const filename = path
    .split('/')
    .pop()
    .replace(/\.(jpg|jpeg|png|webp)$/, '');
  acc[filename] = imagesGlob[path].default;
  return acc;
}, {});

const resolve = (quote) => ({
  ...quote,
  image: quote.image ? images[quote.image] : undefined,
});

export const quotes = {
  landing: quotesData.landing.map(resolve),
  grundkurs: quotesData.grundkurs.map(resolve),
  deepdive_ki: quotesData.deepdive_ki.map(resolve),
  fokuskurs_kommunizieren: quotesData.fokuskurs_kommunizieren.map(resolve),
};
