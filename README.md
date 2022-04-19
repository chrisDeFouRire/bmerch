# Binance Pay Merchant API for nodejs

I've found no lib for the Binance Pay Merchant API, so I'm creating one.

All of this is very early access, so use at your own risk. 

The createOrder api is probably the only one I'll implement as it's the one I need now. I'm also going to support receiving and authentifying 
incoming webhook requests.

Feel free to submit pull requests to add more APIs! and issues if you have any.

This package was started for https://dojibar.com which is a Telegram bot to receive notification of your orders execution on Binance.

## Quickstart

Simply install `bmerch` with :

```
npm install bmerch
```

The only dependency is `Axios` which is used for HTTP requests.

Instantiate a new API with

```js
import { BinanceMerch } from 'bmerch'

const binanceMerch = new BinanceMerch(apikey, apisecret, { timeout: 5000 })
```

The third parameter is an `AxiosRequestConfig` which you can use to pass any additional parameters to `Axios`, like this timeout.

### Create a new Order

```js
const order = {
	env: {
		terminalType: 'APP',
	},
	merchantTradeNo: 'yourOwnTransactionReference',
	orderAmount: "5.00",
	currency: 'USDT',
	goods: {
		goodsType: '02', // virtual goods
		goodsCategory: 'Z000', // others
		referenceGoodsId: 'sub_1_month', // your reference for the product
		goodsName: "One month subscription",
	},
	buyer: {
		referenceBuyerId: 'yourReferenceForTheBuyer', // your reference
		buyerName: {
			firstName: 'chris',
			lastName: 'hartwig'
		}
	}
}

const result = await binanceMerch.createOrder(order)
console.log(result.data)
```

This would yield

```json
{
    status: 'SUCCESS',
    code: '000000',
    data: {
      prepayId: '155661443313674176',
      terminalType: 'APP',
      expireTime: 1650325908850,
      qrcodeLink: 'https://public.bnbstatic.com/static/payment/20220418/8b0cd5d2-88eb-407d-912b-a0481219317f.jpg',
      qrContent: 'https://app.binance.com/qr/dplk6827518b7be9465da70d0f48ccd68712',
      checkoutUrl: 'https://pay.binance.com/en/checkout/efc2ebfc129a454cb2adc9b5cd571911',
      deeplink: 'bnc://app.binance.com/payment/secpay?tempToken=bkM5KsSwgSVWzmfxrWv9qM5V6Lg4EVAF&returnLink=https://pay.binance.com/en/checkout/efc2ebfc129a454cb2adc9b5cd571911',
      universalUrl: 'https://app.binance.com/payment/secpay?linkToken=efc2ebfc129a454cb0adc9bccd571911&_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL3BheW1lbnQvc2VjcGF5P3RlbXBUb2tlbj1ia001S3NTd2dTVld6bWZ4cld2OXFNNVYzTGc0RVZBRiZyZXR1cm5MaW5rPWh0dHBzOi8vcGF5LmJpbmFuY2UuY29tL2VuL2NoZWNrb3V0L2VmYzJlYmZjMTI5YTQ1NGNiMGFkYzliNWNkNTcxOTEx'
    }
}
```

You can then use any of the URLs to send your customer to Binance to pay for the order.

### Verify a Webhook signature

It's a best practice to check signatures for incoming webhook requests for Binance Pay Merchant API.

```js
const headers = // headers of the webhook request
const body = // json parsed body (ie. object) of the webhook request
const isValid = await binanceMerch.isValidSignature(headers, body)
```

### TODO

- [ ] Test it all in Dojibar.com
