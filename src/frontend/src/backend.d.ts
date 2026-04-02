import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SalesData {
    plan: Category;
    withoutCoin: Category;
    overallSale: Category;
    studded: Category;
    plain: Category;
}
export interface SalesKey {
    month: bigint;
    year: bigint;
}
export interface Category {
    achieved: bigint;
    target: bigint;
}
export interface backendInterface {
    getAllMonths(): Promise<Array<[SalesKey, SalesData]>>;
    getAllMonthsSorted(): Promise<Array<[SalesKey, SalesData]>>;
    getMonth(key: SalesKey): Promise<SalesData>;
    saveMonth(key: SalesKey, data: SalesData): Promise<void>;
}
