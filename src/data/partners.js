const imagesGlob = import.meta.glob('@assets/images/partners/*.{jpg,jpeg,png,webp}', {
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

export const partners = [
  { name: 'Lernzeit gUg', logo: images['lernzeit'] },
  { name: 'Herausforderung einfach machen', logo: images['herausforderung-einfach-machen'] },
  { name: 'Hacker School', logo: images['hacker-school'] },
  { name: 'Der Kinderschutzbund Frankfurt', logo: images['kinderschutzbund-frankfurt'] },
  { name: 'Quinoa Bildung gGmbH', logo: images['quinoa-bildung'] },
  { name: 'Common Purpose', logo: images['common-purpose'] },
  { name: 'Stiftung Ein Quadratkilometer Bildung gGmbH', logo: images['km2-bildung'] },
  { name: 'Aelius Förderwerk e.V.', logo: images['aelius-foerderwerk'] },
  { name: 'Education Y / Pacemaker', logo: images['education-y'] },
  { name: 'Start Stiftung', logo: images['start-stiftung'] },
  { name: 'Zukunft Umwelt Gesellschaft gGmbH', logo: images['zubaka'] },
  { name: 'Dare2Care gUG', logo: images['dare2care'] },
  { name: 'InSL e. V.', logo: images['insl'] },
];
