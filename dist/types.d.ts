export declare type decimal = string;
export interface BinancePayHeaders {
    'binancepay-timestamp': string;
    'binancepay-nonce': string;
    'binancepay-signature': string;
    'binancepay-certificate-sn': string;
    'content-type': string;
    [key: string]: string;
}
export interface Order {
    merchant?: {
        subMerchantId: string;
    };
    env: {
        terminalType: "APP" | "WEB" | "WAP" | "MINI_PROGRAM" | "OTHERS";
        osType?: string;
        orderClientIp?: string;
        cookieId?: string;
    };
    merchantTradeNo: string;
    orderAmount: decimal;
    currency: "BUSD" | "USDT" | "MBOX";
    goods: {
        goodsType: "01" | "02";
        goodsCategory: "0000" | "1000" | "2000" | "3000" | "4000" | "5000" | "6000" | "7000" | "8000" | "9000" | "A000" | "B000" | "C000" | "D000" | "E000" | "F000" | "Z000";
        referenceGoodsId: string;
        goodsName: string;
        goodsDetail?: string;
        goodsUnitAmount?: {
            currency: string;
            amount: decimal;
        };
        goodsQuantity?: string;
    };
    shipping?: {
        shippingName?: {
            firstName: string;
            middleName?: string;
            lastName: string;
        };
        shippingAddress?: {
            region: string;
            state?: string;
            city?: string;
            address?: string;
            zipCode?: string;
            shippingAddressType?: "01" | "02" | "03" | "04";
        };
        shippingPhoneNo?: string;
    };
    buyer?: {
        referenceBuyerId: string;
        buyerName: {
            firstName: string;
            middleName?: string;
            lastName: string;
        };
        buyerPhoneCountryCode?: string;
        buyerPhoneNo?: string;
        buyerEmail?: string;
        buyerRegistrationTime?: number;
        buyerBrowserLanguage?: string;
    };
    returnUrl?: string;
    cancelUrl?: string;
    orderExpireTime?: number;
    supportPayCurrency?: string;
    appId?: string;
}
export interface Order_Response {
    status: "SUCCESS" | "FAIL";
    code: string;
    data: {
        prepayId: string;
        terminalType: string;
        expireTime: number;
        qrcodeLink: string;
        qrContent: string;
        checkoutUrl: string;
        deeplink: string;
        universalUrl: string;
    };
}
export interface GetCertificates_Response_Cert {
    certPublic: string;
    certSerial: string;
}
export interface GetCertificates_Response {
    status: "SUCCESS" | "FAIL";
    code: string;
    data: Array<GetCertificates_Response_Cert>;
}
export interface BinanceWebhook {
    bizType: string;
    bizId: number;
    bizStatus: "PAY_SUCCESS" | "PAY_CLOSED";
    data: string;
}
export interface BinanceWebhookOrderNotification {
    merchantTradeNo: string;
    productType: string;
    productName: string;
    tradeType: "WEB" | "APP" | "WAP" | "MINI_PROGRAM" | "PAYMENT_LINK" | "OTHERS";
    totalFee: string;
    currency: string;
    openUserId?: string;
    payerInfo?: {
        firstName: string;
        middleName?: string;
        lastName: string;
        walletId: string;
        country?: string;
        city?: string;
        address?: string;
        identityType?: string;
        identityNumber?: string;
        dateOfBirth?: string;
        placeOfBirth?: string;
        nationality?: string;
    };
}
