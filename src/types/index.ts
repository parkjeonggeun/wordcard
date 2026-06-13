export interface CardItem {
  id: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  imagePath: string;
}

export interface Category {
  id: string;
  nameKo: string;
  nameEn: string;
  emoji: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  cards: CardItem[];
}
