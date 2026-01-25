export interface ExchangeRates {
    usdToVesBinance: number;
    usdToVesBcv: number;
    usdToCop: number;
    vesToCop: number;
    usdToEur: number;
}

export interface CurrencyAmounts {
    usd: string;
    usdBinance: string;
    vesBcv: string;
    vesBinance: string;
    cop: string;
    eur: string;
}

export type SupportedCurrency = "usd" | "vesBcv" | "vesBinance" | "cop" | "eur";
export type RateInputValues = { [K in keyof ExchangeRates]: string };
export type CardTone = "amber" | "blue" | "green" | "slate" | "teal";

export interface CurrencyCardModel {
    id: keyof CurrencyAmounts;
    title: string;
    subtitle?: string;
    flag: string;
    rateKey?: keyof ExchangeRates;
    derivedRate?: number;
    result: string;
    suffix: string;
    tone: CardTone;
}
