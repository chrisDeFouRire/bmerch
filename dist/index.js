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
    async isValidSignature(headers, jsonBody) {
        if (!this.certificates) {
            const certs = await this.getCertificates();
            if (certs.data.status != "SUCCESS") {
                throw new Error("Binance Pay Merchant API couldn't get Certificates");
            }
            this.certificates = certs.data.data.map(pem => crypto.createPublicKey(pem.certPublic));
        }
        const payload = headers['binancepay-timestamp'] + "\n" + headers['binancepay-nonce'] + "\n" + jsonBody + "\n";
        const signature = Buffer.from(headers['binancepay-signature'], 'base64');
        function tryCertificate(publicKey) {
            const v = crypto.createVerify('RSA-SHA256');
            v.update(payload);
            return v.verify(publicKey, signature);
        }
        const verified = this.certificates.find(cert => tryCertificate(cert));
        return verified != undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQTJELE1BQU0sT0FBTyxDQUFBO0FBQy9FLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUkzQixNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRW5HLE1BQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFBO0FBRTdDLE1BQU0sT0FBTyxZQUFZO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQWU7SUFDckIsWUFBWSxDQUEwQjtJQUU5Qzs7Ozs7T0FLRztJQUNILFlBQVksTUFBYyxFQUFFLFNBQWlCLEVBQUUsV0FBZ0M7UUFDOUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxLQUFZO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVFLENBQUM7SUFFRCxlQUFlO1FBQ2QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7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