import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import crypto from 'crypto'
import { Order, Order_Response } from './types'
export type { Order, Order_Response }

const allowednoncechars = 'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase()

const baseURL = 'https://bpay.binanceapi.com'

export class BinanceMerch {
	private apikey: string
	private apisecret: string
	private client: AxiosInstance

	/**
	 * Constructor for the BinanceMerch API
	 * @param apikey your Binance Merchant API key
	 * @param apisecret your Binance Merchant API secret
	 * @param axiosConfig Optional parameters for Axios
	 */
	constructor(apikey: string, apisecret: string, axiosConfig?: AxiosRequestConfig) {
		this.apikey = apikey
		this.apisecret = apisecret
		this.client = axios.create({ baseURL, ...axiosConfig})
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

	// signs a request, returns the headers to be used
	private sign(body: Object) {
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
}