import axios from 'axios';
import crypto from 'crypto';
const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();
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
    constructor(apikey, apisecret, axiosConfig = {}) {
        if (!axiosConfig.baseURL) {
            axiosConfig.baseURL = 'https://bpay.binanceapi.com';
        }
        this.apikey = apikey;
        this.apisecret = apisecret;
        this.client = axios.create(axiosConfig);
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
            'binancepay-timestamp': ts,
            'binancepay-nonce': nonce,
            'binancepay-certificate-sn': this.apikey,
            'binancepay-signature': signature
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQTJELE1BQU0sT0FBTyxDQUFBO0FBQy9FLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUszQixNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRW5HLE1BQU0sT0FBTyxZQUFZO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQWU7SUFDckIsWUFBWSxDQUVuQjtJQUVEOzs7OztPQUtHO0lBQ0gsWUFBWSxNQUFjLEVBQUUsU0FBaUIsRUFBRSxjQUFrQyxFQUFFO1FBQ2xGLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFO1lBQ3pCLFdBQVcsQ0FBQyxPQUFPLEdBQUcsNkJBQTZCLENBQUE7U0FDbkQ7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQTtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUE7SUFDeEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxXQUFXLENBQUMsS0FBWTtRQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUM1RSxDQUFDO0lBRUQsZUFBZTtRQUNkLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxFQUFFLEVBQUUs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