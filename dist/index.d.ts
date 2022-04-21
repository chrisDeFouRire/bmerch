import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { BinancePayHeaders, GetCertificates_Response, Order, Order_Response } from './types';
export type { Order, Order_Response, BinancePayHeaders };
export declare class BinanceMerch {
    private apikey;
    private apisecret;
    private client;
    private certificates?;
    /**
     * Constructor for the BinanceMerch API
     * @param apikey your Binance Merchant API key
     * @param apisecret your Binance Merchant API secret
     * @param axiosConfig Optional parameters for Axios
     */
    constructor(apikey: string, apisecret: string, axiosConfig?: AxiosRequestConfig);
    /**
     * Create a new Order (v2 API)
     * @param order the order to create
     * @returns the Axios response for the Order Response
     */
    createOrder(order: Order): Promise<AxiosResponse<Order_Response>>;
    getCertificates(): Promise<AxiosResponse<GetCertificates_Response>>;
    private sign;
    /**
     * Checks the signature of an incoming webhook request
     * @param headers The headers to check against
     * @param body The body to check
     * @returns a promise for true if the signature is OK
     */
    isValidWebhookRequest(headers: BinancePayHeaders, jsonBody: string): Promise<boolean>;
}
