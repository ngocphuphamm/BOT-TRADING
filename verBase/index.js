const ccxt = require('ccxt');
const moment = require('moment');
const binance = new ccxt.binance({
    apiKey: process.env.apiKey,
    secret: process.env.secret
});
const delay = require('delay');

binance.setSandboxMode(true);

async function printBalance(btcPrice) {
    const balance = await binance.fetchBalance();
    const total = balance.total;
    console.log(`Balance : BTC ${total.BTC}, USDT : ${total.USDT}`);
    console.log(`TotalUSD : ${(total.BTC -1) * btcPrice + total.USDT} \n`);;
}

async function main() {

    const prices = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 5);
    const bPrices = prices.map(el => {
        return {
            timestamp: moment(el[0]).format(),
            open: el[1],
            high: el[2],
            low: el[3],
            close: el[4]
        }
    })
    const averagePrice = bPrices.reduce((acc, price) => acc + price.close, 0) / 5
    const lastPrice = bPrices[bPrices.length - 1].close;

    console.log(bPrices.map(el => el.close), averagePrice, lastPrice);

    let direction = lastPrice > averagePrice ? 'sell' : 'buy';
    const TRADE_SIZE = 100;
    const quantity = TRADE_SIZE / lastPrice;
    console.log(`Average price : ${averagePrice} , Last price : ${lastPrice}`)
        //  const order = await binance.createOrder('BTC/USDT', direction, 'limit', quantity, lastPrice);
    const order = await binance.createMarketOrder('BTC/USDT', direction, quantity);
    console.log(`${moment().format()}: ${direction}${quantity} BTC at ${lastPrice}`);

    printBalance(lastPrice);
}

async function tick() {
    while (true) {
        await main();
        await delay(60 * 1000);
    }
}
tick();
// printBalance();