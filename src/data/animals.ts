export interface AnimalEntry {
  name: string;
  weight: number; // Nominal weight in kg
  qtEstate: number;
  qtInverno: number;
  h2oEstate: number;
  h2oInverno: number;
  qsEstate: number;
  qsInverno: number;
  co2: number;
  vEstate: number;
}

export const ANIMAL_DATABASE: AnimalEntry[] = [
  { name: "Vacche da latte (500 kg, 10 kg latte/g)", weight: 500, qtEstate: 820, qtInverno: 890, h2oEstate: 815, h2oInverno: 300, qsEstate: 270, qsInverno: 685, co2: 145, vEstate: 319 },
  { name: "Vacche da latte (500 kg, 15 kg latte/g)", weight: 500, qtEstate: 930, qtInverno: 1005, h2oEstate: 920, h2oInverno: 340, qsEstate: 305, qsInverno: 775, co2: 165, vEstate: 365 },
  { name: "Vacche da latte (500 kg, 20 kg latte/g)", weight: 500, qtEstate: 1035, qtInverno: 1120, h2oEstate: 1025, h2oInverno: 380, qsEstate: 335, qsInverno: 860, co2: 180, vEstate: 410 },
  { name: "Vacche da latte (600 kg, 10 kg latte/g)", weight: 600, qtEstate: 905, qtInverno: 980, h2oEstate: 895, h2oInverno: 330, qsEstate: 295, qsInverno: 755, co2: 160, vEstate: 354 },
  { name: "Vacche da latte (600 kg, 15 kg latte/g)", weight: 600, qtEstate: 1010, qtInverno: 1095, h2oEstate: 1000, h2oInverno: 370, qsEstate: 330, qsInverno: 850, co2: 180, vEstate: 399 },
  { name: "Vacche da latte (600 kg, 20 kg latte/g)", weight: 600, qtEstate: 1115, qtInverno: 1210, h2oEstate: 1105, h2oInverno: 410, qsEstate: 365, qsInverno: 930, co2: 195, vEstate: 444 },
  { name: "Vacche da latte (700 kg, 10 kg latte/g)", weight: 700, qtEstate: 985, qtInverno: 1065, h2oEstate: 975, h2oInverno: 360, qsEstate: 320, qsInverno: 820, co2: 175, vEstate: 389 },
  { name: "Vacche da latte (700 kg, 15 kg latte/g)", weight: 700, qtEstate: 1090, qtInverno: 1180, h2oEstate: 1080, h2oInverno: 400, qsEstate: 355, qsInverno: 910, co2: 195, vEstate: 433 },
  { name: "Vacche da latte (700 kg, 20 kg latte/g)", weight: 700, qtEstate: 1195, qtInverno: 1295, h2oEstate: 1185, h2oInverno: 440, qsEstate: 390, qsInverno: 1000, co2: 210, vEstate: 478 },
  { name: "Vitelli da rimonta (50 kg)", weight: 50, qtEstate: 125, qtInverno: 135, h2oEstate: 125, h2oInverno: 46, qsEstate: 41, qsInverno: 105, co2: 22, vEstate: 65 },
  { name: "Vitelli da rimonta (100 kg)", weight: 100, qtEstate: 215, qtInverno: 235, h2oEstate: 215, h2oInverno: 79, qsEstate: 70, qsInverno: 180, co2: 38, vEstate: 94 },
  { name: "Vitelli da rimonta (150 kg)", weight: 150, qtEstate: 310, qtInverno: 335, h2oEstate: 305, h2oInverno: 115, qsEstate: 100, qsInverno: 260, co2: 55, vEstate: 129 },
  { name: "Manze da rimonta (200 kg)", weight: 200, qtEstate: 395, qtInverno: 430, h2oEstate: 390, h2oInverno: 145, qsEstate: 130, qsInverno: 330, co2: 70, vEstate: 163 },
  { name: "Manze da rimonta (300 kg)", weight: 300, qtEstate: 550, qtInverno: 595, h2oEstate: 545, h2oInverno: 200, qsEstate: 180, qsInverno: 460, co2: 97, vEstate: 223 },
  { name: "Manze da rimonta (400 kg)", weight: 400, qtEstate: 690, qtInverno: 745, h2oEstate: 680, h2oInverno: 250, qsEstate: 225, qsInverno: 575, co2: 120, vEstate: 275 },
  { name: "Manze da rimonta (500 kg)", weight: 500, qtEstate: 815, qtInverno: 885, h2oEstate: 810, h2oInverno: 300, qsEstate: 265, qsInverno: 680, co2: 145, vEstate: 319 },
  { name: "Vitelli da carne (50 kg)", weight: 50, qtEstate: 125, qtInverno: 135, h2oEstate: 125, h2oInverno: 46, qsEstate: 41, qsInverno: 105, co2: 22, vEstate: 65 },
  { name: "Vitelli da carne (100 kg)", weight: 100, qtEstate: 240, qtInverno: 260, h2oEstate: 240, h2oInverno: 88, qsEstate: 78, qsInverno: 200, co2: 43, vEstate: 94 },
  { name: "Vitelli da carne (150 kg)", weight: 150, qtEstate: 345, qtInverno: 375, h2oEstate: 340, h2oInverno: 125, qsEstate: 110, qsInverno: 285, co2: 61, vEstate: 129 },
  { name: "Bovini da carne (200 kg)", weight: 200, qtEstate: 440, qtInverno: 475, h2oEstate: 435, h2oInverno: 160, qsEstate: 145, qsInverno: 365, co2: 85, vEstate: 163 },
  { name: "Bovini da carne (300 kg)", weight: 300, qtEstate: 610, qtInverno: 660, h2oEstate: 605, h2oInverno: 225, qsEstate: 200, qsInverno: 510, co2: 120, vEstate: 223 },
  { name: "Bovini da carne (400 kg)", weight: 400, qtEstate: 765, qtInverno: 830, h2oEstate: 760, h2oInverno: 280, qsEstate: 250, qsInverno: 640, co2: 150, vEstate: 275 },
  { name: "Bovini da carne (500 kg)", weight: 500, qtEstate: 906, qtInverno: 980, h2oEstate: 895, h2oInverno: 330, qsEstate: 295, qsInverno: 755, co2: 175, vEstate: 319 },
  { name: "Scrofe gestanti e verri (150 kg)", weight: 150, qtEstate: 215, qtInverno: 225, h2oEstate: 210, h2oInverno: 89, qsEstate: 70, qsInverno: 160, co2: 36, vEstate: 145 },
  { name: "Scrofe gestanti e verri (200 kg)", weight: 200, qtEstate: 260, qtInverno: 275, h2oEstate: 260, h2oInverno: 110, qsEstate: 85, qsInverno: 200, co2: 45, vEstate: 184 },
  { name: "Scrofe gestanti e verri (250 kg)", weight: 250, qtEstate: 305, qtInverno: 320, h2oEstate: 305, h2oInverno: 130, qsEstate: 100, qsInverno: 235, co2: 52, vEstate: 224 },
  { name: "Scrofe in allattamento (150 kg)", weight: 150, qtEstate: 375, qtInverno: 390, h2oEstate: 370, h2oInverno: 180, qsEstate: 120, qsInverno: 270, co2: 64, vEstate: 145 },
  { name: "Scrofe in allattamento (200 kg)", weight: 200, qtEstate: 420, qtInverno: 435, h2oEstate: 415, h2oInverno: 200, qsEstate: 135, qsInverno: 300, co2: 71, vEstate: 184 },
  { name: "Scrofe in allattamento (250 kg)", weight: 250, qtEstate: 465, qtInverno: 485, h2oEstate: 465, h2oInverno: 225, qsEstate: 155, qsInverno: 335, co2: 79, vEstate: 224 },
  { name: "Suinetti (2 kg)", weight: 2, qtEstate: 17, qtInverno: 18, h2oEstate: 17, h2oInverno: 15, qsEstate: 5.6, qsInverno: 7.3, co2: 2.9, vEstate: 14 },
  { name: "Suinetti (5 kg)", weight: 5, qtEstate: 35, qtInverno: 37, h2oEstate: 35, h2oInverno: 26, qsEstate: 12, qsInverno: 19, co2: 6, vEstate: 18 },
  { name: "Suinetti (10 kg)", weight: 10, qtEstate: 58, qtInverno: 61, h2oEstate: 58, h2oInverno: 40, qsEstate: 19, qsInverno: 33, co2: 9.9, vEstate: 25 },
  { name: "Suinetti (20 kg)", weight: 20, qtEstate: 92, qtInverno: 96, h2oEstate: 92, h2oInverno: 49, qsEstate: 30, qsInverno: 62, co2: 16, vEstate: 36 },
  { name: "Suini da ingrasso (30 kg)", weight: 30, qtEstate: 120, qtInverno: 125, h2oEstate: 120, h2oInverno: 57, qsEstate: 39, qsInverno: 85, co2: 20, vEstate: 47 },
  { name: "Suini da ingrasso (40 kg)", weight: 40, qtEstate: 140, qtInverno: 150, h2oEstate: 140, h2oInverno: 60, qsEstate: 46, qsInverno: 110, co2: 24, vEstate: 61 },
  { name: "Suini da ingrasso (60 kg)", weight: 60, qtEstate: 180, qtInverno: 190, h2oEstate: 180, h2oInverno: 71, qsEstate: 59, qsInverno: 145, co2: 31, vEstate: 75 },
  { name: "Suini da ingrasso (80 kg)", weight: 80, qtEstate: 215, qtInverno: 225, h2oEstate: 210, h2oInverno: 84, qsEstate: 70, qsInverno: 170, co2: 37, vEstate: 91 },
  { name: "Suini da ingrasso (100 kg)", weight: 100, qtEstate: 245, qtInverno: 255, h2oEstate: 240, h2oInverno: 95, qsEstate: 79, qsInverno: 190, co2: 42, vEstate: 106 },
  { name: "Suini da ingrasso (140 kg)", weight: 140, qtEstate: 320, qtInverno: 330, h2oEstate: 315, h2oInverno: 125, qsEstate: 100, qsInverno: 245, co2: 53, vEstate: 150 },
  { name: "Suini da ingrasso (150 kg)", weight: 150, qtEstate: 320, qtInverno: 330, h2oEstate: 315, h2oInverno: 125, qsEstate: 100, qsInverno: 245, co2: 53, vEstate: 145 },
  { name: "Suini da ingrasso (160 kg)", weight: 160, qtEstate: 360, qtInverno: 366, h2oEstate: 350, h2oInverno: 140, qsEstate: 110, qsInverno: 265, co2: 58, vEstate: 160 },
  { name: "Agnelli (20 kg)", weight: 20, qtEstate: 60, qtInverno: 65, h2oEstate: 58, h2oInverno: 22, qsEstate: 20, qsInverno: 50, co2: 11, vEstate: 36 },
  { name: "Agnelli (40 kg)", weight: 40, qtEstate: 100, qtInverno: 110, h2oEstate: 99, h2oInverno: 38, qsEstate: 33, qsInverno: 84, co2: 18, vEstate: 61 },
  { name: "Pecore (60 kg)", weight: 60, qtEstate: 110, qtInverno: 120, h2oEstate: 110, h2oInverno: 40, qsEstate: 36, qsInverno: 93, co2: 20, vEstate: 75 },
  { name: "Pecore (80 kg)", weight: 80, qtEstate: 140, qtInverno: 150, h2oEstate: 140, h2oInverno: 50, qsEstate: 45, qsInverno: 115, co2: 25, vEstate: 91 },
  { name: "Conigli (0,5 kg)", weight: 0.5, qtEstate: 3.8, qtInverno: 3.9, h2oEstate: 2, h2oInverno: 1.4, qsEstate: 2, qsInverno: 2.9, co2: 1.0, vEstate: 2 },
  { name: "Conigli (1,5 kg)", weight: 1.5, qtEstate: 7.5, qtInverno: 7.8, h2oEstate: 4, h2oInverno: 2.7, qsEstate: 3, qsInverno: 6, co2: 1.8, vEstate: 6 },
  { name: "Conigli (2,5 kg)", weight: 2.5, qtEstate: 11.8, qtInverno: 12.1, h2oEstate: 6, h2oInverno: 4, qsEstate: 6, qsInverno: 9.4, co2: 2.2, vEstate: 10 },
  { name: "Fattrici (4 kg)", weight: 4, qtEstate: 17, qtInverno: 17.6, h2oEstate: 7, h2oInverno: 5.5, qsEstate: 8, qsInverno: 13.9, co2: 2.54, vEstate: 16 },
  { name: "Riproduttori (5 kg)", weight: 5, qtEstate: 19, qtInverno: 20.4, h2oEstate: 8, h2oInverno: 6, qsEstate: 12, qsInverno: 16.3, co2: 2.71, vEstate: 20 },
  { name: "Fattrici in allatamento + nidiata", weight: 4, qtEstate: 31, qtInverno: 32.6, h2oEstate: 12, h2oInverno: 10.5, qsEstate: 18, qsInverno: 25.5, co2: 2.84, vEstate: 24 },
  { name: "Polli (0,05 kg)", weight: 0.05, qtEstate: 0.52, qtInverno: 0.49, h2oEstate: 0.24, h2oInverno: 0.16, qsEstate: 0.08, qsInverno: 0.35, co2: 0.08, vEstate: 1 },
  { name: "Polli (0,3 kg)", weight: 0.3, qtEstate: 3.09, qtInverno: 2.95, h2oEstate: 1.43, h2oInverno: 0.98, qsEstate: 0.50, qsInverno: 2.11, co2: 0.46, vEstate: 3 },
  { name: "Polli (0,5 kg)", weight: 0.5, qtEstate: 3.09, qtInverno: 2.95, h2oEstate: 1.43, h2oInverno: 0.98, qsEstate: 0.50, qsInverno: 2.11, co2: 0.46, vEstate: 5 },
  { name: "Polli (1 kg)", weight: 1, qtEstate: 6.2, qtInverno: 5.9, h2oEstate: 2.9, h2oInverno: 2.0, qsEstate: 1.0, qsInverno: 4.2, co2: 0.93, vEstate: 9 },
  { name: "Polli (1,7 kg)", weight: 1.7, qtEstate: 9.6, qtInverno: 10, h2oEstate: 4.6, h2oInverno: 3.1, qsEstate: 1.6, qsInverno: 6.9, co2: 1.8, vEstate: 11 },
  { name: "Polli (2,2 kg)", weight: 2.2, qtEstate: 13.6, qtInverno: 13, h2oEstate: 6.3, h2oInverno: 4.3, qsEstate: 2.2, qsInverno: 9.3, co2: 2.04, vEstate: 12 },
  { name: "Polli (3,2 kg)", weight: 3.2, qtEstate: 19.7, qtInverno: 18.9, h2oEstate: 9.2, h2oInverno: 6.2, qsEstate: 3.2, qsInverno: 13.5, co2: 2.97, vEstate: 14 },
  { name: "Galline (1,5 kg)", weight: 1.5, qtEstate: 9.6, qtInverno: 10, h2oEstate: 4.6, h2oInverno: 3.1, qsEstate: 1.6, qsInverno: 6.9, co2: 1.8, vEstate: 11 },
  { name: "Galline (2 kg)", weight: 2, qtEstate: 11.3, qtInverno: 11.8, h2oEstate: 5.4, h2oInverno: 3.7, qsEstate: 1.9, qsInverno: 8.1, co2: 1.85, vEstate: 12 },
  { name: "Galline (2,5 kg)", weight: 2.5, qtEstate: 13.6, qtInverno: 13, h2oEstate: 6.3, h2oInverno: 4.3, qsEstate: 2.2, qsInverno: 9.3, co2: 2.04, vEstate: 14 }
];
