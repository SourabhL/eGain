const express = require("express");
const axios = require('axios');

const app = express();
app.use(express.json());

const websites = ['amazon', 'flipkart', 'snapdeal'];

app.get("/", (req, res) => {
  res.send("Welcome to Shopping");
});

// *****
app.get("/api/mobiles/:website?", async (req, res) => {

  axios.defaults.headers.get['Accept'] = 'application/json';
  axios.defaults.headers.get['Accept-Language'] = 'en-us';
  console.log("req.query.product..." + req.query.product);
  console.log("req.params.website..." + req.params.website);

  const website = req.params.website;
  if (website) {
    if (!websites.includes(website)) {
      return res.send("Request Error: Website Data Not Available");
    }
  }
  selectedWebsites = website ? [website] : websites;
  const product = req.query.product;
  let productFinal = { product: { details: {}, website: [] } };


  //if(!website) return res.send("Request Error: Missing Parameter: Website Name");
  if (!product) return res.send("Request Error: Missing Parameter: product");

  // **** API Base URL ****
  const baseURL = "https://aspmsnp3w1.execute-api.ap-south-1.amazonaws.com/Stage/ws";

  // **** Get Product Details ****
  const productURL = `${baseURL}/product/details?productName=${product}`;

  axios.get(productURL).then((details) => {
    console.log(details.data);
    productFinal.product.details = details.data;
    console.log("details...", productFinal);
  });
  console.log("---------selectedWebsites-------", selectedWebsites);
  // **** Get Website Offers ****
  const offersRequests = selectedWebsites.map(site => axios.get(`${baseURL}/offers/${site}`).catch(err => null));

  axios.all(offersRequests).then((response) => {
    // res.send(JSON.stringify({...details.data, ...website.data},null,3));
    response.forEach((val, i) => {
      console.log(i);
      //console.log(val.request.path.split('/').pop());
      //console.log(val.data);
      productFinal.product.website[i] = {
        websitename: val.request.path.split('/').pop(),
        offers: val.data.offers
      }
      console.log("productFinal 53...", productFinal.product.website);
    });

  }).catch(error => {
    console.log(error.response);
  });
  // let requestURLs= websites.reduce((acc, site) => {
  //   return acc.concat( [`${baseURL}/product/${site}?productName=${product}`, `${baseURL}/offers/${site}`]);
  // }, []);
  // console.log(requestURLs);
  // const requests = requestURLs.map(URL => axios.get(URL).catch(err => null));
  const requests = selectedWebsites.map(site => axios.get(`${baseURL}/product/${site}?productName=${product}`).catch(err => null));

  // console.log("*************************requests")
  // console.log(requests);
  axios.all(requests).then((response) => {
    console.log('**************************** details ********************************');

    response.forEach((val, i) => {
      console.log(val.request.path.split('/').pop().split('?')[0]);
      console.log(val.data);
      productFinal.product.website[i].price = val.data.price;
    });
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(productFinal, null, 3));
  });
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ---${port}`);
});
