const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

async function getAmazonProductList(query) {
  try {
    let products = [],
      idx = 0,
      imgidx = 0,
      imgl = [],
      anch = [];
    let keys = ["id", "Name", "Price", "imageLink", "prodLink", "Rating"];
    const link = `https://www.amazon.in/s?k=${query.replaceAll(" ", "+")}`;
    const response = await axios.get(link);
    const $ = cheerio.load(response.data);
    //console.log(response.data);
    //$("#search > div.s-desktop-width-max.s-desktop-content.s-wide-grid-style-t1.s-opposite-dir.s-wide-grid-style.sg-row > div.sg-col-20-of-24.s-matching-dir.sg-col-16-of-20.sg-col.sg-col-8-of-12.sg-col-12-of-16 > div > span.rush-component.s-latency-cf-section > div.s-main-slot.s-result-list.s-search-results.sg-row > div:nth-child(9) > div > div > span > div > div > div > div.puisg-col.puisg-col-4-of-12.puisg-col-8-of-16.puisg-col-12-of-20.puisg-col-12-of-24.puis-list-col-right > div > div").each((i, el) => {
    $("div.puisg-row").each((i, el) => {
      let obj = {};
      $(el)
        .children()
        .each((childIndex, childEl) => {
          $(childEl)
            .children()
            .each((childIndex2, childEl2) => {
              //console.log($('img', childEl2).attr('src'));
              if ($("img", childEl2).attr("src")) {
                imgl.push($("img", childEl2).attr("src"));
              }

              if ($("a.s-no-outline", childEl2).attr("href")) {
                anch.push($("a.s-no-outline", childEl2).attr("href"));
              }
            });
          $(childEl)
            .children()
            .each((childIndex1, childEl1) => {
              if (
                $("span.a-price-whole", childEl1).text() &&
                childIndex == 1 &&
                !$(childEl1).text().split("  ")[0].includes("Sponsored") &&
                imgidx < imgl.length
              ) {
                obj[keys[0]] = ++idx;
                obj[keys[1]] = $(childEl1).text().split("  ")[0];
                obj[keys[2]] = parseInt(
                  $("span.a-price-whole", childEl1).text().replaceAll(",", "")
                );
                obj[keys[3]] = imgl[imgidx++];
                obj[keys[4]] = `https://www.amazon.in${anch[imgidx - 1]}`;
                obj[keys[5]] = $(childEl1).text().split("  ")[1].split(" ")[0];
                if (!obj[keys[5]].includes(".")) {
                  obj[keys[5]] = NaN;
                } else {
                  obj[keys[5]] = parseFloat(obj[keys[5]]);
                }
              }
            });
        });
      if (Object.keys(obj).length > 0) {
        //console.log(obj);
        products.push(obj);
      }
    });
    //console.log(products);
    return products;
  } catch (error) {
    console.log(error);
  }
}

const app = express();

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API working successfully"
    });
    
})

app.get("/product", async (req, res) => {
    const query = req.query.search;
    const products = await getAmazonProductList(query);
    res.status(200).json({
        success: true,
        data: products
    });
})

app.listen(3000, () => {
    console.log("Server running on port 3000");
})

//getAmazonProductList("samsung s23 ultra");
