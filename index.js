const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const axios = require('axios')

const schema = buildSchema(`
  type Query {
    hello: String
    binance: OrderBook
  }

  type OrderBook {
    bids: [Entry]
    asks: [Entry]
  }

  type Entry {
    quantity: String
    price: String
  }
`);

const root = {
  hello: () => 'Hello world!',
  binance: () => axios.get(`https://api.binance.com/api/v1/depth?symbol=ETHBTC`)
    .then(res => {
      res.data.bids = res.data.bids.map(e => ({
        quantity: e[1],
        price: e[0],
      }))
      res.data.asks = res.data.asks.map(e => ({
        quantity: e[1],
        price: e[0],
      }))
      return res.data
    })

};

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(5000, () => console.log('Serving on localhost:5000/'));
