const express = require("express");
const axios = require('axios');

const app = express();
app.use(express.json());

const websites = ['amazon', 'flipkart', 'snapdeal'];

app.get("/", (req, res) => {
  res.send("Welcome to Shopping");
});

// ***** Get Product Details and Offers *****
app.get("/api/mobiles/:website?", async (req, res) => {
  
  // Set Axios Headers for all get Requests
  axios.defaults.headers.get['Accept'] = 'application/json';
  axios.defaults.headers.get['Accept-Language'] = 'en-us';

  const productFinal = { product: { details: {}, website: [] } };

  // Product name from URL Query Params [Required]
  const product = req.query.product;
  
  // Website name from URL Path Params [Optional]
  const website = req.params.website;
  
  if (!product) return res.send("Request Error: Missing Parameter: product");

  if (website) {
    // *** If Invalid Website Name Passed ***
    if (!websites.includes(website)) {
      return res.send("Request Error: Website Data Not Available");
    }
  }

  // *** Website Name, If Specific Website to be Searched for, otherwise Search All Websites ***
  selectedWebsites = website ? [website] : websites;


  // **** API Base URL ****
  const baseURL = "https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws";


  // **************** Get Product Details *******************
  const productURL = `${baseURL}/product/details?productName=${product}`;

  try {
    const productDetailReponse = await axios.get(productURL);
    productFinal.product.details = productDetailReponse.data;
  }
  catch (err) {
    return res.send(err.message);
  }

  // **************** Get Website Offers ****************
  const offersRequests = selectedWebsites.map(site => axios.get(`${baseURL}/offers/${site}`).catch(err => null));
  try {
    const offersResponse = await axios.all(offersRequests);
    offersResponse.forEach((val, i) => {
      productFinal.product.website[i] = {
        websitename: val.request.path.split('/').pop(),
        offers: val.data.offers
      }
    });
  }
  catch (err) {
    return res.send(err.message);
  }

  // **************** Get Product Prices from Websites ****************
  const priceRequests = selectedWebsites.map(site => axios.get(`${baseURL}/product/${site}?productName=${product}`).catch(err => null));

  try {
    const priceResponse = await axios.all(priceRequests);
    priceResponse.forEach((val, i) => {
      productFinal.product.website[i].price = val.data.price;
    });
  }
  catch (err) {
    return res.send(err.message);
  }

  // *** Return Response to User ***
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(productFinal, null, 3));

});



const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ---${port}`);
});
