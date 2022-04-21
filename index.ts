import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import crypto from 'crypto'
import { BinancePayHeaders, GetCertificates_Response, GetCertificates_Response_Cert, Order, Order_Response } from './types'
export type { Order, Order_Response, BinancePayHeaders }
const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()

export class BinanceMerch {
	private apikey: string
	private apisecret: string
	private client: AxiosInstance
	private certificates?: {
		[key: string]: crypto.KeyObject
	}

	/**
	 * Constructor for the BinanceMerch API
	 * @param apikey your Binance Merchant API key
	 * @param apisecret your Binance Merchant API secret
	 * @param axiosConfig Optional parameters for Axios
	 */
	constructor(apikey: string, apisecret: string, axiosConfig: AxiosRequestConfig = {}) {
		if (!axiosConfig.baseURL) {
			axiosConfig.baseURL = 'https://bpay.binanceapi.com'
		}
		this.apikey = apikey
		this.apisecret = apisecret
		this.client = axios.create(axiosConfig)
	}

	/**
	 * Create a new Order (v2 API)
	 * @param order the order to create
	 * @returns the Axios response for the Order Response
	 */
	createOrder(order: Order): Promise<AxiosResponse<Order_Response>> {
		const headers = this.sign(order)
		return this.client.post('/binancepay/openapi/v2/order', order, { headers })
	}

	getCertificates(): Promise<AxiosResponse<GetCertificates_Response>> {
		const headers = this.sign({})
		return this.client.post('/binancepay/openapi/certificates', {}, { headers })
	}

	// signs a request, returns the headers to be used
	private sign(body: Object): BinancePayHeaders {
		const ts = Date.now().toString()
		let nonce = ''
		for (let i = 0; i < 32; i++) {
			const c = Math.ceil(Math.random() * 51)
			nonce += allowednoncechars[c]
		}

		const payload = `${ts}\n${nonce}\n${JSON.stringify(body)}\n`

		const hmac = crypto.createHmac("sha512", this.apisecret)
		hmac.update(payload)
		const signature = hmac.digest('hex').toUpperCase()

		return {
			'content-type': 'application/json',
			'binancepay-timestamp': ts,
			'binancepay-nonce': nonce,
			'binancepay-certificate-sn': this.apikey,
			'binancepay-signature': signature
		}
	}

	/**
	 * Checks the signature of an incoming webhook request
	 * @param headers The headers to check against
	 * @param body The body to check
	 * @returns a promise for true if the signature is OK
	 */
	async isValidWebhookRequest(headers: BinancePayHeaders, jsonBody: string): Promise<boolean> {
		if (!this.certificates) {
			this.certificates = {}
			const certs = await this.getCertificates()
			if (certs.data.status != "SUCCESS") {
				throw new Error("Binance Pay Merchant API couldn't get Certificates")
			}
			for (let cert of certs.data.data) {
				this.certificates[cert.certSerial] = crypto.createPublicKey(cert.certPublic)
			}
		}
		const payload = headers['binancepay-timestamp'] + "\n" + headers['binancepay-nonce'] + "\n" + jsonBody + "\n"
		const signature = Buffer.from(headers['binancepay-signature'], 'base64')

		const cert = this.certificates[headers['binancepay-certificate-sn']]
		if (!cert) {
			console.error("Can't find Binance cert with SN "+headers['binancepay-certificate-sn'])
			return false
		}
		const v = crypto.createVerify('RSA-SHA256')
		v.update(payload)
		return v.verify(cert, signature)
	}
}