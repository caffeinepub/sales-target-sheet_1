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
    value: Category;
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
    achieved: number;
    target: number;
}
export interface backendInterface {
    deleteUser(adminMobileId: string, targetMobile: string): Promise<boolean>;
    getAllMonths(userMobile: string): Promise<Array<[SalesKey, SalesData]>>;
    getAllMonthsSorted(userMobile: string): Promise<Array<[SalesKey, SalesData]>>;
    getMonth(userMobile: string, key: SalesKey): Promise<SalesData>;
    isAdminUser(mobile: string): Promise<boolean>;
    listUsers(): Promise<Array<string>>;
    loginUser(mobile: string, password: string): Promise<boolean>;
    registerUser(mobile: string, password: string): Promise<boolean>;
    saveMonth(userMobile: string, key: SalesKey, data: SalesData): Promise<void>;
}
