import axios from 'axios';
import crypto from 'crypto';
const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
const baseURL = 'https://bpay.binanceapi.com';
export class BinanceMerch {
    apikey;
    apisecret;
    client;
    certificates;
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
    getCertificates() {
        const headers = this.sign({});
        return this.client.post('/binancepay/openapi/certificates', {}, { headers });
    }
    // signs a request, returns the headers to be used
    sign(body) {
        const ts = Date.now().toString();
        let nonce = '';
        for (let i = 0; i < 32; i++) {
            const c = Math.ceil(Math.random() * 51);
            nonce += allowednoncechars[c];
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
    /**
     * Checks the signature of an incoming webhook request
     * @param headers The headers to check against
     * @param body The body to check
     * @returns a promise for true if the signature is OK
     */
    async isValidWebhookRequest(headers, jsonBody) {
        if (!this.certificates) {
            this.certificates = {};
            const certs = await this.getCertificates();
            if (certs.data.status != "SUCCESS") {
                throw new Error("Binance Pay Merchant API couldn't get Certificates");
            }
            for (let cert of certs.data.data) {
                this.certificates[cert.certSerial] = crypto.createPublicKey(cert.certPublic);
            }
        }
        const payload = headers['binancepay-timestamp'] + "\n" + headers['binancepay-nonce'] + "\n" + jsonBody + "\n";
        const signature = Buffer.from(headers['binancepay-signature'], 'base64');
        const cert = this.certificates[headers['binancepay-certificate-sn']];
        if (!cert) {
            console.error("Can't find Binance cert with SN " + headers['binancepay-certificate-sn']);
            return false;
        }
        const v = crypto.createVerify('RSA-SHA256');
        v.update(payload);
        return v.verify(cert, signature);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQTJELE1BQU0sT0FBTyxDQUFBO0FBQy9FLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUczQixNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRW5HLE1BQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFBO0FBRTdDLE1BQU0sT0FBTyxZQUFZO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQWU7SUFDckIsWUFBWSxDQUVuQjtJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxNQUFjLEVBQUUsU0FBaUIsRUFBRSxXQUFnQztRQUM5RSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxXQUFXLEVBQUUsQ0FBQyxDQUFBO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsV0FBVyxDQUFDLEtBQVk7UUFDdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNoQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDNUUsQ0FBQztJQUVELGVBQWU7UUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJ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