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
    /**
     * Checks the signature of an incoming webhook request
     * @param headers The headers to check against
     * @param body The body to check
     * @returns a promise for true if the signature is OK
     */
    async isValidSignature(headers, body) {
        const jsonBody = JSON.stringify(body);
        if (!this.certificates) {
            const certs = await this.getCertificates();
            if (certs.data.status != "SUCCESS") {
                throw new Error("Binance Pay Merchant API couldn't get Certificates");
            }
            this.certificates = certs.data.data;
            if (!this.certificates) {
                throw new Error("Can't find certificates for Binance Pay");
            }
        }
        const payload = `${headers['BinancePay-Timestamp']}\n${headers['BinancePay-Nonce']}\n${jsonBody}\n`;
        const signature = Buffer.from(headers['BinancePay-Signature'], 'base64');
        function tryCertificate(certPublic) {
            const publicKey = crypto.createPublicKey(certPublic); // TODO cache public key objects
            const v = crypto.createVerify('RSA-SHA256');
            v.update(jsonBody);
            return v.verify(publicKey, signature);
        }
        const verified = this.certificates.find(cert => tryCertificate(cert.certPublic));
        return verified != undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQTJELE1BQU0sT0FBTyxDQUFBO0FBQy9FLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUkzQixNQUFNLGlCQUFpQixHQUFHLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRW5HLE1BQU0sT0FBTyxHQUFHLDZCQUE2QixDQUFBO0FBRTdDLE1BQU0sT0FBTyxZQUFZO0lBQ2hCLE1BQU0sQ0FBUTtJQUNkLFNBQVMsQ0FBUTtJQUNqQixNQUFNLENBQWU7SUFDckIsWUFBWSxDQUF1QztJQUUzRDs7Ozs7T0FLRztJQUNILFlBQVksTUFBYyxFQUFFLFNBQWlCLEVBQUUsV0FBZ0M7UUFDOUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7UUFDcEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFdBQVcsQ0FBQyxLQUFZO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFBO0lBQzVFLENBQUM7SUFFRCxlQUFlO1FBQ2QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7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