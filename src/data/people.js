// Load all people images using glob
const imagesGlob = import.meta.glob(
  "@assets/images/people/*.{jpg,jpeg,png,webp}",
  {
    eager: true,
  },
);

// Create a lookup object from the glob
const images = Object.keys(imagesGlob).reduce((acc, path) => {
  // Extract filename without extension (e.g., "vester-annkristin" from "/src/assets/images/people/vester-annkristin.jpeg")
  const filename = path
    .split("/")
    .pop()
    .replace(/\.(jpg|jpeg|png)$/, "");
  acc[filename] = imagesGlob[path].default;
  return acc;
}, {});

export const people = {
  annkristin: {
    name: "Ann-Kristin Vester",
    role: "Geschäftsführung",
    image: images["vester-annkristin"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Ann-Kristin%2C",
  },
  zoe: {
    name: "Zoé Wolter",
    role: "Geschäftsführung und Bildung",
    image: images["wolter-zoe"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Ann-Kristin%2C",
  },
  antje: {
    name: "Antje Relitz",
    role: "Bildung",
    image: images["relitz-antje"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Antje%2C",
  },
  emma: {
    name: "Emma Morlock",
    role: "Werkstudentin Data Literacy",
    image: images["morlock-emma"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Emma%2C",
  },
  jonas: {
    name: "Jonas Lorenz",
    role: "Werkstudent Bildung",
    image: images["lorenz-jonas"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Jonas%2C",
  },
  nora: {
    name: "Nora Cremille",
    role: "Bildung",
    image: images["cremille-nora"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Nora%2C",
  },
  lisa: {
    name: "Lisa Vasetska",
    role: "Werkstudentin Bildung",
    image: images["vasetska-lisa"],
    email: "lab@correlaid.org?subject=CorrelLAB&body=Hi%20Lisa%2C",
  },
};
