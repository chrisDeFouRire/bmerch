import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import crypto from 'crypto'
import { BinancePayHeaders, GetCertificates_Response, GetCertificates_Response_Cert, Order, Order_Response } from './types'
export type { Order, Order_Response, BinancePayHeaders }

const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()

const baseURL = 'https://bpay.binanceapi.com'

export class BinanceMerch {
	private apikey: string
	private apisecret: string
	private client: AxiosInstance
	private certificates?: Array<GetCertificates_Response_Cert>

	/**
	 * Constructor for the BinanceMerch API
	 * @param apikey your Binance Merchant API key
	 * @param apisecret your Binance Merchant API secret
	 * @param axiosConfig Optional parameters for Axios
	 */
	constructor(apikey: string, apisecret: string, axiosConfig?: AxiosRequestConfig) {
		this.apikey = apikey
		this.apisecret = apisecret
		this.client = axios.create({ baseURL, ...axiosConfig })
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
			nonce += allowednoncechars[Math.ceil(Math.random() * 52)]
		}

		const payload = `${ts}\n${nonce}\n${JSON.stringify(body)}\n`

		const hmac = crypto.createHmac("sha512", this.apisecret)
		hmac.update(payload)
		const signature = hmac.digest('hex').toUpperCase()

		return {
			'content-type': 'application/json',
			'BinancePay-Timestamp': ts,
			'BinancePay-Nonce': nonce,
			'BinancePay-Certificate-SN': this.apikey,
			'BinancePay-Signature': signature
		}
	}

	/**
	 * Checks the signature of an incoming webhook request
	 * @param headers The headers to check against
	 * @param body The body to check
	 * @returns a promise for true if the signature is OK
	 */
	async isValidSignature(headers: BinancePayHeaders, body: any): Promise<boolean> {
		const jsonBody = JSON.stringify(body)
		if (!this.certificates) {
			const certs = await this.getCertificates()
			if (certs.data.status != "SUCCESS") {
				throw new Error("Binance Pay Merchant API couldn't get Certificates")
			}
			this.certificates = certs.data.data
			if (!this.certificates) {
				throw new Error("Can't find certificates for Binance Pay")
			}
		}
		const payload = `${headers['BinancePay-Timestamp']}\n${headers['BinancePay-Nonce']}\n${jsonBody}\n`
		const signature = Buffer.from(headers['BinancePay-Signature'], 'base64')

		function tryCertificate(certPublic: string) {
			const publicKey = crypto.createPublicKey(certPublic) // TODO cache public key objects
			const v = crypto.createVerify('RSA-SHA256')
			v.update(jsonBody)
			return v.verify(publicKey, signature)
		}
		const verified = this.certificates.find(cert => tryCertificate(cert.certPublic))

		return verified != undefined
	}
}