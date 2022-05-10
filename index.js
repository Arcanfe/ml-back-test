const express = require('express');
const cors = require('cors');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());

/**
 * Función que es llamada con la url /api/items/q/:query
 * Realiza el llamado a https://api.mercadolibre.com/sites/MLA/search?q=:query
 * Retorna un arreglo con 4 objetos que son 4 items como resultado de busqueda
 */
app.get("/api/items/q/:query", async (req, res) => {
  const itemsQuery = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${req.params.query}`).then(data => data.json());
  const itemsOutput = itemsQuery.results.slice(0, 4).map(result => {
    const strPrice = result.price.toString().split('.');
    const numberPrice = parseInt(strPrice[0]);
    const floatPrice = strPrice[1] ? parseInt(strPrice[1]) : 00;

    return {
      id: result.id,
      title: result.title,
      price: {
        currency: result.currency_id,
        amount: numberPrice,
        decimals: floatPrice
      },
      picture: result.thumbnail,
      condition: result.condition,
      free_shipping: result.shipping.free_shipping,
      location: result.address.state_name
    }
  })
  res.send(itemsOutput);
});

/**
 * Función que es llamada con la url /api/items/:id
 * Realiza el llamado a https://api.mercadolibre.com/items/:id y a https://api.mercadolibre.com/items/:id/description
 * Retorna un objeto con la información del item
 */
app.get("/api/items/:id", async (req, res) => {
  const itemInfo = await fetch(`https://api.mercadolibre.com/items/${req.params.id}`).then(data => data.json());
  const itemsDesc = await fetch(`https://api.mercadolibre.com/items/${req.params.id}/description`).then(data => data.json());
  const strPrice = itemInfo.price.toString().split('.');
  const numberPrice = parseInt(strPrice[0]);
  const floatPrice = strPrice[1] ? parseInt(strPrice[1]) : 0;
  res.send({
    id: itemInfo.id,
    title: itemInfo.title,
    price: {
      currency: itemInfo.currency_id,
      amount: numberPrice,
      decimals: floatPrice,
    },
    picture: itemInfo.pictures[0].url,
    condition: itemInfo.condition,
    free_shipping: itemInfo.shipping.free_shipping,
    sold_quantity: itemInfo.sold_quantity,
    description: itemsDesc.plain_text
  })
});

app.listen(5000, () => {
  console.log("Server started in port 5000")
})