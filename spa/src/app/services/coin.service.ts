import { Injectable } from '@angular/core';
import { CoinViewModel } from '../models/view/coin-view.model';

@Injectable({
  providedIn: 'root'
})
export class CoinService {
  private readonly coins: CoinViewModel[] = [
    {
      id: 1,
      coin: 'Dólar estadounidense (USD)',
      country: 'Estados Unidos',
      symbol: '$'
    },
    {
      id: 2,
      coin: 'Euro (EUR)',
      country: 'Unión Europea',
      symbol: '€'
    },
    {
      id: 3,
      coin: 'Yen japonés (JPY)',
      country: 'Japón',
      symbol: '¥'
    },
    {
      id: 4,
      coin: 'Libra esterlina (GBP)',
      country: 'Reino Unido',
      symbol: '£'
    },
    {
      id: 5,
      coin: 'Dólar canadiense (CAD)',
      country: 'Canadá',
      symbol: '$'
    },
    {
      id: 6,
      coin: 'Dólar australiano (AUD)',
      country: 'Australia',
      symbol: '$'
    },
    {
      id: 7,
      coin: 'Franco suizo (CHF)',
      country: 'Suiza',
      symbol: 'CHF'
    },
    {
      id: 8,
      coin: 'Corona sueca (SEK)',
      country: 'Suecia',
      symbol: 'kr'
    },
    {
      id: 9,
      coin: 'Corona noruega (NOK)',
      country: 'Noruega',
      symbol: 'kr'
    },
    {
      id: 10,
      coin: 'Corona danesa (DKK)',
      country: 'Dinamarca',
      symbol: 'kr'
    },
    {
      id: 11,
      coin: 'Dólar neozelandés (NZD)',
      country: 'Nueva Zelanda',
      symbol: '$'
    },
    {
      id: 12,
      coin: 'Real brasileño (BRL)',
      country: 'Brasil',
      symbol: 'R$'
    },
    {
      id: 13,
      coin: 'Peso mexicano (MXN)',
      country: 'México',
      symbol: '$'
    },
    {
      id: 14,
      coin: 'Rupia india (INR)',
      country: 'India',
      symbol: '₹'
    },
    {
      id: 15,
      coin: 'Yuan chino (CNY)',
      country: 'China',
      symbol: '¥'
    },
    {
      id: 16,
      coin: 'Rublo ruso (RUB)',
      country: 'Rusia',
      symbol: '₽'
    },
    {
      id: 17,
      coin: 'Rand sudafricano (ZAR)',
      country: 'Suráfrica',
      symbol: 'R'
    },
    {
      id: 18,
      coin: 'Dólar singapurense (SGD)',
      country: 'Singapur',
      symbol: '$'
    },
    {
      id: 19,
      coin: 'Won surcoreano (KRW)',
      country: 'Corea del Sur',
      symbol: '₩'
    },
    {
      id: 20,
      coin: 'Riyal saudita (SAR)',
      country: 'Arabia Saudita',
      symbol: 'ر.س'
    },
    {
      id: 21,
      coin: 'Guaraní paraguayo (PYG)',
      country: 'Paraguay',
      symbol: '₲'
    },
    {
      id: 22,
      coin: 'Peso chileno (CLP)',
      country: 'Chile',
      symbol: '$'
    },
    {
      id: 23,
      coin: 'Peso uruguayo (UYU)',
      country: 'Uruguay',
      symbol: '$U'
    },
    {
      id: 24,
      coin: 'Boliviano (BOB)',
      country: 'Bolivia',
      symbol: 'Bs.'
    },
    {
      id: 25,
      coin: 'Peso argentino (ARS)',
      country: 'Argentina',
      symbol: '$'
    },
    {
      id: 26,
      coin: 'Peso colombiano (COP)',
      country: 'Colombia',
      symbol: '$'
    },
  ]

  constructor() { }

  public getCoins = (): CoinViewModel[] => this.coins

}
