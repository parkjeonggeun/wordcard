import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'fruits',
    nameKo: '과일',
    nameEn: 'Fruits',
    emoji: '🍎',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-700',
    cards: [
      { id: 'apple',      nameKo: '사과',    nameEn: 'Apple',      emoji: '🍎', imagePath: '/images/fruits/apple.png' },
      { id: 'banana',     nameKo: '바나나',  nameEn: 'Banana',     emoji: '🍌', imagePath: '/images/fruits/banana.png' },
      { id: 'strawberry', nameKo: '딸기',    nameEn: 'Strawberry', emoji: '🍓', imagePath: '/images/fruits/strawberry.png' },
      { id: 'grape',      nameKo: '포도',    nameEn: 'Grape',      emoji: '🍇', imagePath: '/images/fruits/grape.png' },
      { id: 'watermelon', nameKo: '수박',    nameEn: 'Watermelon', emoji: '🍉', imagePath: '/images/fruits/watermelon.png' },
      { id: 'tangerine',  nameKo: '귤',      nameEn: 'Tangerine',  emoji: '🍊', imagePath: '/images/fruits/tangerine.png' },
      { id: 'peach',      nameKo: '복숭아',  nameEn: 'Peach',      emoji: '🍑', imagePath: '/images/fruits/peach.png' },
      { id: 'pineapple',  nameKo: '파인애플', nameEn: 'Pineapple', emoji: '🍍', imagePath: '/images/fruits/pineapple.png' },
    ],
  },
  {
    id: 'vegetables',
    nameKo: '채소',
    nameEn: 'Vegetables',
    emoji: '🥕',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    cards: [
      { id: 'carrot',   nameKo: '당근',    nameEn: 'Carrot',    emoji: '🥕', imagePath: '/images/vegetables/carrot.png' },
      { id: 'tomato',   nameKo: '토마토',  nameEn: 'Tomato',    emoji: '🍅', imagePath: '/images/vegetables/tomato.png' },
      { id: 'cucumber', nameKo: '오이',    nameEn: 'Cucumber',  emoji: '🥒', imagePath: '/images/vegetables/cucumber.png' },
      { id: 'corn',     nameKo: '옥수수',  nameEn: 'Corn',      emoji: '🌽', imagePath: '/images/vegetables/corn.png' },
      { id: 'onion',    nameKo: '양파',    nameEn: 'Onion',     emoji: '🧅', imagePath: '/images/vegetables/onion.png' },
      { id: 'potato',   nameKo: '감자',    nameEn: 'Potato',    emoji: '🥔', imagePath: '/images/vegetables/potato.png' },
      { id: 'broccoli', nameKo: '브로콜리', nameEn: 'Broccoli', emoji: '🥦', imagePath: '/images/vegetables/broccoli.png' },
      { id: 'cabbage',  nameKo: '배추',    nameEn: 'Cabbage',   emoji: '🥬', imagePath: '/images/vegetables/cabbage.png' },
    ],
  },
  {
    id: 'vehicles',
    nameKo: '탈것',
    nameEn: 'Vehicles',
    emoji: '🚗',
    bgColor: 'bg-sky-100',
    borderColor: 'border-sky-300',
    textColor: 'text-sky-700',
    cards: [
      { id: 'car',        nameKo: '자동차',   nameEn: 'Car',        emoji: '🚗', imagePath: '/images/vehicles/car.png' },
      { id: 'bus',        nameKo: '버스',     nameEn: 'Bus',        emoji: '🚌', imagePath: '/images/vehicles/bus.png' },
      { id: 'taxi',       nameKo: '택시',     nameEn: 'Taxi',       emoji: '🚕', imagePath: '/images/vehicles/taxi.png' },
      { id: 'firetruck',  nameKo: '소방차',   nameEn: 'Fire Truck', emoji: '🚒', imagePath: '/images/vehicles/firetruck.png' },
      { id: 'policecar',  nameKo: '경찰차',   nameEn: 'Police Car', emoji: '🚓', imagePath: '/images/vehicles/policecar.png' },
      { id: 'ambulance',  nameKo: '구급차',   nameEn: 'Ambulance',  emoji: '🚑', imagePath: '/images/vehicles/ambulance.png' },
      { id: 'train',      nameKo: '기차',     nameEn: 'Train',      emoji: '🚂', imagePath: '/images/vehicles/train.png' },
      { id: 'airplane',   nameKo: '비행기',   nameEn: 'Airplane',   emoji: '✈️', imagePath: '/images/vehicles/airplane.png' },
      { id: 'helicopter', nameKo: '헬리콥터', nameEn: 'Helicopter', emoji: '🚁', imagePath: '/images/vehicles/helicopter.png' },
      { id: 'ship',       nameKo: '배',       nameEn: 'Ship',       emoji: '🚢', imagePath: '/images/vehicles/ship.png' },
      { id: 'bicycle',    nameKo: '자전거',   nameEn: 'Bicycle',    emoji: '🚲', imagePath: '/images/vehicles/bicycle.png' },
      { id: 'excavator',  nameKo: '굴착기',   nameEn: 'Excavator',  emoji: '🚜', imagePath: '/images/vehicles/excavator.png' },
      { id: 'dumptruck',  nameKo: '덤프트럭', nameEn: 'Dump Truck', emoji: '🚛', imagePath: '/images/vehicles/dumptruck.png' },
      { id: 'tractor',    nameKo: '트랙터',   nameEn: 'Tractor',    emoji: '🚜', imagePath: '/images/vehicles/tractor.png' },
    ],
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
