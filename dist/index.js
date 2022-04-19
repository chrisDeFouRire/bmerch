import axios from 'axios';
import crypto from 'crypto';
const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
const baseURL = 'https://bpay.binanceapi.com';
export class BinanceMerch {
    apikey;
    apisecret;
    client;
    /**
     * Constructor for the BinanceMerch API
     * @param apikey your Binance Merchant API key
     * @param apisecret your Binance Merchant API secret
     * @param axiosConfig Optional parameters for Axios
     */
    constructor(apikey, apisecret, axiosConfig) {
        this.apikey = apikey;
        this.apisecret = apisecret;
        this.client = axios.create({ baseURL, ...axiosConfig });
    }
    /**
     * Create a new Order (v2 API)
     * @param order the order to create
     * @returns the Axios response for the Order Response
     */
    createOrder(order) {
        const headers = this.sign(order);
        return this.client.post('/binancepay/openapi/v2/order', order, { headers });
    }
    // signs a request, returns the headers to be used
    sign(body) {
        const ts = Date.now().toString();
        let nonce = '';
        for (let i = 0; i < 32; i++) {
            nonce += allowednoncechars[Math.ceil(Math.random() * 52)];
        }
        const payload = `${ts}\n${nonce}\n${JSON.stringify(body)}\n`;
        const hmac = crypto.createHmac("sha512", this.apisecret);
        hmac.update(payload);
        const signature = hmac.digest('hex').toUpperCase();
        return {
            'content-type': 'application/json',
            'BinancePay-Timestamp': ts,
            'BinancePay-Nonce': nonce,
            'BinancePay-Certificate-SN': this.apikey,
            'BinancePay-Signature': signature
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQTJELE1BQU0sT0FBTyxDQUFBO0FBQy9FLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUkzQixNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRW5HLE1BQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFBO0FBRTdDLE1BQU0sT0FBTyxZQUFZO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQWU7SUFFN0I7Ozs7O09BS0c7SUFDSCxZQUFZLE1BQWMsRUFBRSxTQUFpQixFQUFFLFdBQWdDO1FBQzlFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFBO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLFdBQVcsRUFBQyxDQUFDLENBQUE7SUFDdkQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsS0FBWTtRQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM1RSxDQUFDO0lBRUQsa0RBQWtEO0lBQzFDLElBQUksQ0FBQyxJQUFZO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUNoQyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUE7UUFDZCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzVCLEtBQUssSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3pEO1FBRUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLEtBQUssS0FBSyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQTtRQUU1RCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUNwQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBRWxELE9BQU87WUFDTixjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLHNCQUFzQixFQUFFLEVBQUU7WUFDMUIsa0JBQWtCLEVBQUUsS0FBSztZQUN6QiwyQkFBMkIsRUFBRSxJQUFJLENBQUMsTUFBTTtZQUN4QyxzQkFBc0IsRUFBRSxTQUFTO1NBQ2pDLENBQUE7SUFDRixDQUFDO0NBQ0QifQ==