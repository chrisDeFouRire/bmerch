import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Order, Order_Response } from './types';
export type { Order, Order_Response };
export declare class BinanceMerch {
    private apikey;
    private apisecret;
    private client;
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
    private sign;
}
