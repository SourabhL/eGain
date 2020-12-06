const express = require("express");
const axios = require('axios');

const app = express();
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Welcome to Shopping");
});

app.get("/api/mobiles/:website?", async (req, res) => {

    axios.defaults.headers.get['Accept'] = 'application/json';
    axios.defaults.headers.get['Accept-Language'] = 'en-us';
    console.log("req.query.product..."+req.query.product);
    console.log("req.params.website..."+req.params.website);

    const website = req.params.website;
    const product = req.query.product;
    
    axios.all([
      axios.get(`https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/product/details?productName=${product}`),
      axios.get(`https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/product/${website}?productName=${product}`),
      axios.get(`https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws/offers/${website}`)
    ]).then(axios.spread((details, website,offers) => {
      console.log('**************************** details ********************************');
      console.log(details.data);
      console.log('**************************** website ********************************');
      console.log(website.data);
      console.log('**************************** offers ********************************');
      console.log(offers.data);
      res.setHeader('Content-Type', 'application/json');
      let productFinal = {product:{details:{},website:[]}};
      
      res.send(JSON.stringify({...details.data, ...website.data},null,3));
    })).catch(error => {
      console.log(error.response);
    });
    
    
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ---${port}`);
});
