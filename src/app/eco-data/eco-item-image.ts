// The wiki redirect keeps icon URLs stable while avoiding any runtime scraping.
export const ecoItemImageUrl = (iconName: string): string =>
  `https://wiki.play.eco/en/Special:Redirect/file/${encodeURIComponent(`${iconName}_Icon.png`)}`;
